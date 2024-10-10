export type Maybe<T> = T | null | undefined;

export type FirstParam<T> = T extends (first: infer R, ...args: any[]) => any
  ? R
  : never;
