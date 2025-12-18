export declare class DocumentResponseDto {
    id: string;
    userId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: Date;
    status: string;
    errorMessage?: string;
}
export declare class QueryResultDto {
    content: string;
    metadata: {
        documentId: string;
        chunkIndex: number;
        score: number;
        similarity: number;
    };
}
