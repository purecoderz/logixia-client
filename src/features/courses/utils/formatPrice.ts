import { formatNaira } from "../../../utils/format";

/** 50000 -> "₦50K", 0 -> "Free" */
export function formatPrice(price: number) {
  return price > 0 ? formatNaira(price) : "Free";
}