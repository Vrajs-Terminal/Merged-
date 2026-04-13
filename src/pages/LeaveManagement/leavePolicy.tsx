import { useState, useEffect } from "react";
import axios from "axios";
import "./leavePolicy.css";
import { Settings, Save, CheckCircle, AlertCircle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

export default function LeavePolicy() {
    const [types, setTypes] = useState<any[]>([]);
    const [_policies, setPolicies] = useState<any[]>([]);
    const [forms, setForms] = useState<any>({});
    const [msg, setMsg] = useState<any>(null);
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([axios.get(`${API}/types`), axios.get(`${API}/policies`)]).then(([tr, pr]) => {
            setTypes(tr.data);
            const pMap: any = {};
            pr.data.forEach((p: any) => { pMap[p.leaveTypeId] = p; });
            const fMap: any = {};
            tr.data.forEach((t: any) => {
                const p = pMap[t.id];
                fMap[t.id] = {
                    daysPerYear: p?.daysPerYear ?? t.defaultDays, maxPerMonth: p?.maxPerMonth ?? 0,
                    accrualType: p?.accrualType ?? "Yearly", docAfterDays: p?.docAfterDays ?? 0,
                    noticeDays: p?.noticeDays ?? 0, carryForwardMax: p?.carryForwardMax ?? 0
                };
            });
            setForms(fMap); setPolicies(pr.data);
        }).catch(() => { });
    }, []);

    const handleChange = (typeId: number, field: string, value: string) => {
        setForms((p: any) => ({ ...p, [typeId]: { ...p[typeId], [field]: value } }));
    };

    const handleSave = async (t: any) => {
        setSaving(t.id); setMsg(null);
        try {
            const f = forms[t.id];
            await axios.post(`${API}/policies`, {
                leaveTypeId: t.id,
                daysPerYear: parseInt(f.daysPerYear) || 0,
                maxPerMonth: parseInt(f.maxPerMonth) || 0,
                accrualType: f.accrualType,
                docAfterDays: parseInt(f.docAfterDays) || 0,
                noticeDays: parseInt(f.noticeDays) || 0,
                carryForwardMax: parseInt(f.carryForwardMax) || 0,
            });
            setMsg({ type: "success", text: `Policy saved for ${t.name}` });
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed to save." });
        } finally { setSaving(null); }
    };

    return (
        <div className="lm-container lm-fade lpol-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><Settings size={22} /> Leave Policy</h2>
                    <p className="lm-page-subtitle">Define detailed rules for each leave type</p>
                </div>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            {types.length === 0
                ? <div className="lm-card"><div className="lm-empty">No leave types found. Create leave types first from the Leave Types page.</div></div>
                : types.map(t => (
                    <div className="lm-card" key={t.id}>
                        <div className="lm-card-title">
                            <span className="lm-badge lm-badge-purple" style={{ marginRight: 6 }}>{t.leaveCode || "—"}</span>
                            {t.name} — Policy Rules
                        </div>
                        <div className="lm-three-col">
                            <div className="lm-field">
                                <label className="lm-label">Days Allowed / Year</label>
                                <input className="lm-input" type="number" min={0}
                                    value={forms[t.id]?.daysPerYear ?? ""} onChange={e => handleChange(t.id, "daysPerYear", e.target.value)} />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Max per Month</label>
                                <input className="lm-input" type="number" min={0}
                                    value={forms[t.id]?.maxPerMonth ?? ""} onChange={e => handleChange(t.id, "maxPerMonth", e.target.value)} />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Accrual Type</label>
                                <select className="lm-select" value={forms[t.id]?.accrualType ?? "Yearly"} onChange={e => handleChange(t.id, "accrualType", e.target.value)}>
                                    <option value="Yearly">Yearly (credited on Jan 1)</option>
                                    <option value="Monthly">Monthly (1/12th per month)</option>
                                </select>
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Doc Required After (days)</label>
                                <input className="lm-input" type="number" min={0}
                                    value={forms[t.id]?.docAfterDays ?? ""} onChange={e => handleChange(t.id, "docAfterDays", e.target.value)} />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Notice Period (days)</label>
                                <input className="lm-input" type="number" min={0}
                                    value={forms[t.id]?.noticeDays ?? ""} onChange={e => handleChange(t.id, "noticeDays", e.target.value)} />
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Max Carry Forward Days</label>
                                <input className="lm-input" type="number" min={0}
                                    value={forms[t.id]?.carryForwardMax ?? ""} onChange={e => handleChange(t.id, "carryForwardMax", e.target.value)} />
                            </div>
                        </div>
                        <button className="lm-btn-primary" onClick={() => handleSave(t)} disabled={saving === t.id}>
                            <Save size={14} /> {saving === t.id ? "Saving..." : "Save Policy"}
                        </button>
                    </div>
                ))}
        </div>
    );
}
