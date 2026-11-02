import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { CATEGORIES, publicItem, requireEmail } from "../server/lib/campus.js";
import { geminiJson } from "../server/lib/gemini.js";

const capped = (n: number) => z.string().trim().max(n).catch("");
const criteriaSchema = z.object({
  category: capped(30),
  colors: z.array(z.string().trim().max(20)).max(5).catch([]),
  brand: capped(40),
  marks: capped(80),
  location: capped(80),
});
type Criteria = z.infer<typeof criteriaSchema>;

const COLORS = ["black", "white", "blue", "red", "green", "yellow", "grey", "gray", "silver", "gold", "pink", "purple", "brown", "orange"];
const BRANDS = ["dell", "hp", "lenovo", "apple", "samsung", "tecno", "infinix", "itel", "oppo", "xiaomi", "nokia", "asus", "acer", "toshiba", "anker", "oraimo"];
const CATEGORY_WORDS: Record<string, string[]> = {
  Chargers: ["charger", "adapter", "cable", "brick"],
  Phones: ["phone", "iphone", "android", "earbuds", "airpods"],
  IDs: ["id", "card", "lanyard", "identity"],
  Books: ["book", "textbook", "notebook", "note"],
  Bags: ["bag", "backpack", "purse"],
  Keys: ["key", "keys"],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function heuristicCriteria(query: string): Criteria {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const category =
    Object.entries(CATEGORY_WORDS).find(([, ws]) => ws.some((w) => words.includes(w) || words.includes(`${w}s`)))?.[0] ?? "";
  const withIdx = words.indexOf("with");
  const markWords = withIdx >= 0 ? words.slice(withIdx + 1) : [];
  const marks = markWords.join(" ");
  const colors = COLORS.filter((c) => words.includes(c) && !markWords.includes(c)).map(cap);
  const brand = BRANDS.find((b) => words.includes(b)) ?? "";
  return { category, colors, brand: brand ? (brand.length <= 3 ? brand.toUpperCase() : cap(brand)) : "", marks, location: "" };
}

const norm = (s: string) => s.toLowerCase().trim();
const tokens = (s: string) => norm(s).split(/[^a-z0-9]+/).filter((t) => t.length > 2);

export default defineAction({
  description:
    "Search found items in plain language. Gemini extracts category, colours, brand, marks and location, then items are scored and ranked. Falls back to keyword search if Gemini is unavailable.",
  schema: z.object({ query: z.string().trim().min(1).max(200) }),
  http: { method: "GET" },
  run: async ({ query }) => {
    const email = requireEmail();
    const raw = await geminiJson(
      [
        {
          text: `A university student is searching a lost-and-found board. Extract search criteria from their query and reply with JSON only: {"category": one of ${JSON.stringify(CATEGORIES)} or "", "colors": string[], "brand": string, "marks": string (distinguishing marks), "location": string}. Use "" or [] when unknown.\nQuery: ${JSON.stringify(query)}`,
        },
      ],
      8000,
    );
    const parsed = raw ? criteriaSchema.safeParse(raw) : null;
    const usedAi = Boolean(parsed?.success);
    const criteria = parsed?.success ? parsed.data : heuristicCriteria(query);

    const rows = await getDb()
      .select()
      .from(schema.items)
      .where(eq(schema.items.status, "found"))
      .orderBy(desc(schema.items.foundAt))
      .limit(500);

    const queryTokens = tokens(query);
    const scored = rows
      .map((item) => {
        let score = 0;
        if (criteria.category && norm(item.category) === norm(criteria.category)) score += 3;
        const itemColors = item.colors.map(norm);
        for (const c of criteria.colors) if (itemColors.includes(norm(c))) score += 2;
        if (criteria.brand && norm(item.brand) === norm(criteria.brand)) score += 3;
        const markTokens = tokens(criteria.marks);
        const itemMarks = tokens(`${item.marks} ${item.summary}`);
        if (markTokens.length && markTokens.every((t) => itemMarks.includes(t))) score += 3;
        if (criteria.location && norm(item.location).includes(norm(criteria.location))) score += 1;
        const haystack = tokens(
          [item.title, item.category, item.colors.join(" "), item.brand, item.marks, item.summary, item.location].join(" "),
        );
        for (const t of queryTokens) if (haystack.some((h) => h.startsWith(t) || t.startsWith(h))) score += 0.5;
        return { item, score };
      })
      .filter((r) => r.score >= 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const top = scored[0]?.score ?? 0;
    return {
      criteria,
      usedAi,
      results: scored.map((r, i) => ({
        ...publicItem(r.item, email),
        match: i === 0 && top >= 6 ? ("best" as const) : ("possible" as const),
      })),
    };
  },
});
