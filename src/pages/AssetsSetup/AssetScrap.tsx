import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Trash2, Package,
  DollarSign, 
  Trash,
  Shield,
  Info, X, 
  AlertTriangle, RefreshCcw
} from 'lucide-react';
import { toast } from '../../components/Toast';

const AssetScrap: React.FC = () => {
  const [scrapList, setScrapList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    reason: '',
    soldPrice: '',
    scrapDate: new Date().toISOString().split('T')[0],
    scrapBy: 'System Admin'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scrapRes, assetRes] = await Promise.all([
        assetsAPI.getScrap().catch(() => ({ data: [] })),
        assetsAPI.getAssets({ status: 'Active' }).catch(() => ({ data: [] }))
      ]);
      setScrapList(Array.isArray(scrapRes?.data) ? scrapRes.data : Array.isArray(scrapRes?.data?.data) ? scrapRes.data.data : []);
      setAssets(Array.isArray(assetRes?.data) ? assetRes.data : Array.isArray(assetRes?.data?.data) ? assetRes.data.data : []);
    } catch (error) {
      toast.info('ℹ️ Operating in offline mode - disposal records may not sync');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetsAPI.scrapAsset(formData);
      toast.success('Hardware permanently decommissioned');
      setShowScrapModal(false);
      setFormData({ assetId: '', reason: '', soldPrice: '', scrapDate: new Date().toISOString().split('T')[0], scrapBy: 'System Admin' });
      fetchData();
    } catch (error) {
      toast.error('Decommissioning protocol failed');
    }
  };

  const totalRecoveryValue = scrapList.reduce((acc, item) => acc + (item.soldPrice || 0), 0);

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
           <h1 className="page-title"><Package size={22} /> Asset Disposal Hub</h1>
           <p className="page-subtitle">Post-lifecycle decommissioning & recovery</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button 
             onClick={() => setShowScrapModal(true)}
             className="btn btn-danger shadow-glow"
           >
              <Trash size={18} /> Disposal Protocol
           </button>
           <button onClick={fetchData} className="btn btn-secondary shadow-sm">
              <RefreshCcw size={18} />
           </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <Trash2 size={24} color="#ef4444" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Decommissioned Units</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{scrapList.length}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <DollarSign size={24} color="#10b981" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Asset Recovery (Net)</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>₹ {totalRecoveryValue.toLocaleString()}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <Shield size={24} color="var(--primary)" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Health Index</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>100%</h3>
           </div>
        </div>
      </div>

      {/* Matrix Table Card */}
      <div className="glass-card" style={{ padding: 0 }}>
        <table className="table-modern">
          <thead>
            <tr>
              <th>Disposed Unit UID</th>
              <th>Isolation Reason</th>
              <th>Recovery Val</th>
              <th>Authorized By</th>
              <th style={{ textAlign: "right" }}>Disposal Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-8 text-center text-muted">Synchronizing decommissioning records...</td></tr>
               ))
            ) : scrapList.length === 0 ? (
              <tr>
                 <td colSpan={5} style={{ padding: "80px", textAlign: "center" }}>
                    <div style={{ background: "rgba(79, 70, 229, 0.04)", padding: "24px", borderRadius: "24px", display: "inline-block", marginBottom: "16px" }}>
                        <Package size={48} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>Inventory High Purity</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Zero scrapped units in current chronological window</p>
                 </td>
              </tr>
            ) : scrapList.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                       <Trash size={18} />
                    </div>
                    <div>
                       <div style={{ fontWeight: "700", fontSize: "14px" }}>{item.asset?.itemName || 'Purged Unit'}</div>
                       <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.asset?.assetCode || 'NO-REF'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                     <AlertTriangle size={14} color="#f59e0b" />
                     {item.reason}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span style={{ fontWeight: "700", color: "#10b981" }}>₹ {item.soldPrice?.toLocaleString() || '0'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="badge" style={{ background: "var(--color-bg-secondary)", color: "var(--text-muted)" }}>{item.scrapBy || 'MineHR Auth'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{new Date(item.scrapDate).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Scrap Modal System */}
      {showScrapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="glass-card w-full max-w-2xl shadow-2xl animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "24px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Decommissioning Protocol</h2>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Unit Termination Order</p>
                 </div>
                 <button onClick={() => setShowScrapModal(false)} style={{ padding: "8px", borderRadius: "8px", background: "white", border: "1px solid var(--color-border)" }}>
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div>
                       <label className="label-modern">Unit Identification*</label>
                       <select 
                         required
                         value={formData.assetId}
                         onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                         className="select-modern"
                       >
                          <option value="">Choose Unit from Registry</option>
                          {assets.map(a => <option key={a.id} value={a.id}>{a.itemName} ({a.assetCode})</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="label-modern">Termination Reason*</label>
                       <select 
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="select-modern"
                       >
                          <option value="">Select Protocol Trigger</option>
                          <option value="Damaged - Beyond Repair">Damaged - Beyond Repair</option>
                          <option value="Old / Obsolete">Old / Obsolete</option>
                          <option value="Lost / Stolen">Lost / Stolen</option>
                          <option value="End of Lifecycle">End of Lifecycle</option>
                       </select>
                    </div>
                 </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div>
                       <label className="label-modern">Recovery Ledger (₹)</label>
                       <input 
                         type="number"
                         placeholder="0.00"
                         value={formData.soldPrice}
                         onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value })}
                         className="input-modern"
                       />
                    </div>
                    <div>
                       <label className="label-modern">Execution Date</label>
                       <input 
                        type="date"
                        value={formData.scrapDate}
                        onChange={(e) => setFormData({ ...formData, scrapDate: e.target.value })}
                        className="input-modern"
                       />
                    </div>
                 </div>

                 <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button type="submit" className="btn btn-danger" style={{ flex: 1, padding: "12px" }}>
                       Finalize Decommissioning
                    </button>
                    <button type="button" onClick={() => setShowScrapModal(false)} className="btn btn-secondary">Abort</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Info Section */}
      <div className="glass-card" style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "20px", background: "var(--color-bg-secondary)" }}>
         <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "white", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Info size={24} color="var(--primary)" />
         </div>
         <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Immutable Historical Lock</h4>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Scrapping an asset permanently removes it from the Active Registry and triggers an automated final audit log entry.</p>
         </div>
      </div>
    </div>
  );
};

export default AssetScrap;
