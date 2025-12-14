export class DocumentResponseDto {
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

export class QueryResultDto {
  content: string;
  metadata: {
    documentId: string;
    chunkIndex: number;
    score: number;
    similarity: number; // Similarity percentage (0-1), higher = more relevant
  };
}

