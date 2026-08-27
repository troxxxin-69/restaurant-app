import {
  parseGoogleMapsUrlCoordinates,
  RESTAURANT_LAT,
  RESTAURANT_LNG,
  LOCALITY_KEYWORD_COORDINATES,
  UDAIPUR_AREA_COORDINATES,
} from "./distance";

export function getOrderCoordinates(ord: any): { lat: number; lng: number; source?: string; mode?: string } {
  // Mode 1: Google Maps Link Priority
  const effectiveLink =
    ord?.google_maps_link ||
    String(ord?.address || "").match(/\[Google Maps Link:\s*([^\]]+)\]/i)?.[1] ||
    String(ord?.address || "").match(/(https:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|google\.com\/maps)[^\s()\]]+)/i)?.[1];

  if (effectiveLink) {
    const parsedLink = parseGoogleMapsUrlCoordinates(effectiveLink);
    if (parsedLink) {
      return { lat: parsedLink.lat, lng: parsedLink.lng, source: "Customer Shared Google Maps Link", mode: "google_maps_link" };
    }
  }

  // Mode 2: GPS Device Hardware Pin Priority
  const match = String(ord?.address || "").match(/GPS Pin:?\s*([0-9.-]+),\s*([0-9.-]+)/i);
  if (match && match[1] && match[2]) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng, source: "Customer Device GPS Pin", mode: "gps_device" };
    }
  }

  const latNum = Number(ord?.lat);
  const lngNum = Number(ord?.lng);
  const isDabokDefault = Math.abs(latNum - RESTAURANT_LAT) < 0.001 && Math.abs(lngNum - RESTAURANT_LNG) < 0.001;

  if (ord?.location_mode === "gps_device" && !isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
    return { lat: latNum, lng: lngNum, source: "Customer Device GPS Pin", mode: "gps_device" };
  }

  // Mode 3: Manual Address Geocoding (Institution & Locality matching)
  const fullText = `${ord?.street_address || ""} ${ord?.address || ""} ${ord?.landmark || ""}`.toLowerCase();
  for (const item of LOCALITY_KEYWORD_COORDINATES) {
    if (item.keywords.some((kw) => fullText.includes(kw))) {
      return { lat: item.lat, lng: item.lng, source: `Typed Address (${item.name})`, mode: "manual_address" };
    }
  }

  if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0 && !isDabokDefault) {
    return { lat: latNum, lng: lngNum, source: "Saved Coordinates", mode: ord?.location_mode || "manual_address" };
  }

  const pincodeStr = (ord?.pincode || String(ord?.address || "").match(/313\d{3}/)?.[0] || "").trim();
  if (pincodeStr && UDAIPUR_AREA_COORDINATES[pincodeStr]) {
    const area = UDAIPUR_AREA_COORDINATES[pincodeStr];
    return { lat: area.lat, lng: area.lng, source: `Typed Address (${area.name})`, mode: "manual_address" };
  }

  if (effectiveLink) {
    const parsed = parseGoogleMapsUrlCoordinates(effectiveLink);
    if (parsed) return { lat: parsed.lat, lng: parsed.lng, source: "Customer Shared Google Maps Link", mode: "google_maps_link" };
  }

  if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
    return { lat: latNum, lng: lngNum, source: "GPS Pin", mode: "manual_address" };
  }
  return { lat: RESTAURANT_LAT, lng: RESTAURANT_LNG, source: "Restaurant Dabok Branch", mode: "manual_address" };
}

/**
 * Returns the exact Google Maps URL for an order (shared URL priority, falling back to GPS/coordinates q=lat,lng)
 */
export function getOrderMapUrl(ord: any): string {
  const effectiveLink =
    ord?.google_maps_link ||
    String(ord?.address || "").match(/\[Google Maps Link:\s*([^\]]+)\]/i)?.[1] ||
    String(ord?.address || "").match(/(https:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|google\.com\/maps)[^\s()\]]+)/i)?.[1];

  if (effectiveLink) {
    return effectiveLink;
  }

  const coords = getOrderCoordinates(ord);
  return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
}
