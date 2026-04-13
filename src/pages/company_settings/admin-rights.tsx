import { useState, useEffect } from 'react';
import { Check, Building, LayoutTemplate, UserPlus, Trash2, Key, Shield } from 'lucide-react';
import api from '../../lib/axios';
import './admin-rights.css';

interface Admin {
    id: number;
    name: string;
    email: string;
    role: string;
    adminBranchRestrictions: { branch_id: number, branch: { name: string } }[];
    adminDepartmentRestrictions: { department_id: number, department: { name: string } }[];
    permissions?: any;
}

interface ReferenceData {
    id: number;
    name: string;
    code?: string;
    branch?: { name: string };
}

export default function AdminRights() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [employees, setEmployees] = useState<Admin[]>([]);
    const [branches, setBranches] = useState<ReferenceData[]>([]);
    const [departments, setDepartments] = useState<ReferenceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [branchSelection, setBranchSelection] = useState<number[]>([]);
    const [departmentSelection, setDepartmentSelection] = useState<number[]>([]);
    const [allBranches, setAllBranches] = useState(true);
    const [allDepartments, setAllDepartments] = useState(true);
    const [modulePermissions, setModulePermissions] = useState<Record<string, boolean>>({});

    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('Admin');
    const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

    const [adminResetPasswordValue, setAdminResetPasswordValue] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [adminsRes, empRes, refRes] = await Promise.all([
                api.get('/admin-rights'),
                api.get('/admin-rights/employees'),
                api.get('/admin-rights/references')
            ]);
            setAdmins(adminsRes.data);
            setEmployees(empRes.data);
            setBranches(refRes.data.branches);
            setDepartments(refRes.data.departments);
        } catch (error) {
            console.error('Failed to load admin rights dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        let passwordToUse = newUserPassword;
        if (!passwordToUse) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            let pass = "";
            for (let i = 0; i < 12; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            passwordToUse = pass;
        }

        try {
            await api.post('/auth/add-user', {
                name: newUserName,
                email: newUserEmail,
                password: passwordToUse,
                role: newUserRole,
                sendEmail: sendWelcomeEmail
            });
            alert('User created successfully!');

            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create user.');
        }
    };

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewUserPassword(pass);
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            await api.delete(`/auth/user/${id}`);
            fetchData();
            if (selectedAdmin?.id === id) setSelectedAdmin(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete user.');
        }
    };

    const handleSelectAdmin = (admin: Admin) => {
        setSelectedAdmin(admin);
        const bList = admin.adminBranchRestrictions.map(r => r.branch_id);
        const dList = admin.adminDepartmentRestrictions.map(r => r.department_id);

        setBranchSelection(bList);
        setDepartmentSelection(dList);

        // If they have 0 specific restrictions mapped in DB, it means they have "All Access".
        setAllBranches(bList.length === 0);
        setAllDepartments(dList.length === 0);

        // Populate module permissions
        let perms = {};
        if (admin.permissions) {
            perms = typeof admin.permissions === 'string'
                ? JSON.parse(admin.permissions)
                : admin.permissions;
        }
        setModulePermissions(perms);
    };

    const handleSave = async () => {
        if (!selectedAdmin) return;

        try {
            await Promise.all([
                api.put(`/admin-rights/${selectedAdmin.id}/branches`, {
                    isAll: allBranches,
                    branchIds: allBranches ? [] : branchSelection
                }),
                api.put(`/admin-rights/${selectedAdmin.id}/departments`, {
                    isAll: allDepartments,
                    departmentIds: allDepartments ? [] : departmentSelection
                }),
                api.put(`/admin-rights/${selectedAdmin.id}/permissions`, {
                    permissions: modulePermissions
                })
            ]);

            alert('Restrictions updated successfully!');
            fetchData();
            setSelectedAdmin(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to update restrictions');
        }
    };

    const toggleBranch = (id: number) => {
        setBranchSelection(prev =>
            prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
        );
    };

    const toggleDepartment = (id: number) => {
        setDepartmentSelection(prev =>
            prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
        );
    };

    const togglePermission = (moduleName: string) => {
        setModulePermissions(prev => ({
            ...prev,
            [moduleName]: !prev[moduleName]
        }));
    };

    const modules = [
        "Dashboard",
        "Company Settings",
        "Attendance",
        "Employee Tracking",
        "Visit Management",
        "Daily Work Report",
        "Core HRMS",
        "Finance & Accounting",
        "Productivity & Tracking",
        "CRM",
        "Effective Communication",
        "Orders & Visits",
        "Analytics & Reports",
        "Industry Modules",
        "Knowledge Center",
        "Assets & Resources",
        "Other Utilities",
        "Contact Support Team",
        "Tax Exemption",
        "Payroll",
        "Meeting"
    ];

    const handleAdminPasswordReset = async () => {
        if (!selectedAdmin) return;
        if (!adminResetPasswordValue) {
            alert('Please enter a new password.');
            return;
        }

        try {
            await api.put(`/auth/user/${selectedAdmin.id}/password`, {
                password: adminResetPasswordValue
            });
            alert('Password successfully force-reset!');
            setAdminResetPasswordValue('');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to force-reset password.');
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading Admin Configs...</div>;

    return (
        <div className="ar-container">
            <div className="ar-header">
                <div>
                    <h1><Shield className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Roles & Privileges</h1>
                    <p>Configure data access silos and restrictions for Admin users</p>
                </div>
            </div>

            <div className="ar-layout split">
                <div className="ar-card">
                    <h2>Admin Users</h2>
                    <div className="ar-list">
                        {admins.map((admin) => (
                            <div key={admin.id} className={`ar-admin-item ${selectedAdmin?.id === admin.id ? 'selected' : ''}`}>
                                <div className="ar-admin-left">
                                    <div className="ar-avatar">{admin.name.charAt(0).toUpperCase()}</div>
                                    <div className="ar-admin-info">
                                        <h4>{admin.name}</h4>
                                        <p>{admin.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="ar-admin-stats">
                                        <div className="ar-stat">
                                            <span className="label">Branches</span>
                                            {admin.adminBranchRestrictions.length === 0 ? <span className="val-all">ALL</span> : <span className="val-restricted">{admin.adminBranchRestrictions.length}</span>}
                                        </div>
                                        <div className="ar-stat">
                                            <span className="label">Depts</span>
                                            {admin.adminDepartmentRestrictions.length === 0 ? <span className="val-all">ALL</span> : <span className="val-restricted">{admin.adminDepartmentRestrictions.length}</span>}
                                        </div>
                                    </div>
                                    <button className="btn-configure" onClick={() => handleSelectAdmin(admin)}>Configure</button>
                                    <button className="btn-cancel" style={{ marginLeft: '8px', padding: '8px' }} onClick={() => handleDeleteUser(admin.id)} title="Remove User"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ marginTop: '32px' }}>Employee Users</h2>
                    <div className="ar-list">
                        {employees.map((emp) => (
                            <div key={emp.id} className={`ar-admin-item ${selectedAdmin?.id === emp.id ? 'selected' : ''}`}>
                                <div className="ar-admin-left">
                                    <div className="ar-avatar" style={{ background: '#10b981' }}>{emp.name.charAt(0).toUpperCase()}</div>
                                    <div className="ar-admin-info">
                                        <h4>{emp.name}</h4>
                                        <p>{emp.email}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="ar-admin-stats">
                                        <div className="ar-stat">
                                            <span className="label">Branches</span>
                                            {emp.adminBranchRestrictions.length === 0 ? <span className="val-all">ALL</span> : <span className="val-restricted">{emp.adminBranchRestrictions.length}</span>}
                                        </div>
                                        <div className="ar-stat">
                                            <span className="label">Depts</span>
                                            {emp.adminDepartmentRestrictions.length === 0 ? <span className="val-all">ALL</span> : <span className="val-restricted">{emp.adminDepartmentRestrictions.length}</span>}
                                        </div>
                                    </div>
                                    <button className="btn-configure" onClick={() => handleSelectAdmin(emp)}>Configure</button>
                                    <button className="btn-cancel" style={{ marginLeft: '8px', padding: '8px' }} onClick={() => handleDeleteUser(emp.id)} title="Remove User"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ar-config-wrapper">
                    {selectedAdmin ? (
                        <div className="ar-card">
                            <h2>Configuring: {selectedAdmin.name}</h2>

                            <div className="ar-config-section" style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div className="ar-config-header" style={{ marginBottom: '12px' }}>
                                    <Key size={18} color="#ef4444" />
                                    <h3 style={{ margin: 0 }}>Force Password Reset</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter new password"
                                        value={adminResetPasswordValue}
                                        onChange={(e) => setAdminResetPasswordValue(e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                    <button className="btn-save" onClick={handleAdminPasswordReset} style={{ background: '#ef4444' }}>Update</button>
                                </div>
                            </div>

                            <div className="ar-config-section" style={{ marginBottom: '24px' }}>
                                <div className="ar-config-header">
                                    <Building size={18} color="#3b82f6" />
                                    <h3>Branch Restrictions</h3>
                                </div>
                                <div className="ar-config-body">
                                    <label className={`ar-toggle-card ${allBranches ? 'active' : ''}`}>
                                        <input type="checkbox" checked={allBranches} onChange={(e) => { setAllBranches(e.target.checked); if (e.target.checked) setBranchSelection([]); }} />
                                        <div className="ar-toggle-text"><strong>Unrestricted Access</strong><span>Admin can view data across ALL branches.</span></div>
                                    </label>
                                    {!allBranches && (
                                        <div className="ar-select-grid">
                                            {branches.map(b => (
                                                <label key={b.id} className={`ar-select-item ${branchSelection.includes(b.id) ? 'selected' : ''}`}>
                                                    <input type="checkbox" checked={branchSelection.includes(b.id)} onChange={() => toggleBranch(b.id)} />
                                                    <div className="ar-select-label"><span>{b.name}</span></div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ar-config-section" style={{ marginBottom: '24px' }}>
                                <div className="ar-config-header">
                                    <LayoutTemplate size={18} color="#10b981" />
                                    <h3>Department Restrictions</h3>
                                </div>
                                <div className="ar-config-body">
                                    <label className={`ar-toggle-card ${allDepartments ? 'active' : ''}`}>
                                        <input type="checkbox" checked={allDepartments} onChange={(e) => { setAllDepartments(e.target.checked); if (e.target.checked) setDepartmentSelection([]); }} />
                                        <div className="ar-toggle-text"><strong>Unrestricted Access</strong><span>Admin can view data across ALL departments.</span></div>
                                    </label>
                                    {!allDepartments && (
                                        <div className="ar-select-grid">
                                            {departments.map(d => (
                                                <label key={d.id} className={`ar-select-item ${departmentSelection.includes(d.id) ? 'selected' : ''}`}>
                                                    <input type="checkbox" checked={departmentSelection.includes(d.id)} onChange={() => toggleDepartment(d.id)} />
                                                    <div className="ar-select-label"><strong>{d.branch?.name || 'Unknown'}</strong><span>{d.name}</span></div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ar-config-section">
                                <div className="ar-config-header">
                                    <Shield size={18} color="#f59e0b" />
                                    <h3>Module Visibility / Custom Role</h3>
                                </div>
                                <div className="ar-config-body">
                                    <div className="ar-select-grid">
                                        {modules.map(module => (
                                            <label key={module} className={`ar-select-item ${modulePermissions[module] ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!modulePermissions[module]}
                                                    onChange={() => togglePermission(module)}
                                                />
                                                <div className="ar-select-label"><span>{module}</span></div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={() => setSelectedAdmin(null)}>Cancel</button>
                                <button className="btn-save" onClick={handleSave}><Check size={16} /> Save Privileges</button>
                            </div>
                        </div>
                    ) : (
                        <div className="ar-card">
                            <h2>Create New User</h2>
                            <form onSubmit={handleAddUser} style={{ marginTop: '20px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Full Name *</label>
                                    <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email Address *</label>
                                    <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Password (Leave empty for auto-gen)</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Auto-generated if empty"
                                            value={newUserPassword}
                                            onChange={e => setNewUserPassword(e.target.value)}
                                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={generateRandomPassword}
                                            style={{ padding: '0 12px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '12px' }}
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>System Role *</label>
                                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="Admin">Administrator</option>
                                        <option value="Employee">Employee</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                        <input
                                            type="checkbox"
                                            checked={sendWelcomeEmail}
                                            onChange={e => setSendWelcomeEmail(e.target.checked)}
                                        />
                                        Send Welcome Email with credentials
                                    </label>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <button type="submit" className="btn-save"><UserPlus size={16} /> Create User</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
