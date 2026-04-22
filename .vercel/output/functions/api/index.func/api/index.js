"use strict";
// Vercel Serverless Entry Point for MineHR Backend (CommonJS)
// This bridges the Express app to Vercel's serverless runtime.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("../backend/src/server"));
// Load environment variables
dotenv_1.default.config();
// Export the default export (Express app)
exports.default = server_1.default;
//# sourceMappingURL=index.js.map