import { z } from 'zod';
import { EPSILON } from '../constants';

export function identity<T>(arg: T) {
  return arg;
}

type PromiseResolveFunction<T> = (value: T) => void;
type PromiseRejectFunction = (reason?: Error) => void;
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: PromiseResolveFunction<T>;
  reject: PromiseRejectFunction;
}

export function defer<T>(): Deferred<T> {
  let innerResolve: PromiseResolveFunction<T> | null = null;
  let innerReject: PromiseRejectFunction | null = null;

  const resolve = (value: T) => {
    if (innerResolve) innerResolve(value);
  };
  const reject = (reason?: Error) => {
    if (innerReject) innerReject(reason);
  };

  const promise = new Promise<T>((res, rej) => {
    innerResolve = res;
    innerReject = rej;
  });

  return { promise, resolve, reject };
}

export function removeFromArray<T>(arr: Array<T>, el: T) {
  const idx = arr.indexOf(el);
  if (idx > -1) {
    arr.splice(idx, 1);
  }
}

export function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return keys.reduce((o, k) => ({ ...o, [k]: obj[k] }), {} as Pick<T, K>);
}

/**
 * Takes a predicate and a list of values and returns a a tuple (2-item array),
 *  with each item containing the subset of the list that matches the predicate
 *  and the complement of the predicate respectively
 *
 * @sig (T -> Boolean, T[]) -> [T[], T[]]
 *
 * @param {Function} predicate A predicate to determine which side the element belongs to.
 * @param {Array} arr The list to partition
 *
 * Inspired by the Ramda function of the same name
 * @see https://ramdajs.com/docs/#partition
 *
 * @example
 *
 *     const isNegative: (n: number) => boolean = n => n < 0
 *     const numbers = [1, 2, -4, -7, 4, 22]
 *     partition(isNegative, numbers)
 *     // => [ [-4, -7], [1, 2, 4, 22] ]
 *
 * Source https://gist.github.com/zachlysobey/71ac85046d0d533287ed85e1caa64660
 */
export function partition<T>(
  predicate: (val: T) => boolean,
  arr: Array<T>
): [Array<T>, Array<T>] {
  const partitioned: [Array<T>, Array<T>] = [[], []];
  arr.forEach((val: T) => {
    const partitionIndex: 0 | 1 = predicate(val) ? 0 : 1;
    partitioned[partitionIndex].push(val);
  });
  return partitioned;
}

export function partitionByType<T, U extends T>(
  guard: (x: T) => x is U,
  arr: T[]
): [U[], Exclude<T, U>[]] {
  const ret: [U[], Exclude<T, U>[]] = [[], []];
  arr.forEach((el) =>
    guard(el) ? ret[0].push(el) : ret[1].push(el as Exclude<T, U>)
  );
  return ret;
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function ensureError(e: unknown) {
  return e instanceof Error ? e : new Error(JSON.stringify(e));
}

// https://github.com/colinhacks/zod/discussions/839#discussioncomment-4335236
export function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, any>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return z.enum([firstKey, ...otherKeys]);
}

export const ensureDefault = <T>(
  key: string,
  records: Record<string, T>,
  default_: T
) => {
  if (!(key in records)) {
    // eslint-disable-next-line no-param-reassign
    records[key] = default_;
  }

  return records[key];
};

export function roundIfCloseToInteger(value: number, eps = EPSILON) {
  const rounded = Math.round(value);
  if (Math.abs(rounded - value) <= eps) {
    return rounded;
  }
  return value;
}

/**
 * Normalizes a list of objects to { order, byKey }
 * @param objects
 * @param key
 * @returns
 */
export function normalizeForStore<T, K extends keyof T>(objects: T[], key: K) {
  type KeyType = T[K];
  const order: KeyType[] = objects.map((obj) => obj[key]);
  const byKey = objects.reduce<Record<K, T>>(
    (acc, obj) => ({ ...acc, [obj[key] as string | number | symbol]: obj }),
    {} as Record<string | number | symbol, T>
  );

  return { order, byKey };
}
