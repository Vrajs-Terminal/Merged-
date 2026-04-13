import { useState, useEffect } from "react";
import axios from "axios";
import "./shiftRotation.css";
import { RefreshCw, Plus, Save, Trash2, AlertCircle, CheckCircle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/shifts`;

function ShiftRotation() {
    const [rotations, setRotations] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        rotationName: "",
        rotationPeriod: "Weekly",
        cycleStartDate: new Date().toISOString().split("T")[0],
        departmentName: "",
        shiftSequence: [] as number[],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rotRes, shiftRes] = await Promise.all([
                axios.get(`${API}/rotations/list`),
                axios.get(API)
            ]);
            setRotations(rotRes.data.rotations);
            setShifts(shiftRes.data.shifts);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    };

    const addToSequence = (shiftId: number) => {
        setForm(prev => ({ ...prev, shiftSequence: [...prev.shiftSequence, shiftId] }));
    };

    const removeFromSequence = (idx: number) => {
        setForm(prev => ({ ...prev, shiftSequence: prev.shiftSequence.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.shiftSequence.length < 2) {
            setMsg({ type: "error", text: "Add at least 2 shifts to the rotation sequence." });
            return;
        }
        setSaving(true);
        setMsg(null);
        try {
            await axios.post(`${API}/rotations`, form);
            setMsg({ type: "success", text: "Rotation plan created successfully!" });
            setForm({ rotationName: "", rotationPeriod: "Weekly", cycleStartDate: new Date().toISOString().split("T")[0], departmentName: "", shiftSequence: [] });
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed to create rotation." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this rotation plan?")) return;
        try {
            await axios.delete(`${API}/rotations/${id}`);
            setRotations(prev => prev.filter(r => r.id !== id));
        } catch {
            alert("Failed to delete rotation.");
        }
    };

    const getShiftName = (id: number) => shifts.find(s => s.id === id)?.shiftName || `Shift #${id}`;

    const PERIOD_COLORS: Record<string, string> = {
        Daily: "sm-badge-blue",
        Weekly: "sm-badge-purple",
        Monthly: "sm-badge-orange",
    };

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><RefreshCw size={22} /> Shift Rotation</h2>
                    <p className="sm-page-subtitle">Configure rotating shift cycles for departments and teams</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> {showForm ? "Cancel" : "New Rotation"}
                </button>
            </div>

            {msg && (
                <div className={`sm-alert sm-alert-${msg.type}`}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {msg.text}
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <div className="sm-section" style={{ marginBottom: "1.25rem" }}>
                        <div className="sm-section-title">🔄 Create Rotation Plan</div>
                        <div className="sm-section-body">
                            <div className="sm-grid-3" style={{ marginBottom: "1rem" }}>
                                <div className="sm-field">
                                    <label className="sm-label">Rotation Name *</label>
                                    <input className="sm-input" value={form.rotationName} onChange={e => setForm(p => ({ ...p, rotationName: e.target.value }))} placeholder="e.g. BPO 3-Shift Cycle" required />
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Rotation Period</label>
                                    <select className="sm-select" value={form.rotationPeriod} onChange={e => setForm(p => ({ ...p, rotationPeriod: e.target.value }))}>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Cycle Start Date *</label>
                                    <input className="sm-input" type="date" value={form.cycleStartDate} onChange={e => setForm(p => ({ ...p, cycleStartDate: e.target.value }))} required />
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Department (optional)</label>
                                    <input className="sm-input" value={form.departmentName} onChange={e => setForm(p => ({ ...p, departmentName: e.target.value }))} placeholder="e.g. Operations" />
                                </div>
                            </div>

                            <div style={{ marginTop: "0.75rem" }}>
                                <label className="sm-label" style={{ marginBottom: "0.5rem", display: "block" }}>📋 Shift Sequence (in order)</label>

                                {/* Current sequence */}
                                {form.shiftSequence.length > 0 && (
                                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                                        {form.shiftSequence.map((sid, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#ede9fe", padding: "0.3rem 0.75rem", borderRadius: 20, fontSize: "0.8rem" }}>
                                                <span style={{ background: "#6366f1", color: "white", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>{idx + 1}</span>
                                                <span>{getShiftName(sid)}</span>
                                                <button type="button" onClick={() => removeFromSequence(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6d28d9", lineHeight: 1 }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {shifts.map((s: any) => (
                                        <button key={s.id} type="button" className="btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }} onClick={() => addToSequence(s.id)}>
                                            + {s.shiftName}
                                        </button>
                                    ))}
                                    {shifts.length === 0 && <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>No shifts available. Create shifts first.</span>}
                                </div>
                            </div>

                            <div className="sm-form-actions" style={{ marginTop: "1rem" }}>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    <Save size={16} /> {saving ? "Saving..." : "Create Rotation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* Rotations list */}
            {loading ? <div className="sm-loading">Loading rotation plans...</div> : (
                <div className="sm-table-wrap">
                    <table className="sm-table">
                        <thead>
                            <tr><th>#</th><th>Rotation Name</th><th>Period</th><th>Department</th><th>Shift Sequence</th><th>Cycle Start</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {rotations.length === 0
                                ? <tr><td colSpan={8} className="sm-empty">No rotation plans configured yet.</td></tr>
                                : rotations.map((r: any, idx: number) => {
                                    const seq = (() => { try { return JSON.parse(r.shiftSequence) as number[]; } catch { return []; } })();
                                    return (
                                        <tr key={r.id}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{r.rotationName}</strong></td>
                                            <td><span className={`sm-badge ${PERIOD_COLORS[r.rotationPeriod] || "sm-badge-blue"}`}>{r.rotationPeriod}</span></td>
                                            <td>{r.departmentName || <span style={{ color: "#9ca3af" }}>All</span>}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                                                    {seq.map((sid: number, i: number) => (
                                                        <span key={i} style={{ background: "#f3f4f6", padding: "0.15rem 0.5rem", borderRadius: 12, fontSize: "0.75rem" }}>
                                                            {i + 1}. {getShiftName(sid)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{r.cycleStartDate?.split("T")[0]}</td>
                                            <td><span className={`sm-badge ${r.status === "Active" ? "sm-badge-active" : "sm-badge-inactive"}`}>{r.status}</span></td>
                                            <td>
                                                <button className="btn-danger" style={{ padding: "0.3rem 0.5rem" }} onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ShiftRotation;
