import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { Tool } from '@langchain/core/tools';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgeBaseService } from '../../knowledge-base/application/knowledge-base.service';
import { DuckDuckGoConfig } from '../../configs/types/duck-config.type';
import { TOOLS } from '../constants/tools.constant';

export const ToolsProvider: Provider<Tool[]> = {
  provide: TOOLS,
  useFactory: async (
    service: ConfigService,
    knowledgeBaseService: KnowledgeBaseService,
  ) => {
    const duckConfig = service.get<DuckDuckGoConfig>('duckDuckGo');
    const maxResults = duckConfig?.maxResults || 3;
    const duckTool = new DuckDuckGoSearch({ maxResults });
    const retrieverTools = await knowledgeBaseService.createRetrieverTools();
    return [duckTool, ...retrieverTools] as Tool[];
  },
  inject: [ConfigService, KnowledgeBaseService],
};
