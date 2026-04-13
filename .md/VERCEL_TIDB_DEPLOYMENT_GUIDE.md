# Vercel & TiDB Cloud Deployment Master Guide

This guide details exactly how to deploy your MineHR application to the internet using **Vercel** (for the application) and **TiDB Cloud** (for the database). It also covers day-to-day operations like taking backups, making changes, and rolling back if something breaks.

---

## 🏗️ Part 1: Setting up the TiDB Cloud Database

TiDB Cloud Serverless is a highly scalable, MySQL-compatible database. We use this because Vercel does not host databases, and TiDB offers a generous free tier that pairs perfectly with Vercel's serverless environment.

### 1. Create the Database Cluster
1. Go to [TiDB Cloud](https://tidbcloud.com/) and sign up.
2. Create a **Serverless Cluster** (the free option).
3. Choose a region close to your users (e.g., AWS US East or AWS ap-south-1).
4. Once created, click on the **Connect** button in your cluster dashboard.

### 2. Connect Your Local Code to TiDB
You need to tell Prisma (your database tool) where the new cloud database is.

1. In the TiDB Connect dialog, select **Prisma** from the connection options.
2. Copy the generated **Connection String**. It will look something like this:
   `mysql://[username]:[password]@gateway01.[region].prod.aws.tidbcloud.com:4000/[database_name]?sslaccept=strict`
3. Open your local `backend/.env` file.
4. Replace the old `DATABASE_URL` with this new TiDB connection string.

### 3. Push Your Database Structure to TiDB
Now you must build the tables (Zones, Departments, Users, etc.) inside the empty TiDB database.

1. Open your terminal.
2. Navigate to your backend folder: `cd backend`
3. Run the schema push command:
   ```bash
   npx prisma db push
   ```
*Why? This reads your `backend/prisma/schema.prisma` file and creates the exact matching tables in the live TiDB cloud.*

---

## 🚀 Part 2: Deploying to Vercel (Manual CLI Method)

We will use the Vercel Command Line Interface (CLI) to push your code directly from your laptop to Vercel. This completely bypasses GitHub.

### 1. Install and Login to Vercel CLI
1. Open your terminal.
2. Install the CLI tool globally:
   ```bash
   npm i -g vercel
   ```
3. Log into your Vercel account:
   ```bash
   vercel login
   ```
   *(Follow the prompts to authenticate via your browser)*

### 2. Prepare the Code for Vercel
Vercel needs specific instructions on how to handle your backend API and frontend React code.

1. **Update `backend/src/server.ts`:** Vercel needs the app exported, not just listening on a port. At the bottom of the file, ensure it looks like this:
   ```typescript
   if (process.env.NODE_ENV !== 'production') {
       app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   }
   export default app;
   ```

2. **Create `vercel.json`:** In the root folder (`hrms-master`), create a file named `vercel.json` with this code:
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
   *Why? This tells Vercel: "Build the React frontend using the package.json scripts and put it in the 'dist' folder. Also, take server.ts and run it as a serverless function. If a user visits `/api/anything`, send them to the backend function. Otherwise, send them to the frontend index.html."*

3. **Update Axios URLs:** In your React frontend (`src/lib/axios.ts` or wherever you construct API requests), ensure it points to the correct URL based on the environment:
   ```typescript
   const baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';
   // Note: Vercel handles the routing via the rewrites in vercel.json, so '/api' works perfectly.
   ```

### 3. Deploy the Application
1. Open your terminal in the root folder (`hrms-master`).
2. Run the production deploy command:
   ```bash
   vercel --prod
   ```
3. You will be asked a few setup questions the first time:
   - Set up and deploy? -> **Y**
   - Which scope? -> **(Your username)**
   - Link to existing project? -> **N**
   - What's your project's name? -> **minehr**
   - In which directory is your code located? -> **./** (Just press Enter)
   - Want to modify these settings? -> **N**

### 4. Set Environment Variables in Vercel
Your deployed app needs to know how to connect to TiDB and needs your JWT secret.
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) in your browser.
2. Click on your newly created `minehr` project.
3. Go to **Settings > Environment Variables**.
4. Add the following:
   - Key: `DATABASE_URL`, Value: *(Your TiDB Connection String)*
   - Key: `JWT_SECRET`, Value: *(Your secret key, e.g., 'your_super_secret_key')*
5. Run `vercel --prod` in your terminal one more time so it rebuilds using these variables.

Your app is now live on the internet!

---

## 💾 Part 3: Downloading & Backing Up Your Database

You should regularly backup your live TiDB database.

1. Go to the [TiDB Cloud Dashboard](https://tidbcloud.com/).
2. Select your cluster.
3. Go to the **Export** or **Backup** section.
4. Choose to export the database as a SQL file.
5. Download the file to your computer.

*Why? This gives you a physical `.sql` file containing all your live employee data, zones, and designations. If anything catastrophic happens, you can restore from this file.*

---

## 🛠️ Part 4: Making Changes and Updating the Live Site

When you want to add a new feature (like a new UI page or a new database table), here is the workflow:

### Scenario A: Only Frontend/Backend Code Changed (No Database Changes)
1. Write and test your code locally.
2. When you are happy, open the terminal in the root folder.
3. Run the deployment command:
   ```bash
   vercel --prod
   ```
   *Vercel will package the new code and replace the live site in seconds.*

### Scenario B: Database Changes Were Made (e.g., added a new table in `schema.prisma`)
If you change the structure of the database, you must update TiDB *before* updating Vercel.

1. Write and test your code locally.
2. Open `backend/.env` and temporarily ensure `DATABASE_URL` points to your **live TiDB URL** (not localhost).
3. Run the Prisma push command:
   ```bash
   cd backend
   npx prisma db push
   ```
   *This updates the live TiDB database tables without touching the existing data.*
4. Now, go back to the root folder and deploy the new code:
   ```bash
   cd ..
   vercel --prod
   ```

---

## ⏪ Part 5: How to Rollback from a Mistake

If you deploy something and the live site breaks, you must roll back immediately.

### Rolling Back Code (Vercel)
Vercel keeps a history of every single deployment you make.
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click on your project.
2. Go to the **Deployments** tab.
3. You will see a list of every `vercel --prod` command you ever ran.
4. Find the previous deployment that was working correctly.
5. Click the three dots (`...`) next to it and select **Promote to Production** (or **Assign Custom Domains** -> Select your main domain).
   *The live site will instantly revert to that older, working code.*

### Rolling Back Database Changes (TiDB)
If you severely corrupted the live database data:
1. Go to the [TiDB Cloud Dashboard](https://tidbcloud.com/).
2. Select your cluster.
3. Go to the **Import** or **Restore** section.
4. Upload the latest `.sql` backup file you downloaded in Part 3.
5. Restore the database. This will overwrite the corrupted live data with your safe backup.

---

## ⚡ Quick Reference: Daily Command Summary

Here is the absolute shortest cheat sheet of commands you actually type every day.

**1. Update Live Database (Only if you changed `schema.prisma`):**
```bash
# Temporarily point .env to TiDB URL, then run:
cd backend
npx prisma db push
cd ..
```

**2. Update Live Website (Vercel):**
```bash
# Push new frontend/backend code to the internet
vercel --prod
```

**3. Backup Everything to GitHub (End of Day):**
```bash
git add .
git commit -m "my daily backup"
git push origin main
```
