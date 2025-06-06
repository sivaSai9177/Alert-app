CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"session_id" text,
	"action" text NOT NULL,
	"outcome" text NOT NULL,
	"resource" text,
	"entity_type" text,
	"entity_id" text,
	"user_role" text,
	"user_name" text,
	"user_email" text,
	"ip_address" text,
	"user_agent" text,
	"platform" text,
	"description" text,
	"metadata" text,
	"before_state" text,
	"after_state" text,
	"reason_code" text,
	"access_justification" text,
	"sensitive_data_accessed" boolean DEFAULT false,
	"department" text,
	"organization_id" text,
	"timestamp" timestamp NOT NULL,
	"retention_until" timestamp,
	"checksum" text,
	"severity" text DEFAULT 'INFO' NOT NULL,
	"alert_generated" boolean DEFAULT false NOT NULL,
	"application_version" text,
	"request_id" text,
	"trace_id" text
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"device_id" text,
	"device_name" text,
	"device_fingerprint" text,
	"platform" text,
	"ip_address" text,
	"user_agent" text,
	"last_activity" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"revoked_at" timestamp,
	"revoke_reason" text,
	"max_inactive_minutes" integer DEFAULT 30,
	"max_session_hours" integer DEFAULT 8,
	"requires_reauth" boolean DEFAULT false,
	"country" text,
	"city" text,
	"timezone" text,
	"is_suspicious" boolean DEFAULT false,
	"trust_score" integer DEFAULT 100,
	"login_method" text,
	"two_factor_verified" boolean DEFAULT false,
	"session_type" text DEFAULT 'regular',
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'user',
	"organization_id" text,
	"needs_profile_completion" boolean NOT NULL,
	"phone_number" text,
	"department" text,
	"organization_name" text,
	"job_title" text,
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"password_changed_at" timestamp,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_token" ADD CONSTRAINT "two_factor_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;