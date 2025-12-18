"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentExecutorProvider = void 0;
exports.InjectAgent = InjectAgent;
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const langchain_1 = require("langchain");
const agent_constant_1 = require("../constants/agent.constant");
const groq_chat_model_constant_1 = require("../constants/groq-chat-model.constant");
const tools_constant_1 = require("../constants/tools.constant");
function InjectAgent() {
    return (0, common_1.Inject)(agent_constant_1.AGENT_EXECUTOR);
}
exports.AgentExecutorProvider = {
    provide: agent_constant_1.AGENT_EXECUTOR,
    useFactory: async (llm, tools) => {
        const agent = (0, langchain_1.createAgent)({
            model: llm,
            tools,
            stateSchema: zod_1.z.object({
                messages: zod_1.z.array(zod_1.z.any()),
            }),
            systemPrompt: `You are a helpful AI assistant with access to multiple knowledge sources.
⚠️ TOOL PRIORITY:
1. ALWAYS search uploaded documents first
2. Use web search ONLY if no relevant document results
3. Never bypass doc search unless instructed`,
        });
        return agent;
    },
    inject: [groq_chat_model_constant_1.GROQ_CHAT_MODEL, tools_constant_1.TOOLS],
};
//# sourceMappingURL=agent-executor.provider.js.map