import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.services';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getChats(
    @Request() req,
    @Query('sessionId') sessionId?: string,
  ) {
    console.log(sessionId);
    console.log(req.user);
    const userId = req.user.id;

    if (sessionId) {
      // If sessionId is provided, fetch chats by both userId and sessionId
      return this.chatService.getChatsByUserAndSession(userId, sessionId);
    } else {
      // If no sessionId, fetch all chats for the user
      return this.chatService.getChatsByUser(userId);
    }
  }

  @Get('session')
  async getChatsBySession(@Query('sessionId') sessionId: string) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }
    return this.chatService.getChatsBySession(sessionId);
  }
}
