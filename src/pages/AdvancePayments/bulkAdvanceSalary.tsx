import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Check, Layers } from "lucide-react";
import API_BASE from "../api";

export default function BulkAdvanceSalary() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    
    // Filters
    const [departmentFilter, setDepartmentFilter] = useState("");

    const [formParams, setFormParams] = useState({
        salaryMonth: new Date().toISOString().substring(0, 7),
        amount: "",
        givenDate: new Date().toISOString().substring(0, 10),
        givenMode: "Bank",
        remark: ""
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const res = await axios.get(`${API_BASE}/employees`);
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
            setEmployees([]);
        }
    };

    const handleApply = async () => {
        if (selectedEmployees.length === 0) return alert("Select at least one employee");
        if (!formParams.amount || !formParams.salaryMonth) return alert("Fill all required fields");

        try {
            const payload = {
                employees: selectedEmployees,
                ...formParams
            };
            const res = await axios.post(`${API_BASE}/advance-salaries/bulk`, payload);
            alert(res.data.message);
            setSelectedEmployees([]);
            setFormParams({ ...formParams, amount: "", remark: "" });
        } catch (e: any) {
            alert(e.response?.data?.error || "Error applying bulk advances");
        }
    };

    const filteredEmployees = employees.filter(emp => 
        departmentFilter ? emp.department === departmentFilter : true
    );

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={22} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Bulk Advance Salary</h2>
                </div>
                <p className="page-subtitle">Disperse mass advance allocations during festivals or emergency periods.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
                <div className="glass-card">
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                        Disbursement Settings
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label className="input-label">Target Department</label>
                            <select className="select-modern" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                                <option value="">All Departments</option>
                                {[...new Set(employees.map(e => e.department).filter(Boolean))].map(d => (
                                    <option key={d as string} value={d as string}>{d as string}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Salary Month *</label>
                            <input type="month" className="input-modern" value={formParams.salaryMonth} onChange={e => setFormParams({ ...formParams, salaryMonth: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Amount per Selected Employee (₹) *</label>
                            <input type="number" className="input-modern" value={formParams.amount} onChange={e => setFormParams({ ...formParams, amount: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Given Date</label>
                            <input type="date" className="input-modern" value={formParams.givenDate} onChange={e => setFormParams({ ...formParams, givenDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Given Mode</label>
                            <select className="select-modern" value={formParams.givenMode} onChange={e => setFormParams({ ...formParams, givenMode: e.target.value })}>
                                <option value="Bank">Bank</option>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Global Remark</label>
                            <input type="text" className="input-modern" value={formParams.remark} onChange={e => setFormParams({ ...formParams, remark: e.target.value })} placeholder="e.g. Diwali Bonus Advance" />
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} onClick={handleApply}>
                            <Check size={18} /> Apply to {selectedEmployees.length} Employees
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Select Employees</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedEmployees(filteredEmployees.map(x => x.id));
                                    else setSelectedEmployees([]);
                                }}
                            />
                            <span style={{ fontWeight: 500 }}>Select All</span>
                        </label>
                    </div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}></th>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} style={{ opacity: selectedEmployees.includes(emp.id) ? 1 : 0.6 }}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedEmployees.includes(emp.id)} 
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedEmployees([...selectedEmployees, emp.id]);
                                                    else setSelectedEmployees(selectedEmployees.filter(x => x !== emp.id));
                                                }}
                                            />
                                        </td>
                                        <td>{emp.employeeId}</td>
                                        <td style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</td>
                                        <td>{emp.department || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
