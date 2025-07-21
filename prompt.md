I need to run a complete full-stack AI mental health therapy application called SoulSense locally on my Mac. This is a production-grade React + Node.js/Express application with PostgreSQL database that features 4 therapeutic AI personas powered by Claude 3.5 Sonnet.

SETUP DETAILS:
- Project folder: soulsense-ai
- Database: PostgreSQL already set up with imported production data
- DB credentials: username=soulsense_ai, password=admin, database=soulsense_ai
- Required API: OpenRouter API key for Claude 3.5 Sonnet access
- Architecture: Single-server setup that runs both frontend (React/Vite) and backend (Express) on port 5000

ENVIRONMENT VARIABLES NEEDED:
OPENROUTER_API_KEY=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
DATABASE_URL=postgresql://soulsense_ai:admin@localhost:5432/soulsense_ai
NODE_ENV=development

COMMANDS TO RUN:
1. Navigate to project: cd soulsense-ai
2. Create .env file with the above variables
3. Install dependencies: npm install
4. Start application: npm run dev

EXPECTED BEHAVIOR:
- Application serves both UI and API on localhost:5000
- Express server starts with message "serving on port 5000"
- Vite development server connects for hot reloading
- Database connects automatically using the provided credentials
- All 4 therapeutic personas (Dr. Sarah, Alex, Marcus, Maya) should be functional

VERIFICATION:
- Open http://localhost:5000 in browser
- Should see SoulSense homepage with 4 persona cards
- Database should have 3 users, 139 conversations, and 276 messages from imported data
- Chat functionality should work with all personas

If you encounter any errors, please:
1. Check if PostgreSQL is running: brew services list | grep postgresql
2. Test database connection: psql postgresql://soulsense_ai:admin@localhost:5432/soulsense_ai -c "SELECT COUNT(*) FROM users;"
3. Verify port 5000 is available: lsof -ti:5000

Please execute these commands and confirm the application is running successfully with all features operational.