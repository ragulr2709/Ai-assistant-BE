import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { analyticsEvents } from "../db/analytics";
import { sql } from "drizzle-orm";
import { DRIZZLE } from "../db/drizzle.module";

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) {}

  async recordEvent(event: {
    userId?: string;
    eventType: string;
    eventPayload?: any;
    sessionId?: string;
  }) {
    await this.db.insert(analyticsEvents).values({
      userId: event.userId,
      eventType: event.eventType,
      eventPayload: event.eventPayload ? JSON.stringify(event.eventPayload) : null,
      sessionId: event.sessionId,
    });
  }

  async getEventCountsByType(limit = 100) {
    const result = await this.db
      .select({ eventType: analyticsEvents.eventType, count: sql`count(*)` })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventType)
      .orderBy(analyticsEvents.eventType)
      .limit(limit);

    return (result || []).map((r: any) => ({ eventType: r.eventType, count: Number(r.count) }));
  }
}
