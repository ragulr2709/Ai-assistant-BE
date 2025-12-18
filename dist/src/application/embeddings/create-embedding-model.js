"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextEmbeddingModel = void 0;
const generative_ai_1 = require("@google/generative-ai");
const google_genai_1 = require("@langchain/google-genai");
const createTextEmbeddingModel = (configService, title = 'Angular') => {
    const geminiConfig = configService.get('gemini');
    if (!geminiConfig) {
        throw new Error('Missing gemini configuration');
    }
    const { apiKey, embeddingModel: model } = geminiConfig;
    return new google_genai_1.GoogleGenerativeAIEmbeddings({
        apiKey,
        model,
        taskType: generative_ai_1.TaskType.RETRIEVAL_DOCUMENT,
        title,
    });
};
exports.createTextEmbeddingModel = createTextEmbeddingModel;
//# sourceMappingURL=create-embedding-model.js.map