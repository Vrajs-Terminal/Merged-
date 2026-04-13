import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Plus, ArrowRight, TrendingUp, User, Award, Calendar } from "lucide-react";
import "./promotion.css";
import PageTitle from "../../components/PageTitle";

function Promotion() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: "",
        newDesignation: "",
        newLevelId: "",
        newSalary: "",
        performanceRating: "5",
        promotionDate: new Date().toISOString().split('T')[0],
        remarks: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promoRes, empRes, levelRes] = await Promise.all([
                axios.get(`${API_BASE}/promotions`),
                axios.get(`${API_BASE}/employees`),
                axios.get(`${API_BASE}/levels`)
            ]);
            setPromotions(promoRes.data);
            setEmployees(empRes.data.filter((e: any) => e.status === "Active"));
            setLevels(levelRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeChange = (empId: string) => {
        const selected = employees.find(e => e.id === parseInt(empId));
        if (selected) {
            setFormData({
                ...formData,
                employeeId: empId,
                newDesignation: selected.designation || "",
                newLevelId: selected.levelId ? selected.levelId.toString() : ""
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.employeeId) return alert("Select an employee");
        try {
            const combinedRemarks = `${formData.remarks} | New Salary: ₹${formData.newSalary || 'N/A'} | Rating: ${formData.performanceRating}/5`;
            await axios.post(`${API_BASE}/promotions`, {
                ...formData,
                remarks: combinedRemarks
            });
            setShowModal(false);
            fetchData();
            alert("Promotion recorded successfully!");
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to record promotion");
        }
    };

    return (
        <div className="promotion-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Career Advancements" 
                    subtitle="Manage and track employee promotions, role transitions, and level upgrades" 
                />
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Record Advancement
                    </button>
                </div>
            </div>

            <div className="table-wrapper glass-card">
                {loading ? (
                    <div className="flex-col flex-center py-20">
                        <div className="spinner mb-4"></div>
                        <p className="text-muted">Loading career records...</p>
                    </div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Employee / ID</th>
                                <th>Advancement Date</th>
                                <th>Designation Transition</th>
                                <th>Level Transition</th>
                                <th>Remarks & Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map(p => {
                                const prevLevel = levels.find(l => l.id === p.previousLevelId)?.levelName || "None";
                                const newLevel = levels.find(l => l.id === p.newLevelId)?.levelName || "None";
                                return (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar-sm bg-primary text-white font-bold">
                                                    {p.employee?.firstName?.charAt(0)}{p.employee?.lastName?.charAt(0)}
                                                </div>
                                                <div className="flex-col">
                                                    <span className="font-bold text-slate-800 leading-tight">{p.employee?.firstName} {p.employee?.lastName}</span>
                                                    <span className="text-[10px] text-muted font-mono">{p.employee?.employeeId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-medium text-slate-700">{new Date(p.promotionDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted italic line-through">{p.previousDesignation || "Entry"}</span>
                                                <ArrowRight size={14} className="text-primary opacity-50" />
                                                <span className="text-sm font-bold text-slate-800">{p.newDesignation}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted">{prevLevel}</span>
                                                <ArrowRight size={14} className="text-primary opacity-50" />
                                                <span className="status-badge completed py-1 px-3 !text-[11px]">{newLevel}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-xs max-w-[200px] break-words line-clamp-2" title={p.remarks}>
                                                {p.remarks}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {promotions.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                                        <div className="flex-col flex-center text-muted">
                                            <TrendingUp size={48} className="opacity-20 mb-4" />
                                            <p className="text-lg font-bold">No Advancement Records</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Record Promotion</h3>
                        <p style={{ marginBottom: '20px', color: '#64748b', fontSize: '13px' }}>
                            Logging a promotion will automatically update the employee's designated role and log a level history transition.
                        </p>

                        <div className="form-group">
                            <label>Employee</label>
                            <select value={formData.employeeId} onChange={(e) => handleEmployeeChange(e.target.value)}>
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>New Designation</label>
                                <input
                                    type="text"
                                    value={formData.newDesignation}
                                    onChange={e => setFormData({ ...formData, newDesignation: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>New Level</label>
                                <select value={formData.newLevelId} onChange={e => setFormData({ ...formData, newLevelId: e.target.value })}>
                                    <option value="">-- Unchanged --</option>
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id}>{l.levelName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>New Salary (₹)</label>
                                <input
                                    type="number"
                                    value={formData.newSalary}
                                    onChange={e => setFormData({ ...formData, newSalary: e.target.value })}
                                    placeholder="Enter new amount"
                                />
                            </div>
                            <div className="form-group">
                                <label>Performance Rating (1-5)</label>
                                <select value={formData.performanceRating} onChange={e => setFormData({ ...formData, performanceRating: e.target.value })}>
                                    <option value="5">5 - Outstanding</option>
                                    <option value="4">4 - Exceeds Expectations</option>
                                    <option value="3">3 - Meets Expectations</option>
                                    <option value="2">2 - Needs Improvement</option>
                                    <option value="1">1 - Unsatisfactory</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label>Effective Date</label>
                                <input
                                    type="date"
                                    value={formData.promotionDate}
                                    onChange={e => setFormData({ ...formData, promotionDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Remarks</label>
                                <textarea
                                    rows={1}
                                    value={formData.remarks}
                                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="E.g. Annual Appraisal"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSubmit}>Save Promotion</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Promotion;
