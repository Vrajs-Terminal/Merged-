import { useState, useEffect } from "react";
import axios from "axios";
import "./shiftCalendar.css";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}`;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SHIFT_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#3b82f6", "#ef4444", "#14b8a6"
];

function ShiftCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [assignments, setAssignments] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, [currentMonth]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignRes, shiftRes] = await Promise.all([
                axios.get(`${API}/shifts/assignments/list`),
                axios.get(`${API}/shifts`)
            ]);
            setAssignments(assignRes.data.assignments);
            setShifts(shiftRes.data.shifts);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const getShiftColor = (shiftId: number) => {
        const idx = shifts.findIndex(s => s.id === shiftId);
        return SHIFT_COLORS[idx % SHIFT_COLORS.length] || "#6366f1";
    };

    const getAssignmentsForDay = (day: number) => {
        const date = new Date(year, month, day);
        return assignments.filter(a => {
            const start = new Date(a.startDate);
            const end = a.endDate ? new Date(a.endDate) : null;
            return a.isActive && start <= date && (!end || end >= date);
        });
    };

    const isWeeklyOff = (day: number) => {
        const dayName = DAY_NAMES[new Date(year, month, day).getDay()];
        // Check if any shift has this day as weekly off
        const dayAssignments = getAssignmentsForDay(day);
        if (dayAssignments.length === 0) return false;
        return dayAssignments.some(a => {
            const shift = shifts.find(s => s.id === a.shiftId);
            return shift?.weeklyOffDays?.includes(dayName);
        });
    };

    const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const cells = [];
    // Empty cells for days before start
    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push(<div key={`empty-${i}`} className="sm-calendar-cell empty" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dayAssignments = getAssignmentsForDay(d);
        const off = isWeeklyOff(d);

        // Group by shift
        const shiftMap: Record<number, number> = {};
        dayAssignments.forEach(a => {
            shiftMap[a.shiftId] = (shiftMap[a.shiftId] || 0) + 1;
        });

        cells.push(
            <div
                key={d}
                className={`sm-calendar-cell${isToday(d) ? " today" : ""}${off ? " off-day" : ""}`}
                onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                style={{ cursor: "pointer" }}
            >
                <div className="sm-calendar-date">{d}</div>
                {off && <div style={{ fontSize: "0.65rem", color: "#d97706", marginBottom: 2 }}>OFF</div>}
                {Object.entries(shiftMap).slice(0, 2).map(([sid, cnt]) => {
                    const shift = shifts.find(s => s.id === parseInt(sid));
                    return (
                        <div key={sid} className="sm-calendar-shift-tag" style={{ background: getShiftColor(parseInt(sid)) }}>
                            {shift?.shiftCode || shift?.shiftName?.slice(0, 6)} ×{cnt}
                        </div>
                    );
                })}
                {Object.keys(shiftMap).length > 2 && (
                    <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>+{Object.keys(shiftMap).length - 2} more</div>
                )}
            </div>
        );
    }

    const selectedDayAssignments = selectedDay ? getAssignmentsForDay(selectedDay) : [];

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><CalendarIcon size={22} /> Shift Calendar</h2>
                    <p className="sm-page-subtitle">View employee shift distribution across the month</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <button className="btn-secondary" onClick={prevMonth}><ChevronLeft size={18} /></button>
                    <span style={{ fontWeight: 600, fontSize: "1rem", minWidth: 160, textAlign: "center" }}>
                        {MONTH_NAMES[month]} {year}
                    </span>
                    <button className="btn-secondary" onClick={nextMonth}><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Shift Legend */}
            {shifts.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    {shifts.map((s: any, i: number) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SHIFT_COLORS[i % SHIFT_COLORS.length] }} />
                            {s.shiftName} ({s.startTime}–{s.endTime})
                        </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fef3c7", border: "1px solid #d97706" }} />
                        Weekly Off
                    </div>
                </div>
            )}

            {loading ? <div className="sm-loading">Loading calendar...</div> : (
                <>
                    <div className="sm-calendar-grid">
                        {DAY_NAMES.map(d => <div key={d} className="sm-calendar-day-header">{d}</div>)}
                        {cells}
                    </div>

                    {selectedDay && (
                        <div className="sm-section" style={{ marginTop: "1.25rem" }}>
                            <div className="sm-section-title">
                                📅 {MONTH_NAMES[month]} {selectedDay}, {year} — {selectedDayAssignments.length} Assignment(s)
                            </div>
                            <div className="sm-section-body">
                                {selectedDayAssignments.length === 0 ? (
                                    <div className="sm-empty" style={{ padding: "1rem" }}>No assignments for this day.</div>
                                ) : (
                                    <table className="sm-table">
                                        <thead><tr><th>Employee</th><th>Department</th><th>Shift</th><th>Timing</th></tr></thead>
                                        <tbody>
                                            {selectedDayAssignments.map((a: any) => (
                                                <tr key={a.id}>
                                                    <td><strong>{a.employee?.firstName} {a.employee?.lastName}</strong></td>
                                                    <td>{a.employee?.department || "—"}</td>
                                                    <td>{a.shift?.shiftName}</td>
                                                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{a.shift?.startTime} – {a.shift?.endTime}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ShiftCalendar;
