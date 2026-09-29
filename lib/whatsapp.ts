/**
 * WhatsApp helpers for formatting numbers and constructing pickup notification messages.
 */

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  // Strip everything except digits
  let clean = phone.replace(/\D/g, "");
  if (!clean) return "";

  // Sri Lanka local numbers starting with 0 (e.g., 0771234567 -> 94771234567)
  if (clean.startsWith("0")) {
    clean = "94" + clean.slice(1);
  } else if (!clean.startsWith("94") && clean.length === 9) {
    clean = "94" + clean;
  }
  return clean;
}

export function generatePickupMessage(repair: {
  brand?: string;
  model: string;
  customerName?: string;
}): string {
  const phoneName = repair.brand ? `${repair.brand} ${repair.model}` : repair.model;
  const customer = repair.customerName?.trim();
  const prefix = customer ? `Hello ${customer}, ` : "Hello, ";
  return `${prefix}your ${phoneName} is ready come and pickup the device within 3 days.`;
}

export function getWhatsAppShareUrl(phone: string, message: string): string {
  const formatted = formatWhatsAppNumber(phone);
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}
