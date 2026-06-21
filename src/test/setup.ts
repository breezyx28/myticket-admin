import '@/i18n';
import { setupZodI18n } from '@/lib/zodI18n';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { server } from '@/test/msw/server';

setupZodI18n();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
