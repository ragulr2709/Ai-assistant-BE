import { Controller, Post, Body, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  async recordEvent(@Body() dto: CreateEventDto) {
    await this.analyticsService.recordEvent(dto as any);
    return { status: 'ok' };
  }

  @Get('summary')
  async summary() {
    return this.analyticsService.getEventCountsByType();
  }
}
