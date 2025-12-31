import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { AnalyticsService } from "../analytics/analytics.service";
export declare class ChatService {
    private readonly db;
    private readonly analyticsService;
    private readonly logger;
    constructor(db: NodePgDatabase<typeof schema>, analyticsService: AnalyticsService);
    getChatsByUserAndSession(userId: string, sessionId: string): Promise<{
        answer: string | null;
        question: string | null;
        sessionId: string | null;
        userId: string;
    }[]>;
    getChatsByUser(userId: string): Promise<{
        id: string;
        sessionId: string | null;
        userId: string;
        heading: string | null;
        message: unknown;
        question: string | null;
        answer: string | null;
        createdAt: Date | null;
    }[]>;
    getChatsBySession(sessionId: string): Promise<{
        id: string;
        sessionId: string | null;
        userId: string;
        heading: string | null;
        message: unknown;
        question: string | null;
        answer: string | null;
        createdAt: Date | null;
    }[]>;
}
