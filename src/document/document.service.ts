import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { documents, documentChunks } from '../db/schema';
import { PdfLoaderService } from './application/pdf-loader.service';
import { VectorStoreService } from './application/vector-store.service';
import { DocumentResponseDto, QueryResultDto } from './dto/document-response.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { chatMessages } from 'src/db/chats';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly uploadDir = './uploads';

  constructor(
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof schema>,
    private readonly pdfLoaderService: PdfLoaderService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly configService: ConfigService,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Error creating upload directory: ${error.message}`);
    }
  }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
  ): Promise<DocumentResponseDto> {
    try {
      this.logger.log(`Uploading document: ${file.originalname} for user: ${userId}`);

      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Only PDF files are allowed');
      }

      // Generate unique filename
      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, filename);

      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Create document record in database
      const [document] = await this.db
        .insert(documents)
        .values({
          userId,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          status: 'processing',
        })
        .returning();

      // Process document asynchronously
      this.processDocument(document.id, filePath).catch((error) => {
        this.logger.error(`Error processing document ${document.id}: ${error.message}`);
        this.updateDocumentStatus(document.id, 'failed', error.message);
      });

      return this.mapToResponseDto(document);
    } catch (error) {
      this.logger.error(`Error uploading document: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processDocument(documentId: string, filePath: string): Promise<void> {
    try {
      this.logger.log(`Processing document: ${documentId}`);

      // Load and split PDF
      const docs = await this.pdfLoaderService.loadAndSplitPdf(filePath);

      // Add documents to vector store
      await this.vectorStoreService.addDocuments(documentId, docs);

      // Update document status to completed
      await this.updateDocumentStatus(documentId, 'completed');

      this.logger.log(`Successfully processed document: ${documentId}`);
    } catch (error) {
      this.logger.error(`Error processing document: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateDocumentStatus(
    documentId: string,
    status: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.db
      .update(documents)
      .set({
        status,
        errorMessage,
      })
      .where(eq(documents.id, documentId));
  }

  async getDocuments(userId: string): Promise<DocumentResponseDto[]> {
    try {
      const userDocuments = await this.db
        .select()
        .from(documents)
        .where(eq(documents.userId, userId));

      return userDocuments.map(this.mapToResponseDto);
    } catch (error) {
      this.logger.error(`Error getting documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDocument(documentId: string, userId: string): Promise<DocumentResponseDto> {
    try {
      const [document] = await this.db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId));

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      if (document.userId !== userId) {
        throw new NotFoundException('Document not found');
      }

      return this.mapToResponseDto(document);
    } catch (error) {
      this.logger.error(`Error getting document: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      const [document] = await this.db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId));

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      if (document.userId !== userId) {
        throw new NotFoundException('Document not found');
      }

      // Delete file from disk
      const filePath = path.join(this.uploadDir, document.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        this.logger.warn(`Could not delete file ${filePath}: ${error.message}`);
      }

      // Delete vector embeddings
      await this.vectorStoreService.deleteDocumentChunks(documentId);

      // Delete document record (chunks will be cascade deleted)
      await this.db.delete(documents).where(eq(documents.id, documentId));

      this.logger.log(`Successfully deleted document: ${documentId}`);
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`, error.stack);
      throw error;
    }
  }

  async queryDocuments(
    userId: string,
    query: string,
    k: number = 5,
    documentId?: string,
    sessionId?: string,
  ): Promise<QueryResultDto[]> {
    try {
      this.logger.log(`Querying documents for user ${userId}: "${query}"`);

      // If documentId is provided, verify it belongs to the user
      if (documentId) {
        await this.getDocument(documentId, userId);
      }

      const results = await this.vectorStoreService.similaritySearch(
        query,
        k,
        documentId,
      );

      await this.db.insert(chatMessages).values({
        sessionId: sessionId,
        userId: userId,
        heading: query,
        message: results,
        question: query,
        answer: results.answer,
      });

      // Log if no relevant results found
      if (results.length === 0) {
        this.logger.log(
          `No relevant documents found for query: "${query}". ` +
          `This means no content matched the similarity threshold.`
        );
      }

      return results;
    } catch (error) {
      this.logger.error(`Error querying documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToResponseDto(document: any): DocumentResponseDto {
    return {
      id: document.id,
      userId: document.userId,
      filename: document.filename,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      uploadedAt: document.uploadedAt,
      status: document.status,
      errorMessage: document.errorMessage,
    };
  }
}

