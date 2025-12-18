import { VectorStoreService } from './vector-store.service';
export declare class DocumentRetrieverToolService {
    private readonly vectorStoreService;
    private readonly logger;
    constructor(vectorStoreService: VectorStoreService);
    createDocumentSearchTool(): any;
}
