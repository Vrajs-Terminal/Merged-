import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveTypes.css";
import { Tag, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Save, X } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

const EMPTY_FORM = {
    name: "", leaveCode: "", description: "", defaultDays: 12,
    isPaid: true, carryForward: false, encashAllowed: false, docRequired: false,
    applyOnWeeklyOff: false, applyOnHoliday: false, applicableInUnpaidLeave: false,
    applicableFor: "All", isBirthdayLeave: false, isAnniversaryLeave: false, applyOnPastDays: true
};

export default function LeaveTypes() {
    const [types, setTypes] = useState<any[]>([]);
    const [form, setForm] = useState<any>({ ...EMPTY_FORM });
    const [editId, setEditId] = useState<number | null>(null);
    const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const load = () => axios.get(`${API}/types`).then(r => setTypes(r.data)).catch(() => { });
    useEffect(() => { load(); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, type, value } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((p: any) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setMsg({ type: "error", text: "Leave name is required." }); return; }
        setSaving(true); setMsg(null);
        try {
            const data = { ...form, defaultDays: parseInt(form.defaultDays) };
            if (editId) await axios.put(`${API}/types/${editId}`, data);
            else await axios.post(`${API}/types`, data);
            setMsg({ type: "success", text: editId ? "Leave type updated!" : "Leave type created!" });
            setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(false);
            load();
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed to save." });
        } finally { setSaving(false); }
    };

    const handleEdit = (t: any) => {
        setForm({
            name: t.name, leaveCode: t.leaveCode || "", description: t.description || "",
            defaultDays: t.defaultDays, isPaid: t.isPaid, carryForward: t.carryForward,
            encashAllowed: t.encashAllowed, docRequired: t.docRequired,
            applyOnWeeklyOff: t.applyOnWeeklyOff || false,
            applyOnHoliday: t.applyOnHoliday || false,
            applicableInUnpaidLeave: t.applicableInUnpaidLeave || false,
            applicableFor: t.applicableFor || "All",
            isBirthdayLeave: t.isBirthdayLeave || false,
            isAnniversaryLeave: t.isAnniversaryLeave || false,
            applyOnPastDays: t.applyOnPastDays ?? true
        });
        setEditId(t.id); setShowForm(true); setMsg(null);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this leave type?")) return;
        try { await axios.delete(`${API}/types/${id}`); load(); }
        catch (err: any) { setMsg({ type: "error", text: err?.response?.data?.error || "Failed to delete." }); }
    };

    return (
        <div className="lm-container lm-fade lt-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><Tag size={22} /> Leave Types</h2>
                    <p className="lm-page-subtitle">Define all leave categories available in your organization</p>
                </div>
                <button className="lm-btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...EMPTY_FORM }); }}>
                    {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Leave Type</>}
                </button>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            {showForm && (
                <div className="lm-card">
                    <div className="lm-card-title"><Edit2 size={16} /> {editId ? "Edit" : "Create"} Leave Type</div>
                    <form onSubmit={handleSubmit}>
                        <div className="lm-two-col">
                            <div className="lm-field">
                                <label className="lm-label">Leave Name *</label>
                                <input className="lm-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Casual Leave" />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Leave Code</label>
                                <input className="lm-input" name="leaveCode" value={form.leaveCode} onChange={handleChange} placeholder="e.g. CL" />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Default Days / Year</label>
                                <input className="lm-input" type="number" name="defaultDays" value={form.defaultDays} onChange={handleChange} min={0} />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Description</label>
                                <input className="lm-input" name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
                            </div>
                        </div>
                        <h4 style={{marginTop: "1.5rem", marginBottom: "0.75rem", fontWeight: 600, color: "#4b5563"}}>Basic Settings</h4>
                        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                            {[
                                { name: "isPaid", label: "Paid Leave" },
                                { name: "carryForward", label: "Carry Forward" },
                                { name: "encashAllowed", label: "Encashment Allowed" },
                                { name: "docRequired", label: "Document Required" },
                            ].map(cb => (
                                <label key={cb.name} className="lm-checkbox-row">
                                    <input type="checkbox" name={cb.name} checked={form[cb.name]} onChange={handleChange} />
                                    {cb.label}
                                </label>
                            ))}
                        </div>

                        <h4 style={{marginBottom: "0.75rem", fontWeight: 600, color: "#4b5563"}}>Advanced Applicability Rules</h4>
                        <div style={{ marginBottom: "1rem", maxWidth: "400px" }}>
                            <label className="lm-label">Applicable For Employee Segment</label>
                            <select className="lm-input" name="applicableFor" value={form.applicableFor} onChange={handleChange}>
                                <option value="All">All Employees</option>
                                <option value="Men">Men Only</option>
                                <option value="Women">Women Only</option>
                                <option value="Married">Married Only</option>
                                <option value="Unmarried">Unmarried Only</option>
                                <option value="Married Female Only">Married Female Only</option>
                                <option value="Married Male Only">Married Male Only</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                            {[
                                { name: "applyOnWeeklyOff", label: "Apply on Weekly Off" },
                                { name: "applyOnHoliday", label: "Apply on Holiday" },
                                { name: "applicableInUnpaidLeave", label: "Applicable in Unpaid Leave" },
                                { name: "isBirthdayLeave", label: "Is Birthday Leave" },
                                { name: "isAnniversaryLeave", label: "Is Anniversary Leave" },
                                { name: "applyOnPastDays", label: "Can Apply for Past Days" },
                            ].map(cb => (
                                <label key={cb.name} className="lm-checkbox-row" style={{ fontSize: "0.875rem" }}>
                                    <input type="checkbox" name={cb.name} checked={form[cb.name]} onChange={handleChange} />
                                    {cb.label}
                                </label>
                            ))}
                        </div>

                        <button className="lm-btn-primary" type="submit" disabled={saving}>
                            <Save size={14} /> {saving ? "Saving..." : editId ? "Update Leave Type" : "Create Leave Type"}
                        </button>
                    </form>
                </div>
            )}

            <div className="lm-card">
                <div className="lm-table-wrap">
                    <table className="lm-table">
                        <thead>
                            <tr>
                                <th>Leave Type</th><th>Code</th><th>Days/Year</th>
                                <th>Paid</th><th>Carry Fwd</th><th>Encash</th><th>Doc Req.</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.length === 0
                                ? <tr><td colSpan={8} className="lm-empty">No leave types created yet. Click "New Leave Type" to get started.</td></tr>
                                : types.map(t => (
                                    <tr key={t.id}>
                                        <td><strong>{t.name}</strong></td>
                                        <td>{t.leaveCode ? <span className="lm-badge lm-badge-purple">{t.leaveCode}</span> : "—"}</td>
                                        <td><strong>{t.defaultDays}</strong> days</td>
                                        <td><span className={`lm-badge ${t.isPaid ? "lm-badge-green" : "lm-badge-orange"}`}>{t.isPaid ? "Paid" : "Unpaid"}</span></td>
                                        <td><span className={`lm-badge ${t.carryForward ? "lm-badge-blue" : "lm-badge-gray"}`}>{t.carryForward ? "Yes" : "No"}</span></td>
                                        <td><span className={`lm-badge ${t.encashAllowed ? "lm-badge-green" : "lm-badge-gray"}`}>{t.encashAllowed ? "Yes" : "No"}</span></td>
                                        <td><span className={`lm-badge ${t.docRequired ? "lm-badge-orange" : "lm-badge-gray"}`}>{t.docRequired ? "Yes" : "No"}</span></td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="lm-btn-icon" onClick={() => handleEdit(t)} title="Edit"><Edit2 size={14} /></button>
                                                <button className="lm-btn-icon" onClick={() => handleDelete(t.id)} title="Delete" style={{ color: "#ef4444", borderColor: "#fecaca" }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
