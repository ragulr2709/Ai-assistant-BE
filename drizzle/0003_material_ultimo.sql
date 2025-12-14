CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"user_id" text NOT NULL,
	"heading" text,
	"message" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
