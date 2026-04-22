"use strict";
/**
 * Auto-loader for all backend routes
 * This module dynamically discovers and registers all route files
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllRoutes = loadAllRoutes;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routesDir = path_1.default.join(__dirname, 'routes');
const ROUTE_MAPPINGS = {
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
function loadAllRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = fs_1.default.readdirSync(routesDir)
                .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
                .sort();
            console.log(`\n📂 Loading ${files.length} backend route modules...\n`);
            let successCount = 0;
            let skipCount = 0;
            for (const file of files) {
                const routeName = path_1.default.basename(file, '.ts');
                // Skip if already registered manually
                if (routeName === 'escalationRoutes' || routeName === 'meetingRoutes') {
                    skipCount++;
                    continue;
                }
                try {
                    // Dynamic import
                    const routeModule = yield Promise.resolve(`${`./routes/${routeName}.js`}`).then(s => __importStar(require(s)));
                    const router = routeModule.default;
                    // Determine API path
                    let apiPath = ROUTE_MAPPINGS[routeName];
                    if (!apiPath) {
                        // Auto-detect path from route name
                        apiPath = `/api/${routeName
                            .replace(/Routes$/, '')
                            .replace(/([A-Z])/g, (m) => '-' + m.toLowerCase())
                            .replace(/^-/, '')
                            .toLowerCase()}`;
                    }
                    app.use(apiPath, router);
                    successCount++;
                    console.log(`✓ Loaded: ${apiPath} (${routeName})`);
                }
                catch (err) {
                    console.warn(`⚠ Failed to load route ${routeName}:`, err.message);
                }
            }
            console.log(`\n✅ Route loading complete: ${successCount} registered, ${skipCount} manually handled\n`);
        }
        catch (err) {
            console.error('❌ Error loading routes:', err);
        }
    });
}
