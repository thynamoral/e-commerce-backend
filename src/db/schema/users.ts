import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("USERS", {
  id: uuid().defaultRandom().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),
  firstName: varchar({ length: 100 }),
  lastName: varchar({ length: 100 }),
  role: varchar({ length: 50 }).notNull().default("user"),
  googleId: varchar({ length: 255 }),
  isEmailVerified: boolean().default(false),
  verificationToken: varchar({ length: 255 }),
  resetPasswordToken: varchar({ length: 255 }),
  resetPasswordExpires: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
