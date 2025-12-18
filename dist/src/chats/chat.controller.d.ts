import { ChatService } from './chat.services';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getChats(req: any, sessionId?: string): Promise<{
        answer: string | null;
        question: string | null;
        sessionId: string | null;
        userId: string;
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
