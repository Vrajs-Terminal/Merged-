import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { UserMinus, ClipboardCheck, Trash2, Plus, Info } from "lucide-react";
import "./offboarding.css";
import PageTitle from "../../components/PageTitle";

function Offboarding() {
    const [offboardings, setOffboardings] = useState<any[]>([]);
    const [activeEmployees, setActiveEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [showChecklistModal, setShowChecklistModal] = useState(false);
    const [activeOffboarding, setActiveOffboarding] = useState<any>(null);

    const [formData, setFormData] = useState({
        employeeDbId: "",
        lastWorkingDate: "",
        reason: "",
        noticeServed: "Yes",
        assets: ""
    });

    const fetchData = async () => {
        try {
            const offRes = await axios.get(`${API_BASE}/offboarding`);
            setOffboardings(offRes.data);

            const empRes = await axios.get(`${API_BASE}/employees`);
            // Filter out employees who are already in the offboarding list
            const offboardingIds = offRes.data.map((o: any) => o.employeeId);
            const available = empRes.data.filter((e: any) => !offboardingIds.includes(e.id));
            setActiveEmployees(available);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInitiate = async () => {
        if (!formData.employeeDbId || !formData.lastWorkingDate) return alert("Employee and Date required");
        try {
            const combinedReason = `${formData.reason} | Notice Served: ${formData.noticeServed} | Assets: ${formData.assets || 'None'}`;
            await axios.post(`${API_BASE}/offboarding/initiate`, {
                employeeDbId: parseInt(formData.employeeDbId),
                lastWorkingDate: formData.lastWorkingDate,
                reason: combinedReason
            });
            setShowInitiateModal(false);
            setFormData({ employeeDbId: "", lastWorkingDate: "", reason: "", noticeServed: "Yes", assets: "" });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to initiate");
        }
    };

    const cancelOffboarding = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this offboarding process?")) return;
        try {
            await axios.delete(`${API_BASE}/offboarding/${id}`);
            fetchData();
        } catch (error) {
            alert("Failed to cancel offboarding");
        }
    };

    const toggleChecklist = async (checklistId: number, currentStatus: string) => {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        try {
            await axios.put(`${API_BASE}/offboarding/checklist/${checklistId}`, {
                status: newStatus
            });
            // Refresh the specific checklist data in the modal
            const offRes = await axios.get(`${API_BASE}/offboarding`);
            setOffboardings(offRes.data);
            const updatedActive = offRes.data.find((o: any) => o.id === activeOffboarding.id);
            setActiveOffboarding(updatedActive);
        } catch (error) {
            alert("Failed to update checklist status");
        }
    };

    const filtered = offboardings.filter(o =>
        o.employee?.firstName.toLowerCase().includes(search.toLowerCase()) ||
        o.employee?.lastName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="offboarding-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Employee Offboarding" 
                    subtitle="Manage exit processes, clearances, and organizational separations" 
                />
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowInitiateModal(true)}>
                        <Plus size={18} /> Initiate Exit
                    </button>
                </div>
            </div>

            <div className="glass-card mb-6">
                <div className="form-grid">
                    <div className="search-box">
                        <UserMinus size={18} />
                        <input
                            placeholder="Search by Employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-wrapper glass-card">
                {loading ? (
                    <div className="flex-col flex-center py-20">
                        <div className="spinner mb-4"></div>
                        <p className="text-muted">Loading exit records...</p>
                    </div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Employee / Role</th>
                                <th>Separation Date</th>
                                <th>Separation Reason</th>
                                <th>Clearance Progress</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => {
                                const completedTasks = o.checklists.filter((c: any) => c.status === 'Completed').length;
                                const totalTasks = o.checklists.length;
                                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                                return (
                                    <tr key={o.id}>
                                        <td>
                                            <div className="flex-col">
                                                <span className="font-bold text-slate-800 leading-tight">{o.employee?.firstName} {o.employee?.lastName}</span>
                                                <span className="text-xs text-muted leading-tight">{o.employee?.designation} • {o.employee?.department}</span>
                                            </div>
                                        </td>
                                        <td className="font-medium text-slate-700">{new Date(o.lastWorkingDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="text-xs max-w-[180px] break-words line-clamp-2" title={o.reason}>
                                                {o.reason || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex-col gap-1 min-w-[120px]">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[10px] font-bold text-slate-600">{completedTasks}/{totalTasks} Steps</span>
                                                    <span className="text-[10px] font-bold text-slate-600">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full transition-all duration-500 rounded-full" 
                                                        style={{ 
                                                            width: `${progress}%`, 
                                                            background: progress === 100 ? 'var(--color-success-500)' : 'var(--color-primary-500)' 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${o.status.toLowerCase()}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex-row justify-end gap-2">
                                                <button
                                                    className="act-btn view"
                                                    title="View Clearance Checklist"
                                                    onClick={() => { setActiveOffboarding(o); setShowChecklistModal(true); }}
                                                >
                                                    <ClipboardCheck size={16} />
                                                </button>
                                                <button
                                                    className="act-btn delete"
                                                    title="Cancel separation process"
                                                    onClick={() => cancelOffboarding(o.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "60px" }}>
                                        <div className="flex-col flex-center text-muted">
                                            <UserMinus size={48} className="opacity-20 mb-4" />
                                            <p className="text-lg font-bold">NoSeparation Records</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* INITIATE MODAL */}
            {showInitiateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Initiate Offboarding</h3>
                        <p className="modal-desc">Select an employee and define their exit parameters to spawn their clearance checklists.</p>

                        <div className="form-group">
                            <label>Select Employee</label>
                            <select name="employeeDbId" value={formData.employeeDbId} onChange={handleChange}>
                                <option value="">-- Select Active Employee --</option>
                                {activeEmployees.map(e => (
                                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Last Working Date</label>
                            <input type="date" name="lastWorkingDate" value={formData.lastWorkingDate} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Notice Period Served?</label>
                            <select name="noticeServed" value={formData.noticeServed} onChange={handleChange}>
                                <option>Yes</option>
                                <option>No (Shortfall)</option>
                                <option>Waived</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Company Assets to Recover</label>
                            <input type="text" name="assets" value={formData.assets} onChange={handleChange} placeholder="e.g. Laptop, ID Card, Keys..." />
                        </div>

                        <div className="form-group">
                            <label>Reason for Exit</label>
                            <textarea name="reason" value={formData.reason} onChange={handleChange} rows={2} placeholder="Resignation, Termination, etc..."></textarea>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowInitiateModal(false)}>Cancel</button>
                            <button className="btn-submit" onClick={handleInitiate} style={{ background: '#3b82f6' }}>Initiate Process</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHECKLIST MODAL */}
            {showChecklistModal && activeOffboarding && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0 }}>Exit Clearance Checklist</h3>
                            <span className={`badge ${activeOffboarding.status.toLowerCase()}`}>{activeOffboarding.status}</span>
                        </div>
                        <p className="modal-desc">
                            Employee: <strong>{activeOffboarding.employee.firstName} {activeOffboarding.employee.lastName}</strong><br />
                            LWD: {new Date(activeOffboarding.lastWorkingDate).toLocaleDateString()}
                        </p>

                        <div className="checklists">
                            {activeOffboarding.checklists.map((c: any) => (
                                <div className="checklist-item" key={c.id}>
                                    <div className="checklist-info">
                                        <p>{c.department} Clearance</p>
                                        <small>{c.taskName}</small>
                                    </div>
                                    <button
                                        className={`status-toggle ${c.status === 'Completed' ? 'completed' : 'pending'}`}
                                        onClick={() => toggleChecklist(c.id, c.status)}
                                    >
                                        {c.status}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowChecklistModal(false)}>Close</button>
                            {activeOffboarding.status === 'Completed' && (
                                <button className="btn-submit" onClick={async () => {
                                    if(window.confirm("Finalize this offboarding and move the employee to Ex-Employees?")) {
                                        try {
                                            await axios.put(`${API_BASE}/employees/${activeOffboarding.employee.employeeId}/disable`);
                                            alert("Employee Offboarded & Archived Successfully!");
                                            setShowChecklistModal(false);
                                            fetchData();
                                        } catch (error) {
                                            console.error("Failed to archive employee", error);
                                            alert("Failed to archive employee.");
                                        }
                                    }
                                }}>
                                    Finalize & Archive Employee
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Offboarding;
