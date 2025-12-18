import { Document } from '@langchain/core/documents';
export declare class PdfLoaderService {
    private readonly logger;
    private readonly textSplitter;
    loadAndSplitPdf(filePath: string): Promise<Document[]>;
    loadPdfPages(filePath: string): Promise<any[]>;
    splitDocuments(docs: any[] | any): Promise<any[]>;
    loadAndSplitPdfFromBuffer(buffer: Buffer, filename: string): Promise<Document[]>;
}
