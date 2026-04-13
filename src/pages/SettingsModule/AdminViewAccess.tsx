import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Filter,
  XCircle
} from "lucide-react";
import "./AdminViewAccess.css";
import PageTitle from "../../components/PageTitle";
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

const AdminViewAccess = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!q) return true;
    return `${record.employeeName || ""} ${record.designation || ""}`.toLowerCase().includes(q);
  });

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <div className="header-title-box">
          <PageTitle title="Admin View Access" subtitle="Define and manage administrative access permissions across system modules" />
        </div>
        <button className="primary-save-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Define New Access</span>
        </button>
      </div>

      <div className="premium-card mt-4">
        <div className="card-toolbar">
          <div className="search-bar-premium">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by employee or designation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <button className="toolbar-btn">
              <Filter size={16} />
              Filter
            </button>
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
              {filteredRecords.map((record: any) => (
                <tr key={record.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-small">{record.employeeName.charAt(0)}</div>
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
                      <button className="icon-btn edit"><Edit3 size={16} /></button>
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

