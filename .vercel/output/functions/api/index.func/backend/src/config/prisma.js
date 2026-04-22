"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
}
const prismaOptions = {
    log: ["error", "warn"],
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
};
console.log("[DB] Initializing Prisma Client with TiDB SSL (sslaccept=strict)...");
// Always create a fresh client — do NOT cache in global to avoid stale models after prisma generate
const prisma = new client_1.PrismaClient(prismaOptions);
exports.default = prisma;
//# sourceMappingURL=prisma.js.map