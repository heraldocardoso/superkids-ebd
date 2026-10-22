import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

/**
 * jsdom noise that says nothing about the code under test: it cannot parse
 * PrimeNG's `@layer` rules, and it does not implement `window.scrollTo`.
 * Everything else still reaches the console.
 */
const IGNORED = ['Could not parse CSS stylesheet', 'Not implemented: window.scrollTo'];

const consoleError = console.error;
console.error = (...args: unknown[]) => {
  const noise = args.some((arg) => {
    const message = String(arg instanceof Error ? arg.message : arg);
    return IGNORED.some((ignored) => message.includes(ignored));
  });
  if (!noise) {
    consoleError(...(args as Parameters<typeof consoleError>));
  }
};
