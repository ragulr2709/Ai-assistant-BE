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
            const genAI = new generative_ai_1.GoogleGenerativeAI(this.configService.get("gemini.apiKey") || "");
            let generationModel = this.configService.get("gemini.generationModel");
            const pickModelFromList = async (genAIClient) => {
                if (!genAIClient || typeof genAIClient.listModels !== 'function')
                    return undefined;
                try {
                    const list = await genAIClient.listModels();
                    const models = Array.isArray(list?.models) ? list.models : Array.isArray(list) ? list : [];
                    const preferred = ['gemini-3', 'gemini-2.5', 'gemini-2.5-pro'];
                    for (const p of preferred) {
                        const m = models.find((mm) => (mm?.name || mm?.id || String(mm)).includes(p));
                        if (m)
                            return m.name || m.id || `models/${p}`;
                    }
                    const fallback = models.find((mm) => (mm?.name || mm?.id || '').toLowerCase().includes('gemini') || (mm?.name || mm?.id || '').toLowerCase().includes('bison'));
                    if (fallback)
                        return fallback.name || fallback.id || undefined;
                    return undefined;
                }
                catch (e) {
                    this.logger.warn('ListModels call failed when trying to auto-select a generation model: ' + (e?.message || String(e)));
                    return undefined;
                }
            };
            if (!generationModel || generationModel === 'latest') {
                try {
                    const pick = await pickModelFromList(genAI);
                    if (pick) {
                        generationModel = pick;
                        this.logger.log(`Auto-selected generation model: ${generationModel}`);
                    }
                    else {
                        generationModel = 'gemini-3';
                        this.logger.log(`No suitable model found via ListModels; defaulting to ${generationModel}`);
                    }
                }
                catch (e) {
                    generationModel = 'gemini-3';
                    this.logger.warn('Auto-selection failed; using default model gemini-3');
                }
            }
            if (generationModel && !generationModel.startsWith('models/')) {
                generationModel = `models/${generationModel}`;
            }
            const context = filteredResults
                .map((doc) => doc.pageContent)
                .join("\n\n");
            const prompt = `
        You are an expert AI assistant.

        Question: ${query}

        Context:
        ${context}

        Provide a clear, exact, and concise answer based strictly on the context.
        Do NOT make up anything that is not in the context.
      `;
            const extractText = (res) => {
                const r = res;
                if (r?.response && typeof r.response.text === "function") {
                    try {
                        return r.response.text();
                    }
                    catch {
                    }
                }
                if (Array.isArray(r?.candidates) && r.candidates[0]?.content) {
                    return r.candidates[0].content;
                }
                if (r?.output && typeof r.output === "string") {
                    return r.output;
                }
                return undefined;
            };
            if (!generationModel) {
                this.logger.warn('Generation model explicitly disabled; returning context as fallback answer.');
                return { answer: context || 'No relevant information found.', sources: filteredResults };
            }
            let answer = 'No answer generated.';
            try {
                const model = genAI.getGenerativeModel({ model: generationModel });
                const result = await model.generateContent(prompt);
                const text = extractText(result);
                if (text) {
                    answer = text;
                }
                else {
                    this.logger.warn(`Generation returned empty response for model ${generationModel}; falling back to context.`);
                    answer = context || answer;
                }
            }
            catch (genErr) {
                this.logger.error(`Generation failed for model ${generationModel}: ${genErr?.message || genErr}`);
                if (genErr?.status === 404) {
                    this.logger.error(`Model ${generationModel} not found or not available for this API version. ` +
                        `Set GEMINI_GENERATION_MODEL to a supported name (for example 'gemini-3' or 'gemini-2.5', or full 'models/gemini-3'), or leave it empty to disable generation.`);
                }
                answer = context || answer;
            }
            return { answer, sources: filteredResults };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
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