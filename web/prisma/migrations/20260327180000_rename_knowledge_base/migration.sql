-- Rename KnowledgeBase table to match @@map("knowledge_base") in schema
ALTER TABLE IF EXISTS "KnowledgeBase" RENAME TO "knowledge_base";
