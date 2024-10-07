import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

export const client = postgres(process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:54322/postgres');
export const db = drizzle(client, { schema });
