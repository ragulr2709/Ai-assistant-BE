"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentExecutorService = void 0;
const messages_1 = require("@langchain/core/messages");
const common_1 = require("@nestjs/common");
const runnables_1 = require("@langchain/core/runnables");
const agent_executor_provider_1 = require("./providers/agent-executor.provider");
let AgentExecutorService = class AgentExecutorService {
    agent;
    chatHistory = [];
    constructor(agent) {
        this.agent = agent;
    }
    async execute(input) {
        const result = await this.agent.invoke({
            input,
            chat_history: this.chatHistory,
        });
        const output = result?.output ?? result;
        this.chatHistory.push(new messages_1.HumanMessage(input), new messages_1.AIMessage(output));
        if (this.chatHistory.length > 20) {
            this.chatHistory.splice(0, this.chatHistory.length - 20);
        }
        return [
            { role: "Human", content: input },
            { role: "Assistant", content: output },
        ];
    }
};
exports.AgentExecutorService = AgentExecutorService;
exports.AgentExecutorService = AgentExecutorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, agent_executor_provider_1.InjectAgent)()),
    __metadata("design:paramtypes", [runnables_1.Runnable])
], AgentExecutorService);
//# sourceMappingURL=agent.service.js.map