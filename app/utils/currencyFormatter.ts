/**
 * Utility functions for Indonesian Rupiah currency formatting
 */

// Format number to Indonesian currency format (300.000)
export const formatCurrency = (value: number | string): string => {
  if (!value && value !== 0) return "";

  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/[^\d]/g, "")) : value;

  if (isNaN(numericValue)) return "";

  return numericValue.toLocaleString("id-ID");
};

// Format number to full Indonesian currency display (Rp 300.000)
export const formatCurrencyDisplay = (value: number | string): string => {
  if (!value && value !== 0) return "";

  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/[^\d]/g, "")) : value;

  if (isNaN(numericValue)) return "";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numericValue);
};

// Parse formatted currency string back to number
export const parseCurrency = (value: string): number => {
  if (!value) return 0;

  // Remove all non-numeric characters except decimal point
  const numericString = value.replace(/[^\d]/g, "");
  const numericValue = parseFloat(numericString);

  return isNaN(numericValue) ? 0 : numericValue;
};

// Format input value as user types (add dots for thousands)
export const formatInputCurrency = (value: string): string => {
  if (!value) return "";

  // Remove all non-numeric characters
  const numericValue = value.replace(/[^\d]/g, "");

  if (!numericValue) return "";

  // Add thousand separators using Indonesian locale
  const number = parseInt(numericValue);
  return number.toLocaleString("id-ID");
};

// Validate currency input
export const validateCurrencyInput = (value: string): boolean => {
  if (!value) return false;

  const numericValue = parseCurrency(value);
  return numericValue > 0;
};
