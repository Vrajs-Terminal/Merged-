# New Device Run Commands

Use this checklist on a fresh machine to run the project correctly.

## 1) Install prerequisites

1. Install Node.js 20 LTS (Node 18+ also works)
2. Install Git
3. Make sure you have access to a MySQL or TiDB database

## 2) Clone repository

1. git clone https://github.com/Vrajs-Terminal/Merged-.git
2. cd hrms-master-merged

## 3) Install dependencies

1. npm install

## 4) Create backend environment file

1. cp .env.example backend/.env
2. Open backend/.env and set:
   DATABASE_URL
   JWT_SECRET
   PORT=5001

Example DATABASE_URL format:
mysql://user:password@host:4000/database?sslaccept=strict&connection_limit=5&pool_timeout=30

## 5) Prepare database

Run from project root:

1. npx prisma generate
2. npx prisma migrate dev --name init_on_new_device

If your DB is already initialized and you only need schema sync:

1. npx prisma generate
2. npx prisma db push

## 6) Start project

1. npm start

This starts:
1. Frontend on http://localhost:5173
2. Backend on http://localhost:5001

## 7) Verify backend health

1. curl http://localhost:5001/api/health

## 8) If something fails

Run this clean reinstall sequence:

1. rm -rf node_modules backend/node_modules package-lock.json backend/package-lock.json
2. npm install
3. cd backend && npm install && cd ..
4. npx prisma generate
5. npm start

## Optional: Run frontend and backend in separate terminals

Terminal 1:
npm run dev

Terminal 2:
cd backend
npm run dev
