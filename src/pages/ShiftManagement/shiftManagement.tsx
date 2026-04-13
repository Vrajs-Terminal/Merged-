import { useState, useEffect } from "react";
import axios from "axios";
import "./shiftManagement.css";
import {
    Clock,
    Layers,
    UserCheck,
    Users,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { toast } from "../../components/Toast";

import API_BASE from "../api";
const API = `${API_BASE}/shifts`;

// ─── Reusable sub-components (MUST be defined outside parent to avoid remount on re-render) ───
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="sm-section">
        <div className="sm-section-title">{title}</div>
        <div className="sm-section-body">{children}</div>
    </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="sm-field">
        <label className="sm-label">{label}</label>
        {children}
    </div>
);

const defaultForm = {
    shiftName: "",
    shiftCode: "",
    department: "",
    description: "",
    startTime: "09:00",
    endTime: "18:00",
    totalWorkHours: 8,
    breakTime: 1,
    gracePeriod: 10,
    lateAfterMin: 15,
    earlyLeaveAllowed: true,
    earlyLeaveBeforeMin: 30,
    halfDayHours: 4,
    absentIfNoPunchAfterMin: 120,
    overtimeAllowed: false,
    minOvertimeMin: 30,
    maxOvertimeHours: 4,
    overtimeRateType: "1.5x",
    breakType: "Fixed",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
    geoFenceEnabled: false,
    officeLatitude: "",
    officeLongitude: "",
    allowedRadiusM: 200,
    weeklyOffDays: "Sunday",
    halfDayOffDays: "",
    weeklyOffPattern: "",
    nextDayGraceTime: 0,
};

