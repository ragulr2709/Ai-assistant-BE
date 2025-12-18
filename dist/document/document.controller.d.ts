import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { DocumentResponseDto, QueryResultDto } from './dto/document-response.dto';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    uploadDocument(file: Express.Multer.File, uploadDto: UploadDocumentDto, req: any): Promise<DocumentResponseDto>;
    getDocuments(req: any): Promise<DocumentResponseDto[]>;
    getDocument(id: string, req: any): Promise<DocumentResponseDto>;
    deleteDocument(id: string, req: any): Promise<{
        message: string;
    }>;
    queryDocuments(queryDto: QueryDocumentDto, req: any): Promise<QueryResultDto[]>;
}
