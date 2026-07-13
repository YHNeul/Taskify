import { afterEach, vi } from 'vitest';

process.env.NEXT_PUBLIC_API_URL = 'https://example.com';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
