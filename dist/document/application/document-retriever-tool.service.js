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
var DocumentRetrieverToolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRetrieverToolService = void 0;
const common_1 = require("@nestjs/common");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const vector_store_service_1 = require("./vector-store.service");
let DocumentRetrieverToolService = DocumentRetrieverToolService_1 = class DocumentRetrieverToolService {
    vectorStoreService;
    logger = new common_1.Logger(DocumentRetrieverToolService_1.name);
    constructor(vectorStoreService) {
        this.vectorStoreService = vectorStoreService;
    }
    createDocumentSearchTool() {
        const self = this;
        const documentSearchSchema = zod_1.z.object({
            query: zod_1.z.string().describe('The search query or question to find relevant document excerpts'),
        });
        return new tools_1.DynamicStructuredTool({
            name: 'search-uploaded-documents',
            description: 'Search through the user\'s uploaded PDF documents for relevant information. ' +
                'Use this tool FIRST when the question might be answered by documents the user has uploaded. ' +
                'Returns relevant excerpts from documents with context. ' +
                'Input should be a search query or question.',
            schema: documentSearchSchema,
            func: async (input) => {
                try {
                    const { query } = input;
                    self.logger.log(`Searching documents for: "${query}"`);
                    const results = await self.vectorStoreService.similaritySearch(query, 5);
                    if (results.length === 0) {
                        return 'No relevant information found in uploaded documents that matches your query. ' +
                            'The documents may not contain information about this topic. ' +
                            'Try rephrasing your question or use web search instead.';
                    }
                    const formattedResults = results.map((doc, index) => {
                        const docId = doc.metadata.documentId || 'unknown';
                        const similarity = doc.metadata.similarity || 0;
                        const content = doc.pageContent;
                        const similarityPercent = (similarity * 100).toFixed(1);
                        return `[Document ${index + 1} - ID: ${docId} - Relevance: ${similarityPercent}%]\n${content}`;
                    }).join('\n\n---\n\n');
                    return `Found ${results.length} relevant excerpts from uploaded documents:\n\n${formattedResults}`;
                }
                catch (error) {
                    self.logger.error(`Error searching documents: ${error.message}`, error.stack);
                    return 'Error searching documents. The document database may be empty or unavailable.';
                }
            },
        });
    }
};
exports.DocumentRetrieverToolService = DocumentRetrieverToolService;
exports.DocumentRetrieverToolService = DocumentRetrieverToolService = DocumentRetrieverToolService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vector_store_service_1.VectorStoreService])
], DocumentRetrieverToolService);
//# sourceMappingURL=document-retriever-tool.service.js.map