import { SetMetadata } from '@nestjs/common';

export const DEMO_KEY = 'demo';

/**
 * Mark a controller handler as demo-aware. When DEMO_MODE=true the
 * DemoInterceptor will start the mock replay and return immediately,
 * skipping the real handler entirely.
 */
export const Demo = () => SetMetadata(DEMO_KEY, true);
