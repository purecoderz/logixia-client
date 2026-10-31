/** "50,000", "₦ 50000" -> 50000. Anything that isn't a whole number -> null. */
export function parsePrice(input: string): number | null {
  const cleaned = input.replace(/[₦,\s]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

/** "50000" -> "50,000". Leaves unparseable text alone so the user can keep typing. */
export function formatPriceInput(input: string): string {
  const n = parsePrice(input);
  return n === null ? input : n.toLocaleString("en-NG");
}
