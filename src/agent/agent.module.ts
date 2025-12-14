import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { AgentController } from './agent.controller';
import { AgentExecutorService } from './agent.service';
import { AgentExecutorProvider } from './providers/agent-executor.provider';
import { GroqChatModelProvider } from './providers/groq-chat-model.provider';
import { ToolsProvider } from './providers/tool.provider';

@Module({
  imports: [ConfigModule, HttpModule, KnowledgeBaseModule],
  controllers: [AgentController],
  providers: [
    AgentExecutorService,
    GroqChatModelProvider,
    ToolsProvider,
    AgentExecutorProvider,
  ],
  exports: [AgentExecutorService],
})
export class AgentModule {}
