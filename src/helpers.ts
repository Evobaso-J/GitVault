export type Brand<T, TName> = T & { __brand: TName }
export type ExtractArrayTypeFromUnion<T> = T extends Array<infer U> ? U : T
// eslint-disable-next-line @typescript-eslint/ban-types
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

type TupleHelper<T, N extends number, U extends unknown[]> = U['length'] extends N ? U : TupleHelper<T, N, [T, ...U]>
export type Tuple<T, N extends number> = TupleHelper<T, N, []>
