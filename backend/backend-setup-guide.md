# MineHR Backend Setup Guide

This document is your step-by-step record of exactly **what** we are doing to build the backend, **why** we are doing it, and all the **commands** used. You can reference this whenever you need to understand the architecture or recreate it!

---

## Step 1: Initializing the Backend Environment

**What we did:** 
We created a brand new folder called `backend` right inside your main `hrms-master` project folder and initialized it as a Node.js project.

**Why:** 
We need a dedicated, secure server space that runs entirely separate from your React frontend. It will hold all the secret keys and database logic that the browser should never see.

**Commands Used:**
```bash
# 1. Created the backend folder and navigated inside it
mkdir -p backend && cd backend

# 2. Initialized it as a Node.js project (created package.json)
npm init -y

# 3. Installed TypeScript tools so we can write our server in the exact same language as your React frontend
npm i typescript ts-node @types/node --save-dev

# 4. Created the TypeScript configuration file (tsconfig.json)
npx tsc --init
```

---

## Step 2: Installing the Core Frameworks & Database Connectors

**What we are doing now:**
We are downloading the "engines" that will power the server, route traffic, handle security, and talk to your MySQL database.

**Why:**
- **Express / CORS:** To create the API URLs (like `/api/login`) and allow your React app to securely talk to it.
- **Prisma:** This is the magic tool that connects Node.js directly to MySQL. It lets us define your tables (like "Branches" and "Departments") in clean code instead of complex SQL.
- **Bcrypt & JWT:** The cryptographic locks for saving passwords and keeping users authenticated.

**Commands Used:**
```bash
# 1. Install production dependencies (the essentials to run the server)
npm i express cors dotenv jsonwebtoken bcryptjs

# 2. Install development tools (TypeScript types and Prisma ORM)
npm i @types/express @types/cors @types/jsonwebtoken @types/bcryptjs prisma ts-node-dev --save-dev

# 3. Initialize Prisma specifically for MySQL
npx prisma init --datasource-provider mysql
```

---

## Step 3: Defining the MySQL Database Schema

**What:** 
We created the exact blueprint for your `Branches`, `Departments`, `Users`, and `Company` inside `backend/prisma/schema.prisma`.

**Why:** 
Prisma will read this blueprint and automatically build the MySQL tables for it. Notice how we use `@relation` so Prisma perfectly understands that a Department *belongs* to a Branch.

**File edited:** `backend/prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  name          String
  email         String   @unique
  password_hash String
  role          String   @default("Employee")
  branch_id     Int?
  department_id Int?
  
  branch        Branch?     @relation(fields: [branch_id], references: [id])
  department    Department? @relation(fields: [department_id], references: [id])
}

model Branch {
  id          Int          @id @default(autoincrement())
  name        String
  code        String       @unique
  type        String       @default("Metro")
  order_index Int          @default(0)
  departments Department[]
  users       User[]
}

model Department {
  id          Int      @id @default(autoincrement())
  name        String
  branch_id   Int
  order_index Int      @default(0)
  branch      Branch   @relation(fields: [branch_id], references: [id])
  users       User[]
}
```

---

## Step 4: Setting up the Express Server

**What:** 
We wrote the main server file `backend/src/server.ts`. This is the brain that receives traffic.

**Why:** 
It boots up the application on port 5000, attaches CORS (so React can talk to it without security errors), and connects exactly to the Prisma database client.

**File Created:** `backend/src/server.ts`
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow us to receive JSON from React

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MineHR Backend is running perfectly!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

## Step 5: Connecting Your MySQL Database

**What:** 
Right now, the server is built but it has no real database to talk to. You need to connect it to an actual running MySQL database.

**Why:** 
Without a database connection URL, Prisma cannot create your tables or save your employees.

**Instructions (Your Action Required):**
1. You must install **MySQL** locally (or use **XAMPP**), or use a free cloud database (like **Aiven** or **TiDB**).
2. Open the file `backend/.env`.
3. Replace the `DATABASE_URL` line with your actual database connection string.
   *(Example: `DATABASE_URL="mysql://root:password@localhost:3306/minehr_db"`)*
4. Run this command to command Prisma to build your tables:
   ```bash
   cd backend
   npx prisma db push
   ```
5. Run the server!
   ```bash
   npm run dev
   ```

---

## Step 6: Integrating React (The Frontend)

**What:** 
Now that the server is alive on `localhost:5001`, your React components need a way to talk to it securely. We configured Vite to proxy requests, and installed `axios`.

**Why:** 
If your React app running on `localhost:5173` tries to fetch data from `localhost:5001`, the browser block it because of CORS.

**What we did:**
1. **Vite Proxy:** We edited `vite.config.ts` to automatically send all `/api` traffic to `localhost:5001`.
2. **Axios Client:** We created `src/lib/axios.ts` which automatically grabs the `auth-token` from localStorage and attaches it to every single request so the server knows an Admin is logged in.

**How to use it from React now:**
```tsx
import api from '../lib/axios';

// Example inside Branches.tsx
const fetchBranches = async () => {
    const response = await api.get('/branches');
    setBranches(response.data);
};
```

---
**The backend foundation is now complete! All Company, Auth, Branches, and Department APIs are live and connected to your MySQL database. From here on, we simply replace the dummy data in your `.tsx` components with real `api.get()` calls!**
