import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { CATEGORIES, requireEmail } from "../server/lib/campus.js";
import { geminiConfigured, geminiJson } from "../server/lib/gemini.js";

const capped = (n: number) =>
  z
    .string()
    .catch("")
    .transform((s) => s.trim().slice(0, n));

const tagsSchema = z.object({
  title: capped(60),
  category: z
    .string()
    .catch("Other")
    .transform((c) => (CATEGORIES as readonly string[]).includes(c) ? c : "Other"),
  colors: z
    .array(z.string())
    .catch([])
    .transform((cs) => cs.slice(0, 4).map((c) => c.trim().slice(0, 20)).filter(Boolean)),
  brand: capped(40),
  marks: capped(80),
  summary: capped(200),
});

export default defineAction({
  description:
    "Send a photo of a found item to Gemini and get back suggested tags (title, category, colours, brand, marks, summary). Returns tags: null if Gemini is unavailable.",
  schema: z.object({
    image: z.string().max(6_000_000).describe("Image as a data URL"),
  }),
  run: async ({ image }) => {
    requireEmail();
    const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image);
    if (!match) fail("Unsupported image format");
    if (!geminiConfigured()) return { tags: null, reason: "not-configured" as const };
    const raw = await geminiJson([
      { inlineData: { mimeType: match[1] ?? "image/jpeg", data: match[2] ?? "" } },
      {
        text: `This photo shows an item found on a university campus. Describe it for a lost-and-found board. Reply with JSON only: {"title": short name like "Black Dell charger", "category": one of ${JSON.stringify(CATEGORIES)}, "colors": string[], "brand": string or "", "marks": distinguishing marks like stickers, tape, cracks or "", "summary": one sentence}. Never include ID numbers, names or other personal details visible in the photo.`,
      },
    ]);
    const parsed = raw ? tagsSchema.safeParse(raw) : null;
    if (!parsed?.success) return { tags: null, reason: "failed" as const };
    return { tags: parsed.data, reason: null };
  },
});
