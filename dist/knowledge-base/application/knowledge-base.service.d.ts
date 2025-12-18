import { Tool } from '@langchain/core/tools';
import { DocumentRetrieverToolService } from '../../document/application/document-retriever-tool.service';
export declare class KnowledgeBaseService {
    private readonly documentRetrieverToolService;
    constructor(documentRetrieverToolService: DocumentRetrieverToolService);
    createRetrieverTools(): Promise<Tool[]>;
}
