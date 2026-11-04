import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod@3.23.8";

// Check Google AI Studio for the current Flash model name.
const GEMINI_MODEL = "gemini-2.5-flash";
const CATEGORIES = ["Phones", "IDs", "Chargers", "Books", "Bags", "Keys", "Other"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const capped = (n: number) => z.string().catch("").transform((s) => s.trim().slice(0, n));
const tagsSchema = z.object({
  title: capped(60),
  category: z.string().catch("Other").transform((c) => (CATEGORIES.includes(c) ? c : "Other")),
  colors: z
    .array(z.string())
    .catch([])
    .transform((cs) => cs.slice(0, 4).map((c) => c.trim().slice(0, 20)).filter(Boolean)),
  brand: capped(40),
  marks: capped(80),
  summary: capped(200),
});

async function gemini(mimeType: string, data: string): Promise<unknown | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data } },
              {
                text: `This photo shows an item found on a university campus. Describe it for a lost-and-found board. Reply with JSON only: {"title": short name like "Black Dell charger", "category": one of ${JSON.stringify(CATEGORIES)}, "colors": string[], "brand": string or "", "marks": distinguishing marks like stickers, tape, cracks or "", "summary": one sentence}. Never include ID numbers, names or other personal details visible in the photo.`,
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    },
  );
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 500);
    console.error(`Gemini ${res.status}: ${detail}`);
    throw new Error(`gemini-${res.status}`);
  }
  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { image } = await req.json();
    const match = typeof image === "string" && image.length < 7_000_000
      ? /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image)
      : null;
    if (!match) return json({ error: "Send a JPEG, PNG or WebP image under 5 MB." }, 400);
    if (!Deno.env.get("GEMINI_API_KEY")) return json({ tags: null, reason: "not-configured" });
    let raw: unknown = null;
    try {
      raw = await gemini(match[1], match[2]);
    } catch (e) {
      console.error("tag-item gemini error", e);
      return json({ tags: null, reason: "failed", detail: e instanceof Error ? e.message : "unknown" });
    }
    const parsed = raw ? tagsSchema.safeParse(raw) : null;
    if (!parsed?.success) return json({ tags: null, reason: "failed", detail: "unparseable" });
    return json({ tags: parsed.data, reason: null });
  } catch {
    return json({ tags: null, reason: "failed" });
  }
});
