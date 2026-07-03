import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Observable, of } from 'rxjs';
import { DEMO_KEY } from './demo.decorator';
import { DemoReplayService } from './demo-replay.service';
import { toDemoKey } from './demo-key.util';

@Injectable()
export class DemoInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly demoReplay: DemoReplayService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isMarked = this.reflector.get<boolean>(DEMO_KEY, context.getHandler());

    if (isMarked && this.config.get<boolean>('demoMode')) {
      const src: unknown = context.switchToHttp().getRequest().body?.src;
      if (typeof src !== 'string' || !src) {
        throw new BadRequestException('src is required to resolve the demo dataset');
      }

      this.demoReplay.start(toDemoKey(src));
      return of({ ok: true });
    }

    return next.handle();
  }
}
