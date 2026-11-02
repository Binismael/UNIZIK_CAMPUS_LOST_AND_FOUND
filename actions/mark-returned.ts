import { defineAction, fail } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { getItemOrFail, requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description: "Finder-only: mark a claimed item as handed back to its owner.",
  schema: z.object({ itemId: z.string() }),
  run: async ({ itemId }) => {
    const email = requireEmail();
    const item = await getItemOrFail(itemId);
    if (item.finderEmail !== email) fail("Only the finder can mark this item returned.", { statusCode: 403 });
    if (item.status !== "claimed") fail("Approve a claim before marking the item returned.");
    await getDb().update(schema.items).set({ status: "returned" }).where(eq(schema.items.id, itemId));
    return { status: "returned" as const };
  },
});
