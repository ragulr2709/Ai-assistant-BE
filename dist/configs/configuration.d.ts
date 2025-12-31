declare const _default: () => {
    port: number;
    groq: {
        apiKey: string;
        model: string;
    };
    gemini: {
        apiKey: string;
        embeddingModel: string;
        generationModel: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    refresh: {
        expiresInDays: number;
    };
    swagger: {
        title: string;
        description: string;
        version: string;
        tag: string;
    };
    duckDuckGo: {
        maxResults: number;
    };
    rag: {
        similarityThreshold: number;
    };
};
export default _default;
