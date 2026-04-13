import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, X, Save, UserCircle, QrCode, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './id-card-templates.css';
import './assign-employee-grade.css'; // Reuse table and modal styles

interface IDCardTemplate {
    id: string; // db id
    templateName: string;
    templateType: 'Employee' | 'Contractor' | 'Visitor';
    branchDept: string;
    status: 'Active' | 'Inactive';
}

export default function IDCardTemplates() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<IDCardTemplate | null>(null);

    const [templates, setTemplates] = useState<IDCardTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [templateName, setTemplateName] = useState('');
    const [templateType, setTemplateType] = useState<'Employee' | 'Contractor' | 'Visitor'>('Employee');
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    // Lookup data
    const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [employees, setEmployees] = useState<{ id: number; name: string; employee_id: string; designation?: string }[]>([]);

    // Employee preview fields
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [empName, setEmpName] = useState('');
    const [empId, setEmpId] = useState('');
    const [designation, setDesignation] = useState('');
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [templatesRes, branchesRes, deptsRes, usersRes] = await Promise.all([
                fetch('/api/id-card-templates'),
                fetch('/api/branches'),
                fetch('/api/departments'),
                fetch('/api/auth/users'),
            ]);

            if (branchesRes.ok) setBranches(await branchesRes.json());
            if (deptsRes.ok) setDepartments(await deptsRes.json());
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setEmployees(Array.isArray(usersData) ? usersData : []);
            }

            if (templatesRes.ok) {
                const data = await templatesRes.json();
                const mapped: IDCardTemplate[] = data.map((item: { id: number, template_name: string, template_type: string, branch_id: number | null, department_id: number | null, status: 'Active' | 'Inactive', branch?: { name: string } | null, department?: { name: string } | null }) => ({
                    id: item.id.toString(),
                    templateName: item.template_name,
                    templateType: item.template_type as 'Employee' | 'Contractor' | 'Visitor',
                    branchDept: item.branch?.name ? `Branch: ${item.branch.name}` : (item.department?.name ? `Dept: ${item.department.name}` : 'All Branches'),
                    status: item.status
                }));
                setTemplates(mapped);
            }
        } catch (error) {
            console.error("Failed to load templates", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingTemplate(null);
        setTemplateName('');
        setTemplateType('Employee');
        setSelectedBranchId('');
        setSelectedDeptId('');
        setStatus('Active');
        setSelectedEmployeeId('');
        setEmpName('');
        setEmpId('');
        setDesignation('');
        setShowQR(false);
        setIsModalOpen(true);
    };

    const handleEditClick = (template: IDCardTemplate) => {
        setEditingTemplate(template);
        setTemplateName(template.templateName);
        setTemplateType(template.templateType);
        setSelectedBranchId('');
        setSelectedDeptId('');
        setStatus(template.status);
        setSelectedEmployeeId('');
        setEmpName('');
        setEmpId('');
        setDesignation('');
        setShowQR(false);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            const res = await fetch(`/api/id-card-templates/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                alert("Failed to delete template.");
            }
        } catch (error) {
            console.error("Error deleting template", error);
        }
    };

    const handleSave = async () => {
        if (!templateName || !templateType) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                template_name: templateName,
                template_type: templateType,
                branch_id: selectedBranchId ? parseInt(selectedBranchId) : null,
                department_id: selectedDeptId ? parseInt(selectedDeptId) : null,
                status
            };

            let res;
            if (editingTemplate) {
                res = await fetch(`/api/id-card-templates/${editingTemplate.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/id-card-templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save template');
            }
        } catch (error) {
            console.error("Error saving template", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEmployeeSelect = (userId: string) => {
        setSelectedEmployeeId(userId);
        if (!userId) {
            setEmpName('');
            setEmpId('');
            setDesignation('');
            return;
        }
        const emp = employees.find(e => e.id.toString() === userId);
        if (emp) {
            setEmpName(emp.name);
            setEmpId(emp.employee_id || `EMP-${String(emp.id).padStart(3, '0')}`);
            setDesignation(emp.designation || '');
        }
    };

    const getQRValue = () => JSON.stringify({
        name: empName || 'Employee Name',
        id: empId || 'EMP-ID',
        designation: designation || 'Designation',
        type: templateType,
        template: templateName || 'ID Card Template',
    });

    const getTypeColor = (tType: string) => {
        switch (tType) {
            case 'Employee': return { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' };
            case 'Visitor': return { bg: '#fff7ed', color: '#f97316', border: '#fed7aa' };
            case 'Contractor': return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
            default: return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        }
    };

    return (
        <div className="id-card-layout">
            <div className="table-card">
                <div className="table-header-title">
                    <h2><CreditCard className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />ID Card Templates</h2>
                    <div className="header-actions">
                        <button className="btn-primary" onClick={handleAddClick}>
                            <Plus size={16} /> Add Template
                        </button>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Template Name</th>
                            <th>Template Type</th>
                            <th>Branch / Department</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading templates...</div>
                                </td>
                            </tr>
                        ) : templates.length > 0 ? (
                            templates.map((template) => {
                                const typeStyle = getTypeColor(template.templateType);
                                return (
                                    <tr key={template.id}>
                                        <td><strong>{template.templateName}</strong></td>
                                        <td>
                                            <span
                                                className="card-type-badge"
                                                style={{ background: typeStyle.bg, color: typeStyle.color, borderColor: typeStyle.border }}
                                            >
                                                <CreditCard size={14} /> {template.templateType}
                                            </span>
                                        </td>
                                        <td>{template.branchDept}</td>
                                        <td>
                                            <span className={`status-badge ${template.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(template)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn-icon-only delete" title="Delete" onClick={() => handleDelete(template.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No templates found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px', width: '95%' }}>
                        <div className="modal-header">
                            <h3><CreditCard size={20} className="text-blue" /> {editingTemplate ? 'Edit ID Card Template' : 'Add ID Card Template'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', maxHeight: '78vh', overflowY: 'auto' }}>
                            {/* Left Settings */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <label>Template Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Standard Employee ID"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label>Template Type <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            value={templateType}
                                            onChange={(e) => setTemplateType(e.target.value as 'Employee' | 'Contractor' | 'Visitor')}
                                        >
                                            <option value="Employee">Employee</option>
                                            <option value="Contractor">Contractor</option>
                                            <option value="Visitor">Visitor</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-select"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label>Branch Filter <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Optional)</span></label>
                                        <select
                                            className="form-select"
                                            value={selectedBranchId}
                                            onChange={(e) => { setSelectedBranchId(e.target.value); setSelectedDeptId(''); }}
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Dept Filter <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Optional)</span></label>
                                        <select
                                            className="form-select"
                                            value={selectedDeptId}
                                            onChange={(e) => { setSelectedDeptId(e.target.value); setSelectedBranchId(''); }}
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ── Employee Preview Fields ── */}
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>Preview Data (Optional)</div>

                                    <div className="form-group" style={{ marginBottom: '12px' }}>
                                        <label>Select Employee</label>
                                        <select
                                            className="form-select"
                                            value={selectedEmployeeId}
                                            onChange={(e) => handleEmployeeSelect(e.target.value)}
                                        >
                                            <option value="">-- Select Employee --</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="form-group">
                                            <label>Employee Name</label>
                                            <input
                                                type="text" className="form-input"
                                                placeholder="e.g. John Doe"
                                                value={empName}
                                                onChange={e => setEmpName(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>EMP ID</label>
                                            <input
                                                type="text" className="form-input"
                                                placeholder="e.g. EMP-001"
                                                value={empId}
                                                onChange={e => setEmpId(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginTop: '10px' }}>
                                        <label>Designation</label>
                                        <input
                                            type="text" className="form-input"
                                            placeholder="e.g. Software Engineer"
                                            value={designation}
                                            onChange={e => setDesignation(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowQR(prev => !prev)}
                                        style={{
                                            marginTop: '12px', width: '100%', padding: '9px',
                                            border: `2px solid ${showQR ? '#3b82f6' : '#e2e8f0'}`,
                                            background: showQR ? '#eff6ff' : '#f8fafc',
                                            color: showQR ? '#3b82f6' : '#64748b',
                                            borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontSize: '13px', transition: 'all 0.2s',
                                        }}
                                    >
                                        <QrCode size={16} />
                                        {showQR ? 'QR Enabled in Preview' : 'Generate QR Code'}
                                    </button>
                                </div>
                            </div>
                            {/* Right Preview - LIVE */}
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Live Preview
                                    <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>● Updates as you type</span>
                                </label>
                                <div className="preview-container">
                                    {/* Redesigned ID Card — clean top-to-bottom layout */}
                                    <div style={{
                                        width: '200px',
                                        borderRadius: '14px',
                                        border: `2px solid ${templateType === 'Employee' ? '#3b82f6' : templateType === 'Visitor' ? '#f97316' : '#94a3b8'}`,
                                        boxShadow: `0 6px 24px ${templateType === 'Employee' ? '#3b82f625' : templateType === 'Visitor' ? '#f9731625' : '#94a3b825'}`,
                                        overflow: 'hidden',
                                        background: '#fff',
                                        margin: '0 auto',
                                        fontFamily: 'sans-serif',
                                    }}>
                                        {/* ── Header strip ── */}
                                        <div style={{
                                            background: templateType === 'Employee'
                                                ? 'linear-gradient(135deg, #3b82f6, #1e40af)'
                                                : templateType === 'Visitor'
                                                    ? 'linear-gradient(135deg, #f97316, #c2410c)'
                                                    : 'linear-gradient(135deg, #64748b, #334155)',
                                            padding: '10px 8px 10px',
                                            textAlign: 'center',
                                        }}>
                                            <div style={{ color: '#1e293b', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                                {templateType}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '7px', marginTop: '2px', letterSpacing: '0.5px' }}>
                                                {templateName || 'ID Card Template'}
                                            </div>
                                        </div>

                                        {/* ── Profile photo ── */}
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            padding: '12px 8px 6px',
                                            background: '#f8fafc',
                                            borderBottom: '1px solid #f1f5f9',
                                        }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '50%',
                                                background: '#fff',
                                                border: `2px solid ${templateType === 'Employee' ? '#3b82f6' : templateType === 'Visitor' ? '#f97316' : '#94a3b8'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            }}>
                                                <UserCircle size={34} color={
                                                    templateType === 'Employee' ? '#3b82f6'
                                                        : templateType === 'Visitor' ? '#f97316' : '#64748b'
                                                } />
                                            </div>
                                        </div>

                                        {/* ── Employee Info ── */}
                                        <div style={{ padding: '8px 10px', textAlign: 'center', background: '#fff' }}>
                                            <div style={{ fontWeight: 800, fontSize: '11px', color: '#1e293b', marginBottom: '2px' }}>
                                                {empName || 'Employee Name'}
                                            </div>
                                            <div style={{ fontSize: '8.5px', color: '#64748b', marginBottom: '6px' }}>
                                                {designation || 'Designation'}
                                            </div>

                                            {/* EMP-ID pill */}
                                            <div style={{
                                                display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
                                                background: templateType === 'Employee' ? '#eff6ff' : templateType === 'Visitor' ? '#fff7ed' : '#f1f5f9',
                                                border: `1px solid ${templateType === 'Employee' ? '#bfdbfe' : templateType === 'Visitor' ? '#fed7aa' : '#e2e8f0'}`,
                                                fontSize: '8px', fontWeight: 700,
                                                color: templateType === 'Employee' ? '#3b82f6' : templateType === 'Visitor' ? '#f97316' : '#64748b',
                                                marginBottom: '4px',
                                            }}>
                                                {empId || 'EMP-ID'}
                                            </div>

                                            {/* Branch/Dept label */}
                                            {(selectedBranchId || selectedDeptId) && (
                                                <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '2px' }}>
                                                    {selectedBranchId
                                                        ? `${branches.find(b => b.id.toString() === selectedBranchId)?.name || 'Branch'}`
                                                        : `${departments.find(d => d.id.toString() === selectedDeptId)?.name || 'Dept'}`
                                                    }
                                                </div>
                                            )}
                                        </div>

                                        {/* ── QR Code ── */}
                                        <div style={{
                                            padding: '6px 0 8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderTop: '1px solid #f1f5f9',
                                            background: '#fff',
                                        }}>
                                            {showQR ? (
                                                <QRCodeSVG
                                                    value={getQRValue()}
                                                    size={52}
                                                    bgColor="#ffffff"
                                                    fgColor={templateType === 'Employee' ? '#3b82f6' : templateType === 'Visitor' ? '#f97316' : '#64748b'}
                                                    level="M"
                                                />
                                            ) : (
                                                <div style={{ padding: '5px', border: '1px dashed #e2e8f0', borderRadius: '6px', display: 'flex' }}>
                                                    <QrCode size={30} color={templateType === 'Employee' ? '#3b82f6' : templateType === 'Visitor' ? '#f97316' : '#64748b'} />
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Status footer ── */}
                                        <div style={{
                                            background: status === 'Active' ? '#dcfce7' : '#fef2f2',
                                            padding: '4px',
                                            textAlign: 'center',
                                            borderTop: `1px solid ${status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
                                        }}>
                                            <span style={{
                                                fontSize: '7.5px', fontWeight: 700,
                                                color: status === 'Active' ? '#16a34a' : '#ef4444',
                                                letterSpacing: '0.5px',
                                            }}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
