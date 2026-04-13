import React, { useState, useEffect } from 'react';
import { assetsAPI, employeeAPI, branchAPI } from '../../services/apiService';
import { 
  Plus, User, DollarSign,
  Trash, Search, Download, QrCode, Tag,
  ShieldCheck, XCircle,
  ArrowRight, Info, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';

const ManageAssets: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [filters, setFilters] = useState({ category: '', branch: '', employee: '', status: '', search: '' });

  const [formData, setFormData] = useState({
    categoryId: '',
    itemName: '',
    brand: '',
    assetCode: '',
    serialNo: '',
    macAddress: '',
    simNo: '',
    purchaseDate: '',
    price: '',
    vendor: '',
    custodianId: '',
    location: '',
    credentials: '',
    description: '',
    imageUrl: '',
    warrantyExpiry: '',
    depreciationRate: ''
  });

  const [assignData, setAssignData] = useState({
    custodianId: '',
    branchId: '',
    remark: ''
  });

  useEffect(() => {
    fetchData();
    loadDropdowns();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await assetsAPI.getAssets(filters);
      setAssets(res.data);
    } catch (error) {
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [catRes, empRes, branchRes] = await Promise.all([
        assetsAPI.getCategories(),
        employeeAPI.getAll(),
        branchAPI.getAll()
      ]);
      setCategories(catRes.data);
      setEmployees(empRes.data);
      setBranches(branchRes.data);
    } catch (error) {
      console.error('Dropdown load failed', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.assetCode === '') delete (payload as any).assetCode;
      await assetsAPI.createAsset(payload);
      toast.success('Asset registered successfully');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to register asset');
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '', itemName: '', brand: '', assetCode: '',
      serialNo: '', macAddress: '', simNo: '', purchaseDate: '',
      price: '', vendor: '', custodianId: '', location: '',
      credentials: '', description: '', imageUrl: '',
      warrantyExpiry: '', depreciationRate: ''
    });
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emp = employees.find(e => e.id === parseInt(assignData.custodianId));
      await assetsAPI.assignAsset(selectedAsset.id, {
        ...assignData,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
      });
      toast.success('Asset assigned successfully');
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      toast.error('Assignment failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await assetsAPI.deleteAsset(id);
      toast.success('Asset deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><Package size={22} /> Manage Assets</h1>
          <p className="page-subtitle">Track and lifecycle management of operational infrastructure from procurement to disposal</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary shadow-sm">
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="btn btn-primary shadow-glow"
          >
            <Plus size={18} /> Add Asset
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search assets..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="input-modern"
              style={{ paddingLeft: "44px" }}
            />
          </div>
          <select 
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="select-modern"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="select-modern"
          >
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
          </select>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="select-modern"
          >
            <option value="">Live Status</option>
            <option value="Active">Active</option>
            <option value="UnderMaintenance">Maintenance</option>
            <option value="Scrapped">Scrapped</option>
            <option value="Missing">Missing</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card" style={{ overflowX: "auto" }}>
        <div>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Asset & ID</th>
                <th>Classification</th>
                <th>Current Allocation</th>
                <th>Technical Specs</th>
                <th>Financial Info</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-28 opacity-30">
                    <td colSpan={7} className="px-6 py-4 bg-gray-50"></td>
                  </tr>
                ))
              ) : assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Tag size={20} />
                      </div>
                      <div>
                        <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "14px" }}>{asset.assetCode || 'NO-ID'}</span>
                        <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>{asset.itemName}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", fontSize: "13px" }}>{asset.category?.name}</span>
                    <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>{asset.brand || 'No Brand'}</p>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={14} color="var(--text-muted)" />
                       </div>
                       <div>
                          <p style={{ fontSize: "13px", fontWeight: "700" }}>{asset.custodian ? `${asset.custodian.firstName} ${asset.custodian.lastName}` : 'IN STOCK'}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{asset.branch?.branchName || 'Central Inventory'}</p>
                       </div>
                    </div>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    <p style={{ fontWeight: "600" }}>Serial: <span style={{ color: "var(--text-muted)" }}>{asset.serialNo || 'N/A'}</span></p>
                    <p style={{ color: "var(--text-muted)", marginTop: "2px" }}>MAC: {asset.macAddress || 'N/A'}</p>
                  </td>
                  <td>
                    <span style={{ fontWeight: "800", color: "#166534", fontSize: "14px" }}>₹ {asset.price?.toLocaleString() || '0'}</span>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Vendor: {asset.vendor || 'Direct'}</p>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`badge ${
                      asset.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      asset.status === 'UnderMaintenance' ? 'bg-orange-100 text-orange-700' :
                      asset.status === 'Scrapped' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button onClick={() => { setSelectedAsset(asset); setShowQRModal(true); }} className="btn btn-secondary" style={{ padding: "8px" }} title="QR Code"><QrCode size={14} /></button>
                      <button onClick={() => { setSelectedAsset(asset); setAssignData({ custodianId: asset.custodianId?.toString() || '', branchId: asset.branchId?.toString() || '', remark: '' }); setShowAssignModal(true); }} className="btn btn-secondary" style={{ padding: "8px" }} title="Transfer"><ArrowRight size={14} /></button>
                      <button onClick={() => handleDelete(asset.id)} className="btn btn-danger" style={{ padding: "8px" }} title="Delete"><Trash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white  ">Register New Infrastructure Asset</h2>
                  <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Lifecycle, Ownership & Financial Master</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><XCircle className="w-8 h-8 text-gray-500" /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 bg-white">
                <div className="asset-grid-3 mb-10">
                   <div className="mb-6 p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Core Designation</h4>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Categorical Group*</label>
                          <select 
                            required
                            value={formData.categoryId}
                            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            <option value="">Select Asset Group</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Operational Name*</label>
                          <input 
                            required
                            type="text"
                            value={formData.itemName}
                            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            placeholder="e.g. Dell XPS Precision"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer / Brand</label>
                          <input 
                            type="text"
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            placeholder="e.g. DELL"
                          />
                        </div>
                      </div>
                   </div>

                   <div className="mb-6 p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Identification Rules</h4>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unique Asset ID (Leave for Auto)</label>
                          <input 
                            type="text"
                            value={formData.assetCode}
                            onChange={(e) => setFormData({...formData, assetCode: e.target.value.toUpperCase()})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            placeholder="MINE-COMP-001"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                            <input 
                              type="text"
                              value={formData.serialNo}
                              onChange={(e) => setFormData({...formData, serialNo: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Network / MAC</label>
                            <input 
                              type="text"
                              value={formData.macAddress}
                              onChange={(e) => setFormData({...formData, macAddress: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credentials / Tokens</label>
                          <input 
                            type="text"
                            value={formData.credentials}
                            onChange={(e) => setFormData({...formData, credentials: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            placeholder="Key, PIN, Admin Token"
                          />
                        </div>
                      </div>
                   </div>

                   <div className="mb-6 p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Fiscal Allocation</h4>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Acquisition Cost</label>
                            <input 
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Acquire Date</label>
                            <input 
                              type="date"
                              value={formData.purchaseDate}
                              onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Custodian</label>
                          <select 
                            value={formData.custodianId}
                            onChange={(e) => setFormData({...formData, custodianId: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            <option value="">STOCK (Warehouse)</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Exp.</label>
                              <input 
                                type="date"
                                value={formData.warrantyExpiry}
                                onChange={(e) => setFormData({...formData, warrantyExpiry: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation %</label>
                              <input 
                                type="number"
                                step="0.01"
                                placeholder="8.5"
                                value={formData.depreciationRate}
                                onChange={(e) => setFormData({...formData, depreciationRate: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              />
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-100 flex gap-6">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-gray-400 font-bold uppercase text-xs  hover:text-gray-900 transition-all ">Discard Changes</button>
                   <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md">Confirm Infrastructure Registry</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Assign/Transfer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 bg-indigo-600 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900 mix-blend-overlay opacity-30"></div>
                <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-white/20 backdrop-blur-xl animate-pulse">
                   <ArrowRight className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white   relative z-10">Custodian Transfer</h2>
                <p className="text-white/60 font-bold uppercase text-[10px]  mt-1 relative z-10 ">Relocating: {selectedAsset?.itemName}</p>
             </div>
             
             <form onSubmit={handleAssign} className="p-6 bg-white  relative overflow-hidden">
                <div className="mb-10">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Target Custodian Employee*</label>
                   <select 
                    required
                    value={assignData.custodianId}
                    onChange={(e) => setAssignData({...assignData, custodianId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                   >
                     <option value="">Select Target Destination</option>
                     {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                   </select>
                </div>
                <div className="mb-10">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Reason / Audit Notes</label>
                   <textarea 
                    value={assignData.remark}
                    onChange={(e) => setAssignData({...assignData, remark: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    placeholder="Document the condition of the asset during this transfer..."
                   />
                </div>
                <div className="flex flex-col gap-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md">Execute Workflow</button>
                  <button type="button" onClick={() => setShowAssignModal(false)} className="py-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider hover:text-gray-900 transition-all">Cancel Transfer</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-slate-900 rounded-xl p-16 text-center max-w-sm animate-scaleIn shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
              <div className="w-64 h-64 bg-white rounded-xl mx-auto mb-10 flex items-center justify-center p-6 shadow-2xl relative">
                  <div className="absolute -inset-4 border-2 border-white/5 rounded-xl group-hover:rotate-12 transition-transform duration-1000"></div>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedAsset?.assetCode || 'MINE-HR'}`} 
                    alt="Asset QR" 
                    className="w-full h-full rounded-xl"
                  />
              </div>
              <h3 className="text-4xl font-bold text-white  mb-3  line-through decoration-indigo-500 decoration-8">{selectedAsset?.assetCode}</h3>
              <p className="text-gray-400 font-bold uppercase text-[10px]   mb-10">Infrastructure Identification Token</p>
              
              <div className="space-y-4">
                 <button className="w-full py-5 bg-white text-gray-900 rounded-xl font-bold uppercase  hover:scale-105 transition-all text-xs shadow-xl shadow-white/5">Print Label Sheet</button>
                 <button 
                   onClick={() => setShowQRModal(false)}
                   className="w-full py-4 bg-white/5 text-gray-400 rounded-xl font-bold uppercase  hover:text-white transition-all text-[10px]"
                 >
                   Discard Preview
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssets;
