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

export const isHeicName = (file: File) => /\.(heic|heif)$/i.test(file.name) || /image\/hei[cf]/i.test(file.type);

export async function compressImage(file: File, maxDim = 1600, quality = 0.72): Promise<string> {
  try {
    return await drawCompressed(file, maxDim, quality);
  } catch (err) {
    // Only Safari decodes iPhone HEIC photos natively; convert them for every other browser.
    const { isHeic, heicTo } = await import("heic-to");
    if (!isHeicName(file) && !(await isHeic(file).catch(() => false))) throw err;
    const jpeg = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 }).catch(() => {
      throw new Error("Couldn't read that iPhone photo. Try taking a new one or choosing a JPG/PNG.");
    });
    return drawCompressed(jpeg, maxDim, quality);
  }
}

function drawCompressed(file: Blob, maxDim: number, quality: number): Promise<string> {
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
      reject(new Error("Couldn't read that image. Try a JPG or PNG photo."));
    };
    img.src = url;
  });
}

const LOST_WHERE = "Where and roughly when did you last have it?";
const FALLBACK_QUESTIONS: Record<string, [string, string]> = {
  Phones: ["What is your lock screen or wallpaper picture?", "Describe the case, and any crack or scratch the photo doesn't show."],
  IDs: ["What name and department are printed on the card?", "Is anything attached to it, like a lanyard, holder or keyring? Describe it."],
  Chargers: ["Which device do you charge with it?", "Describe any mark, tape or damage on the cable or plug the photo doesn't show."],
  Books: ["What is written on the first page or inside the cover?", "Name one page or section you wrote notes in or highlighted."],
  Bags: ["Name two things that were inside the bag.", "Describe any tear, stain or keychain on it the photo doesn't show."],
  Keys: ["How many keys are on it, and what do they open?", "Describe the keyring or any tag attached to it."],
};

export function fallbackClaimQuestions(category: string): string[] {
  const [a, b] = FALLBACK_QUESTIONS[category] ?? [
    "Describe something about it that the photo doesn't show.",
    "Is anything written, stuck or attached to it? What is it?",
  ];
  return [a, b, LOST_WHERE];
}

export type ProofPair = { q: string; a: string };

export function formatClaimProof(pairs: ProofPair[]) {
  return pairs.map(({ q, a }) => `Q: ${q}\nA: ${a}`).join("\n\n");
}

export function parseClaimProof(text: string): ProofPair[] | null {
  const pairs = text
    .split(/\n{2,}/)
    .map((block) => /^Q: ([\s\S]+?)\nA: ([\s\S]*)$/.exec(block.trim()))
    .map((m) => (m ? { q: m[1]!.trim(), a: m[2]!.trim() } : null));
  return pairs.length && pairs.every(Boolean) ? (pairs as ProofPair[]) : null;
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
