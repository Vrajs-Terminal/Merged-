import { useState, useEffect } from 'react';
import {
    Plus, Map, ArrowUp, ArrowDown, GripVertical, Trash2, AlertTriangle, X
    , GitBranch
} from 'lucide-react';
import api from '../../lib/axios';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './branches.css';

interface Branch {
    id: number;
    name: string;
    code: string;
    type: 'Metro' | 'Non-Metro';
}

interface DeleteModalState {
    isOpen: boolean;
    branch: Branch | null;
    typedConfirmation: string;
    isDeleting: boolean;
}

const REQUIRED_TEXT = 'DELETE BRANCH';

export default function Branches() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
        isOpen: false,
        branch: null,
        typedConfirmation: '',
        isDeleting: false,
    });

    const fetchBranches = async () => {
        try {
            const res = await api.get('/branches');
            setBranches(res.data);
        } catch (error) {
            console.error('Failed to fetch branches', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const [newBranch, setNewBranch] = useState({
        name: '',
        code: '',
        type: 'Metro' as 'Metro' | 'Non-Metro',
    });

    const [isReordering, setIsReordering] = useState(false);

    const handleAddBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure name is present, code is optional
            const res = await api.post('/branches', {
                ...newBranch,
                code: newBranch.code || null
            });
            setBranches([...branches, res.data]);
            setNewBranch({ name: '', code: '', type: 'Metro' });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to add branch';
            alert(msg);
        }
    };

    const openDeleteModal = (branch: Branch) => {
        setDeleteModal({ isOpen: true, branch, typedConfirmation: '', isDeleting: false });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, branch: null, typedConfirmation: '', isDeleting: false });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.branch || deleteModal.typedConfirmation !== REQUIRED_TEXT) return;
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        try {
            await api.delete(`/branches/${deleteModal.branch.id}`);
            setBranches(branches.filter(b => b.id !== deleteModal.branch!.id));
            closeDeleteModal();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to delete branch';
            alert(msg);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const moveBranch = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newBranches = [...branches];
            [newBranches[index - 1], newBranches[index]] = [newBranches[index], newBranches[index - 1]];
            setBranches(newBranches);
        } else if (direction === 'down' && index < branches.length - 1) {
            const newBranches = [...branches];
            [newBranches[index + 1], newBranches[index]] = [newBranches[index], newBranches[index + 1]];
            setBranches(newBranches);
        }
    };

    if (isLoading) {
        return <div className="branches-container setup-container" style={{ padding: '2rem' }}>Loading branches...</div>;
    }

    const isConfirmationValid = deleteModal.typedConfirmation === REQUIRED_TEXT;

    return (
        <div className="branches-container setup-container">
            <div className="branches-header setup-header">
                <div>
                    <h1><GitBranch className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Branches</h1>
                    <p>Manage all your company branches and locations</p>
                </div>
                <div className="actions-row" style={{ display: 'flex', gap: '8px' }}>
                    <ImportButton
                        onImport={async (data) => {
                            try {
                                if (!Array.isArray(data)) return;
                                // Map data fields (handle different possible headers)
                                const branchesToImport = data.map(row => ({
                                    name: row.Name || row.name || row.branch_name,
                                    code: row.Code || row.code || row.branch_code || null,
                                    type: (row.Type || row.type || 'Metro').toString().includes('Metro') ? 'Metro' : 'Non-Metro'
                                })).filter(b => b.name);

                                if (branchesToImport.length === 0) {
                                    alert('No valid branches found in the file.');
                                    return;
                                }

                                const res = await api.post('/branches/bulk', { branches: branchesToImport });
                                if (res.data) {
                                    alert(`Successfully imported ${res.data.count || branchesToImport.length} branches.`);
                                    fetchBranches();
                                }
                            } catch (err) {
                                console.error('Import failed', err);
                                alert('Failed to import branches. Please check the file format.');
                            }
                        }}
                        label="Import CSV"
                    />
                    <ExportButtons
                        data={branches.map(b => ({
                            "Name": b.name,
                            "Code": b.code,
                            "Type": b.type
                        }))}
                        fileName="Branches_List"
                        title="Company Branches"
                    />
                    <button className={`btn-secondary ${isReordering ? 'active-reorder' : ''}`} onClick={() => setIsReordering(!isReordering)}>
                        <GripVertical size={16} />
                        {isReordering ? 'Done Reordering' : 'Change Order'}
                    </button>
                </div>
            </div>

            <div className="branches-layout">
                {/* Branches List */}
                <div className="branches-list-card">
                    <div className="branches-list">
                        {branches.map((branch, index) => (
                            <div className="branch-item" key={branch.id}>
                                <div className="bi-left">
                                    <div className="bi-icon">
                                        <Map size={20} />
                                    </div>
                                    <div className="bi-details">
                                        <h4>{branch.name}</h4>
                                        <p>Code: {branch.code || 'N/A'}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span className={`bi-type-badge ${branch.type.toLowerCase()}`}>
                                        {branch.type}
                                    </span>

                                    {isReordering ? (
                                        <div className="sort-actions">
                                            <button
                                                style={{ border: 'none', background: 'transparent', cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                                                onClick={() => moveBranch(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp size={14} color={index === 0 ? '#cbd5e1' : '#64748b'} />
                                            </button>
                                            <button
                                                style={{ border: 'none', background: 'transparent', cursor: index === branches.length - 1 ? 'not-allowed' : 'pointer' }}
                                                onClick={() => moveBranch(index, 'down')}
                                                disabled={index === branches.length - 1}
                                            >
                                                <ArrowDown size={14} color={index === branches.length - 1 ? '#cbd5e1' : '#64748b'} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openDeleteModal(branch)}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                            title="Delete Branch"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Branch Form Card */}
                <div className="branch-form-card" id="branch-form">
                    <h3>Add New Branch</h3>
                    <form onSubmit={handleAddBranch}>
                        <div className="form-group">
                            <label>Branch Name *</label>
                            <input
                                type="text"
                                value={newBranch.name}
                                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                required
                                placeholder="e.g. Noida Main Office"
                            />
                        </div>
                        <div className="form-group">
                            <label>Branch Code (Optional)</label>
                            <input
                                type="text"
                                value={newBranch.code}
                                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                                placeholder="e.g. DEL-01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Branch Type *</label>
                            <select
                                value={newBranch.type}
                                onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value as 'Metro' | 'Non-Metro' })}
                                required
                            >
                                <option value="Metro">Metro</option>
                                <option value="Non-Metro">Non-Metro</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-save" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                            <Plus size={18} />
                            Save Branch
                        </button>
                    </form>
                </div>
            </div>

            {/* ========================================================
                PROFESSIONAL DELETE CONFIRMATION MODAL
            ======================================================== */}
            {deleteModal.isOpen && deleteModal.branch && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, backdropFilter: 'blur(4px)',
                        animation: 'fadeIn 0.2s ease',
                    }}
                    onClick={closeDeleteModal}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            animation: 'slideIn 0.25s ease',
                        }}
                    >
                        {/* Modal Header - Danger zone */}
                        <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '24px 28px', position: 'relative' }}>
                            <button
                                onClick={closeDeleteModal}
                                style={{ position: 'absolute', top: '16px', right: '16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e293b' }}
                            >
                                <X size={16} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ background: '#cbd5e1', borderRadius: '12px', padding: '12px', display: 'flex' }}>
                                    <AlertTriangle size={28} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ color: '#1e293b', margin: 0, fontSize: '18px', fontWeight: 700 }}>Delete Branch Confirmation</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: '13px' }}>This is a destructive and irreversible action</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '28px' }}>
                            <p style={{ color: '#1e293b', fontWeight: 600, marginBottom: '6px', fontSize: '15px' }}>
                                You are about to permanently delete:
                            </p>
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#b91c1c', fontSize: '15px' }}>
                                    {deleteModal.branch.name} <span style={{ fontWeight: 400, fontSize: '13px', color: '#64748b' }}>({deleteModal.branch.code})</span>
                                </p>
                            </div>

                            <p style={{ color: '#475569', marginBottom: '14px', fontSize: '14px', lineHeight: 1.6 }}>
                                This branch currently may have <strong>active employees</strong> assigned to it. If you proceed, all associated data will be permanently removed from the system.
                            </p>

                            {/* Cascading effects list */}
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px', marginBottom: '22px' }}>
                                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
                                    This action will also delete all related records including:
                                </p>
                                <ul style={{ margin: 0, paddingLeft: '18px', color: '#78350f', fontSize: '13px', lineHeight: 2 }}>
                                    <li>Assigned roles &amp; privileges</li>
                                    <li>Employee grade history</li>
                                    <li>Parking allocations</li>
                                    <li>ID card assignments</li>
                                    <li>Other linked employee data</li>
                                </ul>
                            </div>

                            {/* Typed confirmation */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '22px' }}>
                                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>
                                    To confirm, please type <strong style={{ color: '#ef4444', fontFamily: 'monospace', letterSpacing: '1px' }}>{REQUIRED_TEXT}</strong> below:
                                </p>
                                <input
                                    type="text"
                                    value={deleteModal.typedConfirmation}
                                    onChange={e => setDeleteModal(prev => ({ ...prev, typedConfirmation: e.target.value }))}
                                    placeholder={`Type ${REQUIRED_TEXT} here`}
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                                        border: `2px solid ${deleteModal.typedConfirmation.length > 0 ? (isConfirmationValid ? '#22c55e' : '#ef4444') : '#e2e8f0'}`,
                                        fontSize: '14px', outline: 'none', fontFamily: 'monospace',
                                        letterSpacing: '1px', boxSizing: 'border-box',
                                        background: '#fff',
                                        transition: 'border-color 0.2s',
                                    }}
                                    autoFocus
                                />
                                {deleteModal.typedConfirmation.length > 0 && !isConfirmationValid && (
                                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ef4444' }}>
                                        Text does not match. Please type exactly: {REQUIRED_TEXT}
                                    </p>
                                )}
                                {isConfirmationValid && (
                                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#22c55e' }}>
                                        Confirmation accepted.
                                    </p>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={closeDeleteModal}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px',
                                        border: '1px solid #e2e8f0', background: '#f8fafc',
                                        color: '#475569', cursor: 'pointer', fontWeight: 600,
                                        fontSize: '14px',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={!isConfirmationValid || deleteModal.isDeleting}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px',
                                        border: 'none',
                                        background: isConfirmationValid ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : '#e2e8f0',
                                        color: isConfirmationValid ? '#fff' : '#94a3b8',
                                        cursor: isConfirmationValid ? 'pointer' : 'not-allowed',
                                        fontWeight: 700, fontSize: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {deleteModal.isDeleting ? (
                                        <>Deleting...</>
                                    ) : (
                                        <><Trash2 size={16} /> Yes, Permanently Delete</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
