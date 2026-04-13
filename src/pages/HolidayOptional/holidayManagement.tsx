import { useState, useEffect } from "react";
import axios from "axios";
import PageTitle from "../../components/PageTitle";
import {
    Calendar,
    Plus,
    Trash2,
    Users,
    CheckCircle,
    AlertCircle,
    Layers,
} from "lucide-react";
import API_BASE from "../api";
import "./holidayManagement.css";

const API = `${API_BASE}/holidays`;

function HolidayManagement() {
    const [holidays, setHolidays] = useState<any[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showAssign, setShowAssign] = useState<number | null>(null); // Holiday ID for assignment
    const [form, setForm] = useState({ name: "", date: "", type: "Public", description: "" });
    const [assignForm, setAssignForm] = useState({ targetType: "Branch", targetIds: "" });
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const r = await axios.get(API);
            setHolidays(r.data.holidays || []);
        } catch (e) {
            console.error("Failed to fetch holidays");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(API, form);
            setMsg({ type: "success", text: "Holiday created!" });
            setShowAdd(false);
            setForm({ name: "", date: "", type: "Public", description: "" });
            fetchHolidays();
        } catch (err) {
            setMsg({ type: "error", text: "Failed to create holiday." });
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (showAssign === null) return;
        try {
            const ids = assignForm.targetIds.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            await axios.post(`${API}/assign`, {
                holidayId: showAssign,
                targetType: assignForm.targetType,
                targetIds: ids
            });
            setMsg({ type: "success", text: "Holiday assigned successfully!" });
            setShowAssign(null);
            fetchHolidays();
        } catch (err) {
            setMsg({ type: "error", text: "Assignment failed." });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this holiday?")) return;
        try {
            await axios.delete(`${API}/${id}`);
            fetchHolidays();
        } catch (e) { }
    };

    return (
        <div className="sm-container fade-in">
            <div className="holiday-header">
                <div className="holiday-header-content">
                    <PageTitle title="Holiday Management" subtitle="Manage company holidays and assign them to departments or branches" />
                </div>
                <button className="holiday-add-btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} /> Add Holiday
                </button>
            </div>

            {msg && (
                <div className={`holiday-alert holiday-alert-${msg.type}`}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{msg.text}</span>
                </div>
            )}

            <div className="holiday-content-card glass-card">
                <div className="holiday-content-head">
                    <h3 className="holiday-content-title">Holiday Registry</h3>
                    <span className="holiday-content-count">{holidays.length} Total</span>
                </div>

                {/* Holiday Cards Grid */}
                <div className="holiday-grid">
                    {holidays.length === 0 ? (
                        <div className="holiday-empty">
                            <div className="holiday-empty-icon">
                                <Calendar size={44} />
                            </div>
                            <h3 className="holiday-empty-title">No Holidays Scheduled</h3>
                            <p className="holiday-empty-text">No holidays added yet. Create one to get started!</p>
                            <button className="btn btn-primary holiday-empty-cta" onClick={() => setShowAdd(true)}>
                                <Plus size={16} /> Add First Holiday
                            </button>
                        </div>
                    ) : (
                        holidays.map((h: any) => (
                            <div key={h.id} className="holiday-card">
                            <div className="holiday-card-header">
                                <div>
                                    <span className={`holiday-card-type-badge holiday-card-type-${h.type.toLowerCase()}`}>
                                        {h.type}
                                    </span>
                                    <h3 className="holiday-card-title">{h.name}</h3>
                                    <p className="holiday-card-date">
                                        {new Date(h.date).toLocaleDateString('en-GB', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            
                            {h.description && (
                                <p className="holiday-card-description">{h.description}</p>
                            )}
                            
                            <div className="holiday-card-actions">
                                <button 
                                    className="holiday-card-action-btn holiday-card-action-assign"
                                    onClick={() => setShowAssign(h.id)} 
                                    title="Assign to departments/branches"
                                >
                                    <Users size={16} />
                                </button>
                                <button 
                                    className="holiday-card-action-btn holiday-card-action-delete"
                                    onClick={() => handleDelete(h.id)} 
                                    title="Delete holiday"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div className="holiday-card-footer">
                                <Layers size={14} />
                                <span>Assigned to {h.assignments?.length || 0} entities</span>
                            </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Holiday Modal */}
            {showAdd && (
                <div className="holiday-modal-overlay">
                    <div className="holiday-modal">
                        <h3>Add New Holiday</h3>
                        <form className="holiday-modal-form" onSubmit={handleCreate}>
                            <div className="holiday-form-field">
                                <label className="holiday-form-label">Holiday Name</label>
                                <input 
                                    className="holiday-form-input" 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                    placeholder="e.g., Independence Day"
                                    required 
                                />
                            </div>
                            <div className="holiday-form-grid">
                                <div className="holiday-form-field">
                                    <label className="holiday-form-label">Date</label>
                                    <input 
                                        className="holiday-form-input" 
                                        type="date" 
                                        value={form.date} 
                                        onChange={e => setForm({...form, date: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="holiday-form-field">
                                    <label className="holiday-form-label">Type</label>
                                    <select 
                                        className="holiday-form-select" 
                                        value={form.type} 
                                        onChange={e => setForm({...form, type: e.target.value})}
                                    >
                                        <option value="Public">Public Holiday</option>
                                        <option value="Mandatory">Mandatory</option>
                                        <option value="Optional">Optional</option>
                                    </select>
                                </div>
                            </div>
                            <div className="holiday-form-field">
                                <label className="holiday-form-label">Description (Optional)</label>
                                <textarea 
                                    className="holiday-form-input" 
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})} 
                                    rows={3}
                                    placeholder="Add any notes about this holiday..."
                                />
                            </div>
                            <div className="holiday-form-actions">
                                <button type="submit" className="holiday-form-submit">Add Holiday</button>
                                <button type="button" className="holiday-form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Holiday Modal */}
            {showAssign !== null && (
                <div className="holiday-modal-overlay">
                    <div className="holiday-modal">
                        <h3>Assign Holiday To Entities</h3>
                        <form className="holiday-modal-form" onSubmit={handleAssign}>
                            <div className="holiday-form-field">
                                <label className="holiday-form-label">Target Type</label>
                                <select 
                                    className="holiday-form-select" 
                                    value={assignForm.targetType} 
                                    onChange={e => setAssignForm({...assignForm, targetType: e.target.value})}
                                >
                                    <option value="Branch">Branch</option>
                                    <option value="Department">Department</option>
                                    <option value="Employee">Specific Employee</option>
                                </select>
                            </div>
                            <div className="holiday-form-field">
                                <label className="holiday-form-label">Target IDs (comma-separated)</label>
                                <input 
                                    className="holiday-form-input" 
                                    value={assignForm.targetIds} 
                                    onChange={e => setAssignForm({...assignForm, targetIds: e.target.value})} 
                                    placeholder="e.g., 1, 2, 5"
                                    required 
                                />
                                <small style={{fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block'}}>
                                    Enter numerical IDs from settings
                                </small>
                            </div>
                            <div className="holiday-form-actions">
                                <button type="submit" className="holiday-form-submit">Save Assignments</button>
                                <button type="button" className="holiday-form-cancel" onClick={() => setShowAssign(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HolidayManagement;
