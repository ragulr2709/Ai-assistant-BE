import { Injectable, Logger } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { VectorStoreService } from './vector-store.service';

@Injectable()
export class DocumentRetrieverToolService {
  private readonly logger = new Logger(DocumentRetrieverToolService.name);

  constructor(private readonly vectorStoreService: VectorStoreService) {}

  createDocumentSearchTool(): any {
    const self = this;
    const documentSearchSchema = z.object({
      query: z.string().describe('The search query or question to find relevant document excerpts'),
    });

    return new DynamicStructuredTool({
      name: 'search-uploaded-documents',
      description: 
        'Search through the user\'s uploaded PDF documents for relevant information. ' +
        'Use this tool FIRST when the question might be answered by documents the user has uploaded. ' +
        'Returns relevant excerpts from documents with context. ' +
        'Input should be a search query or question.',
      schema: documentSearchSchema as any,
      func: async (input: any): Promise<string> => {
        try {
          const { query } = input;
          self.logger.log(`Searching documents for: "${query}"`);
          
          // Search across all documents with similarity filtering
          const results = await self.vectorStoreService.similaritySearch(query, 5);
          if (results.length === 0) {
            return 'No relevant information found in uploaded documents that matches your query. ' +
                   'The documents may not contain information about this topic. ' +
                   'Try rephrasing your question or use web search instead.';
          }

          // Format results for the agent with similarity scores
          const formattedResults = results.map((doc, index) => {
            const docId = doc.metadata.documentId || 'unknown';
            const similarity = doc.metadata.similarity || 0;
            const content = doc.pageContent;
            const similarityPercent = (similarity * 100).toFixed(1);
            return `[Document ${index + 1} - ID: ${docId} - Relevance: ${similarityPercent}%]\n${content}`;
          }).join('\n\n---\n\n');

          return `Found ${results.length} relevant excerpts from uploaded documents:\n\n${formattedResults}`;
        } catch (error: any) {
          self.logger.error(`Error searching documents: ${error.message}`, error.stack);
          return 'Error searching documents. The document database may be empty or unavailable.';
        }
      },
    } as any);
  }
}

