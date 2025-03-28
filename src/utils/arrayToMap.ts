export function arrayToMap<T extends Record<string, any>>(arr: T[]) {
  const obj = Array.from(arr).reduce((acc, item, index) => {
    Object.assign(acc, { [item["id"] ?? index]: item });
    return acc;
  }, <Record<number, T>>{});
  return obj;
}
