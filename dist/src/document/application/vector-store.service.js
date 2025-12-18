"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VectorStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStoreService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const pgvector_1 = require("@langchain/community/vectorstores/pgvector");
const create_embedding_model_1 = require("../../application/embeddings/create-embedding-model");
const generative_ai_1 = require("@google/generative-ai");
let VectorStoreService = VectorStoreService_1 = class VectorStoreService {
    pool;
    configService;
    logger = new common_1.Logger(VectorStoreService_1.name);
    constructor(pool, configService) {
        this.pool = pool;
        this.configService = configService;
    }
    async createVectorStore(documentId) {
        const embeddings = (0, create_embedding_model_1.createTextEmbeddingModel)(this.configService, 'Document RAG');
        const vectorStore = await pgvector_1.PGVectorStore.initialize(embeddings, {
            postgresConnectionOptions: {
                connectionString: this.configService.get('DATABASE_URL'),
            },
            tableName: 'document_chunks',
            columns: {
                idColumnName: 'id',
                vectorColumnName: 'embedding',
                contentColumnName: 'content',
                metadataColumnName: 'metadata',
            },
        });
        return vectorStore;
    }
    async addDocuments(documentId, documents) {
        try {
            this.logger.log(`Adding ${documents.length} documents to vector store for document ${documentId}`);
            const docsWithMetadata = documents.map((doc, index) => ({
                ...doc,
                metadata: {
                    ...doc.metadata,
                    documentId,
                    chunkIndex: index,
                },
            }));
            const vectorStore = await this.createVectorStore(documentId);
            await vectorStore.addDocuments(docsWithMetadata);
            this.logger.log(`Successfully added documents to vector store`);
        }
        catch (error) {
            this.logger.error(`Error adding documents to vector store: ${error.message}`, error.stack);
            throw error;
        }
    }
    async similaritySearch(query, k = 5, documentId) {
        try {
            this.logger.log(`Performing similarity search for: "${query}"`);
            const vectorStore = await this.createVectorStore(documentId || '');
            let resultsWithScores;
            if (documentId) {
                resultsWithScores = await vectorStore.similaritySearchWithScore(query, k, {
                    documentId,
                });
            }
            else {
                resultsWithScores = await vectorStore.similaritySearchWithScore(query, k);
            }
            const SIMILARITY_THRESHOLD = this.configService.get('rag.similarityThreshold') || 0.2;
            const filteredResults = resultsWithScores
                .filter(([doc, score]) => score < SIMILARITY_THRESHOLD)
                .map(([doc, score]) => {
                doc.metadata = {
                    ...doc.metadata,
                    score: score,
                    similarity: 1 - score / 2,
                };
                return doc;
            });
            if (filteredResults.length === 0) {
                return { answer: "No relevant information found.", sources: [] };
            }
            const genAI = new generative_ai_1.GoogleGenerativeAI(this.configService.get('gemini.apiKey') || '');
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
            });
            const context = filteredResults
                .map(doc => doc.pageContent)
                .join("\n\n");
            const prompt = `
        You are an expert AI assistant.
  
        Question: ${query}
  
        Context:
        ${context}
  
        Provide a clear, exact, and concise answer based strictly on the context.
        Do NOT make up anything that is not in the context.
      `;
            const result = await model.generateContent(prompt);
            const answer = result.response.text();
            return {
                answer,
                sources: filteredResults,
            };
        }
        catch (error) {
            this.logger.error(`Error performing similarity search: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteDocumentChunks(documentId) {
        try {
            this.logger.log(`Deleting chunks for document ${documentId}`);
            await this.pool.query(`DELETE FROM document_chunks WHERE metadata->>'documentId' = $1`, [documentId]);
            this.logger.log(`Successfully deleted chunks for document ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Error deleting document chunks: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.VectorStoreService = VectorStoreService;
exports.VectorStoreService = VectorStoreService = VectorStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [pg_1.Pool,
        config_1.ConfigService])
], VectorStoreService);
//# sourceMappingURL=vector-store.service.js.map