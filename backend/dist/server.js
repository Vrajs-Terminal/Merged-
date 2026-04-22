"use strict";
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prismaClient_1 = __importDefault(require("./lib/prismaClient"));
// CORS origins: allow Vercel deployments and local dev
const allowedOrigins = [
    /\.vercel\.app$/, // any *.vercel.app subdomain
    /^http:\/\/localhost(:\d+)?$/, // localhost dev
    /^http:\/\/127\.0\.0\.1(:\d+)?$/ // 127.0.0.1 dev
];
const auth_1 = __importDefault(require("./routes/auth"));
const company_1 = __importDefault(require("./routes/company"));
const companies_1 = __importDefault(require("./routes/companies"));
const employee_levels_1 = __importDefault(require("./routes/employee-levels"));
const employee_grades_1 = __importDefault(require("./routes/employee-grades"));
const admin_rights_1 = __importDefault(require("./routes/admin-rights"));
const branches_1 = __importDefault(require("./routes/branches"));
const departments_1 = __importDefault(require("./routes/departments"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const zones_1 = __importDefault(require("./routes/zones"));
const sub_departments_1 = __importDefault(require("./routes/sub-departments"));
const posts_1 = __importDefault(require("./routes/timeline/posts"));
const engagement_1 = __importDefault(require("./routes/timeline/engagement"));
const templates_1 = __importDefault(require("./routes/timeline/templates"));
const settings_1 = __importDefault(require("./routes/timeline/settings"));
const designations_1 = __importDefault(require("./routes/designations"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const id_card_templates_1 = __importDefault(require("./routes/id-card-templates"));
const daily_attendance_email_1 = __importDefault(require("./routes/daily-attendance-email"));
const employee_parking_1 = __importDefault(require("./routes/employee-parking"));
const emergency_numbers_1 = __importDefault(require("./routes/emergency-numbers"));
const settings_2 = __importDefault(require("./routes/settings"));
const whatsapp_alerts_1 = __importDefault(require("./routes/whatsapp-alerts"));
const shifts_1 = __importDefault(require("./routes/shifts"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const attendance_requests_1 = __importDefault(require("./routes/attendance-requests"));
const document_requests_1 = __importDefault(require("./routes/document-requests"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const breaks_1 = __importDefault(require("./routes/breaks"));
const geofences_1 = __importDefault(require("./routes/geofences"));
const tracking_1 = __importDefault(require("./routes/tracking"));
const tracking_exceptions_1 = __importDefault(require("./routes/tracking-exceptions"));
const tracking_config_1 = __importDefault(require("./routes/tracking-config"));
const daily_work_reports_1 = __importDefault(require("./routes/daily-work-reports"));
const visit_1 = __importDefault(require("./routes/visit"));
const visit_status_1 = __importDefault(require("./routes/visit/visit-status"));
const manager_approval_1 = __importDefault(require("./routes/visit/manager-approval"));
const visit_reports_1 = __importDefault(require("./routes/visit/visit-reports"));
const search_1 = __importDefault(require("./routes/search"));
const payroll_settings_1 = __importDefault(require("./routes/payroll-settings"));
const earning_deduction_types_1 = __importDefault(require("./routes/earning-deduction-types"));
const salary_groups_1 = __importDefault(require("./routes/salary-groups"));
const incentive_types_1 = __importDefault(require("./routes/payroll/incentive-types"));
const gratuity_settings_1 = __importDefault(require("./routes/payroll/gratuity-settings"));
const employee_ctc_1 = __importDefault(require("./routes/payroll/employee-ctc"));
const salary_slips_1 = __importDefault(require("./routes/payroll/salary-slips"));
const other_earnings_1 = __importDefault(require("./routes/payroll/other-earnings"));
const employee_incentives_1 = __importDefault(require("./routes/payroll/employee-incentives"));
const ff_settlement_1 = __importDefault(require("./routes/payroll/ff-settlement"));
const employee_bank_details_1 = __importDefault(require("./routes/payroll/employee-bank-details"));
const salary_group_swipe_1 = __importDefault(require("./routes/payroll/salary-group-swipe"));
const salary_hold_1 = __importDefault(require("./routes/payroll/salary-hold"));
const reports_1 = __importDefault(require("./routes/payroll/reports"));
const tax_regime_1 = __importDefault(require("./routes/payroll/tax-regime"));
const tds_rules_1 = __importDefault(require("./routes/payroll/tds-rules"));
const tax_benefit_category_1 = __importDefault(require("./routes/payroll/tax-benefit-category"));
const tax_benefit_sub_category_1 = __importDefault(require("./routes/payroll/tax-benefit-sub-category"));
const tax_slabs_1 = __importDefault(require("./routes/payroll/tax-slabs"));
const tax_documents_1 = __importDefault(require("./routes/payroll/tax-documents"));
const other_income_loss_1 = __importDefault(require("./routes/payroll/other-income-loss"));
const form12b_1 = __importDefault(require("./routes/payroll/form12b"));
const tds_challan_1 = __importDefault(require("./routes/payroll/tds-challan"));
const form16_1 = __importDefault(require("./routes/payroll/form16"));
const tax_reports_1 = __importDefault(require("./routes/payroll/tax-reports"));
// General Utilities
const upload_1 = __importDefault(require("./routes/upload"));
// Work Allocation System
const categories_1 = __importDefault(require("./routes/work-allocation/categories"));
const access_1 = __importDefault(require("./routes/work-allocation/access"));
const tasks_1 = __importDefault(require("./routes/work-allocation/tasks"));
const reports_2 = __importDefault(require("./routes/work-allocation/reports"));
// Site Management System
const sites_1 = __importDefault(require("./routes/site-management/sites"));
const site_employees_1 = __importDefault(require("./routes/site-management/site-employees"));
const site_attendance_1 = __importDefault(require("./routes/site-management/site-attendance"));
const site_purchases_1 = __importDefault(require("./routes/site-management/site-purchases"));
const site_reports_1 = __importDefault(require("./routes/site-management/site-reports"));
// PMS – Performance Matrix
const dimensions_1 = __importDefault(require("./routes/pms/dimensions"));
const sub_groups_1 = __importDefault(require("./routes/pms/sub-groups"));
const score_bands_1 = __importDefault(require("./routes/pms/score-bands"));
const assign_1 = __importDefault(require("./routes/pms/assign"));
const evaluations_1 = __importDefault(require("./routes/pms/evaluations"));
const summary_1 = __importDefault(require("./routes/pms/summary"));
// Employee Vehicles
const categories_2 = __importDefault(require("./routes/vehicles/categories"));
const vehicles_1 = __importDefault(require("./routes/vehicles/vehicles"));
const reports_3 = __importDefault(require("./routes/vehicles/reports"));
// Idea Box Module
const categories_3 = __importDefault(require("./routes/idea-box/categories"));
const ideas_1 = __importDefault(require("./routes/idea-box/ideas"));
const approvals_1 = __importDefault(require("./routes/idea-box/approvals"));
const analytics_1 = __importDefault(require("./routes/idea-box/analytics"));
// SOS Management Module
const types_1 = __importDefault(require("./routes/sos/types"));
const alerts_1 = __importDefault(require("./routes/sos/alerts"));
const actions_1 = __importDefault(require("./routes/sos/actions"));
// Holiday Management
const holidays_1 = __importDefault(require("./routes/holidays/holidays"));
const groups_1 = __importDefault(require("./routes/holidays/groups"));
const requests_1 = __importDefault(require("./routes/holidays/requests"));
// Mobile Device Bind Module
const settings_3 = __importDefault(require("./routes/mobile-device/settings"));
const requests_2 = __importDefault(require("./routes/mobile-device/requests"));
// Vendor Management Module
const categories_4 = __importDefault(require("./routes/vendors/categories"));
const sub_categories_1 = __importDefault(require("./routes/vendors/sub-categories"));
const vendors_1 = __importDefault(require("./routes/vendors/vendors"));
// Background Verification Module
const verification_types_1 = __importDefault(require("./routes/bgv/verification-types"));
const manage_1 = __importDefault(require("./routes/bgv/manage"));
const reports_4 = __importDefault(require("./routes/bgv/reports"));
// Visitors Module
const sub_types_1 = __importDefault(require("./routes/visitors/sub-types"));
const manage_2 = __importDefault(require("./routes/visitors/manage"));
const settings_4 = __importDefault(require("./routes/visitors/settings"));
const reports_5 = __importDefault(require("./routes/visitors/reports"));
// Chat Group Module
const groups_2 = __importDefault(require("./routes/chat/groups"));
const members_1 = __importDefault(require("./routes/chat/members"));
// Discussion Forum Module
const manage_3 = __importDefault(require("./routes/discussions/manage"));
const thread_1 = __importDefault(require("./routes/discussions/thread"));
// Complaints
const categories_5 = __importDefault(require("./routes/complaints/categories"));
const manage_4 = __importDefault(require("./routes/complaints/manage"));
const comments_1 = __importDefault(require("./routes/complaints/comments"));
const config_1 = __importDefault(require("./routes/complaints/config"));
// Escalations Module
const escalationRoutes_1 = __importDefault(require("./routes/escalationRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
// ============================================================
// NEW ROUTES FROM MERGED PROJECT (Project B)
// ============================================================
// Asset Management
const assetRoutes_1 = __importDefault(require("./routes/assetRoutes"));
// Advance & Salary Management
const advanceRequestRoutes_1 = __importDefault(require("./routes/advanceRequestRoutes"));
const advanceSalaryRoutes_1 = __importDefault(require("./routes/advanceSalaryRoutes"));
// Expense Management
const expenseAdvanceRoutes_1 = __importDefault(require("./routes/expenseAdvanceRoutes"));
const expenseCategoryRoutes_1 = __importDefault(require("./routes/expenseCategoryRoutes"));
const expenseEntryRoutes_1 = __importDefault(require("./routes/expenseEntryRoutes"));
// Onboarding & Offboarding
const onboardingRoutes_1 = __importDefault(require("./routes/onboardingRoutes"));
const offboardingRoutes_1 = __importDefault(require("./routes/offboardingRoutes"));
const engagementRoutes_1 = __importDefault(require("./routes/engagementRoutes"));
// HR Management Extensions
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const promotionRoutes_1 = __importDefault(require("./routes/promotionRoutes"));
const resignationRoutes_1 = __importDefault(require("./routes/resignationRoutes"));
const leaveRoutes_1 = __importDefault(require("./routes/leaveRoutes"));
// Finance & Payroll Extensions
const financeRoutes_1 = __importDefault(require("./routes/financeRoutes"));
const payrollRoutes_1 = __importDefault(require("./routes/payrollRoutes"));
const ledgerRoutes_1 = __importDefault(require("./routes/ledgerRoutes"));
// Product & Inventory Management
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const productCategoryRoutes_1 = __importDefault(require("./routes/productCategoryRoutes"));
const productStockRoutes_1 = __importDefault(require("./routes/productStockRoutes"));
// Sales & Distribution
const dailySalesReportRoutes_1 = __importDefault(require("./routes/dailySalesReportRoutes"));
const distributorRoutes_1 = __importDefault(require("./routes/distributorRoutes"));
const retailerRoutes_1 = __importDefault(require("./routes/retailerRoutes"));
// Additional Management Modules  
const activityLogRoutes_1 = __importDefault(require("./routes/activityLogRoutes"));
const adminSettingsRoutes_1 = __importDefault(require("./routes/adminSettingsRoutes"));
const beatPlanRoutes_1 = __importDefault(require("./routes/beatPlanRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/branchRoutes"));
const departmentRoutes_1 = __importDefault(require("./routes/departmentRoutes"));
const designationRoutes_1 = __importDefault(require("./routes/designationRoutes"));
const levelRoutes_1 = __importDefault(require("./routes/levelRoutes"));
const hierarchyRoutes_1 = __importDefault(require("./routes/hierarchyRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
console.log('--- MineHR Backend Diagnostic ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL prefix:', process.env.DATABASE_URL.substring(0, 10) + '...');
}
console.log('---------------------------------');
// Security Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Vercel SSR)
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.some(pattern => typeof pattern === 'string' ? pattern === origin : pattern.test(origin));
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(null, true); // permissive for now — restrict once domain confirmed
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter); // Apply to all /api/ endpoints
// Mount API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/timeline', posts_1.default);
app.use('/api/timeline/engagement', engagement_1.default);
app.use('/api/timeline/templates', templates_1.default);
app.use('/api/timeline/settings', settings_1.default);
app.use('/api/company', company_1.default);
app.use('/api/companies', companies_1.default);
app.use('/api/employee-levels', employee_levels_1.default);
app.use('/api/employee-grades', employee_grades_1.default);
app.use('/api/admin-rights', admin_rights_1.default);
app.use('/api/branches', branches_1.default);
app.use('/api/departments', departments_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/zones', zones_1.default);
app.use('/api/sub-departments', sub_departments_1.default);
app.use('/api/designations', designations_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/id-card-templates', id_card_templates_1.default);
app.use('/api/daily-attendance-email', daily_attendance_email_1.default);
app.use('/api/employee-parking', employee_parking_1.default);
app.use('/api/emergency-numbers', emergency_numbers_1.default);
app.use('/api/settings', settings_2.default);
app.use('/api/whatsapp-alerts', whatsapp_alerts_1.default);
app.use('/api/shifts', shifts_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/attendance-requests', attendance_requests_1.default);
app.use('/api/document-requests', document_requests_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/breaks', breaks_1.default);
app.use('/api/geofences', geofences_1.default);
app.use('/api/tracking', tracking_1.default);
app.use('/api/tracking-exceptions', tracking_exceptions_1.default);
app.use('/api/tracking-config', tracking_config_1.default);
app.use('/api/daily-work-reports', daily_work_reports_1.default);
app.use('/api/visits', visit_1.default);
app.use('/api/visit-status', visit_status_1.default);
app.use('/api/manager-approval', manager_approval_1.default);
app.use('/api/visit-reports', visit_reports_1.default);
app.use('/api/search', search_1.default);
app.use('/api/payroll-settings', payroll_settings_1.default);
app.use('/api/earning-deduction-types', earning_deduction_types_1.default);
app.use('/api/salary-groups', salary_groups_1.default);
app.use('/api/incentive-types', incentive_types_1.default);
app.use('/api/gratuity-settings', gratuity_settings_1.default);
app.use('/api/employee-ctc', employee_ctc_1.default);
app.use('/api/salary-slips', salary_slips_1.default);
app.use('/api/other-earnings', other_earnings_1.default);
app.use('/api/employee-incentives', employee_incentives_1.default);
app.use('/api/ff-settlement', ff_settlement_1.default);
app.use('/api/employee-bank-details', employee_bank_details_1.default);
app.use('/api/salary-group-swipe', salary_group_swipe_1.default);
app.use('/api/salary-hold', salary_hold_1.default);
app.use('/api/payroll-reports', reports_1.default);
app.use('/api/payroll/tax-regimes', tax_regime_1.default);
app.use('/api/payroll/tds-rules', tds_rules_1.default);
app.use('/api/payroll/tax-categories', tax_benefit_category_1.default);
app.use('/api/payroll/tax-sub-categories', tax_benefit_sub_category_1.default);
app.use('/api/payroll/tax-slabs', tax_slabs_1.default);
app.use('/api/payroll/tax-documents', tax_documents_1.default);
app.use('/api/payroll/other-income-loss', other_income_loss_1.default);
app.use('/api/payroll/form12b', form12b_1.default);
app.use('/api/payroll/tds-challan', tds_challan_1.default);
app.use('/api/payroll/form16', form16_1.default);
app.use('/api/payroll/tax-reports', tax_reports_1.default);
// Work Allocation System
app.use('/api/work-allocation/categories', categories_1.default);
app.use('/api/work-allocation/access', access_1.default);
app.use('/api/work-allocation/tasks', tasks_1.default);
app.use('/api/work-allocation/report', reports_2.default); // Note singular report endpoint
// Site Management System
app.use('/api/site-management/sites', sites_1.default);
app.use('/api/site-management/employees', site_employees_1.default);
app.use('/api/site-management/attendance', site_attendance_1.default);
app.use('/api/site-management/purchases', site_purchases_1.default);
app.use('/api/site-management/reports', site_reports_1.default);
// PMS – Performance Matrix
app.use('/api/pms/dimensions', dimensions_1.default);
app.use('/api/pms/sub-groups', sub_groups_1.default);
app.use('/api/pms/score-bands', score_bands_1.default);
app.use('/api/pms/assign', assign_1.default);
app.use('/api/pms/evaluations', evaluations_1.default);
app.use('/api/pms/summary', summary_1.default);
// Employee Vehicles
app.use('/api/vehicles/categories', categories_2.default);
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/vehicles/reports', reports_3.default);
// Idea Box Module
app.use('/api/idea-box/categories', categories_3.default);
app.use('/api/idea-box/ideas', ideas_1.default);
app.use('/api/idea-box/approvals', approvals_1.default);
app.use('/api/idea-box/analytics', analytics_1.default);
// SOS Management Module
app.use('/api/sos/types', types_1.default);
app.use('/api/sos/alerts', alerts_1.default);
app.use('/api/sos/actions', actions_1.default);
// Holiday Management
app.use('/api/holidays', holidays_1.default);
app.use('/api/holiday-groups', groups_1.default);
app.use('/api/holiday-requests', requests_1.default);
// Mobile Device Bind Module
app.use('/api/mobile-device/settings', settings_3.default);
app.use('/api/mobile-device/requests', requests_2.default);
// Vendor Management Module
app.use('/api/vendors/categories', categories_4.default);
app.use('/api/vendors/sub-categories', sub_categories_1.default);
app.use('/api/vendors', vendors_1.default);
// Background Verification Module
app.use('/api/bgv/types', verification_types_1.default);
app.use('/api/bgv/manage', manage_1.default);
app.use('/api/bgv/reports', reports_4.default);
// Visitors Module
app.use('/api/visitors/sub-types', sub_types_1.default);
app.use('/api/visitors/manage', manage_2.default);
app.use('/api/visitors/settings', settings_4.default);
app.use('/api/visitors/reports', reports_5.default);
// Chat Group Module
app.use('/api/chat/groups', groups_2.default);
app.use('/api/chat/members', members_1.default);
// Complaints
app.use('/api/complaints/categories', categories_5.default);
app.use('/api/complaints/manage', manage_4.default);
app.use('/api/complaints/comments', comments_1.default);
app.use('/api/complaints/config', config_1.default);
// Discussion Forum Module
app.use('/api/discussions/manage', manage_3.default);
app.use('/api/discussions/thread', thread_1.default);
// Escalations Module
app.use('/api/escalations', escalationRoutes_1.default);
app.use('/api/meetings', meetingRoutes_1.default);
// ============================================================
// NEW API ROUTES FROM MERGED PROJECT (Project B)
// ============================================================
// Asset Management
app.use('/api/assets', assetRoutes_1.default);
// Advance & Salary Management
app.use('/api/advance-requests', advanceRequestRoutes_1.default);
app.use('/api/advance-salary', advanceSalaryRoutes_1.default);
// Expense Management
app.use('/api/expense-advances', expenseAdvanceRoutes_1.default);
app.use('/api/expense-categories', expenseCategoryRoutes_1.default);
app.use('/api/expense-entries', expenseEntryRoutes_1.default);
// Onboarding & Offboarding
app.use('/api/onboarding', onboardingRoutes_1.default);
app.use('/api/offboarding', offboardingRoutes_1.default);
app.use('/api/engagement', engagementRoutes_1.default);
// HR Management
app.use('/api/employees', employeeRoutes_1.default);
app.use('/api/promotions', promotionRoutes_1.default);
app.use('/api/resignations', resignationRoutes_1.default);
app.use('/api/leaves', leaveRoutes_1.default);
// Finance & Payroll
app.use('/api/finance', financeRoutes_1.default);
app.use('/api/payroll-extended', payrollRoutes_1.default);
app.use('/api/ledgers', ledgerRoutes_1.default);
// Product & Inventory
app.use('/api/products', productRoutes_1.default);
app.use('/api/product-categories', productCategoryRoutes_1.default);
app.use('/api/product-stock', productStockRoutes_1.default);
// Sales & Distribution
app.use('/api/daily-sales-reports', dailySalesReportRoutes_1.default);
app.use('/api/distributors', distributorRoutes_1.default);
app.use('/api/retailers', retailerRoutes_1.default);
// Additional Management
app.use('/api/activity-logs', activityLogRoutes_1.default);
app.use('/api/admin-settings', adminSettingsRoutes_1.default);
app.use('/api/beat-plans', beatPlanRoutes_1.default);
app.use('/api/branches-extended', branchRoutes_1.default);
app.use('/api/departments-extended', departmentRoutes_1.default);
app.use('/api/designations-extended', designationRoutes_1.default);
app.use('/api/levels', levelRoutes_1.default);
app.use('/api/hierarchy', hierarchyRoutes_1.default);
app.use('/api/managers', managerRoutes_1.default);
// Auto-register remaining merged route modules from the unified project.
// These are mounted under clean /api/<route-name> aliases to keep the API surface consistent.
const unifiedRouteModules = [
    'appBannerRoutes',
    'attendanceRoutes',
    'authRoutes',
    'bulkUpdateRoutes',
    'celebrationTemplateRoutes',
    'customerCategoryRoutes',
    'customerSubCategoryRoutes',
    'dashboardRoutes',
    'deviceRoutes',
    'distributorAssignmentRoutes',
    'eventRoutes',
    'exEmployeeRoutes',
    'expenseSettingRoutes',
    'expenseSubCategoryRoutes',
    'expenseTemplateRoutes',
    'faceXRoutes',
    'galleryRoutes',
    'geoRoutes',
    'holidayRoutes',
    'jobLocationRoutes',
    'lmsRoutes',
    'lostAndFoundRoutes',
    'nomineeRoutes',
    'orderRoutes',
    'penaltyRoutes',
    'pollRoutes',
    'productSubCategoryRoutes',
    'productVariantRoutes',
    'profileChangeRoutes',
    'quotationConfigRoutes',
    'retirementRoutes',
    'shiftRoutes',
    'superDistributorRoutes',
    'surveyRoutes',
    'taskRoutes',
    'templateQuestionRoutes',
    'templateRoutes',
    'unitMeasureRoutes',
    'visitExpenseAssignmentRoutes',
];
const routeAliases = {
    appBannerRoutes: '/api/app-banners',
    attendanceRoutes: '/api/attendance',
    authRoutes: '/api/auth',
    bulkUpdateRoutes: '/api/bulk-updates',
    celebrationTemplateRoutes: '/api/celebration-templates',
    customerCategoryRoutes: '/api/customer-categories',
    customerSubCategoryRoutes: '/api/customer-sub-categories',
    dashboardRoutes: '/api/dashboard',
    deviceRoutes: '/api/devices',
    distributorAssignmentRoutes: '/api/distributor-assignments',
    eventRoutes: '/api/events',
    exEmployeeRoutes: '/api/ex-employees',
    expenseSettingRoutes: '/api/expense-settings',
    expenseSubCategoryRoutes: '/api/expense-sub-categories',
    expenseTemplateRoutes: '/api/expense-templates',
    faceXRoutes: '/api/face-x',
    galleryRoutes: '/api/galleries',
    geoRoutes: '/api/geo',
    holidayRoutes: '/api/holidays',
    jobLocationRoutes: '/api/job-locations',
    lmsRoutes: '/api/lms',
    lostAndFoundRoutes: '/api/lost-and-found',
    nomineeRoutes: '/api/nominees',
    orderRoutes: '/api/orders',
    penaltyRoutes: '/api/penalties',
    pollRoutes: '/api/polls',
    productSubCategoryRoutes: '/api/product-sub-categories',
    productVariantRoutes: '/api/product-variants',
    profileChangeRoutes: '/api/profile-changes',
    quotationConfigRoutes: '/api/quotation-config',
    retirementRoutes: '/api/retirements',
    shiftRoutes: '/api/shifts',
    superDistributorRoutes: '/api/super-distributors',
    surveyRoutes: '/api/surveys',
    taskRoutes: '/api/tasks',
    templateQuestionRoutes: '/api/template-questions',
    templateRoutes: '/api/templates',
    unitMeasureRoutes: '/api/unit-measures',
    visitExpenseAssignmentRoutes: '/api/visit-expense-assignments',
};
unifiedRouteModules.forEach((moduleName) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const routeModule = require(`./routes/${moduleName}`);
        const router = routeModule.default || routeModule;
        const mountPath = routeAliases[moduleName] || `/api/${moduleName.replace(/Routes$/, '').replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase()}`;
        app.use(mountPath, router);
    }
    catch (error) {
        console.warn(`Skipping route module ${moduleName}:`, error.message);
    }
});
// General Upload Utilities
app.use('/api/upload', upload_1.default);
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../public/uploads')));
// Health check route — used to verify live deployment
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.$queryRaw `SELECT 1`;
        res.json({ status: 'ok', message: 'MineHR Backend is running perfectly!', db: 'connected', env: process.env.NODE_ENV || 'development' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: 'Database connection failed', db: 'disconnected' });
    }
}));
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
exports.default = app;
