import React, { useState, useEffect } from "react";
import axios from "axios";
import { Printer, Search } from "lucide-react";
import API_BASE from "../api";

export default function GenerateVoucher() {
    const [entries, setEntries] = useState<any[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [form, setForm] = useState({ paymentMode: "Bank", remarks: "" });
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries?status=Approved`);
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const selectAll = () => setSelected(filtered.map(e => e.id));
    const clearAll = () => setSelected([]);

    const selectedEntries = entries.filter(e => selected.includes(e.id));
    const totalAmount = selectedEntries.reduce((s, e) => s + e.amount, 0);

    const generate = async () => {
        if (selected.length === 0) return alert("Please select at least one expense.");
        const voucherNo = `VCH-${Date.now()}`;
        try {
            await axios.put(`${API_BASE}/expense-entries/bulk/pay`, { ids: selected, paymentMode: form.paymentMode, voucherNo, paidBy: 1 });
            alert(`Voucher ${voucherNo} generated successfully for ₹${totalAmount.toLocaleString()}!`);
            setSelected([]); load();
        } catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };

    const filtered = entries.filter(e => (`${e.employee?.firstName} ${e.employee?.lastName}`).toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Generate Voucher</h2>
                    </div>
                    <p className="page-subtitle">Create payment vouchers for approved expense claims.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
                <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button className="btn btn-secondary" onClick={selectAll} style={{ minHeight: 'unset', padding: '8px 14px' }}>All</button>
                        <button className="btn btn-secondary" onClick={clearAll} style={{ minHeight: 'unset', padding: '8px 14px' }}>Clear</button>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="table-modern">
                            <thead><tr><th><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearAll()} /></th><th>Employee</th><th>Type</th><th>Amount</th><th>Approved</th></tr></thead>
                            <tbody>
                                {filtered.map(e => (
                                    <tr key={e.id} style={{ cursor: 'pointer', background: selected.includes(e.id) ? 'rgba(var(--primary-rgb,99,102,241),0.08)' : undefined }} onClick={() => toggleSelect(e.id)}>
                                        <td><input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} /></td>
                                        <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                        <td>{e.expenseType}</td>
                                        <td style={{ fontWeight: 700 }}>₹{e.amount}</td>
                                        <td>{e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No approved expenses to pay.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-card" style={{ minWidth: '280px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Voucher Summary</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Selected Claims</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', color: 'var(--primary)' }}>{selected.length}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Amount</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success)', marginBottom: '20px' }}>₹{totalAmount.toLocaleString()}</div>
                    <div style={{ marginBottom: '12px' }}>
                        <label className="input-label">Payment Mode</label>
                        <select className="select-modern" value={form.paymentMode} onChange={e => setForm({...form, paymentMode: e.target.value})}>
                            <option>Bank</option><option>Cash</option><option>UPI</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="input-label">Remarks</label>
                        <input className="input-modern" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Optional notes..." />
                    </div>
                    <button className="btn btn-primary" onClick={generate} style={{ width: '100%' }}><Printer size={16} /> Generate Voucher</button>
                </div>
            </div>
        </div>
    );
}
