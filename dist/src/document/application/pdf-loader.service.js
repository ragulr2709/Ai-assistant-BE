"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PdfLoaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfLoaderService = void 0;
const common_1 = require("@nestjs/common");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const textsplitters_1 = require("@langchain/textsplitters");
let PdfLoaderService = PdfLoaderService_1 = class PdfLoaderService {
    logger = new common_1.Logger(PdfLoaderService_1.name);
    textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    async loadAndSplitPdf(filePath) {
        try {
            this.logger.log(`Loading PDF from: ${filePath}`);
            const loader = new pdf_1.PDFLoader(filePath);
            const docs = await loader.load();
            this.logger.log(`Loaded ${docs.length} pages from PDF`);
            const splitDocs = await this.textSplitter.splitDocuments(docs);
            this.logger.log(`Split into ${splitDocs.length} chunks`);
            return splitDocs;
        }
        catch (error) {
            this.logger.error(`Error loading PDF: ${error.message}`, error.stack);
            throw error;
        }
    }
    async loadPdfPages(filePath) {
        try {
            this.logger.log(`Loading PDF pages from: ${filePath}`);
            const loader = new pdf_1.PDFLoader(filePath);
            const pages = await loader.load();
            this.logger.log(`Loaded ${pages.length} pages from PDF`);
            return pages;
        }
        catch (error) {
            this.logger.error(`Error loading PDF pages: ${error.message}`, error.stack);
            throw error;
        }
    }
    async splitDocuments(docs) {
        try {
            const toSplit = Array.isArray(docs) ? docs : [docs];
            const splitDocs = await this.textSplitter.splitDocuments(toSplit);
            this.logger.log(`Split into ${splitDocs.length} chunks`);
            return splitDocs;
        }
        catch (error) {
            this.logger.error(`Error splitting documents: ${error.message}`, error.stack);
            throw error;
        }
    }
    async loadAndSplitPdfFromBuffer(buffer, filename) {
        try {
            this.logger.log(`Loading PDF from buffer: ${filename}`);
            const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
            const loader = new pdf_1.PDFLoader(blob);
            const docs = await loader.load();
            this.logger.log(`Loaded ${docs.length} pages from PDF`);
            const splitDocs = await this.textSplitter.splitDocuments(docs);
            this.logger.log(`Split into ${splitDocs.length} chunks`);
            return splitDocs;
        }
        catch (error) {
            this.logger.error(`Error loading PDF from buffer: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PdfLoaderService = PdfLoaderService;
exports.PdfLoaderService = PdfLoaderService = PdfLoaderService_1 = __decorate([
    (0, common_1.Injectable)()
], PdfLoaderService);
//# sourceMappingURL=pdf-loader.service.js.map