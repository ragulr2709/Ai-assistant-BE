import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AgentExecutorService } from './agent.service';
import { AgentContent } from './types/agent-content.type';

export class AskDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}

@Controller('agent')
export class AgentController {
  constructor(private readonly service: AgentExecutorService) {}

  @Post('ask')
  async ask(@Body() dto: AskDto): Promise<AgentContent[]> {
    const contents = await this.service.execute(dto.query);
    return contents;
  }
}