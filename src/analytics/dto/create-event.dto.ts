export class CreateEventDto {
  userId?: string;
  eventType!: string;
  eventPayload?: any;
  sessionId?: string;
}
