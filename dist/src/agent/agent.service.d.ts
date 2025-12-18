import { Runnable } from "@langchain/core/runnables";
import { ToolExecutor } from "./interfaces/tool.interface";
import { AgentContent } from "./types/agent-content.type";
export declare class AgentExecutorService implements ToolExecutor {
    private agent;
    private chatHistory;
    constructor(agent: Runnable);
    execute(input: string): Promise<AgentContent[]>;
}
