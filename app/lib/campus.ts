export const CATEGORY_CHIPS = ["All", "Phones", "IDs", "Chargers", "Books"] as const;

export const CATEGORIES = ["Phones", "IDs", "Chargers", "Books", "Bags", "Keys", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export function itemTags(item: { colors: string[]; brand: string; marks: string }) {
  return [...item.colors, item.brand, item.marks].filter(Boolean);
}

export function guessCategory(text: string): Category {
  const t = text.toLowerCase();
  if (/charger|adapter|cable/.test(t)) return "Chargers";
  if (/phone|earbud|airpod/.test(t)) return "Phones";
  if (/\bid\b|card|lanyard/.test(t)) return "IDs";
  if (/book|notebook/.test(t)) return "Books";
  if (/bag|backpack|purse/.test(t)) return "Bags";
  if (/key/.test(t)) return "Keys";
  return "Other";
}

function parseDate(value: string) {
  const iso = value.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function relativeTime(value: string) {
  const d = parseDate(value);
  const now = new Date();
  const mins = Math.round((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 4) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (d.getTime() >= startOfToday) return "Today";
  if (d.getTime() >= startOfToday - 86400000) return "Yesterday";
  if (d.getTime() >= startOfToday - 6 * 86400000) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function dayAndTime(value: string) {
  const d = parseDate(value);
  const day = relativeTime(value);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const label = day === "Today" || day === "Yesterday" ? day : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return `${label}, ${time}`;
}

export function compressImage(file: File, maxDim = 1600, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image"));
    };
    img.src = url;
  });
}

const REPORT_PHOTO_KEY = "clf-report-photo";
export const reportDraft = {
  get: () => (typeof window === "undefined" ? null : sessionStorage.getItem(REPORT_PHOTO_KEY)),
  set: (dataUrl: string) => sessionStorage.setItem(REPORT_PHOTO_KEY, dataUrl),
  clear: () => sessionStorage.removeItem(REPORT_PHOTO_KEY),
};

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
