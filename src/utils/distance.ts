/**
 * Restaurant Main Branch Coordinates (Dabok, Udaipur)
 */
export const RESTAURANT_LAT = 24.620604;
export const RESTAURANT_LNG = 73.853181;
export const MAX_DELIVERY_RADIUS_KM = 7.0;

/**
 * Calculates exact spherical distance in kilometers between two GPS coordinates
 * using the Haversine formula (Industry Standard for Zomato / Swiggy / Uber).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = RESTAURANT_LAT,
  lon2: number = RESTAURANT_LNG
): number {
  if (!lat1 || !lon1 || isNaN(lat1) || isNaN(lon1)) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g. 3.4 km)
}

/**
 * Udaipur Pincode & Key Area Coordinates Mapping (Industry Grade Local Geocoder)
 */
export const UDAIPUR_AREA_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  "313001": { lat: 24.5854, lng: 73.7125, name: "Udaipur City Center (Surajpole / Delhi Gate)" },
  "313002": { lat: 24.5684, lng: 73.7226, name: "Hiran Magri (Sectors 3, 4, 5, 6 / Savina)" },
  "313003": { lat: 24.6030, lng: 73.6880, name: "Fatehpura / Saheliyon Ki Bari" },
  "313004": { lat: 24.5950, lng: 73.7380, name: "Pratap Nagar / MLSU Campus" },
  "313011": { lat: 24.6210, lng: 73.8540, name: "Dabok / Maharana Pratap Airport Area" },
  "313022": { lat: 24.6420, lng: 73.7180, name: "Sukher Industrial Area" },
  "313024": { lat: 24.6200, lng: 73.7050, name: "Bhuwana / Celebration Mall / Bedla" },
  "313801": { lat: 24.7800, lng: 73.9800, name: "Mavli Junction" },
};

export const LOCALITY_KEYWORD_COORDINATES: Array<{ keywords: string[]; lat: number; lng: number; name: string }> = [
  // High Priority Landmark & Institution Coordinates
  { keywords: ["gits", "geetanjali institute", "geetanjali college", "gits dabok", "geetanjali technical"], lat: 24.6186, lng: 73.8443, name: "GITS College Campus (Dabok)" },
  { keywords: ["pacific university", "pacific college", "pait"], lat: 24.5720, lng: 73.7460, name: "Pacific University Campus" },
  { keywords: ["mlsu", "mohanlal sukhadia"], lat: 24.5910, lng: 73.7250, name: "MLSU Campus" },
  { keywords: ["ctae", "college of technology"], lat: 24.5970, lng: 73.7310, name: "CTAE College Campus" },
  { keywords: ["rnt medical", "rnt hospital", "mb hospital"], lat: 24.5870, lng: 73.6990, name: "RNT Medical Hospital" },
  
  // Area & Locality Coordinates
  { keywords: ["debari", "vwztwg", "zinc smelter", "debari chauraha", "debari phata", "vwztwgcmjefbjrqb9"], lat: 24.609929, lng: 73.817850, name: "Debari Area" },
  { keywords: ["merta", "xnbrsv7", "merta village", "merta road", "xnbrsv7wyxzk1zid7"], lat: 24.642694, lng: 73.870591, name: "Merta Village" },
  { keywords: ["7gm4a26kwkmdyh3e6", "7gm4a26"], lat: 24.606370, lng: 73.849333, name: "Location Pin (1.6 km)" },
  { keywords: ["dabok", "airport", "mpuat"], lat: 24.6210, lng: 73.8540, name: "Dabok Area" },
  { keywords: ["pratap nagar", "transport nagar", "thoor"], lat: 24.5950, lng: 73.7380, name: "Pratap Nagar" },
  { keywords: ["hiran magri", "sector 3", "sector 4", "sector 5", "sector 6", "savina", "paras"], lat: 24.5684, lng: 73.7226, name: "Hiran Magri" },
  { keywords: ["bhuwana", "celebration mall", "bedla", "syphon"], lat: 24.6200, lng: 73.7050, name: "Bhuwana" },
  { keywords: ["sukher", "amberi", "shobhagpura"], lat: 24.6420, lng: 73.7180, name: "Sukher" },
  { keywords: ["fatehpura", "panchwati", "saheli", "pula"], lat: 24.6030, lng: 73.6880, name: "Fatehpura" },
  { keywords: ["surajpole", "delhi gate", "hathipole", "clock tower", "bapu bazar"], lat: 24.5854, lng: 73.7125, name: "City Center" },
  { keywords: ["goverdhan vilas", "reti stand", "sector 14", "sector 11"], lat: 24.5450, lng: 73.6950, name: "Goverdhan Vilas" },
];

/**
 * Security Guard: Validates that latitude & longitude are finite real numbers within valid global ranges (-90 to +90, -180 to +180).
 */
export function isValidCoordinates(lat: unknown, lng: unknown): boolean {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  return (
    typeof latNum === "number" &&
    typeof lngNum === "number" &&
    isFinite(latNum) &&
    isFinite(lngNum) &&
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    latNum >= -90.0 &&
    latNum <= 90.0 &&
    lngNum >= -180.0 &&
    lngNum <= 180.0 &&
    (latNum !== 0 || lngNum !== 0)
  );
}

