import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Send, 
    Users, 
    Building, 
    User, 
    Check,
    AlertCircle,
    Loader2,
    FileText,
    Image as ImageIcon,
    AtSign,
    Search,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Plus
} from 'lucide-react';
import api from '../../lib/axios';

interface AddDiscussionProps {
    onClose: () => void;
    onSuccess: () => void;
}

// Internal icon for better aesthetic - Moved to top for Hoisting safety
const MessageCircleV2 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
);

const AddDiscussion: React.FC<AddDiscussionProps> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Targeting State
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
    const [selectedDepts, setSelectedDepts] = useState<number[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    // Dropdown visibility
    const [openDropdown, setOpenDropdown] = useState<'branch' | 'dept' | 'user' | null>(null);

    // Filter states
    const [branchSearch, setBranchSearch] = useState('');
    const [deptSearch, setDeptSearch] = useState('');
    const [empSearch, setEmpSearch] = useState('');

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}') || {};
        } catch {
            return {};
        }
    })();

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTargetOptions();
        
        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTargetOptions = async () => {
        try {
            const [bRes, dRes, eRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments'),
                api.get('/search/employees?limit=100')
            ]);
            setBranches(bRes.data || []);
            setDepartments(dRes.data || []);
            setEmployees(eRes.data || []);
        } catch (err) {
            console.error('Failed to fetch targeting options', err);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachments(prev => [...prev, res.data]);
        } catch (err) {
            console.error('Upload failed', err);
            alert('File upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            setIsSubmitting(true);
            await api.post('/discussions/manage', {
                title,
                description,
                created_by: currentUser?.id || 1,
                branchIds: selectedBranches,
                deptIds: selectedDepts,
                userIds: selectedUsers,
                attachments: attachments
            });
            onSuccess();
        } catch (err) {
            console.error('Failed to create discussion', err);
            alert('Error creating discussion. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelection = (e: React.MouseEvent, id: number, type: 'branch' | 'dept' | 'user') => {
        e.stopPropagation();
        if (type === 'branch') {
            setSelectedBranches(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else if (type === 'dept') {
            setSelectedDepts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    // Filtered lists
    const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()));
    const filteredDepts = departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()));
    const filteredEmps = employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()));

    const DropdownMenu = ({ type, title, search, setSearch, items, selected, onToggle }: any) => (
        <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{title}</label>
                <span style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '6px' }}>{selected.length} Selected</span>
            </div>
            
            <div 
                onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
                style={{ 
                    width: '100%', 
                    background: '#fff', 
                    border: '1px solid #bfdbfe', 
                    borderRadius: '14px', 
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    minHeight: '48px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
            >
                <span style={{ fontSize: '14px', color: selected.length > 0 ? '#1e293b' : '#94a3b8' }}>
                    {selected.length > 0 ? `${selected.length} Item(s) Selected` : `Select ${title}...`}
                </span>
                {openDropdown === type ? <ChevronUp size={18} style={{ color: '#3b82f6' }} /> : <ChevronDown size={18} style={{ color: '#94a3b8' }} />}
            </div>

            {openDropdown === type && (
                <div 
                    ref={dropdownRef}
                    style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        right: 0, 
                        background: '#fff', 
                        borderRadius: '16px', 
                        marginTop: '8px', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                        border: '1px solid #e2e8f0',
                        zIndex: 2000,
                        padding: '12px'
                    }}
                >
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <input 
                            type="text" 
                            placeholder={`Filter ${title.toLowerCase()}...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                            style={{ width: '100%', fontSize: '12px', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#f8fafc' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#60a5fa' }} />
                    </div>
                    
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {items.length === 0 && <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>No options found.</div>}
                        {items.map((item: any) => (
                            <div 
                                key={item.id} 
                                onClick={(e) => onToggle(e, item.id, type)}
                                style={{ 
                                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px',
                                    background: selected.includes(item.id) ? '#eff6ff' : 'transparent',
                                    color: selected.includes(item.id) ? '#3b82f6' : '#475569',
                                    fontWeight: selected.includes(item.id) ? 700 : 400
                                }}
                            >
                                {item.name}
                                {selected.includes(item.id) && <CheckCircle2 size={14} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-content discussion-modal" onClick={e => e.stopPropagation()} style={{ 
                padding: 0, 
                borderRadius: '32px', 
                overflow: 'visible', // Change to visible for dropdowns
                maxWidth: '900px', 
                width: '95%',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div className="modal-header" style={{ padding: '32px 40px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                            <MessageCircleV2 size={32} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>Start a New Discussion</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Communicate, collaborate & grow together.</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose} style={{ background: '#f1f5f9', borderRadius: '12px', padding: '10px' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px', maxHeight: '80vh', overflowY: 'auto', overflowX: 'visible' }}>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '48px' }}>
                        {/* Topic Details */}
                        <div className="form-left">
                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>Discussion Title*</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g. Feedback on New Office Layout" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    style={{ 
                                        borderRadius: '16px', 
                                        padding: '16px 20px', 
                                        fontSize: '16px', 
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        transition: 'all 0.2s',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>Description / Details</label>
                                <textarea 
                                    className="form-control" 
                                    rows={6} 
                                    placeholder="Provide more context for the discussion..." 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{ 
                                        borderRadius: '20px', 
                                        padding: '20px', 
                                        fontSize: '15px', 
                                        border: '2px solid #f1f5f9',
                                        background: '#f8fafc',
                                        width: '100%',
                                        resize: 'none'
                                    }}
                                ></textarea>
                            </div>

                            {/* Attachments Area */}
                            <div className="attachments-section" style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ImageIcon size={16} /> Attach Files (Images/Docs)
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    <label className="attachment-btn-v2" style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '100px',
                                        height: '100px',
                                        border: '2px dashed #cbd5e1', 
                                        borderRadius: '16px', 
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        color: '#64748b',
                                        transition: 'all 0.2s'
                                    }}>
                                        <Plus size={20} />
                                        <span style={{ marginTop: '8px' }}>Add File</span>
                                        <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                                    </label>

                                    {attachments.map((file, idx) => {
                                        const isImg = file.file_type?.startsWith('image/');
                                        return (
                                            <div key={idx} style={{ 
                                                width: '100px',
                                                height: '100px',
                                                background: '#fff',
                                                borderRadius: '16px',
                                                border: '1px solid #e2e8f0',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {isImg ? (
                                                    <img src={file.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Attachment" />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                                                        <FileText size={24} style={{ color: '#3b82f6' }} />
                                                        <span style={{ fontSize: '10px', padding: '0 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                                    </div>
                                                )}
                                                <button 
                                                    type="button"
                                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                    style={{ 
                                                        position: 'absolute', top: '4px', right: '4px', 
                                                        background: 'rgba(255,255,255,0.9)', 
                                                        borderRadius: '6px', 
                                                        padding: '2px', 
                                                        border: 'none', 
                                                        cursor: 'pointer',
                                                        color: '#ef4444',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {isUploading && (
                                        <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Loader2 size={24} className="spinner" style={{ color: '#3b82f6' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Targeting Panel */}
                        <div className="form-right" style={{ overflow: 'visible' }}>
                            <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '28px', border: '1px solid #dbeafe', minHeight: '400px' }}>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Users size={20} /> Target Audience
                                </div>
                                <p style={{ fontSize: '13px', color: '#60a5fa', marginBottom: '24px', marginTop: '-12px' }}>
                                    Leave empty to broadcast to everyone.
                                </p>

                                <DropdownMenu 
                                    type="branch" title="Branches" 
                                    search={branchSearch} setSearch={setBranchSearch} 
                                    items={filteredBranches} selected={selectedBranches} 
                                    onToggle={toggleSelection} 
                                />

                                <DropdownMenu 
                                    type="dept" title="Departments" 
                                    search={deptSearch} setSearch={setDeptSearch} 
                                    items={filteredDepts} selected={selectedDepts} 
                                    onToggle={toggleSelection} 
                                />

                                <DropdownMenu 
                                    type="user" title="Employees" 
                                    search={empSearch} setSearch={setEmpSearch} 
                                    items={filteredEmps} selected={selectedUsers} 
                                    onToggle={toggleSelection} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '48px', padding: 0, display: 'flex', gap: '20px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, height: '56px', borderRadius: '18px', fontSize: '16px' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading} style={{ 
                            flex: 2, height: '56px', borderRadius: '18px', fontSize: '16px', fontWeight: 800,
                            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
                        }}>
                            {isSubmitting ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
                            {isSubmitting ? 'Launching Discussion...' : 'Post Community Topic'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Removed MessageCircleV2 from bottom to fix initialization crash

export default AddDiscussion;
