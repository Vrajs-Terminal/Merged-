/**
 * Auto-loader for all backend routes
 * This module dynamically discovers and registers all route files
 */

import express, { Router } from 'express';
import path from 'path';
import fs from 'fs';

const routesDir = path.join(__dirname, 'routes');

const ROUTE_MAPPINGS: { [key: string]: string } = {
  // Manual overrides for routes with non-standard naming patterns
  'admin-rights': '/api/admin-rights',
  'admin-menu-reordering': '/api/admin-menu-reordering',
  'attendance-requests': '/api/attendance-requests',
  'attendance': '/api/attendance',
  'auth': '/api/auth',
  'breaks': '/api/breaks',
  'branches': '/api/branches',
  'chat': '/api/chat',
  'companies': '/api/companies',
  'company': '/api/company',
  'complaints': '/api/complaints',
  'dashboard': '/api/dashboard',
  'dailyWorkReports': '/api/daily-work-reports',
  'daily-work-reports': '/api/daily-work-reports',
  'daily-attendance-email': '/api/daily-attendance-email',
  'departments': '/api/departments',
  'designations': '/api/designations',
  'discussions': '/api/discussions',
  'document-requests': '/api/document-requests',
  'earning-deduction-types': '/api/earning-deduction-types',
  'employee-grades': '/api/employee-grades',
  'employee-levels': '/api/employee-levels',
  'employee-parking': '/api/employee-parking',
  'Emergency-numbers': '/api/emergency-numbers',
  'escalationRoutes': '/api/escalations',
  'expensesRoutes': '/api/expenses',
  'geofences': '/api/geofences',
  'holidays': '/api/holidays',
  'id-card-templates': '/api/id-card-templates',
  'meeting': '/api/meetings',
  'notifications': '/api/notifications',
  'payroll-settings': '/api/payroll-settings',
  'salary-groups': '/api/salary-groups',
  'search': '/api/search',
  'settings': '/api/settings',
  'shifts': '/api/shifts',
  'sub-departments': '/api/sub-departments',
  'tracking-config': '/api/tracking-config',
  'tracking-exceptions': '/api/tracking-exceptions',
  'tracking': '/api/tracking',
  'upload': '/api/upload',
  'visit': '/api/visits',
  'visitRoutes': '/api/visits',
  'whatsapp-alerts': '/api/whatsapp-alerts',
  'zones': '/api/zones',
};

/**
 * Load and register all routes dynamically
 * @param app Express application instance
 */
export async function loadAllRoutes(app: express.Application): Promise<void> {
  try {
    const files = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
      .sort();

    console.log(`\n📂 Loading ${files.length} backend route modules...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const file of files) {
      const routeName = path.basename(file, '.ts');
      
      // Skip if already registered manually
      if (routeName === 'escalationRoutes' || routeName === 'meetingRoutes') {
        skipCount++;
        continue;
      }

      try {
        // Dynamic import
        const routeModule = await import(`./routes/${routeName}.js`);
        const router = routeModule.default as Router;

        // Determine API path
        let apiPath = ROUTE_MAPPINGS[routeName];
        
        if (!apiPath) {
          // Auto-detect path from route name
          apiPath = `/api/${routeName
            .replace(/Routes$/, '')
            .replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase())
            .replace(/^-/, '')
            .toLowerCase()}`;
        }

        app.use(apiPath, router);
        successCount++;
        console.log(`✓ Loaded: ${apiPath} (${routeName})`);
      } catch (err: any) {
        console.warn(`⚠ Failed to load route ${routeName}:`, err.message);
      }
    }

    console.log(`\n✅ Route loading complete: ${successCount} registered, ${skipCount} manually handled\n`);
  } catch (err) {
    console.error('❌ Error loading routes:', err);
  }
}
