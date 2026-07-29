import { MapPin, ExternalLink, Navigation } from "lucide-react";

const MAPS_LINK = "https://maps.app.goo.gl/hi4wn4KoKKjm8oPP6";
const LAT = 24.620604;
const LNG = 73.853181;

// BBOX ~ 2km around MANAS Restaurant
const BBOX = `73.843181%2C24.610604%2C73.863181%2C24.630604`;

export default function MapPlaceholder({ height = "h-72" }: { height?: string }) {
  return (
    <div
      className={`group relative ${height} w-full overflow-hidden rounded-[20px] bg-[#e8ecef] ring-1 ring-black/5 dark:ring-white/10`}
    >
      {/* OSM Embed — never blocked by Google's X-Frame-Options */}
      <iframe
        title="Manas Restaurant — Udaipur Location"
        className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.1] transition-[filter] group-hover:grayscale-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${LAT}%2C${LNG}#map=16/${LAT}/${LNG}`}
      />

      {/* Subtle vignette for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      {/* Top action — opens your exact Google Maps location */}
      <a
        href={MAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-lg ring-1 ring-black/5 transition hover:scale-105 hover:bg-ink hover:text-white dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-white dark:hover:text-ink"
      >
        <ExternalLink size={14} /> View Larger Map
      </a>

      {/* Bottom card — always clickable, opens Google Maps in new tab */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 sm:right-auto sm:max-w-[92%]">
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center gap-3 rounded-2xl bg-white/95 p-2.5 pr-4 shadow-xl backdrop-blur ring-1 ring-black/5 transition hover:bg-white dark:bg-neutral-900/95 dark:ring-white/10 dark:hover:bg-neutral-900"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20">
            <MapPin size={18} />
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-[13px] font-extrabold leading-tight text-ink dark:text-white">
              Manas Restaurant
            </p>
            <p className="truncate text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
              Udaipur, Rajasthan — Tap to get directions
            </p>
          </div>
        </a>

        {/* Quick Directions button */}
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink text-white shadow-xl transition hover:scale-105 hover:bg-brand dark:bg-white dark:text-ink sm:grid"
          aria-label="Get Directions"
          title="Open in Google Maps"
        >
          <Navigation size={18} />
        </a>
      </div>
    </div>
  );
}
