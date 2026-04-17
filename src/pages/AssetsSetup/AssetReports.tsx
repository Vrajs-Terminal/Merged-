import React, { useState, useEffect } from 'react';
import { assetsAPI, branchAPI } from '../../services/apiService';
import { 
  Download, 
  PieChart, TrendingUp,
  Printer, Package, User,
  RefreshCcw,
  Shield
} from 'lucide-react';
import { toast } from '../../components/Toast';
import './AssetReportsScrap.css';

const AssetReports: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branchId: '', status: '', categoryId: '' });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetRes, branchRes, statsRes, catRes] = await Promise.all([
        assetsAPI.getAssets(filters),
        branchAPI.getAll(),
        assetsAPI.getStats(),
        assetsAPI.getCategories()
      ]);
      setAssets(assetRes.data);
      setBranches(branchRes.data);
      setStats(statsRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to load analytics matrix');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const headers = ['UID', 'CLASS', 'NAME', 'BRAND', 'VALUATION', 'OWNERSHIP', 'NODE', 'PROTOCOL', 'ACQUISITION'];
    const rows = assets.map(a => [
      a.assetCode || 'N/A', a.category?.code || 'N/A', a.itemName || 'N/A', a.brand || 'N/A', 
      a.price || 0, `${a.custodian?.firstName || 'ADMIN STOCK'}`, 
      a.branch?.branchName || 'ROOT', a.status || 'Active', 
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MineHR_Asset_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Matrix exported for forensic analysis');
  };

  const getStatusClass = (status: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active') return 'active';
    if (normalized === 'undermaintenance') return 'undermaintenance';
    if (normalized === 'scrapped') return 'scrapped';
    if (normalized === 'returned') return 'returned';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'UnderMaintenance') return 'Under Maintenance';
    return status || 'Unknown';
  };

  return (
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
        <div>
           <h1 className="asset-page-title"><Package size={24} /> Asset Intelligence Matrix</h1>
           <p className="asset-page-subtitle">Infrastructure Audit & Extraction Hub</p>
        </div>
        <div className="asset-header-actions">
           <button 
             onClick={exportToExcel}
             className="asset-btn primary"
           >
              <Download size={16} /> Export CSV
           </button>
           <button 
              onClick={() => window.print()}
              className="asset-btn secondary icon-only"
              title="Print report"
           >
             <Printer size={16} />
           </button>
        </div>
      </div>

      <div className="asset-kpi-grid">
        <div className="asset-kpi-card">
           <div className="asset-kpi-icon green">
              <TrendingUp size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Asset Valuation (Net)</p>
              <h3 className="asset-kpi-value">₹ {(stats?.totalValue || 0).toLocaleString()}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon primary">
              <Package size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Inventory Units</p>
              <h3 className="asset-kpi-value">{stats?.total || 0}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon info">
              <RefreshCcw size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Upcoming Pulse</p>
              <h3 className="asset-kpi-value">{stats?.upcomingMaint || 0}</h3>
           </div>
        </div>
      </div>

      <div className="asset-panel-card">
        <div className="asset-filter-row">
          <div className="asset-select-wrap">
            <label>Branch</label>
            <select 
              value={filters.branchId}
              onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
              className="select-modern"
            >
              <option value="">Global Branch Protocol</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
            </select>
          </div>
          <div className="asset-select-wrap">
            <label>Category</label>
            <select 
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="select-modern"
            >
              <option value="">All Classification Units</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div className="asset-select-wrap">
            <label>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select-modern"
            >
              <option value="">Full Maintenance Scope</option>
              <option value="Active">Operational Status</option>
              <option value="UnderMaintenance">Under Maintenance</option>
              <option value="Scrapped">Decommissioned / Scrap</option>
              <option value="Returned">Returned to Base</option>
            </select>
          </div>
          <button 
            onClick={() => setFilters({ branchId: '', status: '', categoryId: '' })}
            className="asset-btn secondary"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="asset-panel-card">
         <div className="asset-panel-head">
            <div>
              <h3>Inventory Pulse Matrix</h3>
              <p>Live real-time extraction with branch and classification filters.</p>
            </div>
            <div className="asset-pill">Real Time</div>
         </div>
         <div className="asset-table-wrap">
           <table className="asset-ops-table">
             <thead>
               <tr>
                 <th>System UID</th>
                 <th>Hardware Item</th>
                 <th>Custodianship</th>
                 <th>Valuation</th>
                 <th>Protocol</th>
                 <th>Integrate Date</th>
               </tr>
             </thead>
             <tbody>
               {loading ? (
                 Array.from({ length: 6 }).map((_, i) => (
                   <tr key={i} className="asset-skeleton-row">
                      <td colSpan={6}><div className="asset-skeleton"></div></td>
                   </tr>
                 ))
               ) : assets.length === 0 ? (
                 <tr>
                    <td colSpan={6}>
                      <div className="asset-empty-state compact">
                        <Package size={36} />
                        <h4>Matrix Vacuum</h4>
                        <p>No records match the requested protocol filters.</p>
                      </div>
                    </td>
                 </tr>
               ) : assets.map((a) => (
                 <tr key={a.id}>
                   <td>
                     <div className="asset-cell-stack">
                       <span className="asset-cell-main">{a.assetCode || 'UNTITLED'}</span>
                       <span className="asset-cell-sub">{a.category?.name || 'Unclassified'}</span>
                     </div>
                   </td>
                   <td>
                     <div className="asset-cell-stack">
                       <span className="asset-cell-main">{a.itemName || 'Untitled Unit'}</span>
                       <span className="asset-cell-sub">{a.brand || 'Unbranded Protocol'}</span>
                     </div>
                   </td>
                   <td>
                     <div className="asset-custodian">
                        <span className="asset-avatar">
                           <User size={16} />
                        </span>
                        <div className="asset-cell-stack">
                          <span className="asset-cell-main">{a.custodian?.firstName || 'ROOT INVENTORY'}</span>
                          <span className="asset-cell-sub">{a.branch?.branchName || 'GLOBAL BASE'}</span>
                        </div>
                     </div>
                   </td>
                   <td>
                     <div className="asset-cell-stack">
                        <span className="asset-cell-main">₹ {a.price?.toLocaleString() || 0}</span>
                        <span className="asset-cell-sub">Net Value Sync</span>
                     </div>
                   </td>
                   <td>
                     <span className={`asset-status ${getStatusClass(a.status)}`}>{getStatusLabel(a.status)}</span>
                   </td>
                   <td>
                     <span className="asset-cell-sub">{a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A PROTOCOL'}</span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="asset-note-grid">
         <div className="asset-note-card">
            <span className="asset-note-icon">
              <PieChart size={22} />
            </span>
            <div>
               <h4>Inventory Distribution</h4>
               <p>System generates heatmaps based on departmental asset density and financial depreciation curves.</p>
            </div>
         </div>
         <div className="asset-note-card">
            <span className="asset-note-icon">
              <Shield size={22} />
            </span>
            <div>
               <h4>Immutable Audit Ready</h4>
               <p>All exported data contains linked UID references for strong internal auditing and compliance workflows.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AssetReports;
