import { sql } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  email: text("email").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  admissionNumber: text("admission_number").unique(),
  faculty: text("faculty").notNull().default(""),
  department: text("department").notNull().default(""),
  level: text("level").notNull().default(""),
  residence: text("residence").notNull().default(""),
  phone: text("phone").notNull().default(""),
  profileComplete: boolean("profile_complete").notNull().default(false),
  matchAlerts: boolean("match_alerts").notNull().default(true),
  notifications: boolean("notifications").notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  finderEmail: text("finder_email").notNull(),
  photo: text("photo"),
  title: text("title").notNull(),
  category: text("category").notNull(),
  colors: text("colors").array().notNull().default(sql`ARRAY[]::text[]`),
  brand: text("brand").notNull().default(""),
  marks: text("marks").notNull().default(""),
  summary: text("summary").notNull().default(""),
  location: text("location").notNull(),
  status: text("status").notNull().default("found"),
  foundAt: text("found_at").notNull().default(sql`now()`),
});

export const claims = pgTable("claims", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  claimantEmail: text("claimant_email").notNull(),
  proofText: text("proof_text").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  decidedAt: text("decided_at"),
});

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  reporterEmail: text("reporter_email").notNull(),
  reason: text("reason").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});
