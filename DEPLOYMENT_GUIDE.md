# 🚀 Zero-Error Deployment Guide for MineHR

To ensure every deployment to Vercel with TiDB Cloud is successful and error-free, follow these simple steps and best practices.

## 1. Prerequisites (Setup on Vercel Dashboard)
Make sure the following Environment Variables are set in your [Vercel Project Settings](https://vercel.com/vrajamin45-3343s-projects/minehr/settings/environment-variables):
*   `DATABASE_URL`: Must be the TiDB Cloud connection string ending with `?sslaccept=strict`.
*   `JWT_SECRET`: Your secure secret for authentication.
*   `NODE_ENV`: Set to `production`.

## 2. Standard Deployment Command
Always use the following command to deploy. The `--force` flag is important because it bypasses Vercel's legacy build cache and ensures a fresh Prisma Client is generated:

```bash
vercel --prod --force
```

## 3. How the "Zero-Error" System Works
We have configured the following automated safeguards in the repository:
*   **Automatic Prisma Generation**: The `vercel-build` and `postinstall` scripts in `package.json` are configured to automatically run `prisma generate` on every Vercel build.
*   **Linux Compatibility**: The `prisma/schema.prisma` file includes `binaryTargets = ["native", "rhel-openssl-3.0.x"]`, which ensures the database engine works perfectly on Vercel's Linux servers.
*   **Lambda Bundling**: The `vercel.json` file is configured with `includeFiles` to guarantee that the generated Prisma client is properly bundled into the serverless function.
*   **Integrated Types**: The `api/tsconfig.json` ensures that all backend code is correctly compiled without IDE or runtime errors.

## 4. Common Troubleshooting
If you encounter a `FUNCTION_INVOCATION_FAILED` after a future push:
1.  **Check Dependencies**: Ensure any new backend library you add is listed in the **root** `package.json` (not just the `backend/package.json`).
2.  **Schema Changes**: If you modify `prisma/schema.prisma`, run `npx prisma db push` locally first to sync the TiDB database before you deploy.
3.  **Logs**: Visit the Vercel "Logs" tab to see the exact error message.

---
*Created by Antigravity AI to ensure long-term stability for MineHR.*
