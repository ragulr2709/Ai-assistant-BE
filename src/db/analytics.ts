import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  eventType: text("event_type").notNull(),
  eventPayload: jsonb("event_payload"),
  sessionId: uuid("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
