import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("USERS", {
  id: uuid().defaultRandom().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 50 }).notNull().default("user"),
});
