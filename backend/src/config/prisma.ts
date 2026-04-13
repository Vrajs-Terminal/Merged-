import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const prismaOptions: any = {
  log: ["error", "warn"],
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
};

console.log("[DB] Initializing Prisma Client with TiDB SSL (sslaccept=strict)...");

// Always create a fresh client — do NOT cache in global to avoid stale models after prisma generate
const prisma = new PrismaClient(prismaOptions);

export default prisma;