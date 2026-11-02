import { defineAction } from "@agent-native/core/action";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { publicItem, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "List items the signed-in student has posted, with their claim status.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const email = requireEmail();
    const db = getDb();
    const items = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.finderEmail, email))
      .orderBy(desc(schema.items.foundAt));
    const claims = items.length
      ? await db
          .select({ id: schema.claims.id, itemId: schema.claims.itemId, status: schema.claims.status })
          .from(schema.claims)
          .where(inArray(schema.claims.itemId, items.map((i) => i.id)))
          .orderBy(desc(schema.claims.createdAt))
      : [];
    return items.map((item) => {
      const mine = claims.filter((c) => c.itemId === item.id);
      const pending = mine.filter((c) => c.status === "pending");
      return {
        ...publicItem(item, email),
        pendingCount: pending.length,
        firstPendingClaimId: pending[pending.length - 1]?.id ?? null,
        approvedClaimId: mine.find((c) => c.status === "approved")?.id ?? null,
      };
    });
  },
});
