import { injectLocal, provideLocal } from "@vueuse/core";

export function createInjectableHook<A extends unknown[], R>(
  hook: (...args: A) => R,
): [(...args: A) => R, (hookToProvide: (...args: A) => R) => void] {
  const key = Symbol("injectable hook");

  function useHook(...args: A) {
    return injectLocal(key, () => hook, true)(...args);
  }

  function provideHook(hookToProvide: (...args: A) => R) {
    provideLocal(key, hookToProvide);
  }

  return [useHook, provideHook];
}
