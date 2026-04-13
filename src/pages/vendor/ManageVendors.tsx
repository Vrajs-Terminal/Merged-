import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, Trash2, X, Check, Loader2, Users, Filter, Download, Plus, MapPin, Phone, Mail, Building, MoreVertical, ExternalLink } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import './vendor.css';

interface Vendor {
    id: number;
    name: string;
    contactPerson: string | null;
    mobile: string;
    email: string | null;
    companyName: string | null;
    city: string | null;
    status: string;
    categoryId: number;
    subCategoryId: number | null;
    category: { name: string };
    subCategory: { name: string } | null;
    createdAt: string;
}

const ManageVendors: React.FC = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        categoryId: '',
        status: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [vendRes, catRes] = await Promise.all([
                api.get('/vendors'),
                api.get('/vendors/categories')
            ]);
            setVendors(vendRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            await api.delete(`/vendors/${id}`);
            toast.success('Vendor deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete');
        }
    };

    const handleToggleStatus = async (vendor: Vendor) => {
        const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.put(`/vendors/${vendor.id}`, { status: newStatus });
            toast.success(`Vendor marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filtered = vendors.filter(v => {
        const matchesSearch = 
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.contactPerson && v.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
            v.mobile.includes(search) ||
            (v.companyName && v.companyName.toLowerCase().includes(search.toLowerCase()));
        
        const matchesCategory = !filters.categoryId || v.categoryId === Number(filters.categoryId);
        const matchesStatus = !filters.status || v.status === filters.status;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Company', 'Category', 'Sub Category', 'Contact', 'Mobile', 'Email', 'City', 'Status'];
        const rows = filtered.map(v => [
            v.id, v.name, v.companyName || '-', v.category.name, v.subCategory?.name || '-', 
            v.contactPerson || '-', v.mobile, v.email || '-', v.city || '-', v.status
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "vendors_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="vendor-layout">
            <div className="vendor-container">
                <div className="vendor-header">
                    <div className="vendor-header-info">
                        <h2><Users size={20} /> Manage Vendors</h2>
                        <p>View, filter, and manage all your registered vendors.</p>
                    </div>
                    <div className="vendor-actions">
                        <button className="action-btn" onClick={exportToCSV} title="Export CSV">
                            <Download size={16} /> Export
                        </button>
                        <button className="btn-primary" onClick={() => navigate('/vendor/add')}>
                            <Plus size={16} /> Add Vendor
                        </button>
                    </div>
                </div>

                <div className="report-filters" style={{ flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Search Vendor</label>
                        <div className="search-input-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Name, Mobile, Company..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Filter by Category</label>
                        <select 
                            className="form-control" 
                            style={{ width: '200px' }}
                            value={filters.categoryId}
                            onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Filter by Status</label>
                        <select 
                            className="form-control" 
                            style={{ width: '150px' }}
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setSearch(''); setFilters({ categoryId: '', status: '' }); }}>
                        Reset Filters
                    </button>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vendor Details</th>
                                <th>Category / Sub</th>
                                <th>Business Info</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '60px' }}>
                                        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                        No vendors found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((v, index) => (
                                    <tr key={v.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                ID: #VND-{v.id.toString().padStart(4, '0')}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{v.category.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{v.subCategory?.name || '—'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Building size={14} /> {v.companyName || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={14} /> {v.mobile}
                                            </div>
                                            {v.email && (
                                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Mail size={12} /> {v.email}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={14} /> {v.city || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleToggleStatus(v)} 
                                                className={`status-badge ${v.status.toLowerCase()}`}
                                                style={{ border: 'none', cursor: 'pointer' }}
                                            >
                                                {v.status}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                {/* <button className="action-btn" title="View Profile">
                                                    <ExternalLink size={14} />
                                                </button> */}
                                                <button className="action-btn" onClick={() => navigate(`/vendor/edit/${v.id}`)} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(v.id)} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Total {filtered.length} vendors in list
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageVendors;
