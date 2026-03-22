-- Create TeamMember table
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "inviteToken" TEXT,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Create unique index on inviteToken
CREATE UNIQUE INDEX "TeamMember_inviteToken_key" ON "TeamMember"("inviteToken");

-- Create indexes
CREATE INDEX "TeamMember_ownerId_idx" ON "TeamMember"("ownerId");
CREATE INDEX "TeamMember_email_idx" ON "TeamMember"("email");
