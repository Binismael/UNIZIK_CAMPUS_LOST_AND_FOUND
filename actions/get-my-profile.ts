import { defineAction } from "@agent-native/core/action";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description:
    "Get the signed-in student's profile, plus counts of new claims on their posts and their own pending claims.",
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const email = requireEmail();
    const db = getDb();
    const [profile] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.email, email));
    const myItems = await db
      .select({ id: schema.items.id })
      .from(schema.items)
      .where(eq(schema.items.finderEmail, email));
    const newClaims = myItems.length
      ? (
          await db
            .select({ id: schema.claims.id })
            .from(schema.claims)
            .where(
              and(
                inArray(
                  schema.claims.itemId,
                  myItems.map((i) => i.id),
                ),
                eq(schema.claims.status, "pending"),
              ),
            )
        ).length
      : 0;
    const pendingClaims = (
      await db
        .select({ id: schema.claims.id })
        .from(schema.claims)
        .where(
          and(
            eq(schema.claims.claimantEmail, email),
            eq(schema.claims.status, "pending"),
          ),
        )
    ).length;
    return { email, profile: profile ?? null, newClaims, pendingClaims };
  },
});
