import React, { useState, useEffect } from 'react';
import { assetsAPI, employeeAPI, branchAPI } from '../../services/apiService';
import { 
  Plus, User, DollarSign,
  Trash, Search, Download, QrCode, Tag,
  ShieldCheck, XCircle,
  ArrowRight, Info, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';
import './AssetReportsScrap.css';

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

  const getStatusClass = (status: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active') return 'active';
    if (normalized === 'undermaintenance') return 'undermaintenance';
    if (normalized === 'scrapped') return 'scrapped';
    return 'default';
  };

  return (
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
        <div>
          <h1 className="asset-page-title"><Package size={24} /> Manage Assets</h1>
          <p className="asset-page-subtitle">Track lifecycle management of operational infrastructure from procurement to disposal</p>
        </div>
        <div className="asset-header-actions">
          <button className="asset-btn secondary">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="asset-btn primary"
          >
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      <div className="asset-manage-filter">
        <div className="asset-manage-filter-grid">
          <div className="asset-search-field">
            <Search size={16} />
            <input 
              type="text"
              placeholder="Search assets..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="input-modern"
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

      <div className="asset-manage-table-card">
        <div className="asset-table-wrap">
          <table className="asset-ops-table">
            <thead>
              <tr>
                <th>Asset & ID</th>
                <th>Classification</th>
                <th>Current Allocation</th>
                <th>Technical Specs</th>
                <th>Financial Info</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="asset-skeleton-row">
                    <td colSpan={7}><div className="asset-skeleton"></div></td>
                  </tr>
                ))
              ) : assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div className="asset-custodian">
                      <span className="asset-avatar">
                        <Tag size={20} />
                      </span>
                      <div className="asset-cell-stack">
                        <span className="asset-cell-main">{asset.assetCode || 'NO-ID'}</span>
                        <span className="asset-cell-sub">{asset.itemName}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="asset-cell-stack">
                      <span className="asset-cell-main">{asset.category?.name}</span>
                      <span className="asset-cell-sub">{asset.brand || 'No Brand'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="asset-custodian">
                       <span className="asset-avatar"><User size={14} /></span>
                       <div className="asset-cell-stack">
                          <span className="asset-cell-main">{asset.custodian ? `${asset.custodian.firstName} ${asset.custodian.lastName}` : 'IN STOCK'}</span>
                          <span className="asset-cell-sub">{asset.branch?.branchName || 'Central Inventory'}</span>
                       </div>
                    </div>
                  </td>
                  <td>
                    <div className="asset-cell-stack">
                      <span className="asset-cell-main">Serial: {asset.serialNo || 'N/A'}</span>
                      <span className="asset-cell-sub">MAC: {asset.macAddress || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="asset-cell-stack">
                      <span className="asset-cell-main">₹ {asset.price?.toLocaleString() || '0'}</span>
                      <span className="asset-cell-sub">Vendor: {asset.vendor || 'Direct'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`asset-mini-badge ${getStatusClass(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <div className="asset-custodian">
                      <button onClick={() => { setSelectedAsset(asset); setShowQRModal(true); }} className="asset-icon-action" title="QR Code"><QrCode size={14} /></button>
                      <button onClick={() => { setSelectedAsset(asset); setAssignData({ custodianId: asset.custodianId?.toString() || '', branchId: asset.branchId?.toString() || '', remark: '' }); setShowAssignModal(true); }} className="asset-icon-action" title="Transfer"><ArrowRight size={14} /></button>
                      <button onClick={() => handleDelete(asset.id)} className="asset-icon-action danger" title="Delete"><Trash size={14} /></button>
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
        <div className="asset-modal-overlay">
          <div className="asset-modal">
             <div className="asset-modal-head">
                <div>
                  <h2>Register New Infrastructure Asset</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="scrap-modal-close"><XCircle size={18} /></button>
             </div>

             <form onSubmit={handleSubmit} className="asset-modal-body">
                <div className="asset-register-grid">
                   <div className="asset-register-section">
                      <h4><Info size={14} /> Core Designation</h4>
                      <div className="asset-form-field">
                        <label>Categorical Group*</label>
                        <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="select-modern">
                          <option value="">Select Asset Group</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="asset-form-field">
                        <label>Operational Name*</label>
                        <input required type="text" value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} className="input-modern" placeholder="e.g. Dell XPS Precision" />
                      </div>
                      <div className="asset-form-field">
                        <label>Manufacturer / Brand</label>
                        <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="input-modern" placeholder="e.g. DELL" />
                      </div>
                    </div>

                   <div className="asset-register-section">
                      <h4><ShieldCheck size={14} /> Identification Rules</h4>
                      <div className="asset-form-field">
                        <label>Unique Asset ID (Leave for Auto)</label>
                        <input type="text" value={formData.assetCode} onChange={(e) => setFormData({...formData, assetCode: e.target.value.toUpperCase()})} className="input-modern" placeholder="MINE-COMP-001" />
                      </div>
                      <div className="asset-form-grid">
                        <div className="asset-form-field">
                          <label>Serial Number</label>
                          <input type="text" value={formData.serialNo} onChange={(e) => setFormData({...formData, serialNo: e.target.value})} className="input-modern" />
                        </div>
                        <div className="asset-form-field">
                          <label>Network / MAC</label>
                          <input type="text" value={formData.macAddress} onChange={(e) => setFormData({...formData, macAddress: e.target.value})} className="input-modern" />
                        </div>
                      </div>
                      <div className="asset-form-field">
                        <label>Credentials / Tokens</label>
                        <input type="text" value={formData.credentials} onChange={(e) => setFormData({...formData, credentials: e.target.value})} className="input-modern" placeholder="Key, PIN, Admin Token" />
                      </div>
                    </div>

                   <div className="asset-register-section">
                      <h4><DollarSign size={14} /> Fiscal Allocation</h4>
                      <div className="asset-form-grid">
                        <div className="asset-form-field">
                          <label>Acquisition Cost</label>
                          <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-modern" />
                        </div>
                        <div className="asset-form-field">
                          <label>Acquire Date</label>
                          <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} className="input-modern" />
                        </div>
                      </div>
                      <div className="asset-form-field">
                        <label>Current Custodian</label>
                        <select value={formData.custodianId} onChange={(e) => setFormData({...formData, custodianId: e.target.value})} className="select-modern">
                          <option value="">STOCK (Warehouse)</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                        </select>
                      </div>
                      <div className="asset-form-grid">
                        <div className="asset-form-field">
                          <label>Warranty Exp.</label>
                          <input type="date" value={formData.warrantyExpiry} onChange={(e) => setFormData({...formData, warrantyExpiry: e.target.value})} className="input-modern" />
                        </div>
                        <div className="asset-form-field">
                          <label>Depreciation %</label>
                          <input type="number" step="0.01" placeholder="8.5" value={formData.depreciationRate} onChange={(e) => setFormData({...formData, depreciationRate: e.target.value})} className="input-modern" />
                        </div>
                      </div>
                    </div>
                </div>

                <div className="asset-form-actions">
                   <button type="button" onClick={() => setShowAddModal(false)} className="asset-btn secondary">Discard Changes</button>
                   <button type="submit" className="asset-btn primary">Confirm Infrastructure Registry</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Assign/Transfer Modal */}
      {showAssignModal && (
        <div className="asset-modal-overlay">
           <div className="asset-modal sm">
             <div className="asset-modal-head">
                <h2>Custodian Transfer</h2>
                <button onClick={() => setShowAssignModal(false)} className="scrap-modal-close"><XCircle size={18} /></button>
             </div>

             <form onSubmit={handleAssign} className="asset-modal-body">
                <div className="asset-form-field">
                   <label>Target Custodian Employee*</label>
                   <select required value={assignData.custodianId} onChange={(e) => setAssignData({...assignData, custodianId: e.target.value})} className="select-modern">
                     <option value="">Select Target Destination</option>
                     {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                   </select>
                </div>
                <div className="asset-form-field">
                   <label>Transfer Reason / Audit Notes</label>
                   <textarea value={assignData.remark} onChange={(e) => setAssignData({...assignData, remark: e.target.value})} className="input-modern" placeholder="Document the condition of the asset during this transfer..." />
                </div>
                <div className="asset-form-actions">
                  <button type="submit" className="asset-btn primary">Execute Workflow</button>
                  <button type="button" onClick={() => setShowAssignModal(false)} className="asset-btn secondary">Cancel Transfer</button>
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
