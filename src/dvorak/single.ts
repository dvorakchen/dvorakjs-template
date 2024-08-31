export const OBSERVE_KEY = Symbol("SignalGetter.observe key");

export interface SignalGetter<T> {
  (): T;
  [OBSERVE_KEY]: (subscriber: Function) => void;
}

// export type SignleGetter<T> = (() => T) & GetSetter;
export type SignleSetter<T> = (_: T) => void;

export function useSignal<T>(
  defaultValue: T
): [SignalGetter<T>, SignleSetter<T>] {
  let value: T = defaultValue;
  const queue: Function[] = [];

  let setter = (() => {
    return (newValue: T) => {
      value = newValue;
      queue.forEach((func: Function) => {
        func();
      });
    };
  })();

  let getter: SignalGetter<T> = Object.assign(() => value, {
    [OBSERVE_KEY]: (subscriber: Function) => {
      queue.push(subscriber);
    },
  });

  return [getter, setter];
}

export function isSignalGetter(value: any): value is SignalGetter<any> {
  return (
    value &&
    typeof value === "function" &&
    value[OBSERVE_KEY] &&
    typeof value[OBSERVE_KEY] === "function"
  );
}
