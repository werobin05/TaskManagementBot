import dotenv from 'dotenv';
import { drizzle } from "drizzle-orm/postgres-js";

dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error("DB_URL не задан в .env");

export const db = drizzle(DB_URL);