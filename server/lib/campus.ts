import { fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { eq } from "drizzle-orm";

import { getDb, schema } from "../db.js";

export type ItemRow = typeof schema.items.$inferSelect;

export function requireEmail(): string {
  const email = getRequestUserEmail();
  if (!email) fail("Not signed in", { statusCode: 401 });
  return email;
}

export async function getItemOrFail(id: string): Promise<ItemRow> {
  const [item] = await getDb()
    .select()
    .from(schema.items)
    .where(eq(schema.items.id, id));
  if (!item) fail("Item not found", { statusCode: 404 });
  return item;
}

export function publicItem(item: ItemRow, viewerEmail: string) {
  const { finderEmail, ...rest } = item;
  return { ...rest, isMine: finderEmail === viewerEmail };
}

export const CATEGORIES = [
  "Phones",
  "IDs",
  "Chargers",
  "Books",
  "Bags",
  "Keys",
  "Other",
] as const;
