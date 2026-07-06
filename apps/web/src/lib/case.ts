/** Convert snake_case API keys to camelCase for frontend types. */

function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function snakeToCamel<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => snakeToCamel(item)) as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        toCamelKey(key),
        snakeToCamel(val),
      ]),
    ) as T;
  }
  return value as T;
}
