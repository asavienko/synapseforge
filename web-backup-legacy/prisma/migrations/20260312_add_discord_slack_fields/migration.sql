-- AlterTable: add Discord and Slack metadata fields to AIInstance
ALTER TABLE "AIInstance" ADD COLUMN "discordBotUsername" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN "discordBotId" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN "slackBotName" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN "slackTeamName" TEXT;
