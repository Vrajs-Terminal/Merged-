import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Loader2, Info, Gift } from 'lucide-react';
import api from '../../lib/axios';
import './incentive-types.css';
import { toast } from 'react-hot-toast';

interface IncentiveType {
    id: number;
    name: string;
    incentive_type: string;
    calculation_method: string;
    applicable_on: string;
    description: string | null;
    status: string;
}

const IncentiveTypes = () => {
    const [incentives, setIncentives] = useState<IncentiveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        incentive_type: 'Sales Based',
        calculation_method: 'Fixed Amount',
        applicable_on: 'Individual Employee',
        description: ''
    });

    useEffect(() => {
        fetchIncentives();
    }, []);

    const fetchIncentives = async () => {
        setLoading(true);
        try {
            const res = await api.get('/incentive-types');
            setIncentives(res.data);
        } catch (error) {
            toast.error("Failed to load incentive types");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/incentive-types/${editingId}`, formData);
                toast.success("Incentive type updated");
            } else {
                await api.post('/incentive-types', formData);
                toast.success("Incentive type created");
            }
            setIsModalOpen(false);
            fetchIncentives();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this incentive type?")) return;
        try {
            await api.delete(`/incentive-types/${id}`);
            toast.success("Deleted successfully");
            fetchIncentives();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const toggleStatus = async (item: IncentiveType) => {
        try {
            const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
            await api.put(`/incentive-types/${item.id}`, { ...item, status: newStatus });
            toast.success(`Incentive ${newStatus === 'Active' ? 'unhidden' : 'hidden'}`);
            fetchIncentives();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            incentive_type: 'Sales Based',
            calculation_method: 'Fixed Amount',
            applicable_on: 'Individual Employee',
            description: ''
        });
        setEditingId(null);
    };

    const openEditModal = (item: IncentiveType) => {
        setFormData({
            name: item.name,
            incentive_type: item.incentive_type,
            calculation_method: item.calculation_method,
            applicable_on: item.applicable_on,
            description: item.description || ''
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const filtered = incentives.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.incentive_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="incentive-layout">
            <div className="incentive-container">
                <div className="incentive-header">
                    <div className="header-info">
                        <div className="title-with-icon">
                            <Gift size={32} className="page-title-icon text-indigo-600" />
                            <h2>Incentive Types</h2>
                        </div>
                        <p>Manage performance and sales based incentive structures</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-add" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                            <Plus size={18} /> Add Incentive Type
                        </button>
                    </div>
                </div>

                <div className="filter-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search incentives..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Incentive Name</th>
                                    <th>Incentive Type</th>
                                    <th>Calculation Method</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                                        <td>{item.incentive_type}</td>
                                        <td>{item.calculation_method}</td>
                                        <td>
                                            <span className={`status-badge ${item.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn btn-edit" title="Edit" onClick={() => openEditModal(item)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="action-btn btn-toggle" title={item.status === 'Active' ? 'Hide' : 'Unhide'} onClick={() => toggleStatus(item)}>
                                                    {item.status === 'Active' ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                                <button className="action-btn btn-delete" title="Delete" onClick={() => handleDelete(item.id)}>
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
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Incentive Type' : 'Add Incentive Type'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Incentive Name*</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g. Sales Incentive" 
                                        required 
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Incentive Type*</label>
                                    <select 
                                        className="form-control"
                                        value={formData.incentive_type}
                                        onChange={e => setFormData({ ...formData, incentive_type: e.target.value })}
                                    >
                                        <option>Sales Based</option>
                                        <option>Attendance Based</option>
                                        <option>Performance Based</option>
                                        <option>Target Based</option>
                                        <option>Manual Incentive</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Calculation Method*</label>
                                    <select 
                                        className="form-control"
                                        value={formData.calculation_method}
                                        onChange={e => setFormData({ ...formData, calculation_method: e.target.value })}
                                    >
                                        <option>Fixed Amount</option>
                                        <option>Percentage of Salary</option>
                                        <option>Percentage of Sales</option>
                                        <option>Per Order / Per Task</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Applicable On*</label>
                                    <select 
                                        className="form-control"
                                        value={formData.applicable_on}
                                        onChange={e => setFormData({ ...formData, applicable_on: e.target.value })}
                                    >
                                        <option>Individual Employee</option>
                                        <option>Department</option>
                                        <option>Sales Team</option>
                                        <option>Entire Company</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        className="form-control" 
                                        rows={3} 
                                        placeholder="Brief details about this incentive..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}>
                                    <Info size={14} />
                                    <span>This rule will be applied during payroll processing.</span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="action-btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="action-btn btn-save">
                                    {editingId ? 'Update Incentive' : 'Create Incentive'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncentiveTypes;
