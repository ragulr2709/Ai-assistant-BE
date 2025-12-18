"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentChunks = exports.documents = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = require("./user");
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom().notNull(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => user_1.users.id, { onDelete: 'cascade' }),
    filename: (0, pg_core_1.text)('filename').notNull(),
    originalName: (0, pg_core_1.text)('original_name').notNull(),
    mimeType: (0, pg_core_1.text)('mime_type').notNull(),
    fileSize: (0, pg_core_1.integer)('file_size').notNull(),
    uploadedAt: (0, pg_core_1.timestamp)('uploaded_at').defaultNow().notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('processing'),
    errorMessage: (0, pg_core_1.text)('error_message'),
});
exports.documentChunks = (0, pg_core_1.pgTable)('document_chunks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom().notNull(),
    documentId: (0, pg_core_1.uuid)('document_id')
        .references(() => exports.documents.id, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    embedding: (0, pg_core_1.vector)('embedding', { dimensions: 768 }),
    chunkIndex: (0, pg_core_1.integer)('chunk_index'),
    metadata: (0, pg_core_1.text)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=document.js.map