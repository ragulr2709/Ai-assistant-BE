"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResultDto = exports.DocumentResponseDto = void 0;
class DocumentResponseDto {
    id;
    userId;
    filename;
    originalName;
    mimeType;
    fileSize;
    uploadedAt;
    status;
    errorMessage;
}
exports.DocumentResponseDto = DocumentResponseDto;
class QueryResultDto {
    content;
    metadata;
}
exports.QueryResultDto = QueryResultDto;
//# sourceMappingURL=document-response.dto.js.map