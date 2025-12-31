import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.services";
import { DbModule } from "../db/drizzle.module";
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [DbModule, AnalyticsModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
