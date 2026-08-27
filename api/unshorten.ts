import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers for client-side fetch from Vercel & localhost
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ success: false, error: "URL parameter is required" });
  }

  try {
    const targetUrl = decodeURIComponent(url.trim());

    // Server-side HTTP request following redirects (No CORS limitations!)
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    const finalUrl = response.url || "";
    const htmlText = await response.text();
    const combined = `${finalUrl}\n${htmlText}`;

    let lat: number | null = null;
    let lng: number | null = null;

    // Pattern 1: @lat,lng (e.g. /place/GITS/@24.6186,73.8443,17z)
    const matchAt = combined.match(/@(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)/);
    if (matchAt && matchAt[1] && matchAt[2]) {
      lat = parseFloat(matchAt[1]);
      lng = parseFloat(matchAt[2]);
    }

    // Pattern 2: !3d lat !4d lng (Google Place Embed data format)
    if (!lat || !lng) {
      const match3d = combined.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/);
      if (match3d && match3d[1] && match3d[2]) {
        lat = parseFloat(match3d[1]);
        lng = parseFloat(match3d[2]);
      }
    }

    // Pattern 3: center=lat%2Clng or center=lat,lng (Google Maps Static & Meta OG Image Format)
    if (!lat || !lng) {
      const matchCenter = combined.match(/center=(-?\d{1,2}\.\d+)(?:%2C|,)\s*\+?(-?\d{1,3}\.\d+)/);
      if (matchCenter && matchCenter[1] && matchCenter[2]) {
        lat = parseFloat(matchCenter[1]);
        lng = parseFloat(matchCenter[2]);
      }
    }

    // Pattern 4: search/lat,+lng or search/lat,lng
    if (!lat || !lng) {
      const matchSearch = combined.match(/search\/(-?\d{1,2}\.\d+),\s*\+?(-?\d{1,3}\.\d+)/);
      if (matchSearch && matchSearch[1] && matchSearch[2]) {
        lat = parseFloat(matchSearch[1]);
        lng = parseFloat(matchSearch[2]);
      }
    }

    // Pattern 5: Standalone lat, lng float pair (e.g. 24.6186, 73.8443)
    if (!lat || !lng) {
      const matchPair = combined.match(/(-?\d{2}\.\d{3,}),\s*\+?(-?\d{2,3}\.\d{3,})/);
      if (matchPair && matchPair[1] && matchPair[2]) {
        lat = parseFloat(matchPair[1]);
        lng = parseFloat(matchPair[2]);
      }
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return res.status(200).json({
        success: true,
        lat,
        lng,
        resolvedUrl: finalUrl,
      });
    }

    return res.status(200).json({
      success: false,
      error: "Could not extract latitude & longitude coordinates from short link",
      resolvedUrl: finalUrl,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || "Server-side unshortener error",
    });
  }
}
