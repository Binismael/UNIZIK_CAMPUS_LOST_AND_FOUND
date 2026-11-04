import { IconExternalLink } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export type Pin = { lat: number; lng: number };

export const googleMapsLink = ({ lat, lng }: Pin) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export function MapPreview({ pin, title, className }: { pin: Pin; title: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-surface", className)}>
      <iframe
        title={title}
        src={`https://maps.google.com/maps?q=${pin.lat},${pin.lng}&z=17&output=embed`}
        className="block h-[180px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={googleMapsLink(pin)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center justify-center gap-2 border-t border-line bg-white px-4 text-[15px] font-bold text-link hover:underline"
      >
        Open in Google Maps <IconExternalLink size={16} aria-hidden />
      </a>
    </div>
  );
}
