import QRCode from "qrcode";

export const MANAS_UPI_ID = "nishant1237860@ybl";
export const MANAS_BUSINESS_NAME = "Manas Restaurants And Cafe";

export interface GenerateUpiParams {
  amount: number;
  orderId: string;
  note?: string;
}

/**
 * Generates standard UPI payment deep link.
 * Format: upi://pay?pa=[MY_UPI_ID]&pn=[MY_BUSINESS_NAME]&am=[AMOUNT]&cu=INR&tn=Order-[ORDER_ID]
 */
export function generateUpiDeepLink({ amount, orderId, note }: GenerateUpiParams): string {
  const formattedAmount = amount.toFixed(2);
  const transactionNote = encodeURIComponent(note || `Order-${orderId}`);
  const businessName = encodeURIComponent(MANAS_BUSINESS_NAME);

  return `upi://pay?pa=${MANAS_UPI_ID}&pn=${businessName}&am=${formattedAmount}&cu=INR&tn=${transactionNote}`;
}

/**
 * Generates high-resolution Data URL for Desktop QR Code display using qrcode package.
 */
export async function generateUpiQrCodeDataUrl(upiDeepLink: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(upiDeepLink, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a", // Dark Slate
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });
    return dataUrl;
  } catch (err) {
    console.error("Failed to generate UPI QR code:", err);
    return "";
  }
}

/**
 * Validates 12-digit UTR / UPI Transaction Reference number.
 */
export function validateUtrNumber(utr: string): { isValid: boolean; error?: string } {
  const cleanUtr = utr.trim();
  if (!cleanUtr) {
    return { isValid: false, error: "UTR / Transaction ID is required." };
  }
  // Enforce 12 digits numeric regex or 12-character alpha-numeric reference ID
  if (!/^\d{12}$/.test(cleanUtr) && !/^[A-Za-z0-9]{12}$/.test(cleanUtr)) {
    return { isValid: false, error: "UTR number must be exactly 12 digits (e.g. 423456789012)." };
  }
  return { isValid: true };
}

/**
 * Detects whether the current device is mobile or tablet vs desktop.
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || isSmallScreen;
}

export interface UpiAppConfig {
  id: "gpay" | "phonepe" | "paytm" | "bhim" | "cred" | "generic";
  name: string;
  shortName: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconBg: string;
  iconText: string;
  tagline: string;
}

export const UPI_APPS: UpiAppConfig[] = [
  {
    id: "gpay",
    name: "Google Pay",
    shortName: "GPay",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    badgeText: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30 hover:border-blue-500",
    iconBg: "bg-blue-600 text-white font-black",
    iconText: "GPay",
    tagline: "Pay via Google Pay",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    shortName: "PhonePe",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
    badgeText: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-500",
    iconBg: "bg-purple-600 text-white font-black",
    iconText: "Pe",
    tagline: "Pay via PhonePe",
  },
  {
    id: "paytm",
    name: "Paytm",
    shortName: "Paytm",
    badgeBg: "bg-sky-500/10 dark:bg-sky-500/20",
    badgeText: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-500/30 hover:border-sky-500",
    iconBg: "bg-sky-600 text-white font-black",
    iconText: "Paytm",
    tagline: "Pay via Paytm",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    shortName: "BHIM",
    badgeBg: "bg-orange-500/10 dark:bg-orange-500/20",
    badgeText: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-500/30 hover:border-orange-500",
    iconBg: "bg-orange-500 text-white font-black",
    iconText: "BHIM",
    tagline: "Pay via BHIM",
  },
  {
    id: "cred",
    name: "CRED Pay",
    shortName: "CRED",
    badgeBg: "bg-neutral-800 text-white dark:bg-neutral-700",
    badgeText: "text-neutral-900 dark:text-neutral-100",
    borderColor: "border-neutral-700 hover:border-neutral-500",
    iconBg: "bg-neutral-900 text-white font-black",
    iconText: "CRED",
    tagline: "Pay via CRED",
  },
  {
    id: "generic",
    name: "Any UPI App",
    shortName: "Other",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30 hover:border-emerald-500",
    iconBg: "bg-emerald-600 text-white font-black",
    iconText: "⚡",
    tagline: "Select App",
  },
];

export function generateAppUpiLink(appId: string, params: GenerateUpiParams): string {
  const standard = generateUpiDeepLink(params);
  const query = standard.replace("upi://pay?", "");
  const userAgent = typeof navigator !== "undefined" ? (navigator.userAgent || "").toLowerCase() : "";
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);

  if (isAndroid) {
    switch (appId) {
      case "gpay":
        return `intent://pay?${query}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end;`;
      case "phonepe":
        return `intent://pay?${query}#Intent;scheme=upi;package=com.phonepe.app;end;`;
      case "paytm":
        return `intent://pay?${query}#Intent;scheme=upi;package=net.one97.paytm;end;`;
      case "bhim":
        return `intent://pay?${query}#Intent;scheme=upi;package=in.org.npci.upiapp;end;`;
      case "cred":
        return `intent://pay?${query}#Intent;scheme=upi;package=com.dreamplug.androidapp;end;`;
      default:
        return standard;
    }
  } else if (isIOS) {
    switch (appId) {
      case "gpay":
        return `tez://upi/pay?${query}`;
      case "phonepe":
        return `phonepe://pay?${query}`;
      case "paytm":
        return `paytmmp://pay?${query}`;
      case "bhim":
        return `bhim://pay?${query}`;
      default:
        return standard;
    }
  }

  return standard;
}
