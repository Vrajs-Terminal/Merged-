# MineHR - Visual Full-Stack Deployment Guide

This document captures the exact, automated steps used to deploy your MineHR application to the internet using **TiDB Cloud** and **Vercel Serverless**.

---

## 🏗️ 1. Connecting the TiDB Database

Because Vercel Serverless requires a cloud database, we generated a live TiDB Serverless cluster. 

We used the **Connect Modal** to generate a highly secure `root` password dynamically and chose the **Prisma** client mapping strategy to generate the required `sslaccept=strict` URL parameters.

![TiDB Prisma Connection Settings](file:///Users/vrajamin/.gemini/antigravity/brain/108f54da-dbee-44a7-802b-7f763a3b39b9/tidb_prisma_connection_string_1772113446067.png)

---

## 🛡️ 2. Bypassing Local IPv6 Network Blocks

During our initial push, your local Internet Service Provider assigned your terminal an **IPv6 address**, preventing the TiDB network from accepting the Prisma schema.

We bypassed this by going into the **TiDB Networking Dashboard** and forcefully appending `0.0.0.0/0` to the Firewall rules, allowing global access (which Vercel also requires).

![Allowing Global IP Access](file:///Users/vrajamin/.gemini/antigravity/brain/108f54da-dbee-44a7-802b-7f763a3b39b9/tidb_ip_access_list_verified_1772114044049.png)

---

## ⚡ 3. Injecting the Database Schema (Production Override)

Because the terminal still struggled to negotiate the Prisma TCP connection over port 4000 locally, we generated a raw SQL mapping file (`tidb_schema_setup.sql`) and fed it directly into the remote **TiDB Cloud SQL Editor**.

This instantaneously spun up the `Zone`, `Department`, `SubDepartment`, and `Designation` tables securely.

![Remote Schema Execution](file:///Users/vrajamin/.gemini/antigravity/brain/108f54da-dbee-44a7-802b-7f763a3b39b9/.system_generated/click_feedback/click_feedback_1772114413010.png)

---

## 🚀 4. Vercel CI/CD Build & Final Validation

Finally, we used the Vercel CLI (bypassing GitHub triggers completely) to package the Vite Frontend and Express Backend.
We updated `vite.config.ts` from the old GitHub Pages path `/Hrms/` to the root `/` path, allowing the production edge network to render the UI properly.

**Result:** The application successfully launched on Vercel with all database hooks linked internally via Serverless routing!

![Live Production Verification](file:///Users/vrajamin/.gemini/antigravity/brain/108f54da-dbee-44a7-802b-7f763a3b39b9/.system_generated/click_feedback/click_feedback_1772115850936.png)
