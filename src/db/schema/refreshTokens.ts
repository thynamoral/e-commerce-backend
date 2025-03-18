import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const refreshTokenTable = pgTable("RESFRESH_TOKENS", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow(),
});

export const refreshTokenRelations = relations(
  refreshTokenTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [refreshTokenTable.userId],
      references: [usersTable.id],
    }),
  })
);
