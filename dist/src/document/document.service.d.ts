import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { PdfLoaderService } from './application/pdf-loader.service';
import { VectorStoreService } from './application/vector-store.service';
import { DocumentResponseDto, QueryResultDto } from './dto/document-response.dto';
export declare class DocumentService {
    private readonly db;
    private readonly pdfLoaderService;
    private readonly vectorStoreService;
    private readonly configService;
    private readonly logger;
    private readonly uploadDir;
    constructor(db: NodePgDatabase<typeof schema>, pdfLoaderService: PdfLoaderService, vectorStoreService: VectorStoreService, configService: ConfigService);
    private ensureUploadDir;
    uploadDocument(file: Express.Multer.File, userId: string): Promise<DocumentResponseDto>;
    private processDocument;
    private updateDocumentStatus;
    getDocuments(userId: string): Promise<DocumentResponseDto[]>;
    getDocument(documentId: string, userId: string): Promise<DocumentResponseDto>;
    deleteDocument(documentId: string, userId: string): Promise<void>;
    queryDocuments(userId: string, query: string, k?: number, documentId?: string, sessionId?: string): Promise<QueryResultDto[]>;
    private mapToResponseDto;
}
