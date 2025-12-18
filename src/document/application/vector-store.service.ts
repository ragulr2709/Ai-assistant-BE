import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import { createTextEmbeddingModel } from '../../application/embeddings/create-embedding-model';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  async createVectorStore(documentId: string): Promise<PGVectorStore> {
    const embeddings = createTextEmbeddingModel(
      this.configService,
      'Document RAG',
    );

    const vectorStore = await PGVectorStore.initialize(embeddings, {
      postgresConnectionOptions: {
        connectionString: this.configService.get<string>('DATABASE_URL'),
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

  async addDocuments(
    documentId: string,
    documents: Document[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Adding ${documents.length} documents to vector store for document ${documentId}`,
      );

      // Add document metadata to each chunk
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
    } catch (error) {
      this.logger.error(
        `Error adding documents to vector store: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async similaritySearch(
    query: string,
    k: number = 5,
    documentId?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Performing similarity search for: "${query}"`);
  
      const vectorStore = await this.createVectorStore(documentId || '');
      
      let resultsWithScores: [Document, number][];
  
      if (documentId) {
        resultsWithScores = await vectorStore.similaritySearchWithScore(query, k, {
          documentId,
        });
      } else {
        resultsWithScores = await vectorStore.similaritySearchWithScore(query, k);
      }
  
      const SIMILARITY_THRESHOLD =
        this.configService.get<number>('rag.similarityThreshold') || 0.2;
  
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
  
      // ----------------------------
      // ⭐ Gemini Summarization Step
      // ----------------------------
      const genAI = new GoogleGenerativeAI(
        this.configService.get<string>("gemini.apiKey") || "",
      );

      // Use a config-driven model name with a safe default that is supported
      // by the Google Generative AI API for text generation.
      const generationModel =
        this.configService.get<string>("gemini.generationModel") ||
        // "models/text-bison-001" is a stable text generation model name supported
        // by Google Generative AI. Adjust via env GEMINI_GENERATION_MODEL if needed.
        "models/text-bison-001";

      const model = genAI.getGenerativeModel({ model: generationModel });
  
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
  
      // generateContent returns a structured result; use .response.text() when
      // available but guard for other response shapes.
      const result = await model.generateContent(prompt);
      // Helper: attempt to extract text from known response shapes
      const extractText = (res: unknown): string | undefined => {
        const r = res as any;
        if (r?.response && typeof r.response.text === "function") {
          try {
            return r.response.text();
          } catch {
            // fallthrough
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

      const answer = extractText(result) || "No answer generated.";
  
      return {
        answer,
        sources: filteredResults,
      };
  
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `Error performing similarity search: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  

  async deleteDocumentChunks(documentId: string): Promise<void> {
    try {
      this.logger.log(`Deleting chunks for document ${documentId}`);

      // Delete using raw SQL since we need to filter by metadata
      await this.pool.query(
        `DELETE FROM document_chunks WHERE metadata->>'documentId' = $1`,
        [documentId],
      );

      this.logger.log(`Successfully deleted chunks for document ${documentId}`);
    } catch (error) {
      this.logger.error(
        `Error deleting document chunks: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

