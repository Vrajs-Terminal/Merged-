import { useEffect, useState } from "react";
import { 
  Smartphone, 
  Layout, 
  ShieldCheck, 
  UserPlus, 
  Fingerprint, 
  Settings2, 
  UserCircle,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings
} from "lucide-react";
import "./AppSettings.css";
import { adminSettingsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const AppSettings = () => {
  const [activeTab, setActiveTab] = useState("feature_controls");

  // Default settings profile until the live app config loads.
  const [settings, setSettings] = useState({
    featureControls: {
      applyResignation: true,
      screenshotCaptureTimeline: false,
      membersChatAccess: true,
      groupChatInApp: true,
      createGroupInApp: false,
      registrationRequestFromApp: true,
      membersTimelineAccess: true,
      membersMyActivityAccess: true,
      bindDevice: true,
      dailyBirthdayNotification: true,
    },
    dashboardVisibility: {
      hideUpcomingCelebrations: false,
      hideBirthdays: false,
      hideWeddingAnniversary: false,
      hideWorkAnniversary: false,
      hideMyDepartment: false,
      hidePhotoGallery: false,
    },
    securitySettings: {
      profileRestriction: false,
      restrictDownloading: true,
      restrictScreenshot: true,
      showSisterCompanyName: true,
    },
    onboardingSettings: {
      dobMandatory: true,
      resignationDateMandatory: false,
      probationPeriodMandatory: true,
      emergencyContactMandatoryApp: true,
      employeeLevelMandatoryWeb: true,
      reportingPersonMandatory: true,
      sisterCompanyMandatory: false,
    },
    employeeIdSettings: {
      allocationMethod: "Branch Wise",
      useBranchCode: true,
      prefixValue: "UAA-EC",
      numberOfDigits: 3,
      example: "UAA-EC-BCODE-015"
    },
    systemSettings: {
      defaultPenaltyApproved: true,
      allowMultipleBrowserLogin: false,
      penaltyToLeaveConversion: true,
      autoLeaveDeleteReason: "System Auto Cleanup",
      maxAlternateShift: 2,
      enableExpenseGroup: true,
    },
    profileMenuAccess: [
      { id: "contact_detail", name: "Contact Detail", access: "Edit" },
      { id: "personal_info", name: "Personal Info", access: "Change Request" },
      { id: "employment_detail", name: "Employment Detail", access: "View Only" },
      { id: "past_experience", name: "Past Experience", access: "Edit" },
      { id: "achievements_education", name: "Achievements & Education", access: "Edit" },
      { id: "my_timeline", name: "My Timeline", access: "View Only" },
      { id: "shift_details", name: "Shift Details", access: "View Only" },
      { id: "attendance_face", name: "My Attendance Face", access: "Change Request" },
      { id: "notification_settings", name: "Notification Settings", access: "Edit" },
      { id: "nominees", name: "Nominees", access: "Edit" },
      { id: "hold_salary", name: "Hold Salary", access: "View Only" },
    ]
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await adminSettingsAPI.getAppConfig();
        if (res?.data && typeof res.data === "object") {
          setSettings(res.data as any);
        }
      } catch {
        toast.info("Using default app settings profile");
      }
    };

    loadConfig();
  }, []);

  const toggleSetting = (section: string, key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleInputChange = (section: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleProfileAccessChange = (id: string, access: string) => {
    setSettings((prev: any) => ({
      ...prev,
      profileMenuAccess: prev.profileMenuAccess.map((item: any) => 
        item.id === id ? { ...item, access } : item
      )
    }));
  };

  const saveSettings = async () => {
    try {
      await adminSettingsAPI.saveAppConfig(settings);
      toast.success("App settings saved");
    } catch {
      toast.error("Failed to save app settings");
    }
  };

  const renderSwitch = (section: string, key: string, label: string) => (
    <div className="setting-control-row">
      <span className="setting-label">{label}</span>
      <label className="premium-switch">
        <input 
          type="checkbox" 
          checked={(settings as any)[section][key]} 
          onChange={() => toggleSetting(section, key)} 
        />
        <span className="premium-slider"></span>
      </label>
    </div>
  );

  const tabs = [
    { id: "feature_controls", label: "App Features", icon: Smartphone },
    { id: "dashboard_visibility", label: "Dashboard", icon: Layout },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "onboarding", label: "Onboarding", icon: UserPlus },
    { id: "employee_id", label: "ID Generator", icon: Fingerprint },
    { id: "system", label: "System", icon: Settings2 },
    { id: "profile_access", label: "Profile Access", icon: UserCircle },
  ];

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <div className="header-title-box">
          <h1 className="page-title"><Settings size={22} /> App Access Settings</h1>
          <p>Configure mobile app features, restrictions, and system-wide behaviors</p>
        </div>
        <button className="primary-save-btn" onClick={saveSettings}>
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="settings-content-wrapper">
        <div className="settings-sidebar-nav">
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              className={`nav-tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </div>
          ))}
        </div>

        <div className="settings-main-panel">
          {activeTab === "feature_controls" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>App Feature Controls</h2>
                <p>Enable or disable specific features within the mobile application</p>
              </div>
              <div className="card-body">
                <div className="settings-grid">
                  {renderSwitch("featureControls", "applyResignation", "Apply Resignation")}
                  {renderSwitch("featureControls", "screenshotCaptureTimeline", "Timeline Screenshot (Android)")}
                  {renderSwitch("featureControls", "membersChatAccess", "Members Chat Access")}
                  {renderSwitch("featureControls", "groupChatInApp", "Group Chat in App")}
                  {renderSwitch("featureControls", "createGroupInApp", "Create Group in App")}
                  {renderSwitch("featureControls", "registrationRequestFromApp", "Registration Request")}
                  {renderSwitch("featureControls", "membersTimelineAccess", "Members Timeline Access")}
                  {renderSwitch("featureControls", "membersMyActivityAccess", "Members My Activity Access")}
                  {renderSwitch("featureControls", "bindDevice", "Bind Device (MAC)")}
                  {renderSwitch("featureControls", "dailyBirthdayNotification", "Birthday Notifications")}
                </div>
              </div>
            </div>
          )}

          {activeTab === "dashboard_visibility" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Dashboard Visibility</h2>
                <p>Control which sections are visible to administrators on the mobile dashboard</p>
              </div>
              <div className="card-body">
                <div className="settings-grid">
                  {renderSwitch("dashboardVisibility", "hideUpcomingCelebrations", "Hide Upcoming Celebrations")}
                  {renderSwitch("dashboardVisibility", "hideBirthdays", "Hide Birthdays")}
                  {renderSwitch("dashboardVisibility", "hideWeddingAnniversary", "Hide Wedding Anniversary")}
                  {renderSwitch("dashboardVisibility", "hideWorkAnniversary", "Hide Work Anniversary")}
                  {renderSwitch("dashboardVisibility", "hideMyDepartment", "Hide My Department")}
                  {renderSwitch("dashboardVisibility", "hidePhotoGallery", "Hide Photo Gallery")}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Security & Restriction Settings</h2>
                <p>Protect company data and control app usage restrictions</p>
              </div>
              <div className="card-body">
                <div className="settings-grid">
                  {renderSwitch("securitySettings", "profileRestriction", "Profile Restriction")}
                  {renderSwitch("securitySettings", "restrictDownloading", "Restrict Downloading")}
                  {renderSwitch("securitySettings", "restrictScreenshot", "Restrict Screenshot")}
                  {renderSwitch("securitySettings", "showSisterCompanyName", "Show Sister Company Name")}
                </div>
              </div>
            </div>
          )}

          {activeTab === "onboarding" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Onboarding / Offboarding Settings</h2>
                <p>Define mandatory fields for employee lifecycle management</p>
              </div>
              <div className="card-body">
                <div className="settings-grid">
                  {renderSwitch("onboardingSettings", "dobMandatory", "Date of Birth Mandatory")}
                  {renderSwitch("onboardingSettings", "resignationDateMandatory", "Resignation Date Mandatory")}
                  {renderSwitch("onboardingSettings", "probationPeriodMandatory", "Probation Period Mandatory")}
                  {renderSwitch("onboardingSettings", "emergencyContactMandatoryApp", "Emergency Contact (App)")}
                  {renderSwitch("onboardingSettings", "employeeLevelMandatoryWeb", "Employee Level (Web)")}
                  {renderSwitch("onboardingSettings", "reportingPersonMandatory", "Reporting Person Mandatory")}
                  {renderSwitch("onboardingSettings", "sisterCompanyMandatory", "Sister Company Mandatory")}
                </div>
              </div>
            </div>
          )}

          {activeTab === "employee_id" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Employee ID Auto Generate</h2>
                <p>Customize the format for automatic employee ID generation</p>
              </div>
              <div className="card-body">
                <div className="employee-id-form">
                  <div className="form-group">
                    <label>ID Allocation Method</label>
                    <select 
                      value={settings.employeeIdSettings.allocationMethod}
                      onChange={(e) => handleInputChange("employeeIdSettings", "allocationMethod", e.target.value)}
                    >
                      <option>Global</option>
                      <option>Branch Wise</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Use Branch Code</label>
                    <select 
                      value={settings.employeeIdSettings.useBranchCode ? "Yes" : "No"}
                      onChange={(e) => handleInputChange("employeeIdSettings", "useBranchCode", e.target.value === "Yes")}
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Prefix Value</label>
                    <input 
                      type="text" 
                      value={settings.employeeIdSettings.prefixValue}
                      onChange={(e) => handleInputChange("employeeIdSettings", "prefixValue", e.target.value)}
                      placeholder="e.g. UAA-EC"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Digits</label>
                    <input 
                      type="number" 
                      value={settings.employeeIdSettings.numberOfDigits}
                      onChange={(e) => handleInputChange("employeeIdSettings", "numberOfDigits", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="id-preview-box">
                    <span className="preview-label">Generated Format Preview:</span>
                    <span className="preview-value">{settings.employeeIdSettings.example}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Other System Settings</h2>
                <p>Miscellaneous system configuration and business rules</p>
              </div>
              <div className="card-body">
                <div className="settings-grid">
                  {renderSwitch("systemSettings", "defaultPenaltyApproved", "Default Penalty Approved")}
                  {renderSwitch("systemSettings", "allowMultipleBrowserLogin", "Allow Multiple Browser Login")}
                  {renderSwitch("systemSettings", "penaltyToLeaveConversion", "Penalty to Leave Conversion")}
                  {renderSwitch("systemSettings", "enableExpenseGroup", "Enable Expense Group")}
                </div>
                <div className="horizontal-form-grid mt-4">
                  <div className="form-group">
                    <label>Auto Leave Delete Reason</label>
                    <input 
                      type="text" 
                      value={settings.systemSettings.autoLeaveDeleteReason}
                      onChange={(e) => handleInputChange("systemSettings", "autoLeaveDeleteReason", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Alternate Shift</label>
                    <input 
                      type="number" 
                      value={settings.systemSettings.maxAlternateShift}
                      onChange={(e) => handleInputChange("systemSettings", "maxAlternateShift", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile_access" && (
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Profile Menu Access</h2>
                <p>Control visibility and editability of profile fields for employees</p>
              </div>
              <div className="card-body p-0">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Menu Item</th>
                      <th>Access Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.profileMenuAccess.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <div className="access-chip-group">
                            {["View Only", "Edit", "Change Request"].map((type) => (
                              <button
                                key={type}
                                className={`access-chip ${item.access === type ? "active" : ""}`}
                                onClick={() => handleProfileAccessChange(item.id, type)}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
