import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
export declare class VectorStoreService {
    private readonly pool;
    private readonly configService;
    private readonly logger;
    constructor(pool: Pool, configService: ConfigService);
    createVectorStore(documentId: string): Promise<PGVectorStore>;
    addDocuments(documentId: string, documents: Document[]): Promise<void>;
    similaritySearch(query: string, k?: number, documentId?: string): Promise<any>;
    deleteDocumentChunks(documentId: string): Promise<void>;
}
