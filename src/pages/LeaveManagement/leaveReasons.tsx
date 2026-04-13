import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, LayoutList, Calendar } from "lucide-react";
import API_BASE from "../api";
import "./leaveReasons.css";

export default function LeaveReasons() {
    const [reasons, setReasons] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "Active"
    });

    useEffect(() => { loadReasons(); }, []);

    const loadReasons = async () => {
        try {
            const res = await axios.get(`${API_BASE}/leave/reasons`);
            setReasons(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_BASE}/leave/reasons/${editingId}`, formData);
            } else {
                await axios.post(`${API_BASE}/leave/reasons`, formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: "", description: "", status: "Active" });
            loadReasons();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error saving reason");
        }
    };

    const handleEdit = (r: any) => {
        setEditingId(r.id);
        setFormData({ name: r.name, description: r.description || "", status: r.status });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this leave reason?")) return;
        try {
            await axios.delete(`${API_BASE}/leave/reasons/${id}`);
            loadReasons();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error deleting reason");
        }
    };

    return (
        <div className="page-container lr-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Calendar size={22} /> Leave Reasons</h2>
                    <p className="page-subtitle">Manage predefined reasons for leave requests.</p>
                </div>
                {!showForm && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Add Reason
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="card">
                    <div className="card-header border-b border-gray-100 pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{editingId ? "Edit Leave Reason" : "New Leave Reason"}</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="custom-form max-w-2xl">
                        <div className="form-group">
                            <label>Reason Name *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="form-input" placeholder="e.g. Sick Leave, Vacation, Personal" />
                        </div>
                        <div className="form-group mt-4">
                            <label>Description (Optional)</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="form-input" placeholder="Add some context for this reason..." />
                        </div>
                        <div className="form-group mt-4 mb-6">
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-input">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="form-actions flex gap-3">
                            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData({name: "", description: "", status: "Active"}); }}>Cancel</button>
                            <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg" disabled={!formData.name}>Save Reason</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="table-container bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {reasons.length === 0 ? (
                        <div className="empty-state py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <LayoutList size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Leave Reasons Found</h3>
                            <p className="text-sm text-gray-500 mb-4 max-w-sm">Create predefined reasons like "Sick Leave" or "Vacation" for employees to select when applying for leaves.</p>
                            <button className="btn-primary" onClick={() => setShowForm(true)}>
                                <Plus size={18} /> Add First Reason
                            </button>
                        </div>
                    ) : (
                        <table className="custom-table w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="py-3 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Reason Name</th>
                                    <th className="py-3 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Description</th>
                                    <th className="py-3 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reasons.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{r.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{r.description || "-"}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                                {r.status === "Active" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
