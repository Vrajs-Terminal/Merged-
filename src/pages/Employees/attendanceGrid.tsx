import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { ChevronLeft, ChevronRight, Download, Calendar as CalendarIcon, Clock, Filter } from "lucide-react";
import "./attendanceGrid.css";
import PageTitle from "../../components/PageTitle";

function AttendanceGrid() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentMonth]);

    const fetchMonthlyData = async () => {
        try {
            setLoading(true);
            const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
            const res = await axios.get(`${API_BASE}/attendance/monthly?month=${monthStr}`);

            setLogs(res.data.logs);

            // Extract unique employees from logs
            const uniqueEmps = new Map();
            res.data.logs.forEach((log: any) => {
                if (!uniqueEmps.has(log.employeeId)) {
                    uniqueEmps.set(log.employeeId, log.employee);
                }
            });
            setEmployees(Array.from(uniqueEmps.values()));

        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    // Calculate columns (days in month)
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const daysCount = getDaysInMonth(currentMonth);
    const dayColumns = Array.from({ length: daysCount }, (_, i) => i + 1);

    const getStatusForDay = (empId: number, day: number) => {
        const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const targetStr = targetDate.toISOString().split('T')[0];

        const log = logs.find(l =>
            l.employeeId === empId &&
            l.date.startsWith(targetStr)
        );

        if (!log) return { status: 'Absent', label: 'A', class: 'status-absent' };
        if (log.status === 'Present') return { status: 'Present', label: 'P', class: 'status-present', hours: log.totalHours };
        if (log.status === 'Half Day') return { status: 'Half Day', label: 'HD', class: 'status-half' };

        return { status: 'Absent', label: 'A', class: 'status-absent' };
    };

    return (
        <div className="attendance-grid-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Attendance Tracking" 
                    subtitle="Monitor monthly timesheets and workforce availability" 
                />
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Filter size={18} /> Filters
                    </button>
                    <button className="btn btn-success">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="glass-card mb-6 p-4">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="stat-mini">
                            <span className="text-xs text-muted font-bold uppercase">Working Month</span>
                            <div className="flex items-center gap-2 mt-1">
                                <button onClick={prevMonth} className="act-btn view">
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="font-bold text-lg min-w-[150px] text-center">
                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </div>
                                <button onClick={nextMonth} className="act-btn view">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="legend-row mt-0">
                        <div className="legend-item"><span className="status-badge completed">P</span> <span className="text-xs font-semibold">Present</span></div>
                        <div className="legend-item"><span className="status-badge pending">HD</span> <span className="text-xs font-semibold">Half Day</span></div>
                        <div className="legend-item"><span className="status-badge failed">A</span> <span className="text-xs font-semibold">Absent</span></div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper glass-card pb-0">
                {loading ? (
                    <div className="flex-col flex-center py-20">
                        <div className="spinner mb-4"></div>
                        <p className="text-muted">Compiling attendance logs...</p>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="flex-col flex-center py-20 text-muted">
                        <CalendarIcon size={48} className="opacity-20 mb-4" />
                        <p className="text-lg font-bold">No records found for this period</p>
                    </div>
                ) : (
                    <div className="grid-scroll-wrapper">
                        <table className="table-modern attendance-table-fixed">
                            <thead>
                                <tr>
                                    <th className="sticky-col-left bg-slate-50">Employee</th>
                                    {dayColumns.map(day => (
                                        <th key={day} className="day-col-header text-center">{day}</th>
                                    ))}
                                    <th className="total-col-header text-center">Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => {
                                    let totalPresent = 0;
                                    return (
                                        <tr key={emp.employeeId}>
                                            <td className="sticky-col-left employee-info-cell">
                                                <div className="flex-col">
                                                    <span className="font-bold text-slate-800 leading-tight">{emp.firstName} {emp.lastName}</span>
                                                    <span className="text-[10px] text-muted font-mono">{emp.employeeId} • {emp.department}</span>
                                                </div>
                                            </td>

                                            {dayColumns.map(day => {
                                                const statusInfo = getStatusForDay(emp.employeeId, day);
                                                if (statusInfo.status === 'Present') totalPresent += 1;
                                                if (statusInfo.status === 'Half Day') totalPresent += 0.5;

                                                const badgeClass = statusInfo.label === 'P' ? 'completed' : statusInfo.label === 'HD' ? 'pending' : 'failed';

                                                return (
                                                    <td key={day} className="text-center p-1">
                                                        <div 
                                                            className={`status-badge ${badgeClass} w-7 h-7 flex items-center justify-center p-0 text-[10px] m-auto cursor-help`}
                                                            title={`${statusInfo.status} ${statusInfo.hours ? `(${statusInfo.hours} hrs)` : ''}`}
                                                        >
                                                            {statusInfo.label}
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            <td className="text-center font-bold text-slate-900 bg-slate-50">
                                                {totalPresent}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttendanceGrid;
