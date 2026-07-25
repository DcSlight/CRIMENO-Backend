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
import { ActiveSelectionStore } from '../selection/active-selection.store';

@Injectable()
export class DemoInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly demoReplay: DemoReplayService,
    private readonly activeSelection: ActiveSelectionStore,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isMarked = this.reflector.get<boolean>(
      DEMO_KEY,
      context.getHandler(),
    );

    if (isMarked && this.config.get<boolean>('demoMode')) {
      const request = context.switchToHttp().getRequest<{ body?: unknown }>();
      const body: unknown = request.body ?? {};
      const { src, businessId } = body as {
        src?: unknown;
        businessId?: unknown;
      };

      if (typeof src !== 'string' || !src) {
        throw new BadRequestException(
          'src is required to resolve the demo dataset',
        );
      }

      // VideosService.selectVideo() never runs in demo mode, so this is the
      // one place that can record the active business for the AI chat.
      if (typeof businessId === 'number') {
        this.activeSelection.set({ businessId, src });
      }

      this.demoReplay.start(toDemoKey(src));
      return of({ ok: true });
    }

    return next.handle();
  }
}
