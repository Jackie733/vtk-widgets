export type Maybe<T> = T | null | undefined;

export type FirstParam<T> = T extends (first: infer R, ...args: any[]) => any
  ? R
  : never;

export type RequiredWithPartial<T, K extends keyof T> = Required<Omit<T, K>> &
  Partial<Pick<T, K>>;

export type PartialWithRequired<T, K extends keyof T> = Pick<T, K> &
  Partial<Omit<T, K>>;
