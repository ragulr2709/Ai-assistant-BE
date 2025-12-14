import { jsonb } from "drizzle-orm/pg-core";
import { text, uuid } from "drizzle-orm/pg-core";
import { pgTable, timestamp } from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id"),
  userId: text("user_id").notNull(),
  heading: text("heading"),
  message: jsonb("message").notNull(),
  question: text("question"),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow()
});

  