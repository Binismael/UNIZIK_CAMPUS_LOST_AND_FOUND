import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, publicItem, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description:
    "Claimant-only: get the finder's name, phone and residence. Only works once the finder has approved this claim.",
  schema: z.object({ claimId: z.string() }),
  http: { method: "GET" },
  run: async ({ claimId }) => {
    const email = requireEmail();
    const db = getDb();
    const [claim] = await db.select().from(schema.claims).where(eq(schema.claims.id, claimId));
    if (!claim || claim.claimantEmail !== email) fail("Claim not found", { statusCode: 404 });
    const item = await getItemOrFail(claim.itemId);
    if (claim.status !== "approved") {
      return { status: claim.status, item: publicItem(item, email), contact: null };
    }
    const [finder] = await db
      .select({
        fullName: schema.profiles.fullName,
        phone: schema.profiles.phone,
        residence: schema.profiles.residence,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.email, item.finderEmail));
    return { status: claim.status, item: publicItem(item, email), contact: finder ?? null };
  },
});
