import { db } from "./db";
import { users, tracker, type InsertUser, type User } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  incrementTracker(): Promise<number>;
  getTrackerCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async incrementTracker(): Promise<number> {
    const result = await db.execute(sql`
      INSERT INTO tracker (id, count) VALUES (1, 1)
      ON CONFLICT (id) DO UPDATE SET count = tracker.count + 1
      RETURNING count
    `);
    return Number(result.rows[0].count);
  }

  async getTrackerCount(): Promise<number> {
    const existing = await db.select().from(tracker).limit(1);
    if (existing.length === 0) return 0;
    return existing[0].count;
  }
}

export const storage = new DatabaseStorage();
