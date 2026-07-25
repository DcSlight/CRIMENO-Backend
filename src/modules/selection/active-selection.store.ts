import { Injectable } from '@nestjs/common';

export type ActiveSelection = {
  businessId: number;
  src: string;
};

// Tracks which business/video is currently "active" — set whenever
// POST /videos/selection succeeds (real or demo path). In-memory,
// process-local, single active selection at a time, like LiveEventsStore
// was meant to be. Lets the AI chat assistant ground its answers without
// the client having to resend the business on every question.
@Injectable()
export class ActiveSelectionStore {
  private current: ActiveSelection | null = null;

  set(selection: ActiveSelection): void {
    this.current = selection;
  }

  get(): ActiveSelection | null {
    return this.current;
  }
}
