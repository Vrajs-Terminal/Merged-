import { useState, useEffect } from "react";
import axios from "axios";
import "./shiftReports.css";
import { BarChart2, Download, Clock, UserX, TrendingUp, Coffee } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}`;

function ShiftReports() {
    const [shifts, setShifts] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShift, setSelectedShift] = useState<string>("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [shiftRes, assignRes, holidayRes, ruleRes] = await Promise.all([
                    axios.get(`${API}/shifts`),
                    axios.get(`${API}/shifts/assignments/list`),
                    axios.get(`${API}/holidays`),
                    axios.get(`${API}/shifts/penalty-rules`)
                ]);
                setShifts(shiftRes.data.shifts);
                setAssignments(assignRes.data.assignments);
                setHolidays(holidayRes.data.holidays || []);
                setRules(ruleRes.data.rules || []);
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalAssigned = assignments.filter(a => a.isActive).length;
    const totalShifts = shifts.length;

    const shiftStats = shifts.map(s => ({
        ...s,
        assigned: assignments.filter(a => a.shiftId === s.id && a.isActive).length
    }));

    const filteredStats = selectedShift === "all"
        ? shiftStats
        : shiftStats.filter(s => s.id === parseInt(selectedShift));

    const exportCSV = () => {
        const rows = [
            ["Shift Name", "Code", "Timing", "Department", "OT Allowed", "Active Employees"],
            ...shiftStats.map(s => [
                s.shiftName, s.shiftCode || "", `${s.startTime}-${s.endTime}`,
                s.department || "All",
                s.overtimeAllowed ? "Yes" : "No",
                s.assigned
            ])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shift_report_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const assignmentsByShift = (shiftId: number) =>
        assignments.filter(a => a.shiftId === shiftId && a.isActive);

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><BarChart2 size={22} /> Shift Reports</h2>
                    <p className="sm-page-subtitle">Overview of shift-wise employee distribution and configuration</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <select className="sm-select" style={{ width: 200 }} value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
                        <option value="all">All Shifts</option>
                        {shifts.map(s => <option key={s.id} value={s.id}>{s.shiftName}</option>)}
                    </select>
                    <button className="btn-secondary" onClick={exportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="sm-report-grid">
                <div className="sm-report-card" style={{ borderLeft: "4px solid #6366f1" }}>
                    <div className="sm-report-card-title">Total Shifts Configured</div>
                    <div className="sm-report-card-value" style={{ color: "#6366f1" }}>{totalShifts}</div>
                </div>
                <div className="sm-report-card" style={{ borderLeft: "4px solid #10b981" }}>
                    <div className="sm-report-card-title">Active Employee Assignments</div>
                    <div className="sm-report-card-value" style={{ color: "#10b981" }}>{totalAssigned}</div>
                </div>
                <div className="sm-report-card" style={{ borderLeft: "4px solid #f59e0b" }}>
                    <div className="sm-report-card-title">Shifts with OT Enabled</div>
                    <div className="sm-report-card-value" style={{ color: "#f59e0b" }}>{shifts.filter(s => s.overtimeAllowed).length}</div>
                </div>
                <div className="sm-report-card" style={{ borderLeft: "4px solid #f43f5e" }}>
                    <div className="sm-report-card-title">Total Company Holidays</div>
                    <div className="sm-report-card-value" style={{ color: "#f43f5e" }}>{holidays.length}</div>
                </div>
            </div>

            {loading ? <div className="sm-loading">Loading shift data...</div> : (
                <>
                    {/* Shift-wise Distribution */}
                    <div className="sm-section" style={{ marginBottom: "1.25rem" }}>
                        <div className="sm-section-title">📊 Shift-Wise Employee Distribution</div>
                        <div className="sm-section-body">
                            {filteredStats.length === 0
                                ? <div className="sm-empty">No shifts created yet.</div>
                                : filteredStats.map((s: any) => {
                                    const pct = totalAssigned > 0 ? Math.round((s.assigned / totalAssigned) * 100) : 0;
                                    return (
                                        <div key={s.id} style={{ marginBottom: "1.25rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                                <div>
                                                    <strong>{s.shiftName}</strong>
                                                    <span style={{ color: "#6b7280", fontSize: "0.8rem", marginLeft: "0.5rem" }}>
                                                        {s.startTime} – {s.endTime} • {s.department || "All Depts"}
                                                    </span>
                                                </div>
                                                <span className="sm-badge sm-badge-purple">{s.assigned} employees</span>
                                            </div>
                                            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                                                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 99, transition: "width 0.5s ease" }} />
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>{pct}% of total workforce</div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>

                    {/* Shift Policy Summary */}
                    <div className="sm-section">
                        <div className="sm-section-title">⚙️ Shift Policy Summary</div>
                        <div style={{ overflowX: "auto" }}>
                            <table className="sm-table">
                                <thead>
                                    <tr>
                                        <th>Shift</th><th>Timing</th><th>Grace</th><th>Late After</th>
                                        <th>Half Day &lt;</th><th>Break</th><th>OT</th><th>Weekly Off</th>
                                        <th>Geo</th><th>Employees</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedShift === "all" ? shiftStats : shiftStats.filter(s => s.id === parseInt(selectedShift))).length === 0
                                        ? <tr><td colSpan={10} className="sm-empty">No data.</td></tr>
                                        : (selectedShift === "all" ? shiftStats : shiftStats.filter(s => s.id === parseInt(selectedShift))).map((s: any) => (
                                            <tr key={s.id}>
                                                <td>
                                                    <strong>{s.shiftName}</strong>
                                                    {s.shiftCode && <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{s.shiftCode}</div>}
                                                </td>
                                                <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{s.startTime}–{s.endTime}</td>
                                                <td>{s.gracePeriod} min</td>
                                                <td>+{s.lateAfterMin} min</td>
                                                <td>{s.halfDayHours} hrs</td>
                                                <td>{s.breakTime}h ({s.breakType})</td>
                                                <td>
                                                    {s.overtimeAllowed
                                                        ? <span className="sm-badge sm-badge-orange">{s.overtimeRateType}</span>
                                                        : <span style={{ color: "#9ca3af" }}>—</span>}
                                                </td>
                                                <td style={{ fontSize: "0.8rem" }}>{s.weeklyOffDays || "—"}</td>
                                                <td>
                                                    {s.geoFenceEnabled
                                                        ? <span className="sm-badge sm-badge-blue">{s.allowedRadiusM}m</span>
                                                        : <span style={{ color: "#9ca3af" }}>Off</span>}
                                                </td>
                                                <td><span className="sm-badge sm-badge-purple">{s.assigned}</span></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* Penalty & Holiday Connection */}
                    <div className="sm-grid-2" style={{ marginTop: "1.25rem" }}>
                        <div className="sm-section">
                            <div className="sm-section-title">⚖️ Active Penalty Rules</div>
                            <div className="sm-section-body">
                                {rules.length === 0 ? <div className="sm-empty">No rules configured.</div> : rules.map((r: any) => (
                                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <span>{r.name} ({r.type})</span>
                                        <span style={{ fontWeight: 600 }}>₹{r.deductionAmt} / {r.dayDeduction} day</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sm-section">
                            <div className="sm-section-title">📅 Upcoming Holidays</div>
                            <div className="sm-section-body">
                                {holidays.length === 0 ? <div className="sm-empty">No holidays set.</div> : holidays.slice(0, 5).map((h: any) => (
                                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <span>{h.name}</span>
                                        <span style={{ color: "#64748b" }}>{new Date(h.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Employee breakdown per shift (if specific shift selected) */}
                    {selectedShift !== "all" && (
                        <div className="sm-section" style={{ marginTop: "1.25rem" }}>
                            <div className="sm-section-title">👥 Assigned Employees</div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="sm-table">
                                    <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {assignmentsByShift(parseInt(selectedShift)).length === 0
                                            ? <tr><td colSpan={6} className="sm-empty">No employees assigned to this shift.</td></tr>
                                            : assignmentsByShift(parseInt(selectedShift)).map((a: any) => (
                                                <tr key={a.id}>
                                                    <td><strong>{a.employee?.firstName} {a.employee?.lastName}</strong></td>
                                                    <td>{a.employee?.employeeId}</td>
                                                    <td>{a.employee?.department || "—"}</td>
                                                    <td>{a.startDate?.split("T")[0]}</td>
                                                    <td>{a.endDate?.split("T")[0] || <span style={{ color: "#9ca3af" }}>Ongoing</span>}</td>
                                                    <td><span className={`sm-badge ${a.isActive ? "sm-badge-active" : "sm-badge-inactive"}`}>{a.isActive ? "Active" : "Inactive"}</span></td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Connection Info */}
                    <div className="sm-section" style={{ marginTop: "1.25rem" }}>
                        <div className="sm-section-title">🔗 Module Connections</div>
                        <div className="sm-section-body">
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                                {[
                                    { icon: Clock, label: "Attendance Module", desc: "Late/early logic based on shift times", color: "#6366f1" },
                                    { icon: TrendingUp, label: "Payroll Module", desc: "OT hours feed into payslip calculations", color: "#10b981" },
                                    { icon: Coffee, label: "Leave Module", desc: "Leave days vs shift schedule for net pay", color: "#f59e0b" },
                                    { icon: UserX, label: "Overtime Module", desc: "Validated based on per-shift OT rules", color: "#8b5cf6" },
                                    { icon: BarChart2, label: "Employee Tracking", desc: "Geo-fence rules per shift for punch-in", color: "#ec4899" },
                                ].map(({ icon: Icon, label, desc, color }) => (
                                    <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1rem", borderLeft: `3px solid ${color}` }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                            <Icon size={16} style={{ color }} />
                                            <strong style={{ fontSize: "0.85rem" }}>{label}</strong>
                                        </div>
                                        <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ShiftReports;
