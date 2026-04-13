import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, Layers, Users, Save, X, Calendar } from "lucide-react";
import API_BASE from "../api";
import "./leaveGroups.css";

export default function LeaveGroups() {
    const [view, setView] = useState("groups"); // "groups" | "assign"
    const [groups, setGroups] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({ groupName: "", description: "" });
    const [rules, setRules] = useState<any[]>([]); // Array of rule objects per leave type

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [grpRes, typeRes, empRes] = await Promise.all([
                axios.get(`${API_BASE}/leave/groups`),
                axios.get(`${API_BASE}/leave/types`),
                axios.get(`${API_BASE}/employees`)
            ]);
            setGroups(grpRes.data);
            setLeaveTypes(typeRes.data);
            setEmployees(empRes.data);
        } catch (e) {
            console.error("Failed to load data", e);
        }
    };

    const handleNewGroup = () => {
        setEditingId(null);
        setForm({ groupName: "", description: "" });
        const defaultRules = leaveTypes.map(lt => ({
            leaveTypeId: lt.id,
            totalLeaves: lt.defaultDays,
            accrualMethod: "Yearly",
            leaveRestriction: false,
            allowDuringProbation: true,
            allowDuringNoticePeriod: true,
            carryForwardAllowed: lt.carryForward,
            maxCarryForwardLimit: 0,
            leavePayoutAllowed: lt.encashAllowed,
            payoutLimit: 0,
            minLeaveApply: 0.5,
            maxLeaveApply: 30,
            allowHalfDayLeave: true
        }));
        setRules(defaultRules);
        setShowForm(true);
    };

    const handleEditGroup = (g: any) => {
        setEditingId(g.id);
        setForm({ groupName: g.groupName, description: g.description || "" });
        
        // Merge existing rules with missing leave types
        const existingRules = g.rules.reduce((acc: any, r: any) => { acc[r.leaveTypeId] = r; return acc; }, {});
        const mergedRules = leaveTypes.map(lt => {
            if (existingRules[lt.id]) return existingRules[lt.id];
            return {
                leaveTypeId: lt.id, totalLeaves: lt.defaultDays, accrualMethod: "Yearly",
                leaveRestriction: false, allowDuringProbation: true, allowDuringNoticePeriod: true,
                carryForwardAllowed: lt.carryForward, maxCarryForwardLimit: 0,
                leavePayoutAllowed: lt.encashAllowed, payoutLimit: 0, minLeaveApply: 0.5, maxLeaveApply: 30, allowHalfDayLeave: true
            };
        });
        setRules(mergedRules);
        setShowForm(true);
    };

    const handleRuleChange = (index: number, field: string, value: any) => {
        const nr = [...rules];
        nr[index][field] = value;
        setRules(nr);
    };

    const saveGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form, rules };
            if (editingId) await axios.put(`${API_BASE}/leave/groups/${editingId}`, payload);
            else await axios.post(`${API_BASE}/leave/groups`, payload);
            
            setShowForm(false);
            loadData();
        } catch (e: any) { alert(e.response?.data?.error || "Error saving group"); }
    };

    const deleteGroup = async (id: number) => {
        if (!window.confirm("Delete this Leave Group? All assigned employees will lose these rules.")) return;
        try {
            await axios.delete(`${API_BASE}/leave/groups/${id}`);
            loadData();
        } catch (e: any) { alert(e.response?.data?.error || "Error deleting"); }
    };

    // --- Assignment State ---
    const [assignForm, setAssignForm] = useState({ employeeId: "", leaveGroupId: "", effectiveDate: new Date().toISOString().split('T')[0] });
    
    const saveAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/leave/groups/assign`, assignForm);
            alert("Leave Group assigned successfully.");
            setAssignForm({ employeeId: "", leaveGroupId: "", effectiveDate: new Date().toISOString().split('T')[0] });
        } catch (e: any) { alert(e.response?.data?.error || "Error assigning group"); }
    };

    return (
        <div className="page-container lg-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Calendar size={22} /> Leave Groups & Accrual Rules</h2>
                    <p className="page-subtitle">Group leave rules and assign them to specific employees or segments.</p>
                </div>
                <div className="lm-view-toggle-wrap">
                    <button
                        className={`lm-view-toggle-btn ${view === "groups" ? "active" : ""}`}
                        onClick={() => {
                            setView("groups");
                            setShowForm(false);
                        }}
                    >
                        <Layers size={16} /> Manage Groups
                    </button>
                    <button
                        className={`lm-view-toggle-btn ${view === "assign" ? "active" : ""}`}
                        onClick={() => setView("assign")}
                    >
                        <Users size={16} /> Assign to Employees
                    </button>
                </div>
            </div>

            {view === "groups" && !showForm && (
                <div className="lm-card leave-section-card">
                    <div className="leave-section-header">
                        <div>
                            <h3 className="lm-card-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 0 }}>All Leave Groups</h3>
                            <p className="lm-page-subtitle">Create reusable accrual rule sets for different employee segments.</p>
                        </div>
                        <button className="lm-btn-primary" onClick={handleNewGroup}><Plus size={16}/> Create Group</button>
                    </div>
                    {groups.length === 0 ? (
                        <div className="lm-empty leave-empty-state">No Leave Groups defined. Create one to set up accrual rules.</div>
                    ) : (
                        <div className="lm-table-wrap">
                            <table className="lm-table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3">Group Name</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3">Configured Rules</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map(g => (
                                        <tr key={g.id} className="border-b">
                                            <td className="p-3 font-medium">{g.groupName}</td>
                                            <td className="p-3 text-gray-500">{g.description || "-"}</td>
                                            <td className="p-3"><span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{g.rules.length} Leave Types</span></td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => handleEditGroup(g)} className="text-blue-600 mx-2"><Edit2 size={16}/></button>
                                                <button onClick={() => deleteGroup(g.id)} className="text-red-600"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {view === "groups" && showForm && (
                <div className="lm-card leave-section-card">
                    <div className="leave-section-header leave-section-header-tight">
                        <h3 className="lm-card-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 0 }}>{editingId ? "Edit Leave Group" : "Create Leave Group"}</h3>
                        <button onClick={() => setShowForm(false)} className="lm-btn-icon" aria-label="Close form"><X size={18}/></button>
                    </div>
                    
                    <form onSubmit={saveGroup} className="leave-form-stack">
                        <div className="lm-two-col">
                            <div className="lm-field">
                                <label className="lm-label">Group Name *</label>
                                <input required type="text" className="lm-input" value={form.groupName} onChange={e => setForm({...form, groupName: e.target.value})} placeholder="e.g. Sales Team Rules"/>
                            </div>
                            <div className="lm-field">
                                <label className="lm-label">Description</label>
                                <input type="text" className="lm-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description"/>
                            </div>
                        </div>

                        <h4 className="leave-subtitle">Accrual & Usage Rules per Leave Type</h4>
                        <div className="leave-rules-grid">
                            {rules.map((rule, idx) => {
                                const lt = leaveTypes.find(t => t.id === rule.leaveTypeId);
                                if (!lt) return null;
                                return (
                                    <div key={lt.id} className="leave-rule-card">
                                        <h5 className="leave-rule-title">{lt.name} Config <span className="lm-badge lm-badge-purple">{lt.isPaid ? 'Paid' : 'Unpaid'}</span></h5>
                                        
                                        <div className="lm-form-grid leave-rule-fields">
                                            <div className="lm-field">
                                                <label className="lm-label">Total Leaves</label>
                                                <input type="number" step="0.5" className="lm-input" value={rule.totalLeaves} onChange={e => handleRuleChange(idx, 'totalLeaves', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="lm-field">
                                                <label className="lm-label">Accrual Method</label>
                                                <select className="lm-select" value={rule.accrualMethod} onChange={e => handleRuleChange(idx, 'accrualMethod', e.target.value)}>
                                                    <option value="Yearly">Yearly upfront</option>
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Quarterly">Quarterly</option>
                                                </select>
                                            </div>
                                            <div className="lm-field">
                                                <label className="lm-label">Min Apply (Days)</label>
                                                <input type="number" step="0.5" className="lm-input" value={rule.minLeaveApply} onChange={e => handleRuleChange(idx, 'minLeaveApply', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="lm-field">
                                                <label className="lm-label">Max Apply (Days)</label>
                                                <input type="number" step="0.5" className="lm-input" value={rule.maxLeaveApply} onChange={e => handleRuleChange(idx, 'maxLeaveApply', parseFloat(e.target.value))} />
                                            </div>
                                        </div>

                                        <div className="leave-rule-switches">
                                            <label className="lm-checkbox-row">
                                                <input type="checkbox" checked={rule.allowDuringProbation} onChange={e => handleRuleChange(idx, 'allowDuringProbation', e.target.checked)}/> Allow in Probation
                                            </label>
                                            <label className="lm-checkbox-row">
                                                <input type="checkbox" checked={rule.allowDuringNoticePeriod} onChange={e => handleRuleChange(idx, 'allowDuringNoticePeriod', e.target.checked)}/> Allow in Notice Period
                                            </label>
                                            <label className="lm-checkbox-row">
                                                <input type="checkbox" checked={rule.allowHalfDayLeave} onChange={e => handleRuleChange(idx, 'allowHalfDayLeave', e.target.checked)}/> Allow Half Day
                                            </label>
                                            <label className="lm-checkbox-row">
                                                <input type="checkbox" checked={rule.carryForwardAllowed} onChange={e => handleRuleChange(idx, 'carryForwardAllowed', e.target.checked)}/> Carry Forward?
                                            </label>
                                            {rule.carryForwardAllowed && (
                                                <label className="lm-checkbox-row">
                                                    Max Limit: <input type="number" className="lm-input leave-mini-input" value={rule.maxCarryForwardLimit} onChange={e => handleRuleChange(idx, 'maxCarryForwardLimit', parseFloat(e.target.value))}/>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="lm-form-actions">
                            <button type="submit" className="lm-btn-primary"><Save size={16} /> Save Leave Group</button>
                            <button type="button" onClick={() => setShowForm(false)} className="lm-btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {view === "assign" && (
                <div className="lm-card leave-section-card leave-assign-card">
                    <h3 className="lm-card-title">Assign Leave Group to Employee</h3>
                    <p className="lm-page-subtitle">Assigning a new group recalculates the employee’s balance from the effective date.</p>
                    
                    <form onSubmit={saveAssignment} className="leave-form-stack">
                        <div className="lm-field">
                            <label className="lm-label">Select Employee *</label>
                            <select required className="lm-select" value={assignForm.employeeId} onChange={e => setAssignForm({...assignForm, employeeId: e.target.value})}>
                                <option value="">-- Choose Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>[{emp.employeeId}] {emp.firstName} {emp.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lm-field">
                            <label className="lm-label">Select Leave Group *</label>
                            <select required className="lm-select" value={assignForm.leaveGroupId} onChange={e => setAssignForm({...assignForm, leaveGroupId: e.target.value})}>
                                <option value="">-- Choose Group --</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.groupName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lm-field">
                            <label className="lm-label">Effective Date *</label>
                            <input required type="date" className="lm-input" value={assignForm.effectiveDate} onChange={e => setAssignForm({...assignForm, effectiveDate: e.target.value})} />
                        </div>
                        <button type="submit" className="lm-btn-primary">Assign Rules</button>
                    </form>
                </div>
            )}
        </div>
    );
}
