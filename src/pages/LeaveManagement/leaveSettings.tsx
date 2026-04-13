import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveSettings.css";
import { SlidersHorizontal, Save, CheckCircle, AlertCircle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

export default function LeaveSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<any>(null);

    useEffect(() => {
        axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => { });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
        setSettings((p: any) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSave = async () => {
        setSaving(true); setMsg(null);
        try {
            const data = {
                ...settings,
                minLeaveDays: parseFloat(settings.minLeaveDays),
                maxLeaveDays: parseInt(settings.maxLeaveDays),
                noticePeriodDays: parseInt(settings.noticePeriodDays),
                autoApproveAfterDays: parseInt(settings.autoApproveAfterDays),
            };
            await axios.put(`${API}/settings`, data);
            setMsg({ type: "success", text: "Settings saved successfully!" });
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed to save." });
        } finally { setSaving(false); }
    };

    if (!settings) return <div className="lm-container lset-page"><div className="lm-loading">Loading settings...</div></div>;

    const ToggleField = ({ name, label, desc }: { name: string; label: string; desc?: string }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #f1f5f9" }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>{label}</div>
                {desc && <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem" }}>{desc}</div>}
            </div>
            <label className="lm-toggle">
                <input type="checkbox" name={name} checked={!!settings[name]} onChange={handleChange} />
                <span className="lm-toggle-slider" />
            </label>
        </div>
    );

    return (
        <div className="lm-container lm-fade lset-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><SlidersHorizontal size={22} /> Leave Settings</h2>
                    <p className="lm-page-subtitle">Configure global leave management rules for your organization</p>
                </div>
                <button className="lm-btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={14} /> {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            <div className="lm-two-col" style={{ alignItems: "start" }}>
                <div className="lm-card">
                    <div className="lm-card-title">📋 Leave Duration Rules</div>
                    <div className="lm-two-col">
                        <div className="lm-field">
                            <label className="lm-label">Minimum Leave Days</label>
                            <input className="lm-input" type="number" name="minLeaveDays" min={0.5} step={0.5} value={settings.minLeaveDays ?? 0.5} onChange={handleChange} />
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Minimum days an employee can apply</span>
                        </div>
                        <div className="lm-field">
                            <label className="lm-label">Maximum Leave Days (per request)</label>
                            <input className="lm-input" type="number" name="maxLeaveDays" min={1} value={settings.maxLeaveDays ?? 30} onChange={handleChange} />
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Maximum days per single leave application</span>
                        </div>
                        <div className="lm-field">
                            <label className="lm-label">Notice Period (days before leave)</label>
                            <input className="lm-input" type="number" name="noticePeriodDays" min={0} value={settings.noticePeriodDays ?? 1} onChange={handleChange} />
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>How many days in advance must leave be applied</span>
                        </div>
                        <div className="lm-field">
                            <label className="lm-label">Auto-Approve After (days)</label>
                            <input className="lm-input" type="number" name="autoApproveAfterDays" min={0} value={settings.autoApproveAfterDays ?? 0} onChange={handleChange} />
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>0 = disabled. Auto-approves if not acted upon in N days</span>
                        </div>
                    </div>
                </div>

                <div className="lm-card">
                    <div className="lm-card-title">⚙️ Policy Toggles</div>

                    <ToggleField name="sandwichRule" label="Sandwich Leave Rule"
                        desc="If employee takes leave on Fri & Mon, Sat & Sun count as leave too" />

                    <ToggleField name="allowCancelBefore" label="Allow Cancellation Before Leave Starts"
                        desc="Employees can cancel approved leave before the start date" />

                    <ToggleField name="allowCancelAfter" label="Allow Cancellation After Approval"
                        desc="Even after HR/Manager approval, leave can be cancelled" />

                    <div style={{ marginTop: "1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.85rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e40af", fontSize: "0.88rem", marginBottom: "0.3rem" }}>ℹ️ Sandwich Rule Example</div>
                        <div style={{ fontSize: "0.78rem", color: "#374151" }}>
                            Employee takes leave on <strong>Friday</strong> and <strong>Monday</strong>.
                            With Sandwich Rule <strong>ON</strong>: Saturday & Sunday are also counted as leave days.
                            With Sandwich Rule <strong>OFF</strong>: Only Friday & Monday count.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
