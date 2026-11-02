import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { publicItem, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "List the claims the signed-in student has made, newest first, with each item.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const email = requireEmail();
    const rows = await getDb()
      .select({ claim: schema.claims, item: schema.items })
      .from(schema.claims)
      .innerJoin(schema.items, eq(schema.items.id, schema.claims.itemId))
      .where(eq(schema.claims.claimantEmail, email))
      .orderBy(desc(schema.claims.createdAt));
    return rows.map(({ claim, item }) => ({
      id: claim.id,
      status: claim.status,
      createdAt: claim.createdAt,
      item: publicItem(item, email),
    }));
  },
});
