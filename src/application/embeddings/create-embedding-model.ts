import { TaskType } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { EmbeddingModelConfig } from '../types/embedding-model-config.type';

// Add the Gemini embedding model creation logic
export const createTextEmbeddingModel = (
  configService: ConfigService,
  title = 'Angular',
) => {
  const geminiConfig = configService.get<EmbeddingModelConfig>('gemini');

  if (!geminiConfig) {
    throw new Error('Missing gemini configuration');
  }

  const { apiKey, embeddingModel: model } = geminiConfig;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    model,
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title,
  });
};
