// Vercel Serverless Entry Point for MineHR Backend (CommonJS)
// This bridges the Express app to Vercel's serverless runtime.

import dotenv from 'dotenv';
import app from '../backend/src/server';

// Load environment variables
dotenv.config();

// Export the default export (Express app)
export default app;
