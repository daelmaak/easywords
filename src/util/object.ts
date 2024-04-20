export type RealOmit<
  T,
  K extends keyof T | (string & {}) | (number & {}) | (symbol | {})
> = { [P in Exclude<keyof T, K>]: T[P] };

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!keys.includes(key as K)) {
      acc[key as keyof Omit<T, K>] = value;
    }
    return acc;
  }, {} as Omit<T, K>);
}
