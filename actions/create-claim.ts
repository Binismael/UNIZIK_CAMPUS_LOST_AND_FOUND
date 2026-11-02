import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "Claim a found item by describing something only the owner would know.",
  schema: z.object({
    itemId: z.string(),
    proofText: z.string().trim().min(20, "Give at least 20 characters of proof").max(600),
  }),
  run: async ({ itemId, proofText }) => {
    const email = requireEmail();
    const item = await getItemOrFail(itemId);
    if (item.finderEmail === email) fail("You can't claim an item you posted.");
    if (item.status !== "found") fail("This item is no longer open for claims.");
    const db = getDb();
    const [existing] = await db
      .select({ id: schema.claims.id })
      .from(schema.claims)
      .where(
        and(
          eq(schema.claims.itemId, itemId),
          eq(schema.claims.claimantEmail, email),
          eq(schema.claims.status, "pending"),
        ),
      );
    if (existing) fail("You already have a pending claim on this item.");
    const [row] = await db
      .insert(schema.claims)
      .values({ id: crypto.randomUUID(), itemId, claimantEmail: email, proofText, status: "pending" })
      .returning();
    return row;
  },
});
