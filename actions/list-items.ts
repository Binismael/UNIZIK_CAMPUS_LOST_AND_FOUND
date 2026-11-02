import { defineAction } from "@agent-native/core/action";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { publicItem, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "List found items that are still waiting for their owner, newest first.",
  schema: z.object({
    category: z.string().optional().describe("Category filter, e.g. Phones, IDs, Chargers, Books"),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
  http: { method: "GET" },
  run: async ({ category, limit }) => {
    const email = requireEmail();
    const rows = await getDb()
      .select()
      .from(schema.items)
      .where(
        and(
          eq(schema.items.status, "found"),
          category && category !== "All"
            ? eq(schema.items.category, category)
            : undefined,
        ),
      )
      .orderBy(desc(schema.items.foundAt))
      .limit(limit);
    return rows.map((r) => publicItem(r, email));
  },
});
