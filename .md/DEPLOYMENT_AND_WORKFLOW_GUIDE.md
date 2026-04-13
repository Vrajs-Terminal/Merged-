# Independent Vercel Deployment & GitHub Backup Guide

This guide explains how to deploy your React + Node.js application to **Vercel** manually from your command line, connect to a free **TiDB Cloud** database, and keep your **GitHub** completely separate merely as a daily backup tool.

---

## 🌩️ Phase 1: Create a TiDB Cloud Database (Highly Recommended)

We recommend **TiDB Cloud Serverless**. It is fully compatible with MySQL, has a very generous free tier, is incredibly fast, and pairs perfectly with Vercel's serverless environment.

### Step 1: Set up TiDB
1. Go to [TiDB Cloud](https://tidbcloud.com/) and sign up for a free account.
2. Create a new **Serverless Cluster**.
3. Once created, go to the "Connect" dialog in the TiDB console.
4. Select "Prisma" or "MySQL" from the connection options and copy the **Connection String** (Database URL).
   *It will look like: `mysql://user:password@gateway01.region.prod.aws.tidbcloud.com:4000/minehr_db?sslaccept=strict`*

### Step 2: Push your Schema to TiDB
1. Open your `backend/.env` file.
2. Replace your local `DATABASE_URL` with the new TiDB Connection String.
3. Push your database structure to the cloud:
   ```bash
   cd backend
   npx prisma db push
   ```

---

## 🚀 Phase 2: Direct Vercel Deployment (NO GitHub Required)

Instead of linking GitHub to Vercel, we will use the **Vercel CLI** to manually push your code from your computer directly to Vercel.

### Step 1: Install Vercel CLI
Open a terminal and install the Vercel Command Line Interface globally on your Mac:
```bash
npm i -g vercel
```

### Step 2: Prepare the Express Backend
Vercel needs your Express app exported.
1. Open `backend/src/server.ts`. 
2. Change the `app.listen` block at the bottom to this:
   ```typescript
   if (process.env.NODE_ENV !== 'production') {
       app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
   }
   export default app;
   ```

### Step 3: Create `vercel.json`
In the **root folder** of your project (where `package.json` is), create `vercel.json` with this exact code:

```json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "backend/src/server.ts", "use": "@vercel/node" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/src/server.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 4: Update Frontend API Calls
Ensure your frontend (`src/lib/axios.ts` or similar) knows to hit `/api` in production:
```typescript
const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction ? '/api' : 'http://localhost:5001/api';
```

### Step 5: Manual Deployment
1. Make sure you are in the **Root folder** (`hrms-master`) in your terminal.
2. Login to Vercel via CLI:
   ```bash
   vercel login
   ```
3. Deploy your project:
   ```bash
   vercel
   ```
4. Answer the prompts (Yes to set up, link to current directory, default settings are fine).
5. **Crucial:** Once your project is created on Vercel, go to the Vercel Dashboard in your browser, find your project, go to **Settings > Environment Variables**, and add your `DATABASE_URL` and `JWT_SECRET`.
6. To push your code to **Production**, run:
   ```bash
   vercel --prod
   ```
*(Every time you want to update your live website, simply open your terminal and type `vercel --prod`. GitHub is completely bypassed!)*

---

## 🗄️ Phase 3: Daily GitHub Backup Routine

GitHub will now serve purely as your external hard drive for code. It is disconnected from Vercel entirely.

### End of Day Routine:
At the end of your coding session, run these commands to backup your local work to GitHub:

1. **Check what changed:**
   ```bash
   git status
   ```

2. **Stage all changes:**
   ```bash
   git add .
   ```

3. **Label your backup:**
   ```bash
   git commit -m "Daily backup: completed designations module"
   ```

4. **Upload the backup to GitHub:**
   ```bash
   git push origin main
   ```

---
**Summary:**
1. Code on your laptop.
2. Run `vercel --prod` to update the internet website directly.
3. Run `git commit` and `git push` before going to sleep to back up your code to GitHub safekeeping.
