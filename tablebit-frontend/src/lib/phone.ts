/**
 * Phone number normalization for Colombia
 * Accepts: 3147982365, +573147982365, 573147982365
 * Returns E.164: +573147982365
 * Validates: exactly 10 digits starting with 3
 */

const CO_CODE = "57";

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith(CO_CODE)) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith(`+${CO_CODE}`)) return `+${digits.slice(1)}`;
  if (digits.length === 10) return `+${CO_CODE}${digits}`;
  return input;
}

export function validateColombianMobile(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return /^3\d{9}$/.test(digits);
  if (digits.length === 12 && digits.startsWith(CO_CODE)) return /^3\d{9}$/.test(digits.slice(2));
  if (digits.length === 13 && digits.startsWith(`57`)) return /^3\d{9}$/.test(digits.slice(2));
  return false;
}
