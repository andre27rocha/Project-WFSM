CREATE TABLE "release_calendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"developer" text,
	"release_date" date,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"genre" text DEFAULT 'metroidvania' NOT NULL,
	"status" text DEFAULT 'announced' NOT NULL,
	"external_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "release_calendar_slug_unique" UNIQUE("slug")
);
