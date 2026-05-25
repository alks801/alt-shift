type ClassValue = string | number | false | null | undefined;

/**
 * Tiny className combiner. Avoids pulling in `clsx` for a one-liner; falsy
 * values are dropped, the rest are space-joined.
 */
export function cx(...values: ClassValue[]): string {
  let out = "";
  for (const value of values) {
    if (!value) continue;
    out += out ? ` ${value}` : String(value);
  }
  return out;
}
