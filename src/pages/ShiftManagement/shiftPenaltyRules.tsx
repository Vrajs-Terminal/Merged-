import { useState, useEffect } from "react";
import axios from "axios";
import { 
    AlertTriangle, 
    Trash2, 
    Plus, 
    CheckCircle, 
    AlertCircle, 
    DollarSign, 
    Clock, 
    Hash,
    Settings,
    ShieldAlert
} from "lucide-react";
import API_BASE from "../api";
import "./shiftPenaltyRules.css";

const API = `${API_BASE}/shifts/penalty-rules`;

function ShiftPenaltyRules() {
    const [rules, setRules] = useState<any[]>([]);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({
        name: "",
        type: "LateComing",
        thresholdMin: 15,
        deductionAmt: 0,
        dayDeduction: 0,
        status: "Active"
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const r = await axios.get(API);
            setRules(r.data.rules);
        } catch (e) { }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(API, form);
            setMsg({ type: "success", text: "Penalty rule created!" });
            setShowAdd(false);
            setForm({ name: "", type: "LateComing", thresholdMin: 15, deductionAmt: 0, dayDeduction: 0, status: "Active" });
            fetchRules();
        } catch (err) {
            setMsg({ type: "error", text: "Failed to create rule." });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this rule?")) return;
        try {
            await axios.delete(`${API}/${id}`);
            fetchRules();
        } catch (e) { }
    };

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><AlertTriangle size={22} color="#f59e0b" /> Shift Penalty Rules</h2>
                    <p className="sm-page-subtitle">Configure automatic deductions for late coming, early leaving, and missing punches</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} /> Add Rule
                </button>
            </div>

            {msg && (
                <div className={`sm-alert sm-alert-${msg.type}`} style={{ marginBottom: "1.5rem" }}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {msg.text}
                </div>
            )}

            {rules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#f8fafc", borderRadius: "16px", border: "2px dashed #e2e8f0", marginTop: "2rem" }}>
                    <div style={{ background: "#fef3c7", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                        <ShieldAlert size={32} color="#d97706" />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", color: "#1e293b", marginBottom: "0.5rem" }}>No Penalty Rules Configured</h3>
                    <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
                        Create rules to automate payroll deductions for late coming, early leaving, and missing punches to ensure discipline across shifts.
                    </p>
                    <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ padding: "0.75rem 1.5rem", borderRadius: "8px" }}>
                        <Plus size={18} /> Create Your First Rule
                    </button>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "3rem", maxWidth: "800px", margin: "3rem auto 0", textAlign: "left" }}>
                        <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ color: "#ef4444", marginBottom: "0.5rem" }}><Clock size={20} /></div>
                            <h4 style={{ fontSize: "0.95rem", margin: "0 0 0.25rem", color: "#1e293b" }}>Late Coming</h4>
                            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Deduct pay when employees arrive later than the allowed grace period.</p>
                        </div>
                        <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ color: "#f59e0b", marginBottom: "0.5rem" }}><Settings size={20} /></div>
                            <h4 style={{ fontSize: "0.95rem", margin: "0 0 0.25rem", color: "#1e293b" }}>Missing Punch</h4>
                            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Apply fixed deductions when employees fail to clock out properly.</p>
                        </div>
                        <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                            <div style={{ color: "#3b82f6", marginBottom: "0.5rem" }}><DollarSign size={20} /></div>
                            <h4 style={{ fontSize: "0.95rem", margin: "0 0 0.25rem", color: "#1e293b" }}>Early Leaving</h4>
                            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Penalize early departures before the shift end time.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rules-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
                    {rules.map((rule: any) => (
                        <div key={rule.id} className="sm-stat-card" style={{ padding: "1.5rem", borderLeft: "4px solid #f59e0b", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.1 }}>
                                <ShieldAlert size={60} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b" }}>{rule.name}</h3>
                                <button onClick={() => handleDelete(rule.id)} style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "8px", padding: "6px", cursor: "pointer" }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <span style={{ display: "inline-block", background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600, margin: "0.5rem 0 1rem", position: "relative", zIndex: 1 }}>
                                {rule.type}
                            </span>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", position: "relative", zIndex: 1 }}>
                                <div className="rule-stat">
                                    <span className="rule-stat-label"><Clock size={12} /> Threshold</span>
                                    <span className="rule-stat-value">{rule.thresholdMin} Min</span>
                                </div>
                                {rule.deductionAmt > 0 && (
                                    <div className="rule-stat">
                                        <span className="rule-stat-label"><DollarSign size={12} /> Deduction Amount</span>
                                        <span className="rule-stat-value" style={{ color: "#ef4444" }}>₹{rule.deductionAmt}</span>
                                    </div>
                                )}
                                {rule.dayDeduction > 0 && (
                                    <div className="rule-stat">
                                        <span className="rule-stat-label"><Hash size={12} /> Day Deduction</span>
                                        <span className="rule-stat-value" style={{ color: "#ef4444" }}>{rule.dayDeduction} Day(s)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {showAdd && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal-content">
                        <h3>Create Penalty Rule</h3>
                        <form onSubmit={handleCreate}>
                            <div className="sm-field">
                                <label className="sm-label">Rule Name</label>
                                <input className="sm-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Late Comers > 30m" required />
                            </div>
                            <div className="sm-field">
                                <label className="sm-label">Penalty Type</label>
                                <select className="sm-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                    <option value="LateComing">Late Coming</option>
                                    <option value="EarlyLeaving">Early Leaving</option>
                                    <option value="MissingPunch">Missing Punch</option>
                                    <option value="ShortWorkingHours">Short Working Hours</option>
                                    <option value="LateAfterBreak">Late After Break</option>
                                </select>
                            </div>
                            <div className="sm-grid-2">
                                <div className="sm-field">
                                    <label className="sm-label">Threshold (Min)</label>
                                    <input className="sm-input" type="number" value={form.thresholdMin} onChange={e => setForm({...form, thresholdMin: parseInt(e.target.value)})} required />
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Deduction Amt (₹)</label>
                                    <input className="sm-input" type="number" value={form.deductionAmt} onChange={e => setForm({...form, deductionAmt: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                            <div className="sm-field">
                                <label className="sm-label">Day Deduction (e.g. 0.5 for Half Day)</label>
                                <input className="sm-input" type="number" step="0.1" value={form.dayDeduction} onChange={e => setForm({...form, dayDeduction: parseFloat(e.target.value)})} />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Rule</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .rule-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .rule-stat-label {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .rule-stat-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1e293b;
                }
            `}</style>
        </div>
    );
}

export default ShiftPenaltyRules;
