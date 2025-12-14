import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { DocumentResponseDto, QueryResultDto } from './dto/document-response.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @Request() req,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.documentService.uploadDocument(file, "eea8efc5-6ee5-4a0c-b665-5bb7be93b298");
  }

  @Get()
  async getDocuments(@Request() req): Promise<DocumentResponseDto[]> {
    return this.documentService.getDocuments(req.user.id);
  }

  @Get(':id')
  async getDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<DocumentResponseDto> {
    return this.documentService.getDocument(id, req.user.id);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.documentService.deleteDocument(id, req.user.id);
    return { message: 'Document deleted successfully' };
  }

  @Post('query')
  async queryDocuments(
    @Body() queryDto: QueryDocumentDto,
    @Request() req,
  ): Promise<QueryResultDto[]> {
    return this.documentService.queryDocuments(
      req.user.id,
      queryDto.query,
      queryDto.k,
      queryDto.documentId,
      queryDto.sessionId,
    );
  }
}

