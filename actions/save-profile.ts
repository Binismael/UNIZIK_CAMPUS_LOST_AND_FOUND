import { defineAction, fail } from "@agent-native/core/action";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { requireEmail } from "../server/lib/campus.js";

export default defineAction({
  description:
    "Create or update the signed-in student's campus profile and mark it complete.",
  schema: z.object({
    fullName: z.string().trim().min(2).max(80),
    admissionNumber: z.string().trim().min(3).max(40),
    faculty: z.string().trim().min(1).max(80),
    department: z.string().trim().min(1).max(80),
    level: z.string().trim().min(1).max(10),
    residence: z.string().trim().min(1).max(80),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  }),
  run: async (input) => {
    const email = requireEmail();
    const db = getDb();
    const [taken] = await db
      .select({ email: schema.profiles.email })
      .from(schema.profiles)
      .where(
        and(
          eq(schema.profiles.admissionNumber, input.admissionNumber),
          ne(schema.profiles.email, email),
        ),
      );
    if (taken) fail("That admission number is already registered.");
    const values = { ...input, profileComplete: true };
    const [row] = await db
      .insert(schema.profiles)
      .values({ email, ...values })
      .onConflictDoUpdate({ target: schema.profiles.email, set: values })
      .returning();
    return row;
  },
});
