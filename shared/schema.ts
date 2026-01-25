import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // 'idle', 'working', 'offline', 'error'
  currentTask: text("current_task"),
  capabilities: text("capabilities").array().notNull(),
  progress: integer("progress").default(0),
  avatar: text("avatar"),
  lastActive: timestamp("last_active").defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, lastActive: true });

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
