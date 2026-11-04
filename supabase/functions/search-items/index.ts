import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

// Google retires models for new keys and sheds load with 503s, so try several in order.
const GEMINI_MODELS = [
  ...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest"]),
].filter(Boolean) as string[];
const FATAL = new Set([400, 401, 403]);
const CATEGORIES = ["Phones", "IDs", "Chargers", "Books", "Bags", "Keys", "Other"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const capped = (n: number) => z.string().catch("").transform((s) => s.trim().slice(0, n));
const criteriaSchema = z.object({
  category: capped(30),
  colors: z
    .array(z.string())
    .catch([])
    .transform((cs) => cs.slice(0, 5).map((c) => c.trim().slice(0, 20)).filter(Boolean)),
  brand: capped(40),
  marks: capped(80),
  location: capped(80),
});
type Criteria = z.infer<typeof criteriaSchema>;
const EMPTY: Criteria = { category: "", colors: [], brand: "", marks: "", location: "" };

async function parseWithGemini(query: string): Promise<Criteria | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  for (const model of GEMINI_MODELS) {
    const result = await parseWith(model, key, query);
    if (result.criteria) return result.criteria;
    if (result.status && FATAL.has(result.status)) break;
  }
  return null;
}

async function parseWith(
  model: string,
  key: string,
  query: string,
): Promise<{ criteria: Criteria | null; status?: number }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `A university student is searching a lost-and-found board. Extract search criteria from their query. Reply with JSON only: {"category": one of ${JSON.stringify(CATEGORIES)} or "", "colors": string[] (colours of the item itself, capitalised), "brand": string, "marks": distinguishing marks like "blue tape", "location": string}. Use "" or [] when unknown.\nQuery: ${JSON.stringify(query)}`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json", temperature: 0 },
        }),
      },
    );
    if (!res.ok) {
      console.error(`Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 500)}`);
      return { criteria: null, status: res.status };
    }
    const body = await res.json();
    const parts: Array<{ text?: string; thought?: boolean }> = body?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("");
    const jsonText = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = jsonText ? criteriaSchema.safeParse(JSON.parse(jsonText)) : null;
    return { criteria: parsed?.success ? parsed.data : null };
  } catch {
    return { criteria: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim().slice(0, 200) : "";
    if (!query) return json({ error: "Type what you lost." }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const ai = await parseWithGemini(query);
    const criteria = ai ?? EMPTY;
    const { data, error } = await supabase.rpc("search_found_items", {
      p_query: query,
      p_category: criteria.category,
      p_colors: criteria.colors,
      p_brand: criteria.brand,
      p_marks: criteria.marks,
      p_location: criteria.location,
      p_limit: 10,
    });
    if (error) return json({ error: error.message }, 400);

    const rows = (data ?? []) as Array<Record<string, unknown> & { score: number }>;
    const top = rows[0]?.score ?? 0;
    return json({
      criteria,
      usedAi: Boolean(ai),
      results: rows.map((r, i) => ({ ...r, match: i === 0 && top >= 5 ? "best" : "possible" })),
    });
  } catch {
    return json({ error: "Search failed. Try again." }, 500);
  }
});
