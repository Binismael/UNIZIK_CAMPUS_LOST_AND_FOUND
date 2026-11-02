import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "Report a post that looks wrong, fake or unsafe.",
  schema: z.object({
    itemId: z.string(),
    reason: z.string().trim().min(3).max(300),
  }),
  run: async ({ itemId, reason }) => {
    const reporterEmail = requireEmail();
    await getItemOrFail(itemId);
    await getDb()
      .insert(schema.reports)
      .values({ id: crypto.randomUUID(), itemId, reporterEmail, reason });
    return { ok: true };
  },
});
