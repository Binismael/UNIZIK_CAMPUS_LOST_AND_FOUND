import { defineAction, fail } from "@agent-native/core/action";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description:
    "Finder-only: approve or reject a pending claim. Approving rejects every other pending claim on the item and marks the item claimed.",
  schema: z.object({
    claimId: z.string(),
    decision: z.enum(["approve", "reject"]),
  }),
  run: async ({ claimId, decision }) => {
    const email = requireEmail();
    const db = getDb();
    const [claim] = await db.select().from(schema.claims).where(eq(schema.claims.id, claimId));
    if (!claim) fail("Claim not found", { statusCode: 404 });
    const item = await getItemOrFail(claim.itemId);
    if (item.finderEmail !== email) fail("Only the finder can decide this claim.", { statusCode: 403 });
    if (claim.status !== "pending") fail("This claim has already been decided.");
    const now = new Date().toISOString();
    if (decision === "reject") {
      await db.update(schema.claims).set({ status: "rejected", decidedAt: now }).where(eq(schema.claims.id, claimId));
      return { status: "rejected" as const };
    }
    if (item.status !== "found") fail("This item already has an approved claim.");
    await db.update(schema.claims).set({ status: "approved", decidedAt: now }).where(eq(schema.claims.id, claimId));
    await db
      .update(schema.claims)
      .set({ status: "rejected", decidedAt: now })
      .where(and(eq(schema.claims.itemId, item.id), eq(schema.claims.status, "pending"), ne(schema.claims.id, claimId)));
    await db.update(schema.items).set({ status: "claimed" }).where(eq(schema.items.id, item.id));
    return { status: "approved" as const };
  },
});
