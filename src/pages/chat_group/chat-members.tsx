import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
    Users, Plus, Trash2, ArrowLeft, Loader2, Eye, EyeOff, Shield, X
} from 'lucide-react';
import './chat-groups.css';

interface Member {
    id: number;
    groupId: number;
    userId: number;
    role: string;
    visibility: boolean;
    status: string;
    user: {
        name: string;
        role: string;
        branch?: { name: string };
        department?: { name: string };
    };
}

export default function ChatMembers() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialGroupId = queryParams.get('groupId');

    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || '');
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Member Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchGroups();
        fetchAllEmployees();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            fetchMembers(selectedGroupId);
            // Update URL to reflect selected group without reloading
            navigate(`/chat_group/members?groupId=${selectedGroupId}`, { replace: true });
        } else {
            setMembers([]);
        }
    }, [selectedGroupId]);

    const fetchGroups = async () => {
        try {
            // Fetch top groups for dropdown
            const res = await api.get('/chat/groups');
            setGroups(res.data.groups);
            if (!selectedGroupId && res.data.groups.length > 0) {
                setSelectedGroupId(res.data.groups[0].id.toString());
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMembers = async (gid: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/chat/members/${gid}`);
            setMembers(res.data.members);
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllEmployees = async () => {
        try {
            const res = await api.get('/auth/users'); // Assuming this endpoint retrieves all users
            if(res.data) {
                 setAllEmployees(Array.isArray(res.data.users) ? res.data.users : Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error('Failed to load employees for add member list');
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !selectedGroupId) return;

        setIsSubmitting(true);
        try {
            await api.post(`/chat/members/${selectedGroupId}`, {
                userId: selectedUserId,
                role: 'Member',
                visibility: true
            });
            setIsAddModalOpen(false);
            setSelectedUserId('');
            fetchMembers(selectedGroupId);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!window.confirm("Remove this member from the group?")) return;
        try {
            await api.delete(`/chat/members/${selectedGroupId}/${memberId}`);
            fetchMembers(selectedGroupId);
        } catch (err) {
            alert('Failed to remove member');
        }
    };

    const toggleRole = async (member: Member) => {
        const newRole = member.role === 'Admin' ? 'Member' : 'Admin';
        try {
            await api.put(`/chat/members/${selectedGroupId}/${member.id}`, { role: newRole });
            setMembers(members.map(m => m.id === member.id ? { ...m, role: newRole } : m));
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const toggleVisibility = async (member: Member) => {
        const newVis = !member.visibility;
        try {
            await api.put(`/chat/members/${selectedGroupId}/${member.id}`, { visibility: newVis });
            setMembers(members.map(m => m.id === member.id ? { ...m, visibility: newVis } : m));
        } catch (err) {
            alert('Failed to update visibility');
        }
    };

    return (
        <div className="chat-group-layout">
            <div className="chat-group-container">
                <div className="chat-group-header">
                    <div className="chat-group-header-info">
                        <h2>
                            <button className="action-btn" style={{ display: 'inline-flex', marginRight: '16px', verticalAlign: 'middle', background: '#f1f5f9' }} onClick={() => navigate('/chat_group')}>
                                <ArrowLeft size={20} />
                            </button>
                            Group Members
                        </h2>
                        <p>Manage employees inside groups with control over visibility and participation.</p>
                    </div>
                    <div className="chat-group-actions">
                        <select 
                            className="form-control" 
                            style={{ width: '250px' }}
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                        >
                            <option value="">-- Select Chat Group --</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <button className="btn-primary" disabled={!selectedGroupId} onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={16} /> Add Member
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Employee Name</th>
                                <th>Branch & Dept</th>
                                <th>Role</th>
                                <th>Visibility</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!selectedGroupId ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        Please select a group above to view members.
                                    </td>
                                </tr>
                            ) : loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                        <Loader2 className="spinner" size={24} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No members in this group yet. Add employees to start.
                                    </td>
                                </tr>
                            ) : members.map((m, index) => (
                                <tr key={m.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="group-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                {m.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#1e293b' }}>{m.user.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.user.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ color: '#334155' }}>{m.user.branch?.name || 'N/A'}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.user.department?.name || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div 
                                            className={`role-badge ${m.role === 'Admin' ? 'admin' : ''}`}
                                            onClick={() => toggleRole(m)}
                                            title="Click to change role"
                                        >
                                            {m.role === 'Admin' && <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }}/>}
                                            {m.role}
                                        </div>
                                    </td>
                                    <td>
                                        <div 
                                            className={`visibility-toggle ${m.visibility ? 'visible' : 'hidden'}`}
                                            onClick={() => toggleVisibility(m)}
                                        >
                                            {m.visibility ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Hidden</>}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="action-btn delete" title="Remove Member" onClick={() => handleRemoveMember(m.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal">
                        <div className="chat-modal-header">
                            <h3>Add Member to Group</h3>
                            <button className="action-btn" onClick={() => setIsAddModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember}>
                            <div className="chat-modal-body">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', color: '#1e40af' }}>
                                        Search and select an employee to directly grant them access to this group chat.
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Select Employee *</label>
                                    <select 
                                        className="form-control" 
                                        required
                                        value={selectedUserId}
                                        onChange={e => setSelectedUserId(e.target.value)}
                                    >
                                        <option value="">-- Search Employee --</option>
                                        {allEmployees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="chat-modal-footer">
                                <button type="button" className="btn-primary" style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }} onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting || !selectedUserId}>
                                    {isSubmitting ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
