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
  // Read configured model. Accept short name like `gemini-3` or `gemini-2.5`,
  // resource name `models/...`, or the special value `latest` (or unset)
  // which will attempt to pick a supported Gemini model at runtime by
  // calling ListModels.
      let generationModel = this.configService.get<string>("gemini.generationModel");

      // Helper: try to pick a supported model via ListModels
      const pickModelFromList = async (genAIClient: any): Promise<string | undefined> => {
        if (!genAIClient || typeof genAIClient.listModels !== 'function') return undefined;
        try {
          const list = await genAIClient.listModels();
          // list may have different shapes; try common fields
          const models = Array.isArray(list?.models) ? list.models : Array.isArray(list) ? list : [];

          // preference order for Gemini models (short names)
          // Prefer recent Gemini releases (3 then 2.5). Older 1.x models are
          // deprecated and not included here.
          const preferred = ['gemini-3', 'gemini-2.5', 'gemini-2.5-pro'];

          for (const p of preferred) {
            const m = models.find((mm: any) => (mm?.name || mm?.id || String(mm)).includes(p));
            if (m) return m.name || m.id || `models/${p}`;
          }

          // otherwise pick first model that looks like 'gemini' or 'bison'
          const fallback = models.find((mm: any) => (mm?.name || mm?.id || '').toLowerCase().includes('gemini') || (mm?.name || mm?.id || '').toLowerCase().includes('bison'));
          if (fallback) return fallback.name || fallback.id || undefined;

          return undefined;
        } catch (e) {
          this.logger.warn('ListModels call failed when trying to auto-select a generation model: ' + (e?.message || String(e)));
          return undefined;
        }
      };

      // If explicitly set to "latest" or not provided, attempt to auto-select.
      if (!generationModel || generationModel === 'latest') {
        try {
          const pick = await pickModelFromList(genAI);
          if (pick) {
            generationModel = pick;
            this.logger.log(`Auto-selected generation model: ${generationModel}`);
          } else {
            // if no model found, fall back to a reasonable default
            generationModel = 'gemini-3';
            this.logger.log(`No suitable model found via ListModels; defaulting to ${generationModel}`);
          }
        } catch (e) {
          generationModel = 'gemini-3';
          this.logger.warn('Auto-selection failed; using default model gemini-3');
        }
      }

      // Normalize to a form prefixed with 'models/' if not already present.
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

      // generateContent returns a structured result; use .response.text() when
      // available but guard for other response shapes.
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

      // If generation model is not configured, return the joined context as
      // a safe fallback (the UI can present this as sources/extract).
      if (!generationModel) {
        this.logger.warn('Generation model explicitly disabled; returning context as fallback answer.');
        return { answer: context || 'No relevant information found.', sources: filteredResults };
      }

      // Otherwise attempt generation but guard failures and fallback to context.
      let answer = 'No answer generated.';
      try {
        const model = genAI.getGenerativeModel({ model: generationModel });
        const result = await model.generateContent(prompt);
        const text = extractText(result);
        if (text) {
          answer = text;
        } else {
          this.logger.warn(`Generation returned empty response for model ${generationModel}; falling back to context.`);
          answer = context || answer;
        }
      } catch (genErr: any) {
        // Known failure mode: 404 when model name isn't available for the SDK
        // or API version. Log details and fall back to returning the context.
        this.logger.error(
          `Generation failed for model ${generationModel}: ${genErr?.message || genErr}`,
        );
        // If the error contains status 404, surface a helpful log message.
        if (genErr?.status === 404) {
          this.logger.error(
            `Model ${generationModel} not found or not available for this API version. ` +
              `Set GEMINI_GENERATION_MODEL to a supported name (for example 'gemini-3' or 'gemini-2.5', or full 'models/gemini-3'), or leave it empty to disable generation.`,
          );
        }
        answer = context || answer;
      }

      return { answer, sources: filteredResults };
  
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

