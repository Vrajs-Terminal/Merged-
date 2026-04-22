"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.testDatabaseConnection = exports.getPrismaClient = void 0;
const client_1 = require("@prisma/client");
let prisma = null;
const getPrismaClient = () => {
    if (!prisma) {
        // TiDB Serverless requires sslaccept=strict parameter
        const dbUrl = process.env.DATABASE_URL ||
            "mysql://4579PdSAb7iFRRN.root:h6aPQzHNXtGIeVrM@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/minehr_db?sslaccept=strict";
        // Ensure sslaccept=strict is included (TiDB-specific parameter)
        let finalUrl = dbUrl;
        if (!dbUrl.includes("sslaccept")) {
            finalUrl = dbUrl.includes("?") ?
                `${dbUrl}&sslaccept=strict` :
                `${dbUrl}?sslaccept=strict`;
        }
        console.log("[DB] Initializing Prisma Client with TiDB SSL (sslaccept=strict)...");
        prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: finalUrl,
                },
            },
            log: ["error", "warn"],
        });
    }
    return prisma;
};
exports.getPrismaClient = getPrismaClient;
const testDatabaseConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    let retries = 3;
    const client = (0, exports.getPrismaClient)();
    while (retries > 0) {
        try {
            console.log(`[DB] Testing connection... (Attempt ${4 - retries}/3)`);
            yield client.$queryRaw `SELECT 1`;
            console.log("[DB] ✅ Database connection successful!");
            return true;
        }
        catch (error) {
            retries--;
            console.error(`[DB] ❌ Connection failed:`, error.message);
            if (retries > 0) {
                const waitTime = (4 - retries) * 2000; // 2s, 4s backoff
                console.log(`[DB] ⏳ Retrying in ${waitTime}ms...`);
                yield new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }
    }
    console.error("[DB] ❌ CRITICAL: Database connection failed after 3 attempts");
    console.error("[DB] Please ensure TiDB Cloud IP Whitelist includes 0.0.0.0/0");
    return false;
});
exports.testDatabaseConnection = testDatabaseConnection;
const disconnectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (prisma) {
        yield prisma.$disconnect();
        prisma = null;
    }
});
exports.disconnectDatabase = disconnectDatabase;
exports.default = exports.getPrismaClient;
