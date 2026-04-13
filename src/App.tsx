import { useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PageLoader from "./components/PageLoader";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
const Dashboard = lazy(() => import("./pages/dashboard/dashboard"));
import Login from "./pages/auth/login";
import CompanySetup from "./pages/company_settings/company-setup";
const Branches = lazy(() => import("./pages/company_settings/branches"));
const Departments = lazy(() => import("./pages/company_settings/departments"));
const Zones = lazy(() => import("./pages/company_settings/zones"));
const SubDepartments = lazy(() => import("./pages/company_settings/sub-departments"));
const Designations = lazy(() => import("./pages/company_settings/designations"));
import SisterCompanies from "./pages/company_settings/sister-companies";
import EmployeeLevels from "./pages/company_settings/employee-levels";
import EmployeeGrades from "./pages/company_settings/employee-grades";
import AdminRights from "./pages/company_settings/admin-rights";
import AssignEmployeeGrade from "./pages/company_settings/assign-employee-grade";
import EmployeeParking from "./pages/company_settings/employee-parking";
import EmergencyNumbers from "./pages/company_settings/emergency-numbers";
const AdminMenuReordering = lazy(() => import("./pages/company_settings/admin-menu-reordering"));
import WhatsAppAlerts from "./pages/company_settings/whatsapp-alerts";
import IDCardTemplates from "./pages/company_settings/id-card-templates";
import DailyAttendanceEmail from "./pages/company_settings/daily-attendance-email";
import { useAuthStore } from "./store/useAuthStore";

import AttendanceDashboard from "./pages/attendance/attendance-dashboard";
import ViewAttendance from "./pages/attendance/view-attendance";
import AddAttendance from "./pages/attendance/add-attendance";
import MonthWiseAttendance from "./pages/attendance/month-wise-attendance";
import WeeklyAttendance from "./pages/attendance/weekly-attendance";
import PendingAttendance from "./pages/attendance/pending-attendance";
import PunchOutMissingRequest from "./pages/attendance/punch-out-missing-request";
import PunchOutMissingApproval from "./pages/attendance/punch-out-missing-approval";
import PreviousDateAttendance from "./pages/attendance/previous-date-attendance";
import UpdateAttendance from "./pages/attendance/update-attendance";
import UpdateBreak from "./pages/attendance/update-break";
import WeekOffExchangeRequest from "./pages/attendance/week-off-exchange-request";
import WeekOffApproval from "./pages/attendance/week-off-approval";
import AbsentEmployees from "./pages/attendance/absent-employees";
import AddBulkAttendance from "./pages/attendance/bulk-attendance";
import PendingBreak from "./pages/attendance/pending-break";
import BreakApproval from "./pages/attendance/break-approval";
import OvertimeRequest from "./pages/attendance/overtime-request";
import OvertimeApproval from "./pages/attendance/overtime-approval";
import DeleteAttendance from "./pages/attendance/delete-attendance";
import AttendanceModification from "./pages/attendance/attendance-modification";
import RecalculateAttendance from "./pages/attendance/recalculate-attendance";
import PendingFlags from "./pages/attendance/pending-flags";

import TrackingDashboard from "./pages/employee_tracking/tracking-dashboard";
import EmployeeLiveTracking from "./pages/employee_tracking/employee-live-tracking";
import TrackingHistory from "./pages/employee_tracking/tracking-history";
import GeofenceSettings from "./pages/employee_tracking/geofence-settings";
import ExceptionManagement from "./pages/employee_tracking/exception-management";
import TrackingReports from "./pages/employee_tracking/tracking-reports";
import TrackingEmployeeWise from "./pages/employee_tracking/tracking-employee-wise";
import DailyWorkReport from "./pages/employee_tracking/daily-work-report.tsx";
import DailyWorkReportDetail from "./pages/employee_tracking/daily-work-report-detail.tsx";

import VisitDashboard from "./pages/visit_management/visit-dashboard";
import VisitPlanning from "./pages/visit_management/visit-planning";
import VisitCheckInOut from "./pages/visit_management/visit-check-in-out";
import VisitApprovals from "./pages/visit_management/visit-approvals";
import VisitSettings from "./pages/visit_management/visit-settings";

// New Phase 7 Sub-modules
import VisitStatus from "./pages/visit/visit-status";
import ManagerApproval from "./pages/visit/manager-approval";
import VisitReports from "./pages/visit/visit-reports";

import AccountSettings from "./pages/account_settings/account-settings";
import GlobalSpinner from "./components/GlobalSpinner";

import PayrollTaxSettings from "./pages/payroll/payroll-tax-settings";
import EarningDeductionTypes from "./pages/payroll/earning-deduction-types";
import SalaryGroups from "./pages/payroll/salary-groups";
import SalaryGroupForm from "./pages/payroll/salary-group-form";
import IncentiveTypes from "./pages/payroll/incentive-types";
import GratuitySettings from "./pages/payroll/gratuity-settings";
import EmployeeCTC from "./pages/payroll/employee-ctc";
import CreateSalary from "./pages/payroll/create-salary";
import BulkCreateSalary from "./pages/payroll/bulk-create-salary";
import GeneratedSalary from "./pages/payroll/generated-salary";
import PublishedSalary from "./pages/payroll/published-salary";
import OtherEarningsDeductions from "./pages/payroll/other-earnings-deductions";
import EmployeeIncentives from "./pages/payroll/employee-incentives";
import FFSettlement from "./pages/payroll/ff-settlement";
import EmployeeBankDetails from "./pages/payroll/employee-bank-details";
import ChangeSalaryGroup from "./pages/payroll/change-salary-group";
import SalaryHoldRequests from "./pages/payroll/salary-hold-requests";
import PayrollReports from "./pages/payroll/payroll-reports";

// Tax Exemption Module
import TaxRegimeSetting from "./pages/tax-exemption/tax-regime-setting";
import TdsRulesSetting from "./pages/tax-exemption/tds-rules-setting";
import TaxBenefitCategory from "./pages/tax-exemption/tax-benefit-category";
import TaxBenefitSubCategory from "./pages/tax-exemption/tax-benefit-sub-category";
import TaxSlabs from "./pages/tax-exemption/tax-slabs";
import GenerateForm16 from "./pages/tax-exemption/generate-form16";
import ManageTaxDocuments from "./pages/tax-exemption/manage-tax-documents";
import PendingTaxDocuments from "./pages/tax-exemption/pending-tax-documents";
import OtherIncomeLoss from "./pages/tax-exemption/other-income-loss";
import GenerateChallan from "./pages/tax-exemption/generate-challan";
import RejectedTaxDocuments from "./pages/tax-exemption/rejected-tax-documents";
import TDSPaidSummary from "./pages/tax-exemption/tds-paid-summary";
import PreviousEmployer from "./pages/tax-exemption/previous-employer";
import ReportSection from "./pages/tax-exemption/report-section";

// Work Allocation System
import WorkCategory from "./pages/work_allocation/work-category";
import WorkAllocationAccess from "./pages/work_allocation/work-allocation-access";
import ViewWorkAllocation from "./pages/work_allocation/view-work-allocation";
import WorkAllocationReport from "./pages/work_allocation/work-allocation-report";

// Site Management System
import ManageSite from "./pages/site_management/manage-site";
import SiteEmployees from "./pages/site_management/site-employees";
import SiteWiseAttendance from "./pages/site_management/site-wise-attendance";
import ViewSiteAttendance from "./pages/site_management/view-site-attendance";
import SiteWiseReport from "./pages/site_management/site-wise-report";
import SiteAttendanceSummary from "./pages/site_management/site-attendance-summary";
import SiteAttendanceCounts from "./pages/site_management/site-attendance-counts";
import ManageSitePurchase from "./pages/site_management/manage-site-purchase";
import SiteAttendanceReport from "./pages/site_management/site-attendance-report";

// PMS – Performance Matrix
import ManagePMSAssign from "./pages/pms/manage-pms-assign";
import DimensionName from "./pages/pms/dimension-name";
import DimensionSubGroup from "./pages/pms/dimension-sub-group";
import ScoreBandMaster from "./pages/pms/score-band-master";
import PMSPerformanceReport from "./pages/pms/pms-performance-report";
import PerformanceSummary from "./pages/pms/performance-summary";

// Employee Vehicles
import VehicleCategory from "./pages/vehicles/vehicle-category";
import AddVehicle from "./pages/vehicles/add-vehicle";
import VehiclesReport from "./pages/vehicles/vehicles-report";
import VehicleQR from "./pages/vehicles/vehicle-qr";

// Idea Box Module
import IdeaCategory from "./pages/idea-box/idea-category";
import ManageIdeas from "./pages/idea-box/manage-ideas";
import ApproveIdeas from "./pages/idea-box/approve-ideas";
import IdeaLeaderboard from "./pages/idea-box/idea-leaderboard";

// SOS Management Module
import AddSos from "./pages/sos/add-sos";
import ManageSos from "./pages/sos/manage-sos";
import SosReports from "./pages/sos/sos-reports";

// Holiday Management Module
import AddHoliday from "./pages/holidays/add-holiday";
import ManageHolidays from "./pages/holidays/manage-holidays";
import HolidayGroups from "./pages/holidays/holiday-groups";
import AssignGroups from "./pages/holidays/assign-groups";
import ManageOptionalHolidays from "./pages/holidays/manage-optional";
import OptionalRequests from "./pages/holidays/optional-requests";

// Mobile Device Bind Module
import DeviceSettings from "./pages/mobile-device/device-settings";
import DeviceRequests from "./pages/mobile-device/device-requests";

// Timeline Sub-modules
import Timeline from "./pages/timeline/timeline";
import CreatePost from "./pages/timeline/create-post";
import AutoCelebration from "./pages/timeline/auto-celebration";
import TemplateManagement from "./pages/timeline/template-management";
import SocialInteractions from "./pages/timeline/social-interactions";
import TaggingMentions from "./pages/timeline/tagging-mentions";
import ManageTimeline from "./pages/timeline/manage-timeline";
import TimelineReports from "./pages/timeline/timeline-reports";
import TimelineSettings from "./pages/timeline/timeline-settings";

// Chat Group Module
import ManageGroups from "./pages/chat_group/manage-groups";
import ChatMembers from "./pages/chat_group/chat-members";

// Vendor Management Module
import VendorCategory from "./pages/vendor/Category";
import VendorSubCategory from "./pages/vendor/SubCategory";
import AddVendor from "./pages/vendor/AddVendor";
import ManageVendors from "./pages/vendor/ManageVendors";
import VendorReport from "./pages/vendor/VendorReport";

// BGV Module
import BGVManagement from "./pages/bgv/BGVManagement";
import VerificationTypes from "./pages/bgv/VerificationTypes";
import BGVReports from "./pages/bgv/BGVReports";

// Visitors
import VisitorsInOut from "./pages/visitors/VisitorsInOut";
import VisitorSubType from "./pages/visitors/VisitorSubType";
import VisitorSettings from "./pages/visitors/VisitorSettings";
import VisitorReports from "./pages/visitors/VisitorReports";
import FrequentVisitors from "./pages/visitors/FrequentVisitors";

// Complaints
import ManageComplaints from "./pages/complaints/ManageComplaints";
import ComplaintCategory from "./pages/complaints/ComplaintCategory";

// Discussion Forum Module
import ManageDiscussions from './pages/discussions/ManageDiscussions';
import ComplaintEmailConfig from "./pages/complaints/ComplaintEmailConfig";

// Escalations Module
import ManageEscalations from "./pages/escalations/ManageEscalations";

// Meeting Module
import ScheduleMeeting from "./pages/meetings/ScheduleMeeting";
import ManageMeetings from "./pages/meetings/ManageMeetings";
import MeetingParticipants from "./pages/meetings/MeetingParticipants";
import MeetingDetails from "./pages/meetings/MeetingDetails";
import MeetingAttendance from "./pages/meetings/MeetingAttendance";
import MeetingMOM from "./pages/meetings/MeetingMOM";
import ActionItems from "./pages/meetings/ActionItems";
import MeetingNotifications from "./pages/meetings/MeetingNotifications";
import MeetingReports from "./pages/meetings/MeetingReports";
import MeetingSettings from "./pages/meetings/MeetingSettings";
import MeetingRecordings from "./pages/meetings/MeetingRecordings";
import ModulePage from "./pages/modules/ModulePage";
import FinanceDashboardPage from "./pages/FinanceDashboard/financeDashboard";
import PayrollDashboardPage from "./pages/dashboard/payrollDashboard";
import ViewSalarySlipPage from "./pages/payroll/view-slip";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();
  const isPublicSlipRoute = location.pathname.startsWith("/view-slip/");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isPublicSlipRoute) {
    return (
      <Routes>
        <Route path="/view-slip/:id" element={<ViewSalarySlipPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <GlobalSpinner />
        <Login />
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="main-area">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="content-area" style={{ overflow: 'auto', flex: 1 }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
              {/* Idea Box Module */}
              <Route path="/idea-box/category" element={<IdeaCategory />} />
              <Route path="/idea-box/manage" element={<ManageIdeas />} />
              <Route path="/idea-box/approve" element={<ApproveIdeas />} />
              <Route path="/idea-box/leaderboard" element={<IdeaLeaderboard />} />
              
              {/* Timeline Module - 8 Sub-Modules */}
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/timeline/create" element={<CreatePost />} />
              <Route path="/timeline/auto-celebration" element={<AutoCelebration />} />
              <Route path="/timeline/template-management" element={<TemplateManagement />} />
              <Route path="/timeline/social-interactions" element={<SocialInteractions />} />
              <Route path="/timeline/tagging-mentions" element={<TaggingMentions />} />
              <Route path="/timeline/manage-timeline" element={<ManageTimeline />} />
              <Route path="/timeline/reports" element={<TimelineReports />} />
              <Route path="/timeline/settings" element={<TimelineSettings />} />

              {/* SOS Management Module */}
              <Route path="/sos/add" element={<AddSos />} />
              <Route path="/sos/manage" element={<ManageSos />} />
              <Route path="/sos/reports" element={<SosReports />} />

              {/* Holiday Management */}
              <Route path="/holiday/add" element={<AddHoliday />} />
              <Route path="/holiday/manage" element={<ManageHolidays />} />
              <Route path="/holiday/group" element={<HolidayGroups />} />
              <Route path="/holiday/assign" element={<AssignGroups />} />
              <Route path="/holiday/optional-manage" element={<ManageOptionalHolidays />} />
              <Route path="/holiday/optional-request" element={<OptionalRequests />} />

              <Route path="/company-setup" element={<CompanySetup />} />
              <Route path="/company-settings/branches" element={<Branches />} />
              <Route path="/sister-companies" element={<SisterCompanies />} />
              <Route path="/employee-levels" element={<EmployeeLevels />} />
              <Route path="/employee-grades" element={<EmployeeGrades />} />
              <Route path="/admin-rights" element={<AdminRights />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/sub-departments" element={<SubDepartments />} />
              <Route path="/designations" element={<Designations />} />
              <Route path="/assign-employee-grade" element={<AssignEmployeeGrade />} />
              <Route path="/employee-parking" element={<EmployeeParking />} />
              <Route path="/emergency-numbers" element={<EmergencyNumbers />} />
              <Route path="/admin-menu-reordering" element={<AdminMenuReordering />} />
              <Route path="/whatsapp-alerts" element={<WhatsAppAlerts />} />
              <Route path="/id-card-templates" element={<IDCardTemplates />} />
              <Route path="/daily-attendance-email" element={<DailyAttendanceEmail />} />

              <Route path="/attendance-dashboard" element={<AttendanceDashboard />} />
              <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
              <Route path="/view-attendance" element={<ViewAttendance />} />
              <Route path="/add-attendance" element={<AddAttendance />} />
              <Route path="/month-wise-attendance" element={<MonthWiseAttendance />} />
              <Route path="/weekly-attendance" element={<WeeklyAttendance />} />
              <Route path="/pending-attendance" element={<PendingAttendance />} />
              <Route path="/attendance/pending-attendance" element={<PendingAttendance />} />
              <Route path="/punch-out-missing-request" element={<PunchOutMissingRequest />} />
              <Route path="/punch-out-missing-approval" element={<PunchOutMissingApproval />} />
              <Route path="/previous-date-attendance" element={<PreviousDateAttendance />} />
              <Route path="/update-attendance" element={<UpdateAttendance />} />
              <Route path="/update-break" element={<UpdateBreak />} />
              <Route path="/week-off-exchange" element={<WeekOffExchangeRequest />} />
              <Route path="/week-off-approval" element={<WeekOffApproval />} />
              <Route path="/absent-employees" element={<AbsentEmployees />} />
              <Route path="/add-bulk-attendance" element={<AddBulkAttendance />} />
              <Route path="/pending-break" element={<PendingBreak />} />
              <Route path="/break-approval" element={<BreakApproval />} />
              <Route path="/overtime-request" element={<OvertimeRequest />} />
              <Route path="/overtime-approval" element={<OvertimeApproval />} />
              <Route path="/delete-attendance" element={<DeleteAttendance />} />
              <Route path="/attendance-modification" element={<AttendanceModification />} />
              <Route path="/recalculate-attendance" element={<RecalculateAttendance />} />
              <Route path="/pending-flags" element={<PendingFlags />} />

              <Route path="/tracking-dashboard" element={<TrackingDashboard />} />
              <Route path="/employee-live-tracking" element={<EmployeeLiveTracking />} />
              <Route path="/tracking-history" element={<TrackingHistory />} />
              <Route path="/geofence-settings" element={<GeofenceSettings />} />
              <Route path="/exception-management" element={<ExceptionManagement />} />
              <Route path="/tracking-reports" element={<TrackingReports />} />
              <Route path="/tracking-employee-wise" element={<TrackingEmployeeWise />} />
              <Route path="/daily-work-report" element={<DailyWorkReport />} />
              <Route path="/daily-work-report/:id" element={<DailyWorkReportDetail />} />

              <Route path="/visit-dashboard" element={<VisitDashboard />} />
              <Route path="/visit-planning" element={<VisitPlanning />} />
              <Route path="/visit-check-in-out" element={<VisitCheckInOut />} />
              <Route path="/visit-approvals" element={<VisitApprovals />} />
              <Route path="/visit-settings" element={<VisitSettings />} />
              
              <Route path="/visit-status" element={<VisitStatus />} />
              <Route path="/manager-approval-visit" element={<ManagerApproval />} />
              <Route path="/visit-reports" element={<VisitReports />} />

              <Route path="/account-settings" element={<AccountSettings />} />

              <Route path="/payroll-tax-settings" element={<PayrollTaxSettings />} />
              <Route path="/earning-deduction-types" element={<EarningDeductionTypes />} />
              <Route path="/salary-groups" element={<SalaryGroups />} />
              <Route path="/salary-group-form" element={<SalaryGroupForm />} />
              <Route path="/salary-group-form/:id" element={<SalaryGroupForm />} />
              <Route path="/incentive-types" element={<IncentiveTypes />} />
              <Route path="/gratuity-settings" element={<GratuitySettings />} />
              <Route path="/employee-ctc" element={<EmployeeCTC />} />
              <Route path="/payroll/employee-ctc" element={<EmployeeCTC />} />
              <Route path="/create-salary" element={<CreateSalary />} />
              <Route path="/bulk-create-salary" element={<BulkCreateSalary />} />
              <Route path="/generated-salary" element={<GeneratedSalary />} />
              <Route path="/payroll/run" element={<GeneratedSalary />} />
              <Route path="/published-salary" element={<PublishedSalary />} />
              <Route path="/other-earnings" element={<OtherEarningsDeductions />} />
              <Route path="/employee-incentives" element={<EmployeeIncentives />} />
              <Route path="/ff-settlement" element={<FFSettlement />} />
              <Route path="/employee-bank-details" element={<EmployeeBankDetails />} />
              <Route path="/change-salary-group" element={<ChangeSalaryGroup />} />
              <Route path="/salary-hold-requests" element={<SalaryHoldRequests />} />
              <Route path="/payroll-reports" element={<PayrollReports />} />
              
              <Route path="/tax-exemption/tax-regime-setting" element={<TaxRegimeSetting />} />
              <Route path="/tax-exemption/tds-rules-setting" element={<TdsRulesSetting />} />
              <Route path="/tax-exemption/tax-benefit-category" element={<TaxBenefitCategory />} />
              <Route path="/tax-exemption/tax-benefit-sub-category" element={<TaxBenefitSubCategory />} />
              <Route path="/tax-exemption/tax-slabs" element={<TaxSlabs />} />
              <Route path="/tax-exemption/generate-form16" element={<GenerateForm16 />} />
              <Route path="/tax-exemption/manage-tax-documents" element={<ManageTaxDocuments />} />
              <Route path="/tax-exemption/pending-tax-documents" element={<PendingTaxDocuments />} />
              <Route path="/tax-exemption/other-income-loss" element={<OtherIncomeLoss />} />
              <Route path="/tax-exemption/generate-challan" element={<GenerateChallan />} />
              <Route path="/tax-exemption/rejected-tax-documents" element={<RejectedTaxDocuments />} />
              <Route path="/tax-exemption/tds-paid-summary" element={<TDSPaidSummary />} />
              <Route path="/tax-exemption/previous-employer" element={<PreviousEmployer />} />
              <Route path="/tax-exemption/report-section" element={<ReportSection />} />

              <Route path="/work-allocation/categories" element={<WorkCategory />} />
              <Route path="/work-allocation/access" element={<WorkAllocationAccess />} />
              <Route path="/work-allocation/view" element={<ViewWorkAllocation />} />
              <Route path="/work-allocation/report" element={<WorkAllocationReport />} />

              {/* Site Management System */}
              <Route path="/site_management/manage-site" element={<ManageSite />} />
              <Route path="/site_management/site-employees" element={<SiteEmployees />} />
              <Route path="/site_management/site-wise-attendance" element={<SiteWiseAttendance />} />
              <Route path="/site_management/view-site-attendance" element={<ViewSiteAttendance />} />
              <Route path="/site_management/site-wise-report" element={<SiteWiseReport />} />
              <Route path="/site_management/site-attendance-summary" element={<SiteAttendanceSummary />} />
              <Route path="/site_management/site-attendance-counts" element={<SiteAttendanceCounts />} />
              <Route path="/site_management/manage-site-purchase" element={<ManageSitePurchase />} />
              <Route path="/site_management/site-attendance-report" element={<SiteAttendanceReport />} />

              {/* PMS – Performance Matrix */}
              <Route path="/pms/manage-assign" element={<ManagePMSAssign />} />
              <Route path="/pms/dimension-name" element={<DimensionName />} />
              <Route path="/pms/dimension-sub-group" element={<DimensionSubGroup />} />
              <Route path="/pms/score-band-master" element={<ScoreBandMaster />} />
              <Route path="/pms/performance-report" element={<PMSPerformanceReport />} />
              <Route path="/pms/performance-summary" element={<PerformanceSummary />} />

              {/* Employee Vehicles */}
              <Route path="/vehicles/category" element={<VehicleCategory />} />
              <Route path="/vehicles/add" element={<AddVehicle />} />
              <Route path="/vehicles/report" element={<VehiclesReport />} />
              <Route path="/vehicles/qr" element={<VehicleQR />} />

              {/* Mobile Device Bind Module */}
              <Route path="/mobile-device/settings" element={<DeviceSettings />} />
              <Route path="/mobile-device/requests" element={<DeviceRequests />} />

              {/* Chat Group Module */}
              <Route path="/chat_group" element={<ManageGroups />} />
              <Route path="/chat_group/members" element={<ChatMembers />} />

              {/* Vendor Management Module */}
              <Route path="/vendor/category" element={<VendorCategory />} />
              <Route path="/vendor/sub-category" element={<VendorSubCategory />} />
              <Route path="/vendor/add" element={<AddVendor />} />
              <Route path="/vendor/edit/:id" element={<AddVendor />} />
              <Route path="/vendor/manage" element={<ManageVendors />} />
              <Route path="/vendor/reports" element={<VendorReport />} />

              {/* Background Verification (BGV) Module */}
              <Route path="/bgv/manage" element={<BGVManagement />} />
              <Route path="/bgv/types" element={<VerificationTypes />} />
              <Route path="/bgv/reports" element={<BGVReports />} />

              {/* Visitors Module */}
              <Route path="/visitors/manage" element={<VisitorsInOut />} />
              <Route path="/visitors/sub-types" element={<VisitorSubType />} />
              <Route path="/visitors/settings" element={<VisitorSettings />} />
              <Route path="/visitors/reports" element={<VisitorReports />} />
              <Route path="/visitors/frequent" element={<FrequentVisitors />} />

              {/* Complaints */}
              <Route path="/complaints/manage" element={<ManageComplaints />} />
              <Route path="/complaints/categories" element={<ComplaintCategory />} />

              {/* Discussion Forum Module */}
              <Route path="/discussions/manage" element={<ManageDiscussions />} />
              <Route path="/complaints/email-config" element={<ComplaintEmailConfig />} />

              {/* Escalations Module */}
              <Route path="/escalations/manage" element={<ManageEscalations />} />

              {/* Meeting Module */}
              <Route path="/meetings/schedule" element={<ScheduleMeeting />} />
              <Route path="/meetings/manage" element={<ManageMeetings />} />
              <Route path="/meetings/participants" element={<MeetingParticipants />} />
              <Route path="/meetings/attendance" element={<MeetingAttendance />} />
              <Route path="/meetings/mom" element={<MeetingMOM />} />
              <Route path="/meetings/action-items" element={<ActionItems />} />
              <Route path="/meetings/notifications" element={<MeetingNotifications />} />
              <Route path="/meetings/reports" element={<MeetingReports />} />
              <Route path="/meetings/settings" element={<MeetingSettings />} />
              <Route path="/meetings/recordings" element={<MeetingRecordings />} />
              <Route path="/meetings/details/:id" element={<MeetingDetails />} />

              <Route path="/finance-dashboard" element={<FinanceDashboardPage />} />
              <Route path="/payroll-dashboard" element={<PayrollDashboardPage />} />
              <Route path="/modules/:moduleKey" element={<ModulePage />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
