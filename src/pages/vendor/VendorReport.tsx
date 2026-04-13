import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, FileText, Download, Filter, MapPin, Building, Calendar, Phone } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './vendor.css';

interface Vendor {
    id: number;
    name: string;
    companyName: string | null;
    categoryId: number;
    category: { name: string };
    subCategory: { name: string } | null;
    mobile: string;
    city: string | null;
    gstNumber: string | null;
    paymentTerms: number | null;
    status: string;
    createdAt: string;
}

const VendorReport: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        categoryId: '',
        status: '',
        city: '',
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
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = vendors.filter(v => {
        const matchesSearch = 
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.companyName && v.companyName.toLowerCase().includes(search.toLowerCase())) ||
            v.mobile.includes(search);
        
        const matchesCategory = !filters.categoryId || v.categoryId === Number(filters.categoryId);
        const matchesStatus = !filters.status || v.status === filters.status;
        const matchesCity = !filters.city || (v.city && v.city.toLowerCase().includes(filters.city.toLowerCase()));

        return matchesSearch && matchesCategory && matchesStatus && matchesCity;
    });

    const exportToExcel = () => {
        // Simple CSV export for now
        const headers = ['Vendor Name', 'Company Name', 'Category', 'Sub Category', 'Mobile', 'City', 'GST No', 'Payment Terms (Days)', 'Status', 'Date Added'];
        const csvRows = [
            headers.join(','),
            ...filtered.map(v => [
                `"${v.name}"`,
                `"${v.companyName || '-'}"`,
                `"${v.category.name}"`,
                `"${v.subCategory?.name || '-'}"`,
                `"${v.mobile}"`,
                `"${v.city || '-'}"`,
                `"${v.gstNumber || '-'}"`,
                v.paymentTerms || 0,
                v.status,
                new Date(v.createdAt).toLocaleDateString()
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Vendor_Master_Report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="vendor-layout">
            <div className="vendor-container">
                <div className="vendor-header">
                    <div className="vendor-header-info">
                        <h2><FileText size={20} /> Vendor Master Report</h2>
                        <p>Generate and export detailed vendor information and financial terms.</p>
                    </div>
                    <div className="vendor-actions">
                        <button className="btn-primary" onClick={exportToExcel}>
                            <Download size={16} /> Export Report (CSV)
                        </button>
                    </div>
                </div>

                <div className="report-filters" style={{ flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Search Report</label>
                        <div className="search-input-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Name, Mobile..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Category</label>
                        <select 
                            className="form-control" 
                            style={{ width: '180px' }}
                            value={filters.categoryId}
                            onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>City</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{ width: '150px' }}
                            placeholder="All Cities"
                            value={filters.city}
                            onChange={(e) => setFilters({...filters, city: e.target.value})}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Status</label>
                        <select 
                            className="form-control" 
                            style={{ width: '130px' }}
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setSearch(''); setFilters({ categoryId: '', status: '', city: '' }); }}>
                        Reset
                    </button>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vendor & Company</th>
                                <th>Category / Sub</th>
                                <th>Contact Info</th>
                                <th>Terms</th>
                                <th>GST No</th>
                                <th>Added On</th>
                                <th>Status</th>
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
                                        No data available for the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((v, index) => (
                                    <tr key={v.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Building size={12} /> {v.companyName || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{v.category.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{v.subCategory?.name || '—'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={14} /> {v.mobile}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={12} /> {v.city || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#059669' }}>
                                                {v.paymentTerms ? `${v.paymentTerms} Days` : 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                            {v.gstNumber || '—'}
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> {new Date(v.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${v.status.toLowerCase()}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                        <div style={{ color: '#64748b' }}>Total Vendors: <b>{filtered.length}</b></div>
                        <div style={{ color: '#059669' }}>Active: <b>{filtered.filter(v => v.status === 'Active').length}</b></div>
                        <div style={{ color: '#ef4444' }}>Inactive: <b>{filtered.filter(v => v.status === 'Inactive').length}</b></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorReport;