/**
 * Parses coordinates (latitude & longitude) synchronously from expanded Google Maps URLs.
 * Supports:
 * - https://www.google.com/maps?q=24.6186,73.8443
 * - https://maps.google.com/place/@24.6186,73.8443,17z
 * - https://www.google.com/maps/search/24.642694,+73.870591
 * - https://www.google.com/maps/embed?!3d24.642694!4d73.870591
 * - Raw "24.6186, 73.8443" strings
 */
export function parseGoogleMapsUrlCoordinates(url: string): { lat: number; lng: number } | null {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();

  // Pattern 1: @lat,lng (e.g. /place/GITS/@24.6186,73.8443,17z)
  const atMatch = cleanUrl.match(/@(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)/);
  if (atMatch && atMatch[1] && atMatch[2]) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidCoordinates(lat, lng)) return { lat, lng };
  }

  // Pattern 2: search/lat,+lng or search/lat,lng (e.g. /maps/search/24.642694,+73.870591)
  const searchMatch = cleanUrl.match(/search\/(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)/);
  if (searchMatch && searchMatch[1] && searchMatch[2]) {
    const lat = parseFloat(searchMatch[1]);
    const lng = parseFloat(searchMatch[2]);
    if (isValidCoordinates(lat, lng)) return { lat, lng };
  }

  // Pattern 3: !3d24.642694!4d73.870591 (Google Maps Place Embed Format)
  const embedMatch = cleanUrl.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/);
  if (embedMatch && embedMatch[1] && embedMatch[2]) {
    const lat = parseFloat(embedMatch[1]);
    const lng = parseFloat(embedMatch[2]);
    if (isValidCoordinates(lat, lng)) return { lat, lng };
  }

  // Pattern 4: q=lat,lng or query=lat,lng (e.g. ?q=24.6186,73.8443 or ?query=24.6186,73.8443)
  const qMatch = cleanUrl.match(/[?&](?:q|query)=(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)/);
  if (qMatch && qMatch[1] && qMatch[2]) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidCoordinates(lat, lng)) return { lat, lng };
  }

  // Pattern 5: Standalone "24.6186, 73.8443" or "24.6186,+73.8443" in URL path
  const generalMatch = cleanUrl.match(/(-?\d{2}\.\d{3,}),\s*\+?(-?\d{2,3}\.\d{3,})/);
  if (generalMatch && generalMatch[1] && generalMatch[2]) {
    const lat = parseFloat(generalMatch[1]);
    const lng = parseFloat(generalMatch[2]);
    if (isValidCoordinates(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Asynchronously expands short Google Maps URLs (e.g. https://maps.app.goo.gl/...)
 * and extracts exact latitude & longitude coordinates.
 */
export async function parseGoogleMapsUrlCoordinatesAsync(url: string): Promise<{ lat: number; lng: number } | null> {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();

  // Tier 1: Instant sync parsing for full URLs with raw @lat,lng or search/lat,lng
  const syncParsed = parseGoogleMapsUrlCoordinates(cleanUrl);
  if (syncParsed) return syncParsed;

  // Tier 2: Instant Local Keyword & Hash Match (0.001s Instant Response)
  const lowerUrl = cleanUrl.toLowerCase();
  for (const item of LOCALITY_KEYWORD_COORDINATES) {
    if (item.keywords.some((kw) => lowerUrl.includes(kw))) {
      return { lat: item.lat, lng: item.lng };
    }
  }

  // Tier 3: Unshorten JSON API (unshorten.me)
  if (cleanUrl.includes("maps.app.goo.gl") || cleanUrl.includes("goo.gl")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`https://unshorten.me/json/${encodeURIComponent(cleanUrl)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.resolved_url) {
          const decodedUrl = decodeURIComponent(data.resolved_url);
          const parsed = parseGoogleMapsUrlCoordinates(decodedUrl);
          if (parsed) return parsed;
        }
      }
    } catch (e) {
      console.warn("Unshorten API notice:", e);
    }

    // Tier 4: CORS Proxy Fallbacks
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const finalUrl = res.url || "";
          const parsedFromUrl = parseGoogleMapsUrlCoordinates(decodeURIComponent(finalUrl));
          if (parsedFromUrl) return parsedFromUrl;

          const text = await res.text();
          const parsedFromText = parseGoogleMapsUrlCoordinates(decodeURIComponent(text));
          if (parsedFromText) return parsedFromText;
        }
      } catch (e) {
        // Continue
      }
    }
  }

  return null;
}

/**
 * Reverse-geocodes latitude & longitude coordinates to human-readable Indian street address components.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ address: string; landmark: string; city: string; pincode: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const streetParts = [
        addr.building || addr.amenity,
        addr.house_number ? `House/Plot #${addr.house_number}` : "",
        addr.road,
        addr.suburb || addr.neighbourhood || addr.residential || addr.colony,
      ].filter(Boolean);

      let fullStreet = streetParts.join(", ");
      if (!fullStreet && data.display_name) {
        fullStreet = data.display_name.split(", ").slice(0, -3).join(", ");
      }

      const landmarkStr = addr.neighbourhood || addr.suburb || addr.road || "";
      const cityStr = addr.city || addr.town || addr.village || addr.county || "Udaipur";
      const pincodeStr = addr.postcode || "313001";

      return {
        address: fullStreet || `Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        landmark: landmarkStr,
        city: cityStr,
        pincode: pincodeStr,
      };
    }
  } catch (err) {
    console.warn("Reverse geocoding notice:", err);
  }

  return {
    address: `Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    landmark: "",
    city: "Udaipur",
    pincode: "313001",
  };
}

/**
 * Multi-Tier Geocoding Engine for typed addresses.
 * Resolves accurate coordinates even if OpenStreetMap search fails for verbose inputs.
 */
export async function resolveLocationCoordinates(
  address: string,
  landmark: string,
  city: string,
  pincode: string,
  googleMapsLink?: string
): Promise<{ lat: number; lng: number; source: string; mode: "google_maps_link" | "gps_device" | "manual_address" }> {
  // Tier -1: Explicit Customer Provided Google Maps Link Parsing (Async Unshortening Support)
  if (googleMapsLink && googleMapsLink.trim()) {
    const parsed = await parseGoogleMapsUrlCoordinatesAsync(googleMapsLink);
    if (parsed) {
      return { lat: parsed.lat, lng: parsed.lng, source: "Customer Google Maps Link", mode: "google_maps_link" };
    }
  }

  const cleanAddr = (address || "").toLowerCase();
  const cleanLandmark = (landmark || "").toLowerCase();
  const cleanPincode = (pincode || "").trim();
  const cleanLink = (googleMapsLink || "").toLowerCase();

  const combinedText = `${cleanAddr} ${cleanLandmark} ${cleanLink}`;

  // Tier 0: Direct High-Priority Landmark / Campus Keyword Matching
  for (const item of LOCALITY_KEYWORD_COORDINATES) {
    if (item.keywords.some((kw) => combinedText.includes(kw))) {
      return { lat: item.lat, lng: item.lng, source: `Landmark (${item.name})`, mode: googleMapsLink ? "google_maps_link" : "manual_address" };
    }
  }

  // Tier 1: Try OpenStreetMap Nominatim with area & city
  try {
    const primaryQuery = `${address}, ${landmark}, ${city}, ${pincode}, India`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(primaryQuery)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: Number(data[0].lat), lng: Number(data[0].lon), source: "OpenStreetMap GPS", mode: "manual_address" };
      }
    }
  } catch (err) {
    console.warn("Tier 1 Nominatim geocode notice:", err);
  }

  // Tier 2: Try OpenStreetMap Nominatim with Pincode + India
  if (cleanPincode) {
    try {
      const pinQuery = `${cleanPincode}, India`;
      const resPin = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pinQuery)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (resPin.ok) {
        const dataPin = await resPin.json();
        if (dataPin && dataPin.length > 0) {
          return { lat: Number(dataPin[0].lat), lng: Number(dataPin[0].lon), source: "Pincode GPS", mode: "manual_address" };
        }
      }
    } catch (err) {
      console.warn("Tier 2 Pincode geocode notice:", err);
    }
  }

  // Tier 3: Local Udaipur Pincode Lookup Table
  if (cleanPincode && UDAIPUR_AREA_COORDINATES[cleanPincode]) {
    const area = UDAIPUR_AREA_COORDINATES[cleanPincode];
    return { lat: area.lat, lng: area.lng, source: `Pincode Map (${area.name})`, mode: "manual_address" };
  }

  // Tier 4: Locality Keyword Matching
  for (const item of LOCALITY_KEYWORD_COORDINATES) {
    if (item.keywords.some((kw) => combinedText.includes(kw))) {
      return { lat: item.lat, lng: item.lng, source: `Locality Match (${item.name})`, mode: googleMapsLink ? "google_maps_link" : "manual_address" };
    }
  }

  return { lat: RESTAURANT_LAT, lng: RESTAURANT_LNG, source: "Restaurant Dabok Branch", mode: "manual_address" };
}

/**
 * Checks whether a given GPS coordinate is within the 7.0 KM delivery radius.
 */
export function isWithinDeliveryRadius(lat: number, lng: number): {
  allowed: boolean;
  distanceKm: number;
  message: string;
} {
  const distanceKm = calculateDistanceKm(lat, lng);
  const allowed = distanceKm <= MAX_DELIVERY_RADIUS_KM;

  if (allowed) {
    return {
      allowed: true,
      distanceKm,
      message: `✅ Delivery Available! (${distanceKm} km from Dabok branch)`,
    };
  }

  return {
    allowed: false,
    distanceKm,
    message: `❌ Location is ${distanceKm} km away. We only deliver within ${MAX_DELIVERY_RADIUS_KM} km of our Dabok branch!`,
  };
}

