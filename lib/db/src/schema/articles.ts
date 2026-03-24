import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const articlesTable = pgTable("user_articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  content: text("content").notNull().default(""),
  contentEn: text("content_en"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  isPreset: boolean("is_preset").notNull().default(false),
});

export const insertArticleSchema = createInsertSchema(articlesTable);
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
