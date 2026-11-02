import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "Turn match alerts and/or notifications on or off for the signed-in student.",
  schema: z.object({
    matchAlerts: z.boolean().optional(),
    notifications: z.boolean().optional(),
  }),
  run: async (patch) => {
    const email = requireEmail();
    const [row] = await getDb()
      .update(schema.profiles)
      .set(patch)
      .where(eq(schema.profiles.email, email))
      .returning();
    if (!row) fail("Profile not found");
    return { matchAlerts: row.matchAlerts, notifications: row.notifications };
  },
});
