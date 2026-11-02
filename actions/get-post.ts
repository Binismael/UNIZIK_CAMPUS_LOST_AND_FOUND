import { defineAction, fail } from "@agent-native/core/action";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, publicItem, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description:
    "Finder-only: get one of my posted items with its claims. Claimants are shown by name, department and level only.",
  schema: z.object({ itemId: z.string() }),
  http: { method: "GET" },
  run: async ({ itemId }) => {
    const email = requireEmail();
    const item = await getItemOrFail(itemId);
    if (item.finderEmail !== email) fail("Only the finder can view claims on this item.", { statusCode: 403 });
    const db = getDb();
    const claims = await db
      .select()
      .from(schema.claims)
      .where(eq(schema.claims.itemId, itemId))
      .orderBy(asc(schema.claims.createdAt));
    const people = claims.length
      ? await db
          .select({
            email: schema.profiles.email,
            fullName: schema.profiles.fullName,
            department: schema.profiles.department,
            level: schema.profiles.level,
          })
          .from(schema.profiles)
          .where(inArray(schema.profiles.email, claims.map((c) => c.claimantEmail)))
      : [];
    return {
      item: publicItem(item, email),
      claims: claims.map((c) => {
        const p = people.find((x) => x.email === c.claimantEmail);
        return {
          id: c.id,
          status: c.status,
          proofText: c.proofText,
          createdAt: c.createdAt,
          claimant: {
            fullName: p?.fullName || "A student",
            department: p?.department ?? "",
            level: p?.level ?? "",
          },
        };
      }),
    };
  },
});
