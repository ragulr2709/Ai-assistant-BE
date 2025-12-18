"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqChatModelProvider = void 0;
exports.InjectChatModel = InjectChatModel;
const groq_1 = require("@langchain/groq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const groq_chat_model_constant_1 = require("../constants/groq-chat-model.constant");
function InjectChatModel() {
    return (0, common_1.Inject)(groq_chat_model_constant_1.GROQ_CHAT_MODEL);
}
exports.GroqChatModelProvider = {
    provide: groq_chat_model_constant_1.GROQ_CHAT_MODEL,
    useFactory: (configService) => {
        const groqConfig = configService.get('groq');
        if (!groqConfig) {
            throw new Error('Groq configuration is missing');
        }
        const { apiKey, model } = groqConfig;
        return new groq_1.ChatGroq({
            apiKey,
            model,
            temperature: 0.3,
            maxTokens: 2048,
            streaming: false,
        });
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=groq-chat-model.provider.js.map