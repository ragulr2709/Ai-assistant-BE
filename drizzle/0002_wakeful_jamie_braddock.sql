ALTER TABLE "document_chunks" ALTER COLUMN "document_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "document_chunks" ALTER COLUMN "chunk_index" DROP NOT NULL;