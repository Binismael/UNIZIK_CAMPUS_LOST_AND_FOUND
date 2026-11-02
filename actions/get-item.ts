import { defineAction } from "@agent-native/core/action";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, publicItem, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "Get one item's details, plus the signed-in student's latest claim on it.",
  schema: z.object({ id: z.string() }),
  http: { method: "GET" },
  run: async ({ id }) => {
    const email = requireEmail();
    const item = await getItemOrFail(id);
    const [myClaim] = await getDb()
      .select()
      .from(schema.claims)
      .where(and(eq(schema.claims.itemId, id), eq(schema.claims.claimantEmail, email)))
      .orderBy(desc(schema.claims.createdAt))
      .limit(1);
    return { item: publicItem(item, email), myClaim: myClaim ?? null };
  },
});
