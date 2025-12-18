"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const chats_1 = require("../db/chats");
let ChatService = ChatService_1 = class ChatService {
    db;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(db) {
        this.db = db;
    }
    async getChatsByUserAndSession(userId, sessionId) {
        try {
            this.logger.log(`Fetching chats for user ${userId} and session ${sessionId}`);
            const chats = await this.db
                .select({
                answer: chats_1.chatMessages.answer,
                question: chats_1.chatMessages.question,
                sessionId: chats_1.chatMessages.sessionId,
                userId: chats_1.chatMessages.userId
            })
                .from(chats_1.chatMessages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(chats_1.chatMessages.userId, userId), (0, drizzle_orm_1.eq)(chats_1.chatMessages.sessionId, sessionId)));
            if (!chats || chats.length === 0) {
                this.logger.log(`No chats found for user ${userId} and session ${sessionId}`);
                return [];
            }
            this.logger.log(`Found ${chats.length} chats for user ${userId} and session ${sessionId}`);
            return chats;
        }
        catch (error) {
            this.logger.error(`Error fetching chats: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getChatsByUser(userId) {
        try {
            this.logger.log(`Fetching all chats for user ${userId}`);
            const chats = await this.db
                .select()
                .from(chats_1.chatMessages)
                .where((0, drizzle_orm_1.eq)(chats_1.chatMessages.userId, userId));
            this.logger.log(`Found ${chats.length} chats for user ${userId}`);
            return chats;
        }
        catch (error) {
            this.logger.error(`Error fetching chats by user: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getChatsBySession(sessionId) {
        try {
            this.logger.log(`Fetching all chats for session ${sessionId}`);
            const chats = await this.db
                .select()
                .from(chats_1.chatMessages)
                .where((0, drizzle_orm_1.eq)(chats_1.chatMessages.sessionId, sessionId));
            this.logger.log(`Found ${chats.length} chats for session ${sessionId}`);
            return chats;
        }
        catch (error) {
            this.logger.error(`Error fetching chats by session: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], ChatService);
//# sourceMappingURL=chat.services.js.map