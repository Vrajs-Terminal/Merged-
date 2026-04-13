import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
    Search, Plus, Users, LayoutList, 
    ChevronLeft, ChevronRight, Edit, Trash2, 
    X, Loader2, MessageSquare
} from 'lucide-react';
import './chat-groups.css';

interface ChatGroup {
    id: number;
    name: string;
    icon: string | null;
    type: string;
    isAutoCreated: boolean;
    autoBranchName?: string | null;
    createdAt: string;
    _count: { members: number };
}

export default function ManageGroups() {
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Manual',
        isAutoCreated: false,
        autoBranchId: '',
        autoDepartmentId: '',
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        fetchGroups();
    }, [page, search]);

    useEffect(() => {
        if(isModalOpen) {
            fetchFilterOptions();
        }
    }, [isModalOpen]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/chat/groups?page=${page}&search=${search}`);
            setGroups(res.data.groups);
            setTotalPages(Math.ceil(res.data.totalItems / 10) || 1);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const [bRes, dRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments')
            ]);
            setBranches(bRes.data);
            setDepartments(dRes.data);
        } catch (err) {
            console.error("Failed to load filter options");
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this group? All history will be lost.")) return;
        try {
            await api.delete(`/chat/groups/${id}`);
            fetchGroups();
        } catch (error) {
            alert('Failed to delete group');
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/chat/groups', formData);
            setIsModalOpen(false);
            setFormData({
                name: '', type: 'Manual', isAutoCreated: false, autoBranchId: '', autoDepartmentId: ''
            });
            fetchGroups();
        } catch (error) {
            console.error(error);
            alert('Failed to create group. Check network tab for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="chat-group-layout">
            <div className="chat-group-container">
                <div className="chat-group-header">
                    <div className="chat-group-header-info">
                        <h2><MessageSquare size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Manage Groups</h2>
                        <p>Create and manage organizational chat groups automatically or manually.</p>
                    </div>
                    <div className="chat-group-actions">
                        <div className="search-input-wrapper">
                            <Search size={16} />
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search groups..." 
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} /> New Group
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Group Info</th>
                                <th>Branch/Dept Target</th>
                                <th>Type</th>
                                <th>Members</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                        <Loader2 className="spinner" size={24} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : groups.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No chat groups found.
                                    </td>
                                </tr>
                            ) : groups.map((g, index) => (
                                <tr key={g.id}>
                                    <td>{(page - 1) * 10 + index + 1}</td>
                                    <td>
                                        <div className="group-name-cell">
                                            <div className="group-icon">
                                                <Users size={20} />
                                            </div>
                                            <div style={{ fontWeight: 500 }}>{g.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                                            {g.isAutoCreated ? (g.autoBranchName || 'All / Auto Filtered') : 'N/A (Manual)'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`type-badge ${g.isAutoCreated ? 'auto' : 'manual'}`}>
                                            {g.isAutoCreated ? 'Auto Created' : 'Manual'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={14} color="#94a3b8" />
                                            <span style={{ fontWeight: 600 }}>{g._count?.members || 0}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {/* Link to members or setup router */}
                                            <button className="action-btn" title="View Members" onClick={() => window.location.href=`/chat_group/members?groupId=${g.id}`}>
                                                <LayoutList size={18} />
                                            </button>
                                            <button className="action-btn delete" title="Delete Group" onClick={() => handleDelete(g.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {page} of {totalPages}</span>
                    <div className="pagination-controls">
                        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {isModalOpen && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal">
                        <div className="chat-modal-header">
                            <h3>Create New Group</h3>
                            <button className="action-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup}>
                            <div className="chat-modal-body">
                                <div className="form-group">
                                    <label>Group Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        required 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. New York General"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Group Generation Type</label>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="radio" 
                                                checked={!formData.isAutoCreated} 
                                                onChange={() => setFormData({...formData, isAutoCreated: false, type: 'Manual'})} 
                                            />
                                            Manual Group
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="radio" 
                                                checked={formData.isAutoCreated} 
                                                onChange={() => setFormData({...formData, isAutoCreated: true, type: 'Auto Created'})} 
                                            />
                                            System Auto-Created
                                        </label>
                                    </div>
                                </div>

                                {formData.isAutoCreated && (
                                    <>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', color: '#1e40af' }}>
                                                Select the filters below. Employees matching these criteria will be automatically added to this group upon creation.
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Target Branch</label>
                                            <select 
                                                className="form-control"
                                                value={formData.autoBranchId}
                                                onChange={e => setFormData({...formData, autoBranchId: e.target.value})}
                                            >
                                                <option value="">-- All Branches --</option>
                                                {branches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Target Department</label>
                                            <select 
                                                className="form-control"
                                                value={formData.autoDepartmentId}
                                                onChange={e => setFormData({...formData, autoDepartmentId: e.target.value})}
                                            >
                                                <option value="">-- All Departments --</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="chat-modal-footer">
                                <button type="button" className="btn-primary" style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }} onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
