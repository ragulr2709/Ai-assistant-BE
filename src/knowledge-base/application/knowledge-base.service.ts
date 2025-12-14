import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { DocumentRetrieverToolService } from '../../document/application/document-retriever-tool.service';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    private readonly documentRetrieverToolService: DocumentRetrieverToolService,
  ) {}

  async createRetrieverTools(): Promise<Tool[]> {
    // Create the document search tool
    const documentSearchTool = this.documentRetrieverToolService.createDocumentSearchTool();
    
    // Return the RAG document search tool
    // In the future, you can add more retriever tools here (e.g., Angular docs, other knowledge bases)
    return [documentSearchTool as any];
  }
}

