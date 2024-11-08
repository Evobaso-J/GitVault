export type Brand<T, TName> = T & { __brand: TName }
export type ExtractArrayTypeFromUnion<T> = T extends Array<infer U> ? U : T
// eslint-disable-next-line @typescript-eslint/ban-types
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
