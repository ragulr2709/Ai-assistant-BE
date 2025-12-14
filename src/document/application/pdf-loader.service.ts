import { Injectable, Logger } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

@Injectable()
export class PdfLoaderService {
  private readonly logger = new Logger(PdfLoaderService.name);
  private readonly textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  async loadAndSplitPdf(filePath: string): Promise<Document[]> {
    try {
      this.logger.log(`Loading PDF from: ${filePath}`);
      
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      
      this.logger.log(`Loaded ${docs.length} pages from PDF`);
      
      // Split documents into chunks
      const splitDocs = await this.textSplitter.splitDocuments(docs);
      
      this.logger.log(`Split into ${splitDocs.length} chunks`);
      
      return splitDocs;
    } catch (error) {
      this.logger.error(`Error loading PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  async loadAndSplitPdfFromBuffer(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      this.logger.log(`Loading PDF from buffer: ${filename}`);
      
      // Convert Buffer to Blob-like object for PDFLoader
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
      const loader = new PDFLoader(blob);
      const docs = await loader.load();
      
      this.logger.log(`Loaded ${docs.length} pages from PDF`);
      
      // Split documents into chunks
      const splitDocs = await this.textSplitter.splitDocuments(docs);
      
      this.logger.log(`Split into ${splitDocs.length} chunks`);
      
      return splitDocs;
    } catch (error) {
      this.logger.error(`Error loading PDF from buffer: ${error.message}`, error.stack);
      throw error;
    }
  }
}

