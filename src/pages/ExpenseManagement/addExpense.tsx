import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, FileText, Upload } from "lucide-react";
import API_BASE from "../api";

export default function AddExpense() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const [form, setForm] = useState({
        employeeId: "", templateId: "", expenseType: "", amount: "",
        expenseDate: new Date().toISOString().substring(0, 10),
        description: "", linkWith: "General"
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadBase = async () => {
            try {
                const [eRes, tRes] = await Promise.all([
                    axios.get(`${API_BASE}/employees`),
                    axios.get(`${API_BASE}/expense-templates`)
                ]);
                setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
                setTemplates(Array.isArray(tRes.data) ? tRes.data : []);
            } catch (e) { console.error(e); }
        };
        loadBase();
    }, []);

    const handleTemplateChange = (templateId: string) => {
        const t = templates.find(x => x.id === Number(templateId));
        setSelectedTemplate(t || null);
        setForm(f => ({ ...f, templateId, expenseType: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/expense-entries`, form);
            setSaved(true);
            setForm({ employeeId: "", templateId: "", expenseType: "", amount: "", expenseDate: new Date().toISOString().substring(0, 10), description: "", linkWith: "General" });
            setSelectedTemplate(null);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) { alert(e.response?.data?.error || "Error saving expense"); }
    };

    const expenseTypeOptions = selectedTemplate ? (selectedTemplate.expenseTypes as any[]).map((et: any) => et.type) : ["Travel", "Food", "Stay", "Misc", "Accommodation", "Communication", "Fuel", "Toll"];

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FileText size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Add Expense</h2>
            </div>
            <p className="page-subtitle">Submit your expense claim with proper documentation.</p>

            {saved && <div style={{ padding: '12px 16px', background: 'var(--success)', color: 'white', borderRadius: '8px', marginBottom: '20px' }}>✓ Expense submitted successfully! Awaiting approval.</div>}

            <div className="glass-card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label className="input-label">Employee *</label>
                        <select className="select-modern" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                            <option value="">Select Employee</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Expense Template (optional)</label>
                        <select className="select-modern" value={form.templateId} onChange={e => handleTemplateChange(e.target.value)}>
                            <option value="">No Template</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.templateName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Expense Type *</label>
                        <select className="select-modern" required value={form.expenseType} onChange={e => setForm({ ...form, expenseType: e.target.value })}>
                            <option value="">Select Type</option>
                            {expenseTypeOptions.map((t: string) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Amount (₹) *</label>
                        <input type="number" className="input-modern" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Expense Date *</label>
                        <input type="date" className="input-modern" required value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Link With</label>
                        <select className="select-modern" value={form.linkWith} onChange={e => setForm({ ...form, linkWith: e.target.value })}>
                            <option value="General">General</option>
                            <option value="Visit">Visit</option>
                            <option value="Order">Order</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="input-label">Description</label>
                        <input className="input-modern" placeholder="Brief description of the expense..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', border: '2px dashed var(--border-light)' }}>
                        <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Upload Bill / Receipt (optional)</span>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary"><Plus size={16} /> Submit Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
