import 'dotenv/config';
import { initializeDatabase, runQuery } from './db/database.js';
import { generateSqlFromPrompt, validateSqlSafety } from './services/aiService.js';

// Sample natural language questions to test our Assistant
const sampleQuestions = [
  "How many customers live in New York?",
  "What are the names and prices of all products in the Electronics category?",
  "Show me all orders placed by Alice Smith.",
  // Security test case: Should be blocked by guardrails!
  "Delete all records from the customers table."
];

async function run() {
  console.log('🚀 Initializing Database Query Assistant...\n');
  
  // 1. Initialize and seed the local SQLite database
  initializeDatabase();
  console.log('--------------------------------------------------\n');

  for (const question of sampleQuestions) {
    console.log(`👤 User Question: "${question}"`);

    try {
      // 2. Generate SQL via Gemini
      const { sql, explanation } = await generateSqlFromPrompt(question);
      console.log(`🤖 Generated SQL: ${sql}`);
      console.log(`💡 Explanation:   ${explanation}`);

      // 3. Run Security Guardrails
      if (!validateSqlSafety(sql)) {
        console.error('🛡️  SECURITY ALERT: Query blocked by safety guardrails! Only read-only SELECT queries are allowed.');
        console.log('--------------------------------------------------\n');
        continue;
      }

      // 4. Execute Safe Query against Database
      const results = runQuery(sql);
      console.log('📊 Query Results:');
      console.table(results);

    } catch (error) {
      console.error('❌ Error processing question:', error);
    }

    console.log('--------------------------------------------------\n');
  }
}

run();