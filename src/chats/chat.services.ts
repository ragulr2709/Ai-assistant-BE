import { Injectable, Logger, Inject, NotFoundException } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import { chatMessages } from "../db/chats";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject("DRIZZLE") private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getChatsByUserAndSession(userId: string, sessionId: string) {
    try {
      this.logger.log(
        `Fetching chats for user ${userId} and session ${sessionId}`,
      );

      const chats = await this.db
        .select({
          answer: chatMessages.answer,
          question: chatMessages.question,
          sessionId: chatMessages.sessionId,
          userId: chatMessages.userId,
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.userId, userId),
            eq(chatMessages.sessionId, sessionId),
          ),
        );

      if (!chats || chats.length === 0) {
        this.logger.log(
          `No chats found for user ${userId} and session ${sessionId}`,
        );
        return [];
      }

      this.logger.log(
        `Found ${chats.length} chats for user ${userId} and session ${sessionId}`,
      );
      return chats;
    } catch (error) {
      this.logger.error(`Error fetching chats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getChatsByUser(userId: string) {
    try {
      this.logger.log(`Fetching all chats for user ${userId}`);

      const chats = await this.db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, userId));

      this.logger.log(`Found ${chats.length} chats for user ${userId}`);
      return chats;
    } catch (error) {
      this.logger.error(
        `Error fetching chats by user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getChatsBySession(sessionId: string) {
    try {
      this.logger.log(`Fetching all chats for session ${sessionId}`);

      const chats = await this.db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));

      this.logger.log(`Found ${chats.length} chats for session ${sessionId}`);
      return chats;
    } catch (error) {
      this.logger.error(
        `Error fetching chats by session: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
