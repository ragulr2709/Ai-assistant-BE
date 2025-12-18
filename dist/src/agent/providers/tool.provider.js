"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsProvider = void 0;
const duckduckgo_search_1 = require("@langchain/community/tools/duckduckgo_search");
const config_1 = require("@nestjs/config");
const knowledge_base_service_1 = require("../../knowledge-base/application/knowledge-base.service");
const tools_constant_1 = require("../constants/tools.constant");
exports.ToolsProvider = {
    provide: tools_constant_1.TOOLS,
    useFactory: async (service, knowledgeBaseService) => {
        const duckConfig = service.get('duckDuckGo');
        const maxResults = duckConfig?.maxResults || 3;
        const duckTool = new duckduckgo_search_1.DuckDuckGoSearch({ maxResults });
        const retrieverTools = await knowledgeBaseService.createRetrieverTools();
        return [duckTool, ...retrieverTools];
    },
    inject: [config_1.ConfigService, knowledge_base_service_1.KnowledgeBaseService],
};
//# sourceMappingURL=tool.provider.js.map