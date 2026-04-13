import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, X, Check, Users } from 'lucide-react';
import api from '../../lib/axios';
import './work-allocation-access.css';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    role: string;
}

interface Category {
    id: number;
    name: string;
    code: string;
}

interface AccessRule {
    id: number;
    assignBy: User;
    assignTo: User;
    categories: Category[];
    access_type: string;
    max_task_per_day: number;
    max_task_per_employee: number;
    allow_reassign: boolean;
    approval_required: boolean;
    status: string;
}

const WorkAllocationAccessPage = () => {
    const [rules, setRules] = useState<AccessRule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [rulesRes, adminRes, empRes, catRes] = await Promise.all([
                api.get('/work-allocation/access'),
                api.get('/admin-rights'),
                api.get('/admin-rights/employees'),
                api.get('/work-allocation/categories')
            ]);
            
            let fetchedRules = rulesRes.data;
            if (search) {
                const lowerSrc = search.toLowerCase();
                fetchedRules = fetchedRules.filter((r: AccessRule) => 
                    r.assignBy.name.toLowerCase().includes(lowerSrc) || 
                    r.assignTo.name.toLowerCase().includes(lowerSrc)
                );
            }
            setRules(fetchedRules);
            
            const allUsers = [...adminRes.data, ...empRes.data].map(u => ({ id: u.id, name: u.name, role: u.role }));
            setUsers(allUsers);
            
            setCategories(catRes.data.filter((c: any) => c.status === 'Active'));

        } catch (error) {
            toast.error("Failed to load access rules data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchInitialData();
    };

    const deleteRule = async (id: number) => {
        if (!window.confirm("Are you sure you want to deactivate this rule?")) return;
        try {
            await api.delete(`/work-allocation/access/${id}`);
            toast.success("Rule deactivated successfully");
            fetchInitialData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to deactivate rule");
        }
    };

    const toggleStatus = async (rule: AccessRule) => {
        try {
            const newStatus = rule.status === 'Active' ? 'Inactive' : 'Active';
            await api.put(`/work-allocation/access/${rule.id}`, { 
                category_ids: rule.categories.map(c => c.id),
                status: newStatus 
            });
            toast.success(`Rule marked as ${newStatus}`);
            fetchInitialData();
        } catch (error: any) {
             toast.error(error.response?.data?.message || "Failed to toggle status");
        }
    }

    const saveRule = async () => {
        if (!editingRule?.assign_by_id || !editingRule?.assign_to_id || !editingRule?.category_ids?.length) {
            return toast.error("Assign By, Assign To, and at least one Category are required");
        }
        setIsSaving(true);
        try {
            if (editingRule.id) {
                await api.put(`/work-allocation/access/${editingRule.id}`, editingRule);
                toast.success("Access Rule updated");
            } else {
                await api.post(`/work-allocation/access`, editingRule);
                toast.success("Access Rule created");
            }
            setDrawerOpen(false);
            fetchInitialData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save rule");
        } finally {
            setIsSaving(false);
        }
    };

    const openCreateDrawer = () => {
        setEditingRule({
            assign_by_id: '',
            assign_to_id: '',
            category_ids: [],
            access_type: 'Full',
            max_task_per_day: 0,
            max_task_per_employee: 0,
            allow_reassign: false,
            approval_required: false,
            status: 'Active'
        });
        setDrawerOpen(true);
    };

    const openEditDrawer = (rule: AccessRule) => {
        setEditingRule({ 
            id: rule.id,
            assign_by_id: rule.assignBy.id,
            assign_to_id: rule.assignTo.id,
            category_ids: rule.categories.map(c => c.id),
            access_type: rule.access_type,
            max_task_per_day: rule.max_task_per_day,
            max_task_per_employee: rule.max_task_per_employee,
            allow_reassign: rule.allow_reassign,
            approval_required: rule.approval_required,
            status: rule.status
        });
        setDrawerOpen(true);
    };

    const toggleCategorySelection = (catId: number) => {
        const currentIds = editingRule.category_ids || [];
        if (currentIds.includes(catId)) {
            setEditingRule({ ...editingRule, category_ids: currentIds.filter((id: number) => id !== catId) });
        } else {
            setEditingRule({ ...editingRule, category_ids: [...currentIds, catId] });
        }
    };

    return (
        <div className="wa-layout">
            <div className="wa-container">
                <div className="wa-header">
                    <div>
                        <h2>Work Allocation Access</h2>
                        <p>Define mapping rules: Who can assign which task categories to whom.</p>
                    </div>
                    <button className="btn-add-primary" onClick={openCreateDrawer}>
                        <Plus size={16} /> New Rule
                    </button>
                </div>

                <div className="wa-filters-bar">
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            className="wa-input search-input" 
                            placeholder="Search by Assigner or Assignee Name..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button className="btn-secondary" onClick={handleSearch}>Search</button>
                </div>

                <div className="wa-table-wrapper">
                    <table className="wa-table">
                        <thead>
                            <tr>
                                <th>Assign By (Manager)</th>
                                <th>Assign To (Employee)</th>
                                <th>Allowed Categories</th>
                                <th>Limits (Per Day)</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="table-loading">Loading rules...</td></tr>
                            ) : rules.length === 0 ? (
                                <tr><td colSpan={6} className="table-loading">No access rules defined.</td></tr>
                            ) : rules.map(rule => (
                                <tr key={rule.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle">{rule.assignBy.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p className="row-title">{rule.assignBy.name}</p>
                                                <p className="row-desc">{rule.assignBy.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle emp">{rule.assignTo.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p className="row-title">{rule.assignTo.name}</p>
                                                <p className="row-desc">{rule.assignTo.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cat-tags">
                                            {rule.categories.slice(0, 2).map((c: any) => (
                                                <span key={c.id} className="cat-tag" title={c.name}>{c.code}</span>
                                            ))}
                                            {rule.categories.length > 2 && <span className="cat-tag more">+{rule.categories.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="limit-badge">
                                            {rule.max_task_per_day > 0 ? `${rule.max_task_per_day} Tasks` : 'Unlimited'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`status-toggle ${rule.status.toLowerCase()}`} onClick={() => toggleStatus(rule)}>
                                            <div className="status-knob"></div>
                                            <span>{rule.status}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => openEditDrawer(rule)} title="Edit"><Edit2 size={15} /></button>
                                            <button className="btn-icon danger" onClick={() => deleteRule(rule.id)} title="Delete"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Smart Drawer for Create/Edit */}
            {drawerOpen && editingRule && (
                <div className="wa-drawer-overlay" onClick={() => setDrawerOpen(false)}>
                    <div className="wa-drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h3>{editingRule.id ? 'Edit Access Rule' : 'New Access Rule'}</h3>
                            <button className="btn-close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="drawer-body">
                            <div className="wa-input-wrapper">
                                <label>Assign By (Manager) <span className="required">*</span></label>
                                <select 
                                    className="wa-input select-field"
                                    value={editingRule.assign_by_id}
                                    onChange={e => setEditingRule({...editingRule, assign_by_id: e.target.value})}
                                    disabled={!!editingRule.id} // Cannot change mapping once created
                                >
                                    <option value="">-- Select Manager --</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                </select>
                            </div>

                            <div className="wa-input-wrapper">
                                <label>Assign To (Employee) <span className="required">*</span></label>
                                <select 
                                    className="wa-input select-field"
                                    value={editingRule.assign_to_id}
                                    onChange={e => setEditingRule({...editingRule, assign_to_id: e.target.value})}
                                    disabled={!!editingRule.id}
                                >
                                    <option value="">-- Select Employee --</option>
                                    {users.filter(u => u.id.toString() !== editingRule.assign_by_id.toString()).map(u => 
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    )}
                                </select>
                            </div>

                            <div className="wa-input-wrapper">
                                <label>Permitted Content Categories <span className="required">*</span></label>
                                <div className="categories-grid">
                                    {categories.map(c => (
                                        <label key={c.id} className={`cat-checkbox ${editingRule.category_ids?.includes(c.id) ? 'checked' : ''}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={editingRule.category_ids?.includes(c.id)}
                                                onChange={() => toggleCategorySelection(c.id)}
                                            />
                                            <span>{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="wa-input-wrapper">
                                <label>Max Tasks Per Day</label>
                                <input 
                                    type="number"
                                    className="wa-input"
                                    min="0"
                                    placeholder="0 for Unlimited"
                                    value={editingRule.max_task_per_day}
                                    onChange={e => setEditingRule({...editingRule, max_task_per_day: parseInt(e.target.value) || 0})}
                                />
                                <span className="field-hint">Leave 0 for unlimited assignment per day.</span>
                            </div>

                            <div className="flex-options">
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox"
                                        checked={editingRule.allow_reassign}
                                        onChange={e => setEditingRule({...editingRule, allow_reassign: e.target.checked})}
                                    />
                                    <div className="check-box"></div>
                                    <span>Allow re-assignment by employee</span>
                                </label>
                                
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox"
                                        checked={editingRule.approval_required}
                                        onChange={e => setEditingRule({...editingRule, approval_required: e.target.checked})}
                                    />
                                    <div className="check-box"></div>
                                    <span>Require approval upon task completion</span>
                                </label>
                            </div>
                            
                            <div className="wa-input-wrapper">
                                <label>Status</label>
                                <select 
                                    className="wa-input select-field"
                                    value={editingRule.status}
                                    onChange={e => setEditingRule({...editingRule, status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <button className="btn-cancel" onClick={() => setDrawerOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={saveRule} disabled={isSaving}>
                                {isSaving ? 'Saving...' : (editingRule.id ? 'Save Changes' : 'Create Rule')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkAllocationAccessPage;
