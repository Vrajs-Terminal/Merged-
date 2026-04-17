import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Filter,
  XCircle,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import "./AdminViewAccess.css";
import { adminSettingsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const modules = [
  "Attendance", "Leaves", "Work Report", "Tracking", "Expenses", 
  "Employees", "Profile Update", "Visit", "Advance Salary & Loan", 
  "Idea & Escalation", "Task"
];

const submodulesData: any = {
  "Attendance": ["Daily Attendance", "Shift Calendar", "Overtime", "Attendance Modification"],
  "Leaves": ["Leave Approval", "Leave Balance", "Short Leaves", "Leave Reports"],
  "Expenses": ["Expense Approval", "Expense Reports", "Advance Expense"],
  "Employees": ["Direct Records", "Onboarding", "Offboarding", "Ex Employees"],
  // Add other submodules as needed
};

const accessModeFilterOptions = ["All", "View", "Modification", "Approval"] as const;
const teamRequestFilterOptions = ["All", "Yes", "No"] as const;

const AdminViewAccess = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accessModeFilter, setAccessModeFilter] = useState<(typeof accessModeFilterOptions)[number]>("All");
  const [teamRequestFilter, setTeamRequestFilter] = useState<(typeof teamRequestFilterOptions)[number]>("All");
  const [accessRecords, setAccessRecords] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    employeeName: "",
    designation: "",
    parentModule: modules[0],
    submodule: "",
    accessFor: "Individual Wise",
    accessMode: "View",
    teamRequestNeeded: false,
  });

  const fetchRules = async () => {
    try {
      const res = await adminSettingsAPI.getAccessRules();
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setAccessRecords(rows.map((row: any) => ({
        ...row,
        teamRequestNeeded: row.teamRequestNeeded ? "Yes" : "No",
      })));
    } catch {
      toast.error("Failed to load access rules");
      setAccessRecords([]);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSaveRule = async () => {
    if (!formData.employeeName || !formData.submodule) {
      toast.error("Employee name and submodule are required");
      return;
    }
    try {
      await adminSettingsAPI.createAccessRule(formData);
      toast.success("Access rule created");
      setShowAddModal(false);
      setFormData({
        employeeName: "",
        designation: "",
        parentModule: modules[0],
        submodule: "",
        accessFor: "Individual Wise",
        accessMode: "View",
        teamRequestNeeded: false,
      });
      fetchRules();
    } catch {
      toast.error("Failed to create access rule");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this access rule?")) return;
    try {
      await adminSettingsAPI.deleteAccessRule(id);
      toast.success("Access rule deleted");
      fetchRules();
    } catch {
      toast.error("Failed to delete access rule");
    }
  };

  const filteredRecords = accessRecords.filter((record: any) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || `${record.employeeName || ""} ${record.designation || ""}`.toLowerCase().includes(q);
    const matchesAccessMode = accessModeFilter === "All" || record.accessMode === accessModeFilter;
    const teamRequestText = record.teamRequestNeeded === "Yes" || record.teamRequestNeeded === true ? "Yes" : "No";
    const matchesTeamRequest = teamRequestFilter === "All" || teamRequestText === teamRequestFilter;
    return matchesQuery && matchesAccessMode && matchesTeamRequest;
  });

  const hasActiveFilters = Boolean(searchQuery.trim()) || accessModeFilter !== "All" || teamRequestFilter !== "All";

  const resetFilters = () => {
    setSearchQuery("");
    setAccessModeFilter("All");
    setTeamRequestFilter("All");
  };

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <div className="access-title-block">
          <div className="access-title-row">
            <ShieldCheck size={24} className="access-title-icon" />
            <h1 className="settings-page-title">Admin View Access</h1>
          </div>
          <p className="settings-page-subtitle">Define and manage administrative access permissions across system modules</p>
        </div>
        <button className="primary-save-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Define New Access</span>
        </button>
      </div>

      <div className="premium-card">
        <div className="access-panel-header">
          <h3>Access Rules Directory</h3>
          <p>Track and manage role based visibility with structured filters.</p>
        </div>

        <div className="card-toolbar">
          <div className="search-bar-premium">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by employee or designation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim() && (
              <button className="search-clear-btn" onClick={() => setSearchQuery("")} aria-label="Clear search">
                <XCircle size={14} />
              </button>
            )}
          </div>

          <div className="filter-toolbar">
            <div className="filter-block">
              <div className="filter-block-title">
                <SlidersHorizontal size={14} />
                Access Mode
              </div>
              <div className="filter-chip-group">
                {accessModeFilterOptions.map((option) => (
                  <button
                    key={option}
                    className={`filter-chip ${accessModeFilter === option ? "active" : ""}`}
                    onClick={() => setAccessModeFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-block">
              <div className="filter-block-title">
                <Filter size={14} />
                Team Request
              </div>
              <div className="filter-chip-group">
                {teamRequestFilterOptions.map((option) => (
                  <button
                    key={option}
                    className={`filter-chip ${teamRequestFilter === option ? "active" : ""}`}
                    onClick={() => setTeamRequestFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button className="toolbar-btn ghost" onClick={resetFilters} disabled={!hasActiveFilters}>
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        <div className="results-strip">
          <div className="results-card">
            <span className="results-label">Total Rules</span>
            <strong>{accessRecords.length}</strong>
          </div>
          <div className="results-card">
            <span className="results-label">Visible Results</span>
            <strong>{filteredRecords.length}</strong>
          </div>
        </div>

        <div className="table-responsive">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Parent Module</th>
                <th>Submodule</th>
                <th>Access For</th>
                <th>Access Mode</th>
                <th>Team Request</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state-inline">
                      No access rule found for the current search and filter selection.
                    </div>
                  </td>
                </tr>
              )}
              {filteredRecords.map((record: any) => (
                <tr key={record.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-small">{(record.employeeName?.charAt(0) || "?").toUpperCase()}</div>
                      <span>{record.employeeName}</span>
                    </div>
                  </td>
                  <td>{record.designation}</td>
                  <td><span className="badge-outline">{record.parentModule}</span></td>
                  <td>{record.submodule}</td>
                  <td>{record.accessFor}</td>
                  <td>
                    <span className={`status-pill ${record.accessMode.toLowerCase()}`}>
                       {record.accessMode}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${record.teamRequestNeeded === "Yes" ? "success" : "neutral"}`}>
                      {record.teamRequestNeeded}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit" title="Edit access rule"><Edit3 size={16} /></button>
                      <button className="icon-btn delete" onClick={() => handleDelete(record.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="premium-modal-overlay">
          <div className="premium-modal-content large">
            <div className="modal-header">
              <h2>Define Admin Access</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><XCircle /></button>
            </div>
            <div className="modal-body">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Select Employee</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search and select employee..."
                    value={formData.employeeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input type="text" className="form-control" value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Parent Module</label>
                  <select className="form-control" value={formData.parentModule} onChange={(e) => setFormData(prev => ({ ...prev, parentModule: e.target.value, submodule: "" }))}>
                    {modules.map(mod => <option key={mod}>{mod}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Submodule</label>
                  <select className="form-control" value={formData.submodule} onChange={(e) => setFormData(prev => ({ ...prev, submodule: e.target.value }))}>
                    <option>Select submodule...</option>
                    {(submodulesData[formData.parentModule] || []).map((sub: string) => <option key={sub}>{sub}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Access For</label>
                  <select className="form-control" value={formData.accessFor} onChange={(e) => setFormData(prev => ({ ...prev, accessFor: e.target.value }))}>
                    <option>Individual Wise</option>
                    <option>Branch Wise</option>
                    <option>Department Wise</option>
                    <option>All</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Access Mode</label>
                  <select className="form-control" value={formData.accessMode} onChange={(e) => setFormData(prev => ({ ...prev, accessMode: e.target.value }))}>
                    <option>View</option>
                    <option>Modification</option>
                    <option>Approval</option>
                  </select>
                </div>
                <div className="form-group full-width">
                   <div className="flex-row items-center gap-2">
                     <input type="checkbox" id="teamRequest" checked={formData.teamRequestNeeded} onChange={(e) => setFormData(prev => ({ ...prev, teamRequestNeeded: e.target.checked }))} />
                     <label htmlFor="teamRequest">Need Team Member Request (Yes/No)</label>
                   </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveRule}>Save Access Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewAccess;

