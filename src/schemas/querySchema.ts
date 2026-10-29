import { z } from 'zod';

export const SqlQuerySchema = z.object({
  sql: z.string().describe('The executable SQL SELECT query generated based on the user question.'),
  explanation: z.string().describe('A brief, friendly explanation of what data is being queried.'),
});

export type SqlQueryOutput = z.infer<typeof SqlQuerySchema>;