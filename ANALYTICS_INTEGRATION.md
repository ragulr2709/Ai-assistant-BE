Backend analytics integration

Overview

I added a lightweight analytics system:

- DB migration: `drizzle/0006_analytics_events.sql` (table `analytics_events`).
- Drizzle schema: `src/db/analytics.ts` exported via `src/db/schema.ts`.
- Backend module: `src/analytics` with `AnalyticsService` and `AnalyticsController`.

Endpoints

- POST /analytics/event
  - Body: { userId?: string, eventType: string, eventPayload?: any, sessionId?: string }
  - Inserts a row into `analytics_events`.

- GET /analytics/summary
  - Returns counts grouped by event type.

Server-side hooks

I added event recording calls in:

- Document upload: records `document_uploaded` after creating the document record.
- Document processing completion: records `document_processed` when processing completes.
- Document query: records `document_query` when a user queries documents (includes query, k, resultsCount).
- Chats service: records `chats_fetched` when chats are fetched.

Frontend integration flow

1. When user performs an action (upload, query, chat), the FE should:
   - Send its normal request to the API (e.g., POST /documents/upload or POST /documents/query).
   - Optionally, send a separate analytics event to POST /analytics/event for custom client-side events (e.g., button clicks, UI impressions).

2. Example: record a client-side feature usage event (anonymous or with user id):

```js
// authToken is the user's bearer token
await fetch('/analytics/event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    eventType: 'feature_click',
    eventPayload: { feature: 'search_button' },
  }),
});
```

3. Fetch summary for dashboard:

```js
const res = await fetch('/analytics/summary', { headers: { Authorization: `Bearer ${authToken}` } });
const data = await res.json();
console.log(data); // [{ eventType: 'document_query', count: 12 }, ...]
```

Privacy and size

- Events store an optional JSON payload. Avoid sending PII into `eventPayload` or strip it client-side.
- Keep events lightweight. For large payloads, store references instead.

Next steps (optional)

- Add paginated raw events endpoint for admin dashboards.
- Add per-day aggregates and time-range filtering.
- Add retention policy / TTL job to purge old events.
