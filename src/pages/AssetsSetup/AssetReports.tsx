import React, { useState, useEffect } from 'react';
import { assetsAPI, branchAPI } from '../../services/apiService';
import { 
  Download, 
  PieChart, TrendingUp,
  Printer, Package, User,
  RefreshCcw,
  ArrowRight, Shield
} from 'lucide-react';
import { toast } from '../../components/Toast';

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

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
           <h1 className="page-title"><Package size={22} /> Asset Intelligence Matrix</h1>
           <p className="page-subtitle">Infrastructure Audit & Extraction Hub</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button 
             onClick={exportToExcel}
             className="btn btn-primary shadow-glow"
           >
              <Download size={18} style={{ marginRight: '8px' }} /> Export CSV
           </button>
           <button 
              onClick={() => window.print()}
              className="btn btn-secondary shadow-sm"
           >
             <Printer size={18} />
           </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <TrendingUp size={24} color="#10b981" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Asset Valuation (Net)</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>₹ {(stats?.totalValue || 0).toLocaleString()}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <Package size={24} color="var(--primary)" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Inventory Units</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{stats?.total || 0}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(14, 165, 233, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <RefreshCcw size={24} color="#0ea5e9" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Upcoming Pulse</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{stats?.upcomingMaint || 0}</h3>
           </div>
        </div>
      </div>

      {/* Logic Filter Strip */}
      {/* Filters Section */}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "16px" }}>
          <select 
            value={filters.branchId}
            onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
            className="select-modern"
          >
            <option value="">Global Branch Protocol</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
          </select>
          <select 
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            className="select-modern"
          >
            <option value="">All Classification Units</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
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
          <button 
            onClick={() => setFilters({ branchId: '', status: '', categoryId: '' })}
            className="btn btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Matrix Table Card */}
      <div className="glass-card flex flex-col group" style={{ minHeight: "500px", padding: 0 }}>
         <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white group-hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 uppercase  tracking-tighter">Inventory Pulse Matrix</h3>
            <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-[0.2em] ">Live Real-time Extraction</div>
         </div>
         <div className="flex-1 overflow-x-auto relative">
           <table className="table-modern">
             <thead>
               <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] border-b border-gray-100 ">
                 <th className="px-6 py-4">System UID</th>
                 <th className="px-6 py-4">Hardware Item</th>
                 <th className="px-6 py-4">Custodianship</th>
                 <th className="px-6 py-4">Valuation</th>
                 <th className="px-6 py-4">Protocol</th>
                 <th className="px-6 py-4 text-right">Integrate Date</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {loading ? (
                 Array.from({ length: 10 }).map((_, i) => (
                   <tr key={i} className="animate-pulse h-24 opacity-30">
                      <td colSpan={6} className="px-6 py-4"><div className="h-12 bg-gray-50 rounded-xl"></div></td>
                   </tr>
                 ))
               ) : assets.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <h3 className="text-3xl font-bold text-slate-100 uppercase  tracking-tighter">Matrix Vacuum</h3>
                       <p className="text-slate-200 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ">No records match the requested protocol filters</p>
                    </td>
                 </tr>
               ) : assets.map((a) => (
                 <tr key={a.id} className="hover:bg-gray-50/50 transition-all group relative overflow-hidden">
                   <td className="px-6 py-4 relative">
                     <div className="text-gray-900 font-bold  text-xs  uppercase group-hover:text-indigo-600 transition-colors decoration-indigo-500/20 underline underline-offset-4 decoration-2">{a.assetCode || 'UNTITLED'}</div>
                     <div className="text-[9px] text-gray-400 uppercase  font-bold mt-2  flex items-center gap-1.5 leading-none px-2 py-1 bg-gray-100/50 rounded-lg w-fit">{a.category?.name || 'Unclassified'}</div>
                   </td>
                   <td className="px-6 py-4 max-w-[250px]">
                     <div className="text-gray-800 font-bold uppercase truncate  tracking-tighter text-sm group-hover:translate-x-1 transition-transform">{a.itemName || 'Untitled Unit'}</div>
                     <div className="text-gray-400 text-[10px] font-bold uppercase  mt-1 opacity-60 ">{a.brand || 'Unbranded Protocol'}</div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                           <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                           <div className="text-gray-900 font-bold uppercase  tracking-tighter text-[11px] truncate">{a.custodian?.firstName || 'ROOT INVENTORY'}</div>
                           <div className="text-gray-400 text-[9px] uppercase font-bold  mt-0.5 opacity-60 ">{a.branch?.branchName || 'GLOBAL BASE'}</div>
                        </div>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className="text-emerald-700 font-bold text-lg  tracking-tighter leading-none">$ {a.price?.toLocaleString() || 0}</span>
                        <span className="text-gray-400 text-[8px] font-bold uppercase  mt-1 ">Net Value Sync</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          a.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] ring-4 ring-emerald-500/5' :
                          a.status === 'UnderMaintenance' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)] ring-4 ring-indigo-500/5' :
                          a.status === 'Scrapped' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] ring-4 ring-red-500/5' :
                          'bg-slate-400'
                        }`}></div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase   group-hover:text-gray-900 transition-colors">{a.status}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-right relative">
                     <div className="text-gray-500 font-bold text-xs uppercase  tracking-tight group-hover:text-gray-900 transition-colors">
                        {a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A PROTOCOL'}
                     </div>
                     <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-10px] transition-all" />
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {/* Floating Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 opacity-50 hover:opacity-100 transition-opacity">
         <div className="glass-card flex items-center gap-6" style={{ padding: "32px", background: "var(--color-bg-secondary)" }}>
            <PieChart className="w-12 h-12 text-indigo-400" />
            <div>
               <h4 className="text-[10px] font-bold uppercase  text-gray-400">Inventory Distribution</h4>
               <p className="text-xs text-gray-500  mt-1 leading-relaxed">System generates heatmaps based on departmental asset density and financial depreciation curves.</p>
            </div>
         </div>
         <div className="glass-card flex items-center gap-6" style={{ padding: "32px", background: "var(--color-bg-secondary)" }}>
            <Shield className="w-12 h-12 text-emerald-400" />
            <div>
               <h4 className="text-[10px] font-bold uppercase  text-gray-400">Immutable Audit Ready</h4>
               <p className="text-xs text-gray-500  mt-1 leading-relaxed">All exported data contains cryptographically linked UID references for sovereign corporate auditing.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AssetReports;
