import { db } from "./db";
import {
  agents,
  type Agent,
  type InsertAgent
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent>;
}

export class DatabaseStorage implements IStorage {
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(agents.id);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent> {
    const [updated] = await db.update(agents)
      .set(updates)
      .where(eq(agents.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
