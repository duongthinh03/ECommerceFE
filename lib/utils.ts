import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Gộp class Tailwind: clsx xử lý điều kiện, twMerge khử class trùng/đè nhau.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
