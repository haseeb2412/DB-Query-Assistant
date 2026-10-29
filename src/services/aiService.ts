import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { SqlQuerySchema, SqlQueryOutput } from '../schemas/querySchema.js';

const DB_SCHEMA_CONTEXT = `
You are an expert SQLite database assistant.
Here is the database schema:
- customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT)
- products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL)
- orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, order_date TEXT)

Rules:
- Generate ONLY valid SQLite SELECT queries.
- Do not use markdown blocks inside the sql field, just return the raw SQL string.
`;

/**
 * Uses Gemini to translate natural language into a structured SQL query.
 */
export async function generateSqlFromPrompt(userQuestion: string): Promise<SqlQueryOutput> {
  const { object } = await generateObject({
    model: google('gemini-3.8-flash'),
    schema: SqlQuerySchema,
    system: DB_SCHEMA_CONTEXT,
    prompt: `Translate the following user question into a SQLite query:\n\n"${userQuestion}"`,
  });

  return object;
}

/**
 * Security Guardrail: Ensures the SQL query is strictly read-only.
 */
export function validateSqlSafety(sql: string): boolean {
  const cleanedSql = sql.trim().toUpperCase();

  // 1. Must start with SELECT
  if (!cleanedSql.startsWith('SELECT')) {
    return false;
  }

  // 2. Block forbidden write/destructive keywords
  const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'ATTACH', 'DETACH'];
  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql)) {
      return false;
    }
  }

  return true;
}