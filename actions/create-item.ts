import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { CATEGORIES, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "Post a found item so its owner can find and claim it.",
  schema: z.object({
    title: z.string().trim().min(2).max(60),
    category: z.enum(CATEGORIES),
    colors: z.array(z.string().trim().max(20)).max(4).default([]),
    brand: z.string().trim().max(40).default(""),
    marks: z.string().trim().max(80).default(""),
    summary: z.string().trim().max(200).default(""),
    location: z.string().trim().min(2).max(80),
    photo: z.string().max(6_000_000).nullable().optional().describe("Photo as a data URL"),
  }),
  run: async (input) => {
    const finderEmail = requireEmail();
    const [row] = await getDb()
      .insert(schema.items)
      .values({
        id: crypto.randomUUID(),
        finderEmail,
        ...input,
        colors: input.colors.filter(Boolean),
        photo: input.photo ?? null,
        status: "found",
        foundAt: new Date().toISOString(),
      })
      .returning({ id: schema.items.id });
    return row;
  },
});
