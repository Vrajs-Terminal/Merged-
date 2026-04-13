import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
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
    
    prisma = new PrismaClient({
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

export const testDatabaseConnection = async (): Promise<boolean> => {
  let retries = 3;
  const client = getPrismaClient();

  while (retries > 0) {
    try {
      console.log(`[DB] Testing connection... (Attempt ${4 - retries}/3)`);
      await client.$queryRaw`SELECT 1`;
      console.log("[DB] ✅ Database connection successful!");
      return true;
    } catch (error: any) {
      retries--;
      console.error(`[DB] ❌ Connection failed:`, error.message);

      if (retries > 0) {
        const waitTime = (4 - retries) * 2000; // 2s, 4s backoff
        console.log(`[DB] ⏳ Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error(
    "[DB] ❌ CRITICAL: Database connection failed after 3 attempts"
  );
  console.error(
    "[DB] Please ensure TiDB Cloud IP Whitelist includes 0.0.0.0/0"
  );
  return false;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

export default getPrismaClient;
