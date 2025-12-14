import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { DbModule } from './db/drizzle.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { AgentModule } from './agent/agent.module';
import { DocumentModule } from './document/document.module';
import { ChatModule } from './chats/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DbModule,
    UserModule,
    AuthModule,
    KnowledgeBaseModule,
    AgentModule,
    DocumentModule,
    ChatModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
