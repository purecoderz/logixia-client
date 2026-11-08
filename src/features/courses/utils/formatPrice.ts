import { formatNaira } from "../../../utils/format";

/** 50000 -> "₦50K", 0 -> "Free", null (not sold on its own) -> "—" */
export function formatPrice(price: number | null) {
  if (price === null) return "—";
  return price > 0 ? formatNaira(price) : "Free";
}
