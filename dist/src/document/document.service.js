"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const pdf_loader_service_1 = require("./application/pdf-loader.service");
const vector_store_service_1 = require("./application/vector-store.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const chats_1 = require("../db/chats");
let DocumentService = DocumentService_1 = class DocumentService {
    db;
    pdfLoaderService;
    vectorStoreService;
    configService;
    logger = new common_1.Logger(DocumentService_1.name);
    uploadDir = './uploads';
    constructor(db, pdfLoaderService, vectorStoreService, configService) {
        this.db = db;
        this.pdfLoaderService = pdfLoaderService;
        this.vectorStoreService = vectorStoreService;
        this.configService = configService;
        this.ensureUploadDir();
    }
    async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
        catch (error) {
            this.logger.error(`Error creating upload directory: ${error.message}`);
        }
    }
    async uploadDocument(file, userId) {
        try {
            this.logger.log(`Uploading document: ${file.originalname} for user: ${userId}`);
            if (file.mimetype !== 'application/pdf') {
                throw new common_1.BadRequestException('Only PDF files are allowed');
            }
            const filename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(this.uploadDir, filename);
            await fs.writeFile(filePath, file.buffer);
            const [document] = await this.db
                .insert(schema_1.documents)
                .values({
                userId,
                filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                status: 'processing',
            })
                .returning();
            this.processDocument(document.id, filePath).catch((error) => {
                this.logger.error(`Error processing document ${document.id}: ${error.message}`);
                this.updateDocumentStatus(document.id, 'failed', error.message);
            });
            return this.mapToResponseDto(document);
        }
        catch (error) {
            this.logger.error(`Error uploading document: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processDocument(documentId, filePath) {
        try {
            this.logger.log(`Processing document: ${documentId}`);
            const batchSize = parseInt(this.configService.get('RAG_BATCH_SIZE') || '50');
            const pages = await this.pdfLoaderService.loadPdfPages(filePath);
            let batch = [];
            for (const page of pages) {
                const chunks = await this.pdfLoaderService.splitDocuments(page);
                for (const chunk of chunks) {
                    batch.push({ ...chunk });
                    if (batch.length >= batchSize) {
                        this.logger.log(`Flushing batch of ${batch.length} chunks to vector store`);
                        await this.vectorStoreService.addDocuments(documentId, batch);
                        batch = [];
                    }
                }
            }
            if (batch.length > 0) {
                this.logger.log(`Flushing final batch of ${batch.length} chunks to vector store`);
                await this.vectorStoreService.addDocuments(documentId, batch);
            }
            await this.updateDocumentStatus(documentId, 'completed');
            this.logger.log(`Successfully processed document: ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Error processing document: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateDocumentStatus(documentId, status, errorMessage) {
        await this.db
            .update(schema_1.documents)
            .set({
            status,
            errorMessage,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
    }
    async getDocuments(userId) {
        try {
            const userDocuments = await this.db
                .select()
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.userId, userId));
            return userDocuments.map(this.mapToResponseDto);
        }
        catch (error) {
            this.logger.error(`Error getting documents: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getDocument(documentId, userId) {
        try {
            const [document] = await this.db
                .select()
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
            if (!document) {
                throw new common_1.NotFoundException('Document not found');
            }
            if (document.userId !== userId) {
                throw new common_1.NotFoundException('Document not found');
            }
            return this.mapToResponseDto(document);
        }
        catch (error) {
            this.logger.error(`Error getting document: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteDocument(documentId, userId) {
        try {
            const [document] = await this.db
                .select()
                .from(schema_1.documents)
                .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
            if (!document) {
                throw new common_1.NotFoundException('Document not found');
            }
            if (document.userId !== userId) {
                throw new common_1.NotFoundException('Document not found');
            }
            const filePath = path.join(this.uploadDir, document.filename);
            try {
                await fs.unlink(filePath);
            }
            catch (error) {
                this.logger.warn(`Could not delete file ${filePath}: ${error.message}`);
            }
            await this.vectorStoreService.deleteDocumentChunks(documentId);
            await this.db.delete(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
            this.logger.log(`Successfully deleted document: ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Error deleting document: ${error.message}`, error.stack);
            throw error;
        }
    }
    async queryDocuments(userId, query, k = 5, documentId, sessionId) {
        try {
            this.logger.log(`Querying documents for user ${userId}: "${query}"`);
            if (documentId) {
                await this.getDocument(documentId, userId);
            }
            const results = await this.vectorStoreService.similaritySearch(query, k, documentId);
            await this.db.insert(chats_1.chatMessages).values({
                sessionId: sessionId,
                userId: userId,
                heading: query,
                message: results,
                question: query,
                answer: results.answer,
            });
            if (results.length === 0) {
                this.logger.log(`No relevant documents found for query: "${query}". ` +
                    `This means no content matched the similarity threshold.`);
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Error querying documents: ${error.message}`, error.stack);
            throw error;
        }
    }
    mapToResponseDto(document) {
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
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase,
        pdf_loader_service_1.PdfLoaderService,
        vector_store_service_1.VectorStoreService,
        config_1.ConfigService])
], DocumentService);
//# sourceMappingURL=document.service.js.map