import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to TiDB Cloud!');
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Failed to connect to TiDB Cloud:', e);
    process.exit(1);
  }
}

main();
