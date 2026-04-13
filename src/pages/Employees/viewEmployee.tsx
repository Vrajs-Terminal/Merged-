import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Trash2, Shield, User, MapPin, Briefcase } from "lucide-react";
import axios from "axios";
import API_BASE from "../api";
import "./viewEmployee.css";
import PageTitle from "../../components/PageTitle";

function ViewEmployee({ selectedEmployee, setActivePage }: any) {
  const [levels, setLevels] = useState<any[]>([]);
  const [levelHistory, setLevelHistory] = useState<any[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({
    levelId: "",
    effectiveFrom: "",
    remarks: ""
  });

  const [showProfileChangeForm, setShowProfileChangeForm] = useState(false);
  const [changeRequestData, setChangeRequestData] = useState({
    changeType: "Contact Info",
    newData: ""
  });

  const fetchLevelData = async () => {
    if (!selectedEmployee) return;
    try {
      const dbId = selectedEmployee.dbId || selectedEmployee.id;
      const [levelsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/levels`),
        axios.get(`${API_BASE}/levels/${dbId}/history`)
      ]);
      setLevels(levelsRes.data);
      setLevelHistory(historyRes.data);
    } catch (error) {
      console.error("Failed to fetch level data:", error);
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      fetchLevelData();
    }
  }, [selectedEmployee]);

  if (!selectedEmployee) {
    return (
      <div className="view-employee-container">
        <div className="view-header">
          <h2>Employee Details</h2>
          <button className="btn-back" onClick={() => setActivePage("employees")}>
            <ArrowLeft size={18} /> Back to Employees
          </button>
        </div>
        <div className="employee-card card-body" style={{ textAlign: "center", padding: "50px" }}>
          <h2 style={{ color: "#64748b" }}>No Employee Selected</h2>
        </div>
      </div>
    );
  }

  const initial = selectedEmployee.firstName ? selectedEmployee.firstName.charAt(0).toUpperCase() : "?";

  const handleRemove = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      try {
        await axios.put(`${API_BASE}/employees/${id}/disable`);
        setActivePage("employees");
      } catch (error) {
        console.error("Failed to disable employee:", error);
        alert("Failed to remove employee.");
      }
    }
  };

  const handleAssignLevel = async () => {
    if (!assignData.levelId || !assignData.effectiveFrom) {
      return alert("Level and Effective Date are required.");
    }

    try {
      const dbId = selectedEmployee.dbId || selectedEmployee.id;
      await axios.post(`${API_BASE}/levels/assign`, {
        employeeId: dbId,
        levelId: parseInt(assignData.levelId),
        effectiveFrom: assignData.effectiveFrom,
        remarks: assignData.remarks
      });
      setShowAssignForm(false);
      setAssignData({ levelId: "", effectiveFrom: "", remarks: "" });
      fetchLevelData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error assigning level");
    }
  };

  const handleRequestProfileChange = async () => {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(changeRequestData.newData);
      } catch (e) {
        return alert("New Data must be valid JSON format");
      }

      const dbId = selectedEmployee.dbId || selectedEmployee.id;

      let oldData: any = {};
      if (changeRequestData.changeType === "Contact Info") {
        oldData = {
          mobile: selectedEmployee.mobile,
          personalEmail: selectedEmployee.personalEmail,
          currentAddress: selectedEmployee.currentAddress
        };
      } else if (changeRequestData.changeType === "Bank Details") {
        oldData = {
          bankName: selectedEmployee.bankName,
          accountNo: selectedEmployee.accountNo,
          ifscCode: selectedEmployee.ifscCode
        };
      } else {
        oldData = { ...selectedEmployee };
      }

      await axios.post(`${API_BASE}/profile-changes`, {
        employeeId: dbId,
        changeType: changeRequestData.changeType,
        oldData,
        newData: parsedData
      });

      alert("Profile change request submitted successfully!");
      setShowProfileChangeForm(false);
      setChangeRequestData({ changeType: "Contact Info", newData: "" });
    } catch (error: any) {
      alert(error.response?.data?.error || "Error submitting change request");
    }
  };

  const currentActiveLevel = levelHistory.find((h: any) => !h.effectiveTo);

  return (
    <div className="view-employee-container animate-fade-in">
      <div className="page-header">
        <PageTitle 
          title="Employee Profile" 
          subtitle={`Viewing details for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
        />
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setActivePage("employees")}>
            <ArrowLeft size={18} /> Directory
          </button>
          <button className="btn btn-warning" onClick={() => setActivePage("addEmployee")}>
            <Edit size={16} /> Edit Profile
          </button>
          <button className="btn btn-danger" onClick={() => handleRemove(selectedEmployee.employeeId || selectedEmployee.id)}>
            <Trash2 size={16} /> Disable
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-sidebar">
          <div className="glass-card text-center p-8">
            <div className="profile-avatar-large mx-auto mb-4">
              {initial}
            </div>
            <h2 className="text-xl font-bold mb-1">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
            <p className="text-muted text-sm mb-4 font-medium">{selectedEmployee.designation}</p>
            <span className={`status-badge ${selectedEmployee.status === 'Active' ? 'completed' : 'failed'} w-full`}>
              {selectedEmployee.status || "Ex-Employee"}
            </span>
            
            <div className="mt-8 pt-8 border-t space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="stat-icon-sm bg-blue"><User size={14} /></div>
                <div className="flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted">Employee ID</span>
                  <span className="text-sm font-semibold">{selectedEmployee.employeeId || selectedEmployee.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="stat-icon-sm bg-purple"><Briefcase size={14} /></div>
                <div className="flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted">Department</span>
                  <span className="text-sm font-semibold">{selectedEmployee.department}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="stat-icon-sm bg-orange"><MapPin size={14} /></div>
                <div className="flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted">Branch</span>
                  <span className="text-sm font-semibold">{selectedEmployee.branch}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main space-y-6">
          <div className="glass-card">
            <div className="card-header-simple">
              <h3><User size={18} /> Personal & Contact Details</h3>
            </div>
            <div className="form-grid-3 p-6">
              <div className="stat-mini">
                <label>Mobile Number</label>
                <p>{selectedEmployee.mobile || "—"}</p>
              </div>
              <div className="stat-mini">
                <label>Work Email</label>
                <p>{selectedEmployee.email || "—"}</p>
              </div>
              <div className="stat-mini">
                <label>Joining Date</label>
                <p>{selectedEmployee.doj || "—"}</p>
              </div>
              <div className="stat-mini">
                <label>Current Level</label>
                <p className="text-primary font-bold">
                  {currentActiveLevel ? currentActiveLevel.level.levelName : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="card-header-simple px-6 py-4 flex justify-between items-center bg-slate-50/50">
               <h3><Shield size={18} /> Career Progression</h3>
               <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAssignForm(!showAssignForm)}
                >
                  {showAssignForm ? "Cancel" : "Assign Level"}
               </button>
            </div>
            
            <div className="p-6">
              {showAssignForm && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mb-6 animate-slide-up">
                   <div className="form-grid-3">
                      <div className="form-group">
                        <label className="form-group-label">New Level</label>
                        <select className="form-group-select" value={assignData.levelId} onChange={e => setAssignData({ ...assignData, levelId: e.target.value })}>
                           <option value="">-- Choose --</option>
                           {levels.filter((l: any) => l.status === "Active").map((l: any) => (
                             <option key={l.id} value={l.id}>{l.levelName}</option>
                           ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-group-label">Effective Date</label>
                        <input className="form-group-input" type="date" value={assignData.effectiveFrom} onChange={e => setAssignData({ ...assignData, effectiveFrom: e.target.value })} />
                      </div>
                      <button className="btn btn-success btn-lg mt-auto" onClick={handleAssignLevel}>Confirm</button>
                   </div>
                </div>
              )}

              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Designation Level</th>
                    <th>Period</th>
                    <th>Remarks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {levelHistory.map((history: any) => (
                    <tr key={history.id}>
                      <td className="font-bold text-slate-700">{history.level.levelName}</td>
                      <td>
                        <div className="text-xs">
                          {new Date(history.effectiveFrom).toLocaleDateString()} — {history.effectiveTo ? new Date(history.effectiveTo).toLocaleDateString() : "Current"}
                        </div>
                      </td>
                      <td className="text-xs text-muted">{history.remarks || "—"}</td>
                      <td>
                        <span className={`status-badge ${!history.effectiveTo ? 'completed' : 'pending'}`}>
                          {!history.effectiveTo ? "ACTIVE" : "PAST"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold"><Briefcase size={18} className="inline mr-2" /> Request Profile Change</h3>
              <button
                onClick={() => setShowProfileChangeForm(!showProfileChangeForm)}
                className="btn btn-secondary btn-sm"
              >
                {showProfileChangeForm ? "Cancel" : "New Request"}
              </button>
            </div>

            {showProfileChangeForm && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl animate-slide-up">
                <p className="text-xs text-muted mb-4">Profile changes require HR/Admin approval before reflecting in the system.</p>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-group-label">Change Category</label>
                    <select
                      className="form-group-select"
                      value={changeRequestData.changeType}
                      onChange={e => setChangeRequestData({ ...changeRequestData, changeType: e.target.value })}
                    >
                      <option value="Personal Info">Personal Info (Name, DOB, etc)</option>
                      <option value="Contact Info">Contact Info (Mobile, Address)</option>
                      <option value="Bank Details">Bank Details (High Risk)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-group-label">Requested Changes (JSON Format)</label>
                    <textarea
                      className="form-group-input min-h-[100px] font-mono"
                      placeholder='e.g. { "mobile": "+1234567890" }'
                      value={changeRequestData.newData}
                      onChange={e => setChangeRequestData({ ...changeRequestData, newData: e.target.value })}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleRequestProfileChange}>Submit Request</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewEmployee;