/**
 * Security & Sanitization Utilities for MANAS Web Application
 * Protects against XSS, Script Injections, Prototype Pollution & Form Spoofing.
 */

// Strip HTML tags, script tags, event handlers (e.g. onerror=, onload=) & dangerous protocols
export function sanitizeInput(input: string, maxLen = 500): string {
  if (typeof input !== "string") return "";
  return input
    .slice(0, maxLen)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Neutralize javascript: URI schemes
    .replace(/on\w+\s*=/gi, "") // Neutralize inline event handlers like onerror=, onclick=
    .trim();
}

// Sanitize phone number (digits only, max 10 chars)
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 10);
}

// Basic email format validator & sanitizer
export function sanitizeEmail(email: string): string {
  const clean = sanitizeInput(email, 100);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : "";
}

// Safe JSON parser to guard against Prototype Pollution (__proto__, constructor) and malformed storage
export function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    // Block Prototype Pollution
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if ("__proto__" in obj) delete obj["__proto__"];
      if ("constructor" in obj) delete obj["constructor"];
      if ("prototype" in obj) delete obj["prototype"];
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

// Cryptographically secure 4-digit OTP generator
export function generateSecureOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const otp = (1000 + (array[0] % 9000)).toString();
  return otp;
}

// Strict 4-digit OTP format validator
export function validateOTPFormat(otp: string): boolean {
  return /^\d{4}$/.test(otp.trim());
}
