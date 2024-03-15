export function objectEntriesMap<
	T extends Record<K1, V1>,
	K1 extends string | number | symbol,
	V1,
	K2 extends string | number | symbol,
	V2,
>(object: T, map: (k: K1, v: V1) => [K2, V2]|[]) {
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => map(k as K1, v as V1)),
  ) as Record<K2, V2>;
}
