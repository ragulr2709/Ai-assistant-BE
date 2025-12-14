import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PdfLoaderService } from './application/pdf-loader.service';
import { VectorStoreService } from './application/vector-store.service';
import { DocumentRetrieverToolService } from './application/document-retriever-tool.service';
import { DbModule } from '../db/drizzle.module';

@Module({
  imports: [ConfigModule, DbModule],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    PdfLoaderService,
    VectorStoreService,
    DocumentRetrieverToolService,
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        const { Pool } = require('pg');
        return new Pool({
          connectionString: process.env.DATABASE_URL,
        });
      },
    },
  ],
  exports: [DocumentService, VectorStoreService, DocumentRetrieverToolService],
})
export class DocumentModule {}