function ShiftManagement({ selectedShift, setSelectedShift, setActivePage }: any) {
    const [form, setForm] = useState<any>({ ...defaultForm });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [stats, setStats] = useState<any>({ totalShifts: 0, activeAssignments: 0, totalRotations: 0 });

    useEffect(() => {
        axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => { });
        if (selectedShift) {
            setForm({ ...selectedShift });
        }
    }, [selectedShift]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev: any) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const payload = {
                ...form,
                totalWorkHours: parseFloat(form.totalWorkHours),
                breakTime: parseFloat(form.breakTime),
                gracePeriod: parseInt(form.gracePeriod),
                lateAfterMin: parseInt(form.lateAfterMin),
                earlyLeaveBeforeMin: parseInt(form.earlyLeaveBeforeMin),
                halfDayHours: parseFloat(form.halfDayHours),
                absentIfNoPunchAfterMin: parseInt(form.absentIfNoPunchAfterMin),
                minOvertimeMin: parseInt(form.minOvertimeMin),
                maxOvertimeHours: parseFloat(form.maxOvertimeHours),
                allowedRadiusM: parseInt(form.allowedRadiusM),
                officeLatitude: form.officeLatitude ? parseFloat(form.officeLatitude) : null,
                officeLongitude: form.officeLongitude ? parseFloat(form.officeLongitude) : null,
                nextDayGraceTime: parseInt(form.nextDayGraceTime),
            };

            if (selectedShift) {
                await axios.put(`${API}/${selectedShift.id}`, payload);
                toast.success("Shift updated successfully!");
                setSelectedShift(null);
                setActivePage("shiftList");
            } else {
                await axios.post(API, payload);
                toast.success("Shift created successfully!");
                setForm({ ...defaultForm });
            }

            const r = await axios.get(`${API}/stats`);
            setStats(r.data);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Failed to process shift.";
            toast.error(errorMsg);
            setMsg({ type: "error", text: errorMsg });
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="sm-container fade-in">
            {/* Page Header */}
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><Clock size={22} /> {selectedShift ? "Edit Shift" : "Shift Management"}</h2>
                    <p className="sm-page-subtitle">{selectedShift ? `Modifying settings for ${selectedShift.shiftName}` : "Create and configure working shifts for your organization"}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="sm-stats-row">
                <div className="sm-stat-card">
                    <div className="sm-stat-icon-wrap">
                        <Users size={22} />
                    </div>
                    <div className="sm-stat-label">Total Shifts</div>
                    <div className="sm-stat-value">{stats.totalShifts}</div>
                </div>
                <div className="sm-stat-card">
                    <div className="sm-stat-icon-wrap">
                        <UserCheck size={22} />
                    </div>
                    <div className="sm-stat-label">Active Assignments</div>
                    <div className="sm-stat-value">{stats.activeAssignments}</div>
                </div>
                <div className="sm-stat-card">
                    <div className="sm-stat-icon-wrap">
                        <Layers size={22} />
                    </div>
                    <div className="sm-stat-label">Rotation Plans</div>
                    <div className="sm-stat-value">{stats.totalRotations}</div>
                </div>
            </div>

            {msg && (
                <div className={`sm-alert sm-alert-${msg.type}`}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="sm-form">
                <Section title="📋 Basic Information">
                    <div className="sm-grid-2">
                        <Field label="Shift Name *">
                            <input className="sm-input" name="shiftName" value={form.shiftName} onChange={handleChange} placeholder="e.g. General Shift" required />
                        </Field>
                        <Field label="Shift Code">
                            <input className="sm-input" name="shiftCode" value={form.shiftCode} onChange={handleChange} placeholder="e.g. GEN-01" />
                        </Field>
                        <Field label="Department (optional)">
                            <input className="sm-input" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Sales, IT" />
                        </Field>
                        <Field label="Description">
                            <input className="sm-input" name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
                        </Field>
                    </div>
                </Section>

                <Section title="⏰ Time Settings">
                    <div className="sm-grid-3">
                        <Field label="Start Time *">
                            <input className="sm-input" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                        </Field>
                        <Field label="End Time *">
                            <input className="sm-input" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                        </Field>
                        <Field label="Total Working Hours">
                            <input className="sm-input" type="number" name="totalWorkHours" value={form.totalWorkHours} onChange={handleChange} min={1} max={24} step={0.5} />
                        </Field>
                        <Field label="Break Time (hours)">
                            <input className="sm-input" type="number" name="breakTime" value={form.breakTime} onChange={handleChange} min={0} max={4} step={0.25} />
                        </Field>
                        <Field label="Break Type">
                            <select className="sm-select" name="breakType" value={form.breakType} onChange={handleChange}>
                                <option value="Fixed">Fixed Break</option>
                                <option value="Flexible">Flexible Break</option>
                            </select>
                        </Field>
                    </div>
                    {form.breakType === "Fixed" && (
                        <div className="sm-grid-2" style={{ marginTop: "0.75rem" }}>
                            <Field label="Break Start Time">
                                <input className="sm-input" type="time" name="breakStartTime" value={form.breakStartTime} onChange={handleChange} />
                            </Field>
                            <Field label="Break End Time">
                                <input className="sm-input" type="time" name="breakEndTime" value={form.breakEndTime} onChange={handleChange} />
                            </Field>
                        </div>
                    )}
                    <div className="sm-grid-1" style={{ marginTop: "0.75rem" }}>
                        <Field label="Next Day Grace Time (minutes) - For Midnight Shifts">
                            <input className="sm-input" type="number" name="nextDayGraceTime" value={form.nextDayGraceTime} onChange={handleChange} min={0} max={120} placeholder="Extra time allowed on the next day" />
                        </Field>
                    </div>
                </Section>

                <Section title="⚠️ Late Coming Rules">
                    <div className="sm-grid-2">
                        <Field label="Grace Time (minutes)">
                            <input className="sm-input" type="number" name="gracePeriod" value={form.gracePeriod} onChange={handleChange} min={0} max={60} />
                        </Field>
                        <Field label="Mark Late After (minutes from start)">
                            <input className="sm-input" type="number" name="lateAfterMin" value={form.lateAfterMin} onChange={handleChange} min={0} max={120} />
                        </Field>
                    </div>
                </Section>

                <Section title="🚪 Early Leaving Settings">
                    <div className="sm-grid-2">
                        <Field label="Early Leave Allowed">
                            <label className="sm-toggle">
                                <input type="checkbox" name="earlyLeaveAllowed" checked={form.earlyLeaveAllowed} onChange={handleChange} />
                                <span className="sm-toggle-slider"></span>
                            </label>
                        </Field>
                        <Field label="Early Leave Before (minutes before end)">
                            <input className="sm-input" type="number" name="earlyLeaveBeforeMin" value={form.earlyLeaveBeforeMin} onChange={handleChange} min={0} max={120} disabled={!form.earlyLeaveAllowed} />
                        </Field>
                    </div>
                </Section>

                <Section title="📊 Half Day & Absent Rules">
                    <div className="sm-grid-2">
                        <Field label="Half Day if worked less than (hours)">
                            <input className="sm-input" type="number" name="halfDayHours" value={form.halfDayHours} onChange={handleChange} min={1} max={8} step={0.5} />
                        </Field>
                        <Field label="Mark Absent if no punch after (minutes from start)">
                            <input className="sm-input" type="number" name="absentIfNoPunchAfterMin" value={form.absentIfNoPunchAfterMin} onChange={handleChange} min={30} max={480} />
                        </Field>
                    </div>
                </Section>

                <Section title="🕐 Overtime Settings">
                    <div className="sm-grid-2">
                        <Field label="Overtime Allowed">
                            <label className="sm-toggle">
                                <input type="checkbox" name="overtimeAllowed" checked={form.overtimeAllowed} onChange={handleChange} />
                                <span className="sm-toggle-slider"></span>
                            </label>
                        </Field>
                        <Field label="Overtime Rate Type">
                            <select className="sm-select" name="overtimeRateType" value={form.overtimeRateType} onChange={handleChange} disabled={!form.overtimeAllowed}>
                                <option value="1x">1x (Normal Rate)</option>
                                <option value="1.5x">1.5x (Standard OT)</option>
                                <option value="2x">2x (Double Rate)</option>
                            </select>
                        </Field>
                        <Field label="Min Overtime (minutes)">
                            <input className="sm-input" type="number" name="minOvertimeMin" value={form.minOvertimeMin} onChange={handleChange} min={15} max={120} disabled={!form.overtimeAllowed} />
                        </Field>
                        <Field label="Max Overtime (hours)">
                            <input className="sm-input" type="number" name="maxOvertimeHours" value={form.maxOvertimeHours} onChange={handleChange} min={0.5} max={12} step={0.5} disabled={!form.overtimeAllowed} />
                        </Field>
                    </div>
                </Section>

                <Section title="📅 Weekly Off Settings">
                    <div className="sm-grid-2">
                        <Field label="Weekly Off Days (comma-separated)">
                            <input className="sm-input" name="weeklyOffDays" value={form.weeklyOffDays} onChange={handleChange} placeholder="e.g. Saturday,Sunday" />
                        </Field>
                        <Field label="Half Day Off Days">
                            <input className="sm-input" name="halfDayOffDays" value={form.halfDayOffDays} onChange={handleChange} placeholder="e.g. Saturday" />
                        </Field>
                        <Field label="Weekly Off Pattern (e.g. 2nd,4th Saturday)">
                            <input className="sm-input" name="weeklyOffPattern" value={form.weeklyOffPattern} onChange={handleChange} placeholder="Custom patterns like 2nd Saturday off" />
                        </Field>
                    </div>
                </Section>

                <Section title="📍 Geo-Fence Settings (Employee Tracking)">
                    <div className="sm-grid-2">
                        <Field label="Enable Geo-Fence">
                            <label className="sm-toggle">
                                <input type="checkbox" name="geoFenceEnabled" checked={form.geoFenceEnabled} onChange={handleChange} />
                                <span className="sm-toggle-slider"></span>
                            </label>
                        </Field>
                        <Field label="Allowed Radius (meters)">
                            <input className="sm-input" type="number" name="allowedRadiusM" value={form.allowedRadiusM} onChange={handleChange} min={50} max={5000} disabled={!form.geoFenceEnabled} />
                        </Field>
                        <Field label="Office Latitude">
                            <input className="sm-input" type="number" name="officeLatitude" value={form.officeLatitude} onChange={handleChange} step="any" placeholder="e.g. 28.6139" disabled={!form.geoFenceEnabled} />
                        </Field>
                        <Field label="Office Longitude">
                            <input className="sm-input" type="number" name="officeLongitude" value={form.officeLongitude} onChange={handleChange} step="any" placeholder="e.g. 77.2090" disabled={!form.geoFenceEnabled} />
                        </Field>
                    </div>
                </Section>

                <div className="sm-form-actions">
                    <button type="button" className="btn-secondary" onClick={() => { setForm({ ...defaultForm }); setSelectedShift(null); }}>
                        <RotateCcw size={16} /> {selectedShift ? "Cancel Edit" : "Reset"}
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        <Save size={16} /> {saving ? "Saving..." : (selectedShift ? "Update Shift" : "Create Shift")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ShiftManagement;
