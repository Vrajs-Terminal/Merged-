import { useState, useEffect } from "react";
import axios from "axios";
import "./applyLeave.css";
import { PenLine, Save, CheckCircle, AlertCircle, Clock, Upload } from "lucide-react";
import { toast } from "../../components/Toast";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;
const EMP_API = `${API_BASE}/employees`;

const EMPTY = { employeeId: "", leaveTypeId: "", startDate: "", endDate: "", days: "1", isHalfDay: false, reason: "", leaveReasonId: "" };
const EMPTY_SHORT = { employeeId: "", date: "", startTime: "", endTime: "", reasonId: "", reason: "" };

export default function ApplyLeave() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [reasons, setReasons] = useState<any[]>([]);
    const [form, setForm] = useState<any>({ ...EMPTY });
    const [shortForm, setShortForm] = useState<any>({ ...EMPTY_SHORT });
    const [mode, setMode] = useState("regular"); // "regular" | "short"
    const [balance, setBalance] = useState<any[]>([]);
    const [msg, setMsg] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            axios.get(`${EMP_API}?limit=500`),
            axios.get(`${API}/types`),
            axios.get(`${API}/reasons`)
        ]).then(([er, tr, rr]) => {
            setEmployees(er.data?.employees || er.data || []);
            setTypes(tr.data);
            setReasons(rr.data);
        }).catch(() => { });
    }, []);

    const fetchBalance = async (empId: string) => {
        if (!empId) { setBalance([]); return; }
        try {
            const r = await axios.get(`${API}/balances/${empId}`);
            setBalance(r.data);
        } catch { setBalance([]); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type, value } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const val = type === "checkbox" ? checked : value;
        if (name === "employeeId") fetchBalance(val as string);

        if (mode === "short") {
            setShortForm((p: any) => ({ ...p, [name]: val }));
            return;
        }

        // Auto-calculate days from dates
        if ((name === "startDate" || name === "endDate") && (name === "startDate" ? val : form.startDate) && (name === "endDate" ? val : form.endDate)) {
            const s = new Date(name === "startDate" ? val : form.startDate);
            const en = new Date(name === "endDate" ? val : form.endDate);
            const diff = Math.max(1, Math.ceil((en.getTime() - s.getTime()) / 86400000) + 1);
            setForm((p: any) => ({ ...p, [name]: val, days: String(diff) }));
            return;
        }
        setForm((p: any) => ({ ...p, [name]: val }));
    };

    const selectedBalance = balance.find(b => b.leaveTypeId === parseInt(form.leaveTypeId));
    const available = selectedBalance ? selectedBalance.total - selectedBalance.used - selectedBalance.pending : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setMsg(null);
        try {
            if (mode === "regular") {
                if (!form.employeeId || !form.leaveTypeId || !form.startDate || !form.endDate || !form.leaveReasonId) {
                    toast.error("Please fill all required fields."); setSaving(false); return;
                }
                const payload = { ...form, leaveReasonId: parseInt(form.leaveReasonId) };
                await axios.post(`${API}/requests`, payload);
                setForm({ ...EMPTY, employeeId: form.employeeId }); // Keep employee selected
            } else {
                if (!shortForm.employeeId || !shortForm.date || !shortForm.startTime || !shortForm.endTime || !shortForm.reasonId) {
                    toast.error("Please fill all required fields."); setSaving(false); return;
                }
                const payload = { ...shortForm, reasonId: parseInt(shortForm.reasonId) };
                await axios.post(`${API}/short`, payload);
                setShortForm({ ...EMPTY_SHORT, employeeId: shortForm.employeeId });
            }
            toast.success(`${mode === 'regular' ? 'Leave' : 'Short Leave'} applied successfully!`);
            fetchBalance(mode === 'regular' ? form.employeeId : shortForm.employeeId);
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to apply.");
        } finally { setSaving(false); }
    };

    return (
        <div className="lm-container lm-fade leave-apply-layout al-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><PenLine size={22} /> Apply Leave</h2>
                    <p className="lm-page-subtitle">Apply leave on behalf of an employee</p>
                </div>
                <div className="lm-tab-switch">
                    <button type="button" onClick={() => {setMode("regular"); setMsg(null);}} className={`lm-tab-button ${mode === "regular" ? "active" : ""}`}>
                        Regular Leave
                    </button>
                    <button type="button" onClick={() => {setMode("short"); setMsg(null);}} className={`lm-tab-button ${mode === "short" ? "active" : ""}`}>
                        <Clock size={14}/> Short Leave
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            <div className="lm-two-col leave-apply-grid">
                <div className="lm-card leave-form-card">
                    <div className="lm-card-title"><PenLine size={16} /> Leave Application</div>

                    <form onSubmit={handleSubmit} className="leave-form-stack">
                        <div className="lm-field">
                            <label className="lm-label">Employee *</label>
                            <select className="lm-select" name="employeeId" value={mode === 'regular' ? form.employeeId : shortForm.employeeId} onChange={handleChange}>
                                <option value="">— Select Employee —</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                            </select>
                        </div>

                        {mode === "regular" ? (
                            <>
                                <div className="lm-two-col">
                                    <div className="lm-field">
                                        <label className="lm-label">Leave Type *</label>
                                        <select className="lm-select" name="leaveTypeId" value={form.leaveTypeId} onChange={handleChange}>
                                            <option value="">— Select Leave Type —</option>
                                            {types.map(t => <option key={t.id} value={t.id}>{t.name} {t.leaveCode ? `(${t.leaveCode})` : ""}</option>)}
                                        </select>
                                    </div>
                                    <div className="lm-field">
                                        <label className="lm-label">Reason Code *</label>
                                        <select className="lm-select" name="leaveReasonId" value={form.leaveReasonId} onChange={handleChange}>
                                            <option value="">— Select Reason —</option>
                                            {reasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="lm-two-col">
                                    <div className="lm-field">
                                        <label className="lm-label">From Date *</label>
                                        <input className="lm-input" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                                    </div>
                                    <div className="lm-field">
                                        <label className="lm-label">To Date *</label>
                                        <input className="lm-input" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="lm-two-col">
                                    <div className="lm-field">
                                        <label className="lm-label">Number of Days</label>
                                        <input className="lm-input" type="number" name="days" min={0.5} step={0.5} value={form.days} onChange={handleChange} />
                                    </div>
                                    <div className="lm-field lm-halfday-field">
                                        <label className="lm-checkbox-row">
                                            <input type="checkbox" name="isHalfDay" checked={form.isHalfDay} onChange={handleChange} />
                                            Half Day Leave
                                        </label>
                                    </div>
                                </div>
                                <div className="lm-field">
                                    <label className="lm-label">Medical/Reason Proof (optional)</label>
                                    <div className="lm-upload-field">
                                        <Upload size={18} color="#94a3b8" />
                                        <input type="file" style={{ fontSize: "0.85rem" }} />
                                    </div>
                                </div>
                                <div className="lm-field">
                                    <label className="lm-label">Additional Comments</label>
                                    <textarea className="lm-textarea" name="reason" value={form.reason} onChange={handleChange} placeholder="Any more details..." />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="lm-field">
                                    <label className="lm-label">Date *</label>
                                    <input className="lm-input" type="date" name="date" value={shortForm.date} onChange={handleChange} />
                                </div>
                                <div className="lm-two-col">
                                    <div className="lm-field">
                                        <label className="lm-label">Start Time *</label>
                                        <input className="lm-input" type="time" name="startTime" value={shortForm.startTime} onChange={handleChange} />
                                    </div>
                                    <div className="lm-field">
                                        <label className="lm-label">End Time *</label>
                                        <input className="lm-input" type="time" name="endTime" value={shortForm.endTime} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="lm-field">
                                    <label className="lm-label">Reason Code *</label>
                                    <select className="lm-select" name="reasonId" value={shortForm.reasonId} onChange={handleChange}>
                                        <option value="">— Select Reason —</option>
                                        {reasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="lm-field">
                                    <label className="lm-label">Additional Comments</label>
                                    <textarea className="lm-textarea" name="reason" value={shortForm.reason} onChange={handleChange} placeholder="Any more details..." />
                                </div>
                            </>
                        )}
                        <button className="lm-btn-primary" type="submit" disabled={saving}>
                            <Save size={14} /> {saving ? "Submitting..." : "Submit Leave Request"}
                        </button>
                    </form>
                </div>

                <div className="lm-card leave-balance-card">
                    <div className="lm-card-title">Current Leave Balance</div>
                    {!form.employeeId ? (
                        <div className="lm-empty leave-empty-state">Select an employee to view live leave balance and availability.</div>
                    ) : balance.length === 0 ? (
                        <div className="lm-empty leave-empty-state">No balance data. Balances not initialized for this employee.</div>
                    ) : balance.map(b => {
                        const avail = b.total - b.used - b.pending;
                        const pct = b.total > 0 ? Math.min(100, (avail / b.total) * 100) : 0;
                        const isSelected = b.leaveTypeId === parseInt(form.leaveTypeId);
                        return (
                            <div key={b.id} className={`leave-balance-row ${isSelected ? "selected" : ""}`}>
                                <div className="leave-balance-row-top">
                                    <span className="leave-balance-name">{b.leaveType?.name}</span>
                                    <span className="leave-balance-value"><strong className={avail > 0 ? "text-success" : "text-danger"}>{avail}</strong> / {b.total} avail</span>
                                </div>
                                <div className="lm-balance-bar-wrap">
                                    <div className="lm-balance-bar" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="leave-balance-meta">Used: {b.used} · Pending: {b.pending}</div>
                            </div>
                        );
                    })}
                    {form.leaveTypeId && available !== null && (
                        <div className={`lm-alert ${parseFloat(form.days) > (available ?? 0) ? "lm-alert-error" : "lm-alert-success"}`}>
                            {parseFloat(form.days) > (available ?? 0)
                                ? <><AlertCircle size={15} /> Insufficient balance (<strong>{available}</strong> days available, requesting <strong>{form.days}</strong>)</>
                                : <><CheckCircle size={15} /> Balance sufficient — <strong>{available}</strong> days available</>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
