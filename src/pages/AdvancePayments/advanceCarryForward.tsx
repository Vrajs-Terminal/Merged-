import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRightLeft } from "lucide-react";
import API_BASE from "../api";

export default function AdvanceCarryForward() {
    const [advances, setAdvances] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/advance-salaries`);
            // Only show those with remaining amounts that are Pending
            setAdvances(res.data.filter((a: any) => a.remainingAmount > 0 && a.status === 'Pending'));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowRightLeft size={22} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Advance Carry Forward</h2>
                </div>
                <p className="page-subtitle">View pending advances that will automatically roll over to the next payroll cycle.</p>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Original Salary Month</th>
                            <th>Given Date</th>
                            <th>Original Amount</th>
                            <th>Remaining Carry Forward</th>
                            <th>Automatic Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {advances.map(a => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: 500 }}>{a.employee?.firstName} {a.employee?.lastName}</td>
                                <td>{a.salaryMonth}</td>
                                <td>{new Date(a.givenDate).toLocaleDateString()}</td>
                                <td>₹{a.amount}</td>
                                <td style={{ fontWeight: 600, color: 'var(--danger)' }}>₹{a.remainingAmount}</td>
                                <td>
                                    <span className="badge badge-warning">Pending EMI Deduction</span>
                                </td>
                            </tr>
                        ))}
                        {advances.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No pending carry forwards. All clear!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
