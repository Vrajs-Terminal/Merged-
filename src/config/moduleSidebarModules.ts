import {
  Settings,
  Users,
  Clock,
  CalendarDays,
  ClipboardList,
  FileText,
  ShoppingCart,
  Calculator,
  Banknote,
  BookOpen,
  Shield,
  Landmark,
  Gift,
  ScanFace,
  AlertCircle,
  Camera,
  Monitor,
  MessageSquare,
  Search,
  Image as LucideImage,
  ShieldCheck,
} from "lucide-react";

export interface ModuleSubItem {
  name: string;
  path: string;
}

export interface ModuleMenuItem {
  name: string;
  icon: any;
  path?: string;
  subItems?: ModuleSubItem[];
}

const directRouteMap: Record<string, string> = {
  finance: "/finance-dashboard",
  payrollDashboard: "/payroll-dashboard",
};

const l = (key: string) => directRouteMap[key] || `/modules/${key}`;

export const moduleSidebarModules: ModuleMenuItem[] = [
  { name: "Finance Dashboard", icon: Settings, path: l("finance") },
  {
    name: "Employees",
    icon: Users,
    subItems: [
      { name: "All Employees", path: l("employees") },
      { name: "Add Employee", path: l("addEmployee") },
      { name: "Onboarding", path: l("onboarding") },
      { name: "Offboarding", path: l("offboarding") },
      { name: "Resignation", path: l("resignation") },
      { name: "Promotions", path: l("promotion") },
      { name: "Ex Employees", path: l("exEmployees") },
      { name: "Upcoming Retirements", path: l("upcomingRetirements") },
      { name: "Managers / Admin", path: l("managers") },
      { name: "Manager Role", path: l("managerRole") },
      { name: "Level Master", path: l("levelMaster") },
      { name: "Assign Level", path: l("assignLevel") },
      { name: "Level Hierarchy", path: l("levelHierarchy") },
      { name: "Profile Change Requests", path: l("profileChangeRequests") },
      { name: "Structure Management", path: l("structureManagement") },
    ],
  },
  {
    name: "Employee Nominee",
    icon: Users,
    subItems: [
      { name: "Nomination For (Setup)", path: l("nominationType") },
      { name: "Manage Employees Nominee", path: l("manageNominees") },
    ],
  },
  {
    name: "Shift Management",
    icon: Clock,
    subItems: [
      { name: "Create Shift", path: l("shiftManagement") },
      { name: "Shift List", path: l("shiftList") },
      { name: "Shift Assignment", path: l("shiftAssignment") },
      { name: "Shift Rotation", path: l("shiftRotation") },
      { name: "Shift Calendar", path: l("shiftCalendar") },
      { name: "Shift Reports", path: l("shiftReports") },
      { name: "Shift Requests", path: l("shiftChangeRequests") },
      { name: "Penalty Rules", path: l("shiftPenaltyRules") },
    ],
  },
  {
    name: "Holiday & Optional",
    icon: CalendarDays,
    subItems: [
      { name: "Manage Holidays", path: l("holidayManagement") },
      { name: "Exchange Requests", path: l("holidayExchangeRequests") },
    ],
  },
  {
    name: "Leave Management",
    icon: CalendarDays,
    subItems: [
      { name: "Leave Types", path: l("leaveTypes") },
      { name: "Leave Reasons", path: l("leaveReasons") },
      { name: "Leave Groups", path: l("leaveGroups") },
      { name: "Leave Policy", path: l("leavePolicy") },
      { name: "Leave Balance", path: l("leaveBalance") },
      { name: "Apply Leave", path: l("applyLeave") },
      { name: "Short Leaves", path: l("shortLeaves") },
      { name: "Leave Requests", path: l("leaveRequests") },
      { name: "Leave Approval", path: l("leaveApproval") },
      { name: "Leave Payouts", path: l("leavePayouts") },
      { name: "Auto Leaves", path: l("autoLeaves") },
      { name: "Leave Calendar", path: l("leaveCalendar") },
      { name: "Leave Reports", path: l("leaveReports") },
      { name: "Leave Settings", path: l("leaveSettings") },
    ],
  },
  {
    name: "Template Module",
    icon: ClipboardList,
    subItems: [
      { name: "Template List", path: l("templates") },
      { name: "Add New Template", path: l("addTemplate") },
      { name: "Manage Template Questions", path: l("manageTemplateQuestions") },
    ],
  },
  {
    name: "Order Product",
    icon: ShoppingCart,
    subItems: [
      { name: "Sales Dashboard", path: l("salesDashboard") },
      { name: "Order Settings", path: l("orderSettings") },
      { name: "Manage Area", path: l("manageArea") },
      { name: "Manage Cities", path: l("manageCities") },
      { name: "Country List", path: l("countryList") },
      { name: "Assigned Distributors", path: l("assignedDistributors") },
      { name: "Unit Measurement", path: l("unitMeasurement") },
      { name: "View Orders", path: l("viewOrders") },
      { name: "Manage Product Stock", path: l("manageProductStock") },
      { name: "Order Route Map", path: l("orderRouteMap") },
      { name: "Sales Summary Report", path: l("salesSummaryReport") },
      { name: "Stock In/Out Report", path: l("stockInOutReport") },
      { name: "Sales Dump Report", path: l("salesDumpReport") },
      { name: "Available Product Stock", path: l("availableProductStockReport") },
      { name: "Manage Route", path: l("manageRoute") },
      { name: "Manage Employee Route", path: l("manageEmployeeRoute") },
      { name: "Orders Job Location", path: l("ordersJobLocation") },
      { name: "Product Category", path: l("productCategory") },
      { name: "Product Sub Category", path: l("productSubCategory") },
      { name: "Manage Product", path: l("manageProduct") },
      { name: "Manage Product Variant", path: l("manageProductVariant") },
      { name: "Daily Sales Report", path: l("dailySalesReport") },
      { name: "Retailer Beat Plan", path: l("retailerBeatPlan") },
      { name: "Manage Retailer", path: l("manageRetailer") },
      { name: "Manage Distributor", path: l("manageDistributor") },
      { name: "Manage Super Distributor", path: l("manageSuperDistributor") },
      { name: "Customer Categories", path: l("customerCategories") },
      { name: "Customer Sub Category", path: l("customerSubCategory") },
    ],
  },
  {
    name: "Expense Management",
    icon: Calculator,
    subItems: [
      { name: "Expense Categories", path: l("expenseCategories") },
      { name: "Sub Categories", path: l("expenseSubCategories") },
      { name: "Assign Limits", path: l("assignVisitExpense") },
      { name: "Expense Settings", path: l("expenseSettings") },
      { name: "Manage Assign Template", path: l("manageExpenseTemplate") },
      { name: "Add Expense", path: l("addExpense") },
      { name: "Pending Expense", path: l("pendingExpense") },
      { name: "Unpaid Expense", path: l("unpaidExpense") },
      { name: "Paid Expense", path: l("paidExpense") },
      { name: "Rejected Expense", path: l("rejectedExpense") },
      { name: "Generate Voucher", path: l("generateVoucher") },
      { name: "Group Wise Expense", path: l("groupWiseExpense") },
      { name: "Day Wise Expense", path: l("dayWiseExpense") },
      { name: "Manage Advance", path: l("manageExpenseAdvance") },
      { name: "Advance Expense Request", path: l("advanceExpenseRequest") },
      { name: "Paid History Report", path: l("paidExpenseHistoryReport") },
      { name: "Employee Expense Report", path: l("employeeExpenseReport") },
      { name: "Unpaid Expense Report", path: l("unpaidExpenseReport") },
      { name: "Approved Expense Report", path: l("approvedExpenseReport") },
      { name: "Advance Expense Report", path: l("advanceExpenseReport") },
    ],
  },
  {
    name: "Advance Payments",
    icon: Banknote,
    subItems: [
      { name: "Advance Salary", path: l("advanceSalary") },
      { name: "Bulk Advance Salary", path: l("bulkAdvanceSalary") },
      { name: "Carry Forward", path: l("advanceCarryForward") },
      { name: "Salary Requests", path: l("advanceSalaryRequests") },
      { name: "Salary Report", path: l("advanceSalaryReport") },
    ],
  },
  {
    name: "Task Sheet",
    icon: ClipboardList,
    subItems: [
      { name: "Task Dashboard", path: l("taskDashboard") },
      { name: "Task Category", path: l("taskCategory") },
      { name: "Task Priority", path: l("taskPriority") },
      { name: "My Task Category", path: l("myTaskCategory") },
      { name: "Task Category Assign", path: l("taskCategoryAssign") },
      { name: "Manage Main Task Sheet", path: l("manageMainTaskSheet") },
      { name: "Manage Task Sheet", path: l("manageTaskSheet") },
      { name: "Task Report", path: l("taskReport") },
      { name: "Task Sheet Report", path: l("taskSheetReport") },
      { name: "Project Wise Report", path: l("projectWiseTaskSheetReport") },
      { name: "Employee Task Report", path: l("employeeTaskSheetReport") },
      { name: "Task Setting", path: l("taskSetting") },
    ],
  },
  {
    name: "Quotation",
    icon: FileText,
    subItems: [
      { name: "Quotation Templates", path: l("quotationTemplates") },
      { name: "Quotation Labels", path: l("quotationLabels") },
      { name: "Quotation Columns", path: l("quotationTableColumn") },
      { name: "Manage Quotation", path: l("manageQuotation") },
      { name: "Generate Quotation", path: l("quotationGenerate") },
    ],
  },
  {
    name: "LMS",
    icon: BookOpen,
    subItems: [
      { name: "Courses", path: l("lmsCourses") },
      { name: "Courses View Report", path: l("lmsCoursesView") },
      { name: "Manage Assign LMS", path: l("lmsAssignChange") },
    ],
  },
  {
    name: "Logs",
    icon: Shield,
    subItems: [
      { name: "Activity Logs", path: l("activityLog") },
      { name: "Employee Logs", path: l("employeeLog") },
      { name: "Session Logs", path: l("sessionLog") },
    ],
  },
  {
    name: "Balance Sheet",
    icon: Landmark,
    subItems: [
      { name: "Add Balance Entry", path: l("balanceSheetAdd") },
      { name: "Balance Sheet Type", path: l("balanceSheetType") },
      { name: "Manage Balance Sheet", path: l("balanceSheetManage") },
      { name: "WFH Balance Sheet", path: l("balanceSheetWFH") },
      { name: "Financial Report", path: l("balanceSheetReport") },
    ],
  },
  {
    name: "Employee Engagement",
    icon: Gift,
    subItems: [
      { name: "Upcoming Events", path: l("engagementEvents") },
      { name: "Advanced Tracker", path: l("advancedEngagement") },
      { name: "Wishes Templates", path: l("celebrationTemplates") },
    ],
  },
  {
    name: "Face X App",
    icon: ScanFace,
    subItems: [
      { name: "Face App Admin", path: l("facex_admin") },
      { name: "Face App Device", path: l("facex_device") },
      { name: "User Face Data", path: l("facex_data") },
      { name: "Face Change Requests", path: l("facex_request") },
    ],
  },
  {
    name: "Events Management",
    icon: CalendarDays,
    subItems: [
      { name: "Add Event", path: l("addEvent") },
      { name: "View Events", path: l("viewEvents") },
      { name: "Events Report", path: l("eventsReport") },
    ],
  },
  {
    name: "Penalty Management",
    icon: AlertCircle,
    subItems: [
      { name: "Penalty Rules", path: l("penaltyRules") },
      { name: "Penalty To Leave", path: l("penaltyToLeave") },
      { name: "Manage Penalties", path: l("managePenalties") },
      { name: "Pending Penalties", path: l("pendingPenalties") },
      { name: "Penalties Report", path: l("penaltiesReport") },
    ],
  },
  {
    name: "Company Gallery",
    icon: Camera,
    subItems: [
      { name: "Add Gallery", path: l("addGallery") },
      { name: "Manage Gallery", path: l("manageGallery") },
    ],
  },
  {
    name: "Assets Setup",
    icon: Monitor,
    subItems: [
      { name: "Asset Dashboard", path: l("assetDashboard") },
      { name: "Asset Category", path: l("assetCategory") },
      { name: "Manage Assets", path: l("manageAssets") },
      { name: "Asset Bulk Upload", path: l("assetBulkUpload") },
      { name: "Asset History", path: l("assetHistory") },
      { name: "Asset Maintenance", path: l("assetUpcomingMaint") },
      { name: "Asset Reports", path: l("assetReports") },
      { name: "Asset Scrap", path: l("assetScrap") },
      { name: "Asset Settings", path: l("assetSettings") },
    ],
  },
  {
    name: "Settings Module",
    icon: Settings,
    subItems: [
      { name: "App Settings", path: l("appSettings") },
      { name: "Admin View Access", path: l("adminViewAccess") },
      { name: "Check Admin Access", path: l("checkAdminAccess") },
    ],
  },
  {
    name: "App Banner",
    icon: LucideImage,
    path: l("appBanner"),
  },
  {
    name: "Survey",
    icon: Search,
    subItems: [
      { name: "Add Survey", path: l("addSurvey") },
      { name: "Manage Survey", path: l("manageSurvey") },
    ],
  },
  {
    name: "Poll",
    icon: MessageSquare,
    subItems: [
      { name: "Add Poll", path: l("addPoll") },
      { name: "Poll Summary", path: l("pollSummary") },
    ],
  },
  {
    name: "Lost And Found",
    icon: ShieldCheck,
    subItems: [
      { name: "Report Lost Item", path: l("reportLostItem") },
      { name: "Report Found Item", path: l("reportFoundItem") },
      { name: "Manage Lost And Found", path: l("manageLostAndFound") },
      { name: "Claim Verification", path: l("claimVerification") },
      { name: "Lost And Found Report", path: l("lostAndFoundReport") },
    ],
  },
];