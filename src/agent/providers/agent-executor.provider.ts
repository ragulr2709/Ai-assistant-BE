import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Tool } from "@langchain/core/tools";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";  // Add Zod import
import { Inject, Provider } from "@nestjs/common";
import { createAgent } from "langchain";  // v1 agent

import { AGENT_EXECUTOR } from "../constants/agent.constant";
import { GROQ_CHAT_MODEL } from "../constants/groq-chat-model.constant";
import { TOOLS } from "../constants/tools.constant";

export function InjectAgent() {
  return Inject(AGENT_EXECUTOR);
}

export const AgentExecutorProvider: Provider = {
  provide: AGENT_EXECUTOR,
  useFactory: async (llm: ChatGroq, tools: Tool[]) => {
    const agent = createAgent({
      model: llm,
      tools,
      stateSchema: z.object({
        messages: z.array(z.any()),
      }),
      systemPrompt: `You are a helpful AI assistant with access to multiple knowledge sources.
⚠️ TOOL PRIORITY:
1. ALWAYS search uploaded documents first
2. Use web search ONLY if no relevant document results
3. Never bypass doc search unless instructed`,
    });

    return agent;
  },
  inject: [GROQ_CHAT_MODEL, TOOLS],
};
