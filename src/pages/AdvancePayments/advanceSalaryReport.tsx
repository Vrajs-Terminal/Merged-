import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Printer, Download } from "lucide-react";
import API_BASE from "../api";

export default function AdvanceSalaryReport() {
    const [advances, setAdvances] = useState<any[]>([]);
    
    // Filters
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/advance-salaries`);
            setAdvances(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = advances.filter(a => {
        if (departmentFilter && a.department !== departmentFilter) return false;
        if (statusFilter && a.status !== statusFilter) return false;
        if (monthFilter && a.salaryMonth !== monthFilter) return false;
        return true;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }} className="no-print">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={22} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Advance Salary Report</h2>
                    </div>
                    <p className="page-subtitle">Detailed financial reporting and audit trail for advance salaries.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handlePrint}><Printer size={16} /> Print</button>
                    <button className="btn btn-primary" onClick={handlePrint}><Download size={16} /> Export PDF</button>
                </div>
            </div>

            <div className="glass-card no-print" style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="input-label">Filter by Department</label>
                    <select className="select-modern" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                        <option value="">All Departments</option>
                        {[...new Set(advances.map(a => a.department).filter(Boolean))].map(d => (
                            <option key={d as string} value={d as string}>{d as string}</option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="input-label">Filter by Month</label>
                    <input type="month" className="input-modern" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="input-label">Filter by Status</label>
                    <select className="select-modern" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending (Active Deductions)</option>
                        <option value="Returned">Fully Returned</option>
                    </select>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern print-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Given Date</th>
                            <th>Month</th>
                            <th style={{ textAlign: 'right' }}>Total Advance (₹)</th>
                            <th style={{ textAlign: 'right' }}>Returned (₹)</th>
                            <th style={{ textAlign: 'right' }}>Remaining (₹)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(a => {
                            const returnedAmount = a.amount - a.remainingAmount;
                            return (
                                <tr key={a.id}>
                                    <td>{a.employee?.employeeId}</td>
                                    <td style={{ fontWeight: 600 }}>{a.employee?.firstName} {a.employee?.lastName}</td>
                                    <td>{a.department || "-"}</td>
                                    <td>{new Date(a.givenDate).toLocaleDateString()}</td>
                                    <td>{a.salaryMonth}</td>
                                    <td style={{ textAlign: 'right' }}>₹{a.amount}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>₹{returnedAmount}</td>
                                    <td style={{ textAlign: 'right', color: a.remainingAmount > 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 600 }}>
                                        ₹{a.remainingAmount}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${a.status === 'Returned' ? 'success' : 'warning'}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No reporting data available.</td>
                            </tr>
                        )}
                        {filtered.length > 0 && (
                            <tr style={{ background: 'var(--bg-app)', fontWeight: 700 }}>
                                <td colSpan={5} style={{ textAlign: 'right' }}>GRAND TOTAL:</td>
                                <td style={{ textAlign: 'right' }}>₹{filtered.reduce((sum, a) => sum + a.amount, 0)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--success)' }}>₹{filtered.reduce((sum, a) => sum + (a.amount - a.remainingAmount), 0)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--danger)' }}>₹{filtered.reduce((sum, a) => sum + a.remainingAmount, 0)}</td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* CSS Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-table { border: 1px solid #ccc; width: 100%; border-collapse: collapse; }
                    .print-table th, .print-table td { border: 1px solid #ccc; padding: 8px; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
