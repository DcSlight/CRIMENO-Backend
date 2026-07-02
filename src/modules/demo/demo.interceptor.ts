import {
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
      this.demoReplay.start();
      return of({ ok: true });
    }

    return next.handle();
  }
}
