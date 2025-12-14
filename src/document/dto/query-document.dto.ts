import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class QueryDocumentDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  k?: number = 5; // Number of results to return

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  documentId?: string;
}

