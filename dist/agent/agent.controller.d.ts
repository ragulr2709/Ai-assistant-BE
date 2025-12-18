import { AgentExecutorService } from './agent.service';
import { AgentContent } from './types/agent-content.type';
export declare class AskDto {
    query: string;
}
export declare class AgentController {
    private readonly service;
    constructor(service: AgentExecutorService);
    ask(dto: AskDto): Promise<AgentContent[]>;
}
