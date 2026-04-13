# MineHR Project Developer Guide

Welcome to the MineHR project repository! This guide provides everything you need to know about the project architecture, how to run it locally, where the database lives, and how to migrate the project to a new PC.

## 1. Project Summary & Architecture 🏗️

This is a modern **Full-Stack Application** built with:
- **Frontend**: React.js, Vite, TypeScript, Zustand (State Management), React Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL (MariaDB via XAMPP)
- **Database Connector**: Prisma ORM

The frontend serves the user interface and runs on `http://localhost:5173`. The backend provides secure API routes and handles database reading/writing on `http://localhost:5001`. The frontend talks to the backend using Axios.

## 2. Where is the Database? 🗄️

The database is a MySQL (MariaDB) instance currently hosted inside **XAMPP**.
- **Database Name**: `minehr_db`
- **Port**: `3309` (Configured manually to avoid conflicts)
- **User**: `root` (No password by default)

The backend connects to this database via the connection string located in `backend/.env`:
`DATABASE_URL="mysql://root:@localhost:3309/minehr_db"`

All database structure (Users, Company, Branches, Departments) is strictly defined in `backend/prisma/schema.prisma`.

## 3. How to Run Both Servers with a Single Command 🚀

You no longer need to open two terminal windows to start the frontend and backend separately! We have installed `concurrently` to run both simultaneously.

**To start the entire project:**
1. Open your terminal in the root project folder (`hrms-master`).
2. Run this single command:
   ```bash
   npm start
   ```
This command automatically boots the Vite React app AND the Node.js Express server at the exact same time.

## 4. How to Export / Download the Database 📥

To move this project to another PC, you need to bring the database with you. You can export it directly using XAMPP:

**Using phpMyAdmin (Visual Method):**
1. Open your XAMPP Control Panel and ensure MySQL is running.
2. Click the **"Admin"** button next to MySQL (This opens phpMyAdmin in your browser).
3. On the left sidebar, click on the **`minehr_db`** database.
4. Click the **"Export"** tab at the top.
5. Choose the "Quick" export method and "SQL" format, then click **"Go"** or **"Export"**.
6. This will download a file named `minehr_db.sql` to your computer.

**Using Terminal (Advanced Method):**
Run this command from your XAMPP shell:
`mysqldump -u root -P 3309 minehr_db > minehr_db_backup.sql`

## 5. How to Set Up the Project on a New PC 💻

If another developer needs to work on this, or you get a new computer, follow these exact steps:

### Part A: Database Setup
1. **Install XAMPP** (or any MySQL server) on the new PC.
2. Start MySQL via XAMPP. (Ensure the port is set to 3309, or update `backend/.env` if you use the default 3306).
3. Open **phpMyAdmin** (Click Admin on XAMPP).
4. Click **"New"** and create an empty database named `minehr_db`.
5. Click on `minehr_db`, go to the **"Import"** tab, and upload the `minehr_db.sql` file you exported previously.

### Part B: Code Setup
1. Install **Node.js** (LTS version) on the new PC if it is not already installed.
2. Copy this entire project folder (`hrms-master`) to the new PC.
3. Open a terminal inside the project folder.
4. Install all frontend dependencies:
   ```bash
   npm install
   ```
5. Install all backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```
6. Start the whole application:
   ```bash
   npm start
   ```

You are now fully up and running on the new machine!
