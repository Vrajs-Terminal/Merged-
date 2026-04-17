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
import './AssetReportsScrap.css';

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
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
        <div>
           <h1 className="asset-page-title"><Package size={24} /> Asset Disposal Hub</h1>
           <p className="asset-page-subtitle">Post-lifecycle decommissioning and recovery</p>
        </div>
        <div className="asset-header-actions">
           <button 
             onClick={() => setShowScrapModal(true)}
             className="asset-btn danger"
           >
              <Trash size={16} /> Disposal Protocol
           </button>
           <button onClick={fetchData} className="asset-btn secondary icon-only" title="Refresh data">
              <RefreshCcw size={16} />
           </button>
        </div>
      </div>

      <div className="asset-kpi-grid">
        <div className="asset-kpi-card">
           <div className="asset-kpi-icon danger">
              <Trash2 size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Decommissioned Units</p>
              <h3 className="asset-kpi-value">{scrapList.length}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon green">
              <DollarSign size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Asset Recovery (Net)</p>
              <h3 className="asset-kpi-value">₹ {totalRecoveryValue.toLocaleString()}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon primary">
              <Shield size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Health Index</p>
              <h3 className="asset-kpi-value">100%</h3>
           </div>
        </div>
      </div>

      <div className="asset-panel-card">
        <div className="asset-panel-head">
          <div>
            <h3>Disposal Register</h3>
            <p>Chronological decommissioning records with financial recovery trace.</p>
          </div>
          <div className="asset-pill">Scrap Ledger</div>
        </div>
        <div className="asset-table-wrap">
        <table className="asset-ops-table">
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
                  <tr key={i} className="asset-skeleton-row"><td colSpan={5}><div className="asset-skeleton"></div></td></tr>
               ))
            ) : scrapList.length === 0 ? (
              <tr>
                 <td colSpan={5}>
                    <div className="asset-empty-state compact">
                        <Package size={40} />
                        <h4>Inventory High Purity</h4>
                        <p>Zero scrapped units in current chronological window.</p>
                    </div>
                 </td>
              </tr>
            ) : scrapList.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="asset-custodian">
                    <span className="asset-avatar">
                       <Trash size={15} />
                    </span>
                    <div className="asset-cell-stack">
                       <span className="asset-cell-main">{item.asset?.itemName || 'Purged Unit'}</span>
                       <span className="asset-cell-sub">{item.asset?.assetCode || 'NO-REF'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="asset-custodian">
                     <AlertTriangle size={14} color="#f59e0b" />
                     <span className="asset-cell-sub">{item.reason || 'Not specified'}</span>
                  </div>
                </td>
                <td>
                  <span className="asset-cell-main">₹ {item.soldPrice?.toLocaleString() || '0'}</span>
                </td>
                <td>
                  <span className="asset-pill">{item.scrapBy || 'MineHR Auth'}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="asset-cell-sub">{new Date(item.scrapDate).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showScrapModal && (
        <div className="scrap-modal-overlay">
           <div className="scrap-modal">
              <div className="scrap-modal-head">
                 <div>
                    <h2>Decommissioning Protocol</h2>
                    <p>Unit termination order and recovery capture</p>
                 </div>
                 <button onClick={() => setShowScrapModal(false)} className="scrap-modal-close">
                    <X size={18} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="scrap-modal-form">
                 <div className="scrap-form-grid">
                    <div className="scrap-form-field">
                       <label>Unit Identification*</label>
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
                    <div className="scrap-form-field">
                       <label>Termination Reason*</label>
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

                 <div className="scrap-form-grid">
                    <div className="scrap-form-field">
                       <label>Recovery Ledger (₹)</label>
                       <input 
                         type="number"
                         placeholder="0.00"
                         value={formData.soldPrice}
                         onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value })}
                         className="input-modern"
                       />
                    </div>
                    <div className="scrap-form-field">
                       <label>Execution Date</label>
                       <input 
                        type="date"
                        value={formData.scrapDate}
                        onChange={(e) => setFormData({ ...formData, scrapDate: e.target.value })}
                        className="input-modern"
                       />
                    </div>
                 </div>

                 <div className="scrap-form-actions">
                    <button type="submit" className="asset-btn danger">
                       Finalize Decommissioning
                    </button>
                    <button type="button" onClick={() => setShowScrapModal(false)} className="asset-btn secondary">Abort</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="asset-note-card scrap-note">
         <div className="asset-note-icon">
            <Info size={22} />
         </div>
         <div>
            <h4>Immutable Historical Lock</h4>
            <p>Scrapping an asset permanently removes it from the active registry and triggers an automated final audit log entry.</p>
         </div>
      </div>
    </div>
  );
};

export default AssetScrap;
