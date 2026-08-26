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

// Sanitize phone number (digits only)
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Strict 10-digit Indian phone number validator (must start with 6, 7, 8, or 9)
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const digits = sanitizePhone(phone);
  if (!digits) {
    return { valid: false, error: "Phone number is required" };
  }
  if (digits.length < 10) {
    return { valid: false, error: "Phone number must be exactly 10 digits" };
  }
  if (digits.length > 10) {
    return { valid: false, error: "Phone number must be exactly 10 digits" };
  }
  if (!/^[6-9]/.test(digits)) {
    return { valid: false, error: "Phone number must start with 6, 7, 8, or 9" };
  }
  return { valid: true };
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

/**
 * Strict Security Sanitizer & Domain Whitelist Enforcer for Google Maps URLs.
 * Guards against Protocol Hijacking (javascript:, data:, vbscript:), XSS & Phishing Links.
 */
export function sanitizeGoogleMapsUrl(url: string): { valid: boolean; cleanUrl: string; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: true, cleanUrl: "" };
  }

  const trimmed = url.trim().slice(0, 500);
  if (!trimmed) {
    return { valid: true, cleanUrl: "" };
  }

  // Block dangerous schemes explicitly
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { valid: false, cleanUrl: "", error: "⚠️ Security Warning: Invalid link protocol detected." };
  }

  // Enforce HTTP / HTTPS protocol
  if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
    return { valid: false, cleanUrl: "", error: "⚠️ Link must start with http:// or https://" };
  }

  try {
    const parsedUrl = new URL(trimmed);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Official Google Maps Hostname Whitelist
    const isWhitelistedDomain =
      hostname === "maps.google.com" ||
      hostname === "google.com" ||
      hostname.endsWith(".google.com") ||
      hostname.endsWith(".google.co.in") ||
      hostname === "maps.app.goo.gl" ||
      hostname === "goo.gl" ||
      hostname.endsWith(".goo.gl");

    if (!isWhitelistedDomain) {
      return {
        valid: false,
        cleanUrl: "",
        error: "⚠️ Security Warning: Only official Google Maps links (google.com / maps.app.goo.gl) are allowed.",
      };
    }

    return { valid: true, cleanUrl: parsedUrl.toString() };
  } catch (err) {
    return { valid: false, cleanUrl: "", error: "⚠️ Invalid URL format." };
  }
}
