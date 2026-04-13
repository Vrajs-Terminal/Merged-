import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveCalendar.css";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899", "#14b8a6"];

export default function LeaveCalendar() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [leaves, setLeaves] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/calendar?month=${month}&year=${year}`),
            axios.get(`${API_BASE}/holidays`) // Fetching all holidays
        ]).then(([lr, hr]) => {
            setLeaves(lr.data);
            setHolidays(hr.data.holidays || hr.data || []);
        }).catch(() => { });
    }, [month, year]);

    const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const dayLeaves = (day: number) => {
        if (!day) return [];
        const date = new Date(year, month - 1, day);
        return leaves.filter(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
            return date >= start && date <= end;
        });
    };

    const dayHolidays = (day: number) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays.filter(h => h.date && h.date.startsWith(dateStr));
    };

    // Assign employee-consistent colour
    const empColors: any = {};
    let ci = 0;
    leaves.forEach(l => { if (!empColors[l.employeeId]) { empColors[l.employeeId] = COLORS[ci++ % COLORS.length]; } });

    const dayLeavesForSelected = selected ? dayLeaves(selected) : [];

    return (
        <div className="lm-container lm-fade lc-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><Calendar size={22} /> Leave Calendar</h2>
                    <p className="lm-page-subtitle">Monthly view of approved employee leaves</p>
                </div>
                <div className="lc-month-nav">
                    <button className="lm-btn-secondary lc-month-nav-btn" onClick={prev}><ChevronLeft size={16} /></button>
                    <span className="lc-month-label">{MONTHS[month - 1]} {year}</span>
                    <button className="lm-btn-secondary lc-month-nav-btn" onClick={next}><ChevronRight size={16} /></button>
                </div>
            </div>

            {/* Summary badges */}
            <div className="lc-legend-row">
                {[...new Set(leaves.map(l => l.employeeId))].map(empId => {
                    const l = leaves.find(x => x.employeeId === empId);
                    return (
                        <span key={empId} className="lm-badge lc-legend-badge" style={{ background: empColors[empId] + "22", color: empColors[empId], border: `1px solid ${empColors[empId]}44` }}>
                            {l?.employee?.firstName} {l?.employee?.lastName}
                        </span>
                    );
                })}
                {leaves.length === 0 && <span className="lm-badge lm-badge-gray lc-legend-badge">No approved leaves this month</span>}
            </div>

            <div className="lm-card lc-calendar-card">
                {/* Day headers */}
                <div className="lm-cal-grid lc-cal-days-header">
                    {DAYS.map(d => <div key={d} className="lm-cal-day-name">{d}</div>)}
                </div>
                <div className="lm-cal-grid">
                    {cells.map((day, i) => {
                        if (!day) return <div key={i} className="lm-cal-cell other-month" />;
                        const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                        const isWeekend = (i % 7 === 0) || (i % 7 === 6); // Sunday = 0, Saturday = 6
                        const dl = dayLeaves(day);
                        const dh = dayHolidays(day);
                        
                        return (
                            <div key={i} className={`lm-cal-cell lc-cal-cell${isToday ? " today" : ""}${isWeekend ? " lc-cal-weekend" : ""}`}
                                style={{ 
                                    cursor: (dl.length > 0 || dh.length > 0) ? "pointer" : "default",
                                }}
                                onClick={() => setSelected(day === selected ? null : ((dl.length > 0 || dh.length > 0) ? day : null))}>
                                <div className="lc-cal-top">
                                    <div className={`lm-cal-date ${isWeekend ? "lc-cal-date-muted" : ""}`}>{day}</div>
                                    {isWeekend && <div className="lc-weekend-tag">W.O</div>}
                                </div>
                                
                                {dh.map((h: any) => (
                                    <span key={`h-${h.id}`} className="lm-leave-pill lc-holiday-pill"
                                        style={{ background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca" }}>
                                        🎈 {h.name}
                                    </span>
                                ))}
                                
                                {dl.slice(0, 3).map((l: any) => (
                                    <span key={l.id} className="lm-leave-pill lc-leave-pill"
                                        style={{ background: empColors[l.employeeId] + "22", color: empColors[l.employeeId] }}>
                                        {l.employee?.firstName} {l.employee?.lastName?.[0]}.
                                    </span>
                                ))}
                                {dl.length > 3 && <span className="lm-leave-pill lc-more-pill" style={{ background: "#f1f5f9", color: "#64748b" }}>+{dl.length - 3} more</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selected && (dayLeavesForSelected.length > 0 || dayHolidays(selected).length > 0) && (
                <div className="lm-card lc-details-card">
                    <div className="lm-card-title flex items-center gap-2">Details for {MONTHS[month - 1]} {selected}, {year}</div>
                    
                    {dayHolidays(selected).length > 0 && (
                        <div style={{ marginBottom: "1rem" }}>
                            <h4 style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Company Holidays</h4>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {dayHolidays(selected).map((h: any) => (
                                    <div key={h.id} style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.5rem 1rem", borderRadius: "8px", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 500 }}>
                                        🎈 {h.name} ({h.type})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {dayLeavesForSelected.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Employee Leaves</h4>
                            <div className="lm-table-wrap">
                                <table className="lm-table">
                                    <thead><tr><th>Employee</th><th>Leave Type</th><th>Duration</th><th>Days</th><th>Reason</th></tr></thead>
                                    <tbody>
                                        {dayLeavesForSelected.map(l => (
                                            <tr key={l.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{l.employee?.firstName} {l.employee?.lastName}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{l.employee?.department}</div>
                                                </td>
                                                <td><span className="lm-badge lm-badge-purple">{l.leaveType?.name}</span></td>
                                                <td style={{ fontSize: "0.82rem" }}>{l.startDate?.split("T")[0]} → {l.endDate?.split("T")[0]}</td>
                                                <td><strong>{l.days}</strong></td>
                                                <td style={{ fontSize: "0.82rem", color: "#64748b" }}>{l.reason || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
