import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
export declare const createTextEmbeddingModel: (configService: ConfigService, title?: string) => GoogleGenerativeAIEmbeddings;
