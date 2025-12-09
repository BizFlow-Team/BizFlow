import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm nối class CSS (chuẩn Shadcn)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format tiền tệ VNĐ
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Màu sắc trạng thái kho
export const getStatusColor = (stock: number) => {
  if (stock === 0) return 'bg-red-100 text-red-700 border-red-200';
  if (stock < 10) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-green-100 text-green-700 border-green-200';
};