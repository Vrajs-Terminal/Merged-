// Escalation Module: Raise Issue Form
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Send, 
    Users, 
    Building, 
    User as UserIcon, 
    Check,
    AlertCircle,
    Loader2,
    FileText,
    Image as ImageIcon,
    Search,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Plus,
    Flag,
    ShieldAlert
} from 'lucide-react';
import api from '../../lib/axios';

interface AddEscalationProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddEscalation: React.FC<AddEscalationProps> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('General');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Targeting State
    const [branches, setBranches] = useState<any[]>([]);
    const [receivers, setReceivers] = useState<any[]>([]);
    
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);

    // Dropdown visibility
    const [openDropdown, setOpenDropdown] = useState<'branch' | 'receiver' | null>(null);

    // Filter states
    const [branchSearch, setBranchSearch] = useState('');
    const [receiverSearch, setReceiverSearch] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}') || {};
        } catch {
            return { id: 1 };
        }
    })();

    useEffect(() => {
        fetchOptions();
        
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchOptions = async () => {
        try {
            const [bRes, uRes] = await Promise.all([
                api.get('/branches'),
                api.get('/search/employees?limit=100') // Admins/Managers usually receive escalations
            ]);
            setBranches(bRes.data || []);
            setReceivers(uRes.data || []);
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
        if (!title.trim() || !description.trim()) {
            alert('Please fill in required fields.');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/escalations', {
                title,
                description,
                sender_id: currentUser?.id || 1,
                receiver_id: selectedReceiver,
                branch_id: selectedBranch,
                priority,
                category,
                attachments: attachments
            });
            onSuccess();
        } catch (err) {
            console.error('Failed to raise escalation', err);
            alert('Error raising escalation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()));
    const filteredReceivers = receivers.filter(r => r.name.toLowerCase().includes(receiverSearch.toLowerCase()));

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-content escalation-modal" onClick={e => e.stopPropagation()} style={{ 
                padding: 0, 
                borderRadius: '32px', 
                overflow: 'visible',
                maxWidth: '900px', 
                width: '95%',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div className="modal-header" style={{ padding: '32px 40px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: '#fef2f2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>Raise Escalation</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Report an issue for management review.</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose} style={{ background: '#f1f5f9', borderRadius: '12px', padding: '10px', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px', maxHeight: '80vh', overflowY: 'auto', overflowX: 'visible' }}>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
                        
                        <div className="form-left">
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Issue Subject / Title*</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Brief summary of the issue..." 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    style={{ width: '100%', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Detailed Description*</label>
                                <textarea 
                                    className="form-control" 
                                    rows={6} 
                                    placeholder="Explain the situation in detail..." 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    style={{ width: '100%', borderRadius: '18px', padding: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', resize: 'none' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Priority Level</label>
                                    <select 
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        style={{ width: '100%', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none' }}
                                    >
                                        <option value="Urgent">🚨 Urgent</option>
                                        <option value="High">🔴 High</option>
                                        <option value="Medium">🟠 Medium</option>
                                        <option value="Low">🔵 Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Category</label>
                                    <select 
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        style={{ width: '100%', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none' }}
                                    >
                                        <option value="General">General</option>
                                        <option value="Disciplinary">Disciplinary</option>
                                        <option value="Operational">Operational</option>
                                        <option value="Harassment">Harassment</option>
                                        <option value="Financial">Financial</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ImageIcon size={16} /> Evidence / Attachments
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    <label style={{ 
                                        width: '80px', height: '80px', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b'
                                    }}>
                                        <Plus size={20} />
                                        <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                                    </label>

                                    {attachments.map((file, idx) => (
                                        <div key={idx} style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                                            {file.file_type?.startsWith('image/') ? (
                                                <img src={file.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileText size={20} style={{ color: '#3b82f6' }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isUploading && <Loader2 className="spinner" size={24} style={{ color: '#3b82f6' }} />}
                                </div>
                            </div>
                        </div>

                        <div className="form-right" style={{ overflow: 'visible' }}>
                            <div style={{ background: '#fef2f2', padding: '24px', borderRadius: '24px', border: '1px solid #fee2e2' }}>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#991b1b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Users size={20} /> Routing
                                </div>

                                {/* Custom Selection Menus */}
                                <div style={{ position: 'relative', marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>Target Branch</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'branch' ? null : 'branch')}
                                        style={{ width: '100%', background: '#fff', padding: '12px', borderRadius: '14px', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span style={{ fontSize: '14px', color: selectedBranch ? '#1e293b' : '#94a3b8' }}>
                                            {selectedBranch ? branches.find(b => b.id === selectedBranch)?.name : 'Select Branch...'}
                                        </span>
                                        <ChevronDown size={18} />
                                    </div>
                                    {openDropdown === 'branch' && (
                                        <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 3000, background: '#fff', borderRadius: '16px', marginTop: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '10px' }}>
                                            <input 
                                                type="text" placeholder="Search branch..." autoFocus
                                                value={branchSearch} onChange={e => setBranchSearch(e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px', fontSize: '13px' }}
                                            />
                                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {filteredBranches.map(b => (
                                                    <div 
                                                        key={b.id} onClick={() => { setSelectedBranch(b.id); setOpenDropdown(null); }}
                                                        style={{ padding: '10px', cursor: 'pointer', fontSize: '13px', borderRadius: '8px', background: selectedBranch === b.id ? '#fef2f2' : 'transparent', color: selectedBranch === b.id ? '#ef4444' : '#475569' }}
                                                    >
                                                        {b.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ position: 'relative', marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>Assign to Authority</label>
                                    <div 
                                        onClick={() => setOpenDropdown(openDropdown === 'receiver' ? null : 'receiver')}
                                        style={{ width: '100%', background: '#fff', padding: '12px', borderRadius: '14px', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span style={{ fontSize: '14px', color: selectedReceiver ? '#1e293b' : '#94a3b8' }}>
                                            {selectedReceiver ? receivers.find(r => r.id === selectedReceiver)?.name : 'Select Authority...'}
                                        </span>
                                        <ChevronDown size={18} />
                                    </div>
                                    {openDropdown === 'receiver' && (
                                        <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 3000, background: '#fff', borderRadius: '16px', marginTop: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '10px' }}>
                                            <input 
                                                type="text" placeholder="Search employee..." autoFocus
                                                value={receiverSearch} onChange={e => setReceiverSearch(e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px', fontSize: '13px' }}
                                            />
                                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {filteredReceivers.map(r => (
                                                    <div 
                                                        key={r.id} onClick={() => { setSelectedReceiver(r.id); setOpenDropdown(null); }}
                                                        style={{ padding: '10px', cursor: 'pointer', fontSize: '13px', borderRadius: '8px', background: selectedReceiver === r.id ? '#fef2f2' : 'transparent', color: selectedReceiver === r.id ? '#ef4444' : '#475569' }}
                                                    >
                                                        <div>{r.name}</div>
                                                        <div style={{ fontSize: '10px', opacity: 0.7 }}>{r.role}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    By raising this escalation, you agree that the information provided is accurate to the best of your knowledge.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '48px', padding: 0, display: 'flex', gap: '20px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, height: '56px', borderRadius: '16px', fontSize: '16px' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading} style={{ 
                            flex: 2, height: '56px', borderRadius: '16px', fontSize: '16px', fontWeight: 800,
                            background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}>
                            {isSubmitting ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
                            {isSubmitting ? 'Raising issue...' : 'Submit Escalation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEscalation;
