CREATE TABLE "RESFRESH_TOKENS" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "RESFRESH_TOKENS_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "USERS" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"firstName" varchar(100),
	"lastName" varchar(100),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"googleId" varchar(255),
	"isEmailVerified" boolean DEFAULT false,
	"verificationToken" varchar(255),
	"resetPasswordToken" varchar(255),
	"resetPasswordExpires" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "USERS_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "RESFRESH_TOKENS" ADD CONSTRAINT "RESFRESH_TOKENS_userId_USERS_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."USERS"("id") ON DELETE cascade ON UPDATE no action;