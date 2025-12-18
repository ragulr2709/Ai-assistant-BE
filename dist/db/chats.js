"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessages = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
const pg_core_3 = require("drizzle-orm/pg-core");
exports.chatMessages = (0, pg_core_3.pgTable)("chat_messages", {
    id: (0, pg_core_2.uuid)("id").primaryKey().defaultRandom(),
    sessionId: (0, pg_core_2.uuid)("session_id"),
    userId: (0, pg_core_2.text)("user_id").notNull(),
    heading: (0, pg_core_2.text)("heading"),
    message: (0, pg_core_1.jsonb)("message").notNull(),
    question: (0, pg_core_2.text)("question"),
    answer: (0, pg_core_2.text)("answer"),
    createdAt: (0, pg_core_3.timestamp)("created_at").defaultNow()
});
//# sourceMappingURL=chats.js.map