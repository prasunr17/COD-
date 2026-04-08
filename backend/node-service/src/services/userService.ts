import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';

export interface User {
  id: string;
  email: string;
  plan: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export const userService = {
  async createUser(email: string, password: string): Promise<User> {
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await query(
      `INSERT INTO users (id, email, password_hash, plan, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, plan, created_at, updated_at`,
      [id, email, password_hash, 'free', now, now]
    );

    return result.rows[0];
  },

  async getUserByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await query(
      'SELECT id, email, password_hash, plan, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  },

  async getUserById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, plan, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  },

  async updateUserProfile(id: string, updates: Partial<{ plan: string }>): Promise<User> {
    const now = new Date();
    const updateClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.plan !== undefined) {
      updateClauses.push(`plan = $${paramIndex}`);
      params.push(updates.plan);
      paramIndex++;
    }

    updateClauses.push(`updated_at = $${paramIndex}`);
    params.push(now);
    paramIndex++;

    params.push(id);

    const result = await query(
      `UPDATE users
       SET ${updateClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, plan, created_at, updated_at`,
      params
    );

    return result.rows[0];
  },

  async verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hash);
  },

  async userExists(email: string): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );

    return result.rowCount! > 0;
  }
};
