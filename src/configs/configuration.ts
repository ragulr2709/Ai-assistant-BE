export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    embeddingModel:
      process.env.GEMINI_TEXT_EMBEDDING_MODEL || 'text-embedding-004',
    // Model used for text generation. Can be overridden with GEMINI_GENERATION_MODEL env var.
    generationModel:
      process.env.GEMINI_GENERATION_MODEL || 'models/text-bison-001',
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || '',
    description: process.env.SWAGGER_DESCRIPTION || '',
    version: process.env.SWAGGER_VERSION || '',
    tag: process.env.SWAGGER_TAG || '',
  },
  duckDuckGo: {
    maxResults: parseInt(process.env.DUCK_DUCK_GO_MAX_RESULTS || '1', 10),
  },
  rag: {
    // Similarity threshold for RAG vector search
    // Lower distance = more similar (0 = identical, 2 = opposite)
    // Default: 0.7 - only return results with distance < 0.7
    // Adjust lower (e.g., 0.5) for stricter matching, higher (e.g., 0.9) for more lenient
    similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.5'),
  },
});
