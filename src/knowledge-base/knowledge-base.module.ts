import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnowledgeBaseService } from './application/knowledge-base.service';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [ConfigModule, DocumentModule],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}

