import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, hobbies, type User, type NewUser, type Hobby, type NewHobby } from '../db/schema';

export class DatabaseService {
  // User operations
  async createUser(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersPaginated(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const [data, totalCount] = await Promise.all([
      db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);

    const total = Number(totalCount[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Hobby operations
  async createHobby(data: NewHobby): Promise<Hobby> {
    const [hobby] = await db.insert(hobbies).values(data).returning();
    return hobby;
  }

  async getHobbiesByUserId(userId: number): Promise<Hobby[]> {
    return db
      .select()
      .from(hobbies)
      .where(eq(hobbies.userId, userId))
      .orderBy(desc(hobbies.createdAt));
  }

  async deleteHobby(id: number): Promise<boolean> {
    const result = await db.delete(hobbies).where(eq(hobbies.id, id)).returning();
    return result.length > 0;
  }

  // Combined operations with relations
  async getUsersWithHobbies() {
    return db.query.users.findMany({
      with: {
        hobbies: {
          orderBy: (hobbies, { desc }) => [desc(hobbies.createdAt)],
        },
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  async getUsersWithHobbiesPaginated(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      db.query.users.findMany({
        with: {
          hobbies: {
            orderBy: (hobbies, { desc }) => [desc(hobbies.createdAt)],
          },
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);

    const total = Number(totalCount[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUserWithHobbies(userId: number) {
    return db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
      with: {
        hobbies: {
          orderBy: (hobbies, { desc }) => [desc(hobbies.createdAt)],
        },
      },
    });
  }
}

export const dbService = new DatabaseService();