import React, { useEffect, useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Search, 
  Settings, 
  Save, 
  UserCircle2, 
  ArrowRight,
  ClipboardCheck,
  CalendarCheck,
  MapPin,
  FileSpreadsheet,
  Wallet,
  Briefcase,
  AlertCircle
} from "lucide-react";
import "./CheckAdminAccess.css";
import { adminSettingsAPI, employeeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const CheckAdminAccess = () => {
  const [selectedModule, setSelectedModule] = useState("Attendance");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [scopeLevel, setScopeLevel] = useState("Individual-wise");
  const [activeStep, setActiveStep] = useState(1);

  // Permission defaults are loaded from the live admin settings profile.
  const [permissions, setPermissions] = useState({
    "Attendance": [
      { id: "past_date_request", label: "Past Date Request", value: true },
      { id: "punch_out_missing", label: "Punch Out Missing", value: false },
      { id: "out_of_range_request", label: "Out of Range Request", value: true },
      { id: "absent_present_approval", label: "Absent/Present Approval", value: true },
      { id: "wfh_approval", label: "WFH Approval", value: false },
      { id: "monthly_attendance", label: "Monthly Attendance", value: true },
      { id: "shift_change_requests", label: "Shift Change Requests", value: true },
      { id: "punch_notifications", label: "Punch Notifications", value: false },
      { id: "break_request", label: "Break Request", value: true },
      { id: "week_off_exchange", label: "Week Off Exchange", value: false },
      { id: "overtime_request", label: "Overtime Request", value: true },
      { id: "attendance_modification", label: "Attendance Modification", value: true },
    ],
    "Leaves": [
      { id: "pending_leaves", label: "Pending Leaves", value: true },
      { id: "short_leave_request", label: "Short Leave Request", value: true },
      { id: "auto_leaves", label: "Auto Leaves", value: false },
      { id: "view_short_leaves", label: "View Short Leaves", value: true },
      { id: "sandwich_leaves", label: "Sandwich Leaves", value: false },
    ],
    "Work Report": [
      { id: "work_report", label: "Work Report", value: true },
      { id: "review_work_report", label: "Review Work Report", value: true },
      { id: "work_report_summary", label: "Work Report Summary", value: false },
    ],
    "Tracking": [
      { id: "track_employee", label: "Track Employee", value: true },
      { id: "out_of_range_alerts", label: "Out of Range Alerts", value: true },
      { id: "gps_internet_summary", label: "GPS/Internet Summary", value: true },
      { id: "tracking_settings", label: "Tracking Settings", value: false },
      { id: "live_map_view", label: "Live Map View", value: true },
      { id: "travel_summary", label: "Travel Summary", value: true },
    ],
    "Expenses": [
      { id: "pending_expenses", label: "Pending Expenses", value: true },
      { id: "advance_expense_request", label: "Advance Expense Request", value: true },
      { id: "paid_unpaid_expenses", label: "Paid / Unpaid Expenses", value: true },
    ],
    "Employees": [
      { id: "approve_employee", label: "Approve Employee", value: true },
      { id: "onboarding", label: "Onboarding", value: true },
      { id: "offboarding", label: "Offboarding", value: true },
    ],
    "Profile Update": [
      { id: "device_change", label: "Device Change", value: true },
      { id: "personal_info", label: "Personal Info", value: true },
      { id: "face_change_request", label: "Face Change Request", value: true },
      { id: "contact_info", label: "Contact Info", value: true },
      { id: "experience_edu", label: "Experience / Education / Achievements", value: true },
    ],
    "Visit": [
      { id: "add_visit_other", label: "Add Visit for Other Employee", value: true },
      { id: "pending_visit_approval", label: "Pending Visit Approval", value: true },
      { id: "end_visit_approval", label: "End Visit Approval", value: true },
      { id: "view_employee_visits", label: "View Employee Visits", value: true },
    ],
    "Advance Salary & Loan": [
      { id: "advance_salary_request", label: "Advance Salary Request", value: true },
      { id: "loan_request", label: "Loan Request", value: true },
    ],
    "Idea & Escalation": [
      { id: "escalation", label: "Escalation", value: true },
      { id: "idea_approval", label: "Idea Approval", value: true },
    ],
    "Task": [
      { id: "assign_task", label: "Assign Task", value: true },
    ]
  });

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const [permissionRes, employeeRes] = await Promise.all([
          adminSettingsAPI.getPermissionConfig(),
          employeeAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const employeeRows = Array.isArray(employeeRes?.data)
          ? employeeRes.data
          : Array.isArray(employeeRes?.data?.data)
          ? employeeRes.data.data
          : [];

        setEmployees(employeeRows.filter((emp: any) => emp?.status !== "Inactive"));

        const res = permissionRes;
        if (res?.data && typeof res.data === "object") {
          setPermissions(res.data as any);
        }
      } catch {
        toast.info("Using default permission template");
      }
    };

    loadPermissions();
  }, []);

  const filteredEmployees = employees.filter((emp: any) => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return true;
    const name = `${emp?.firstName || ""} ${emp?.lastName || ""}`.toLowerCase();
    const empCode = String(emp?.employeeId || "").toLowerCase();
    return name.includes(q) || empCode.includes(q);
  });

  const toggleCheck = (moduleKey: string, id: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [moduleKey]: prev[moduleKey].map((p: any) => 
        p.id === id ? { ...p, value: !p.value } : p
      )
    }));
  };

  const moduleIcons: any = {
    "Attendance": <CalendarCheck size={20} />,
    "Leaves": <ArrowRight size={20} />,
    "Work Report": <ClipboardCheck size={20} />,
    "Tracking": <MapPin size={20} />,
    "Expenses": <Wallet size={20} />,
    "Employees": <Users size={20} />,
    "Profile Update": <UserCircle2 size={20} />,
    "Visit": <Settings size={20} />,
    "Advance Salary & Loan": <Wallet size={20} />,
    "Idea & Escalation": <AlertCircle size={20} />,
    "Task": <FileSpreadsheet size={20} />,
  };

  const savePermissions = async () => {
    try {
      await adminSettingsAPI.savePermissionConfig(permissions);
      toast.success("Permission matrix saved");
    } catch {
      toast.error("Failed to save permission matrix");
    }
  };

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <div className="header-title-box">
          <h1 className="page-title"><Settings size={22} /> Granular Admin Permission Control</h1>
          <p>Detailed level access control by module, submodule, and individual</p>
        </div>
        <button className="primary-save-btn" onClick={savePermissions}>
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="perm-stepper-row mt-4">
        {/* Step 1: Select Module & Submodule */}
        <div className="perm-card step-card">
          <div className="card-header">
             <div className="step-badge">1</div>
             <h3>Module & Submodule Selection</h3>
          </div>
          <div className="card-body">
            <div className="form-group mb-4">
              <label>Select Parent Module</label>
              <div className="module-pill-grid">
                {Object.keys(permissions).map((module) => (
                  <button 
                    key={module}
                    className={`module-pill ${selectedModule === module ? "active" : ""}`}
                    onClick={() => setSelectedModule(module)}
                  >
                    {moduleIcons[module] || <ArrowRight size={18} />}
                    <span>{module}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Scope & Employee */}
        <div className="perm-card step-card">
          <div className="card-header">
             <div className="step-badge">2</div>
             <h3>Scope & Employee selection</h3>
          </div>
          <div className="card-body">
             <div className="form-group">
                <label>Access Control Level</label>
                <div className="radio-group-modern">
                  {["Branch-wise", "Department-wise", "Individual-wise"].map(level => (
                    <label key={level} className="modern-radio">
                      <input type="radio" name="level" checked={scopeLevel === level} onChange={() => setScopeLevel(level)} />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
             </div>
             <div className="form-group mt-4">
                <label>Select Target Employee / Subject</label>
                <div className="search-input-premium">
                  <Search size={16} />
                  <input type="text" placeholder="Search employee..." value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
                </div>
                <select
                  className="select-modern"
                  style={{ marginTop: "10px" }}
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {filteredEmployees.map((emp: any) => (
                    <option key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId || emp.id})
                    </option>
                  ))}
                </select>
             </div>
             <div className="form-group mt-4">
                <label>Assigned Rights</label>
                <div className="checkbox-row">
                   <label className="checkbox-modern"><input type="checkbox" defaultChecked /> View</label>
                   <label className="checkbox-modern"><input type="checkbox" /> Edit</label>
                   <label className="checkbox-modern"><input type="checkbox" /> Approval</label>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Permissions Grid Section */}
      <div className="premium-card mt-4">
         <div className="card-header-with-actions">
           <div className="flex-col">
             <h2>Granular Permissions: {selectedModule}</h2>
             <p>Toggle specific feature-level administrative rights</p>
           </div>
           <div className="bulk-actions">
             <button className="btn-text">Select All</button>
             <button className="btn-text">Deselect All</button>
           </div>
         </div>
         <div className="card-body mt-4">
           <div className="granular-perm-grid">
             {(permissions as any)[selectedModule].map((perm: any) => (
               <div key={perm.id} className="perm-checkbox-card">
                  <div className="perm-info">
                    <span className="perm-label">{perm.label}</span>
                  </div>
                  <label className="premium-compact-switch">
                    <input 
                      type="checkbox" 
                      checked={perm.value} 
                      onChange={() => toggleCheck(selectedModule, perm.id)} 
                    />
                    <span className="compact-slider"></span>
                  </label>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default CheckAdminAccess;
