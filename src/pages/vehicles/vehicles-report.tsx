import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Filter, Download, X, Loader2, Search, ChevronLeft, ChevronRight, FileText, Calendar, Building2, MapPin, Car, PieChart, Coins, Activity } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './vehicles.css';

interface Vehicle {
  id: number;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_value: number;
  status: string;
  assigned_date: string;
  user: { id: number; name: string };
  category: { id: number; name: string };
  branch?: { id: number; name: string };
  department?: { id: number; name: string };
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalValue: number;
  categoryBreakdown: Record<string, number>;
}

export default function VehiclesReport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    branch_id: '',
    category_id: '',
    status: '',
    start_date: '',
    end_date: ''
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 50;

  const fetchDropdowns = useCallback(async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/api/branches'),
        api.get('/vehicles/categories')
      ]);
      setBranches(bRes.data);
      setCategories(cRes.data);
    } catch (error) {}
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  const getReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.branch_id) params.branch_id = filters.branch_id;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.status) params.status = filters.status;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const res = await api.get('/vehicles/reports', { params });
      setVehicles(res.data.vehicles);
      setStats(res.data.stats);
      setSearched(true);
      setPage(1);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!vehicles.length) return toast.error('No data to export');
    const headers = ['Sr No', 'Employee', 'Vehicle Name', 'Vehicle Number', 'Type', 'Value', 'Branch', 'Assigned Date', 'Status'];
    const rows = filtered.map((v, i) => [
      i + 1,
      v.user.name,
      v.vehicle_name,
      v.vehicle_number,
      v.category.name,
      v.vehicle_value,
      v.branch?.name || '—',
      new Date(v.assigned_date).toLocaleDateString(),
      v.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV Exported!');
  };

  const filtered = vehicles.filter(v => 
    v.vehicle_name.toLowerCase().includes(search.toLowerCase()) || 
    v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
    v.user.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="ev-layout">
      <div className="ev-container">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-header-left">
            <div className="ev-header-icon"><BarChart3 size={22} /></div>
            <div>
              <h2>Vehicles Report</h2>
              <p>Comprehensive fleet analysis and employee assignment history</p>
            </div>
          </div>
          <div className="ev-header-actions">
            {searched && (
              <button className="ev-btn ev-btn-secondary" onClick={exportCSV}>
                <Download size={15} /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="ev-filters">
          <div className="ev-field">
            <label>Branch</label>
            <select className="ev-select" value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="ev-field">
            <label>Category</label>
            <select className="ev-select" value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})}>
              <option value="">All Types</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="ev-field">
            <label>Status</label>
            <select className="ev-select" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="ev-field">
            <label>From Date</label>
            <input className="ev-input" type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
          </div>
          <div className="ev-field">
            <label>To Date</label>
            <input className="ev-input" type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
          </div>
          <button className="ev-btn ev-btn-primary" onClick={getReport} disabled={loading}>
            {loading ? <Loader2 size={16} className="ev-spin" /> : <Filter size={16} />} Get Report
          </button>
          <button className="ev-btn ev-btn-ghost" onClick={() => { setFilters({branch_id:'',category_id:'',status:'',start_date:'',end_date:''}); setSearched(false); setVehicles([]); }}>
            <X size={15} /> Clear
          </button>
        </div>

        {searched ? (
          <>
            {/* Stats */}
            {stats && (
              <div className="ev-stats-grid">
                <div className="ev-stat-card">
                  <div className="ev-stat-icon blue"><Car size={20} /></div>
                  <div>
                    <p className="ev-stat-label">Report Records</p>
                    <p className="ev-stat-value">{stats.total}</p>
                  </div>
                </div>
                <div className="ev-stat-card">
                  <div className="ev-stat-icon green"><Activity size={20} /></div>
                  <div>
                    <p className="ev-stat-label">Active / Inactive</p>
                    <p className="ev-stat-value">{stats.active} / {stats.inactive}</p>
                  </div>
                </div>
                <div className="ev-stat-card">
                  <div className="ev-stat-icon amber"><Coins size={20} /></div>
                  <div>
                    <p className="ev-stat-label">Fleet Valuation</p>
                    <p className="ev-stat-value">₹{stats.totalValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="ev-stat-card">
                  <div className="ev-stat-icon purple"><PieChart size={20} /></div>
                  <div>
                    <p className="ev-stat-label">Categories</p>
                    <p className="ev-stat-value">{Object.keys(stats.categoryBreakdown).length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                {filtered.length} matching vehicles found
              </span>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                <input 
                  className="ev-input ev-input-sm" 
                  style={{ paddingLeft: 32, height: '34px', minWidth: '240px' }} 
                  placeholder="Quick table filter..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="ev-table-wrap">
              <table className="ev-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Vehicle Name</th>
                    <th>Number</th>
                    <th>Value</th>
                    <th>Branch</th>
                    <th>Assigned On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="ev-empty">No records match the current filters.</td>
                    </tr>
                  ) : (
                    paged.map((v, i) => (
                      <tr key={v.id}>
                        <td className="ev-td-sr">{(page - 1) * perPage + i + 1}</td>
                        <td><span className="ev-name">{v.user.name}</span></td>
                        <td><span style={{ fontSize: '12px', fontWeight: 600 }}>{v.category.name}</span></td>
                        <td>{v.vehicle_name}</td>
                        <td style={{ fontWeight: 700, color: '#1e293b' }}>{v.vehicle_number}</td>
                        <td>₹{(v.vehicle_value || 0).toLocaleString()}</td>
                        <td>{v.branch?.name || '—'}</td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>
                          <Calendar size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                          {new Date(v.assigned_date).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`ev-badge ${v.status === 'Active' ? 'ev-badge-active' : 'ev-badge-inactive'}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls could go here */}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
            <BarChart3 size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#64748b', fontSize: '18px', fontWeight: 600 }}>Ready to generate report?</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '8px auto 24px' }}>
              Select filters above and click "Get Report" to view fleet analysis and employee assignments.
            </p>
            <button className="ev-btn ev-btn-primary" onClick={getReport} disabled={loading}>
              {loading ? <Loader2 size={16} className="ev-spin" /> : <Filter size={16} />} Start Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
