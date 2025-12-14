import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Injectable } from "@nestjs/common";
import { Runnable } from "@langchain/core/runnables";
import { ToolExecutor } from "./interfaces/tool.interface";
import { InjectAgent } from "./providers/agent-executor.provider";
import { AgentContent } from "./types/agent-content.type";

@Injectable()
export class AgentExecutorService implements ToolExecutor {
  private chatHistory: BaseMessage[] = [];

  constructor(@InjectAgent() private agent: Runnable) {}

  async execute(input: string): Promise<AgentContent[]> {
    const result = await this.agent.invoke({
      input,
      chat_history: this.chatHistory,
    });

    // Agents in v1 often return: { output, ... } OR just output
    const output = result?.output ?? result;

    this.chatHistory.push(
      new HumanMessage(input),
      new AIMessage(output),
    );

    // keep recent 10 exchanges
    if (this.chatHistory.length > 20) {
      this.chatHistory.splice(0, this.chatHistory.length - 20);
    }

    return [
      { role: "Human", content: input },
      { role: "Assistant", content: output },
    ];
  }
}
