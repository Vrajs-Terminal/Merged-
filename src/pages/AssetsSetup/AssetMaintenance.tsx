import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Plus, RefreshCcw, 
  Clock, AlertTriangle, CheckCircle2, 
  CalendarRange,
   DollarSign, Shield, X, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';
import './AssetReportsScrap.css';

type MaintenanceTab = 'Upcoming' | 'Missing' | 'Completed';

interface AssetMaintenanceProps {
   defaultTab?: MaintenanceTab;
}

const AssetMaintenance: React.FC<AssetMaintenanceProps> = ({ defaultTab = 'Upcoming' }) => {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
   const [activeTab, setActiveTab] = useState<MaintenanceTab>(defaultTab);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceType: 'Service',
    nextMaintenanceDate: new Date().toISOString().split('T')[0],
    frequency: 'Monthly',
    vendorName: '',
    vendorContact: '',
    notes: ''
  });

  const [completeData, setCompleteData] = useState({
    amountSpent: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

   useEffect(() => {
      setActiveTab(defaultTab);
   }, [defaultTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintRes, assetRes] = await Promise.all([
        assetsAPI.getMaintenance({ status: activeTab }).catch(() => ({ data: [] })),
        assetsAPI.getAssets({ status: 'Active' }).catch(() => ({ data: [] }))
      ]);
      setMaintenance(Array.isArray(maintRes?.data) ? maintRes.data : Array.isArray(maintRes?.data?.data) ? maintRes.data.data : []);
      setAssets(Array.isArray(assetRes?.data) ? assetRes.data : Array.isArray(assetRes?.data?.data) ? assetRes.data.data : []);
    } catch (error) {
      toast.info('ℹ️ Operating in offline mode - maintenance data may not sync');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetsAPI.createMaintenance(formData);
      toast.success('Maintenance scheduled successfully');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to schedule maintenance');
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetsAPI.completeMaintenance(selectedMaint.id, completeData);
      toast.success('Maintenance cycle finalized');
      setShowCompleteModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to close maintenance cycle');
    }
  };

  const totalSpent = maintenance.reduce((acc, curr) => acc + (curr.amountSpent || 0), 0);

  return (
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
         <div>
            <h1 className="asset-page-title"><Package size={24} /> Infrastructure Health</h1>
            <p className="asset-page-subtitle">Preventive Engineering Control</p>
         </div>
         <div className="asset-header-actions">
            {activeTab !== 'Completed' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="asset-btn primary"
              >
                 <Plus size={16} /> Schedule
              </button>
            )}
            <button onClick={fetchData} className="asset-btn secondary icon-only" title="Refresh data">
               <RefreshCcw size={16} />
            </button>
         </div>
      </div>

      <div className="asset-kpi-grid">
        <div className="asset-kpi-card">
           <div className="asset-kpi-icon primary">
              <Clock size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Upcoming Cycle</p>
              <h3 className="asset-kpi-value">{activeTab === 'Upcoming' ? maintenance.length : '--'}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon danger">
              <AlertTriangle size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Overdue Protocol</p>
              <h3 className="asset-kpi-value">{activeTab === 'Missing' ? maintenance.length : '--'}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon green">
              <DollarSign size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Recovery/Spent (YTD)</p>
              <h3 className="asset-kpi-value">₹ {totalSpent.toLocaleString() || 0}</h3>
           </div>
        </div>
      </div>

      <div className="asset-panel-card">
         <div className="asset-maint-tabs">
            {(['Upcoming', 'Missing', 'Completed'] as const).map((tab) => (
               <button
                 key={tab}
                 className={`asset-maint-tab ${activeTab === tab ? 'active' : ''}`}
                 onClick={() => setActiveTab(tab)}
               >
                 {tab === 'Missing' ? <AlertTriangle size={14} /> : tab === 'Completed' ? <CheckCircle2 size={14} /> : <CalendarRange size={14} />}
                 {tab}
               </button>
            ))}
         </div>

         <div className="asset-maint-content">
            {loading ? (
              <div className="asset-empty-state compact">
                <h4>Synchronizing health records...</h4>
              </div>
            ) : maintenance.length === 0 ? (
              <div className="asset-empty-state compact">
                 <Shield size={36} />
                 <h4>System Integrity Verified</h4>
                 <p>No pending maintenance protocols for the current window.</p>
              </div>
            ) : (
               <div className="asset-table-wrap">
               <table className="asset-ops-table">
                  <thead>
                     <tr>
                        <th>Unit Target</th>
                        <th>Protocol Type</th>
                        <th>Service Node</th>
                        <th>Execution Date</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {maintenance.map((m) => (
                        <tr key={m.id}>
                           <td>
                              <div className="asset-custodian">
                                 <span className="asset-avatar"><Clock size={14} /></span>
                                 <div className="asset-cell-stack">
                                   <span className="asset-cell-main">{m.asset?.itemName}</span>
                                   <span className="asset-cell-sub">{m.asset?.assetCode}</span>
                                 </div>
                              </div>
                           </td>
                           <td>
                              <span className="asset-pill">{m.maintenanceType}</span>
                           </td>
                           <td>
                              <span className="asset-cell-main">{m.vendorName || 'Internal Engineering'}</span>
                           </td>
                           <td>
                              <span className="asset-cell-sub">{new Date(m.nextMaintenanceDate).toLocaleDateString()}</span>
                           </td>
                           <td>
                              {m.status !== 'Completed' && (
                                 <button 
                                    onClick={() => { setSelectedMaint(m); setShowCompleteModal(true); }}
                                    className="asset-btn primary"
                                 >
                                    Finalize Cycle
                                 </button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               </div>
            )}
         </div>
      </div>

      {showAddModal && (
        <div className="asset-modal-overlay">
           <div className="asset-modal">
              <div className="asset-modal-head">
                 <h2>Schedule Maintenance</h2>
                 <button onClick={() => setShowAddModal(false)} className="scrap-modal-close">
                    <X size={18} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="asset-modal-body">
                 <div className="asset-form-grid">
                    <div className="asset-form-field">
                       <label>Unit Identification*</label>
                       <select 
                         required
                         value={formData.assetId}
                         onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                         className="select-modern"
                       >
                          <option value="">Select Target Unit</option>
                          {assets.map(a => <option key={a.id} value={a.id}>{a.itemName} ({a.assetCode})</option>)}
                       </select>
                    </div>
                    <div className="asset-form-field">
                       <label>Protocol Type</label>
                       <select 
                          value={formData.maintenanceType}
                          onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
                          className="select-modern"
                       >
                          <option value="Service">Standard Service</option>
                          <option value="Repair">Hardware Repair</option>
                          <option value="AMC">Annual Contract</option>
                       </select>
                    </div>
                 </div>

                 <div className="asset-form-grid">
                    <div className="asset-form-field">
                       <label>Frequency Sync</label>
                       <select 
                          value={formData.frequency}
                          onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                          className="select-modern"
                       >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                       </select>
                    </div>
                    <div className="asset-form-field">
                       <label>Scheduled Date*</label>
                       <input 
                         required
                         type="date"
                         value={formData.nextMaintenanceDate}
                         onChange={(e) => setFormData({...formData, nextMaintenanceDate: e.target.value})}
                         className="input-modern"
                       />
                    </div>
                 </div>

                 <div className="asset-form-field">
                    <label>Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="input-modern"
                    />
                 </div>

                 <div className="asset-form-actions">
                    <button type="submit" className="asset-btn primary">Start Health Sequence</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="asset-btn secondary">Discard</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="asset-modal-overlay">
           <div className="asset-modal sm">
              <div className="asset-modal-head">
                 <h2>Finalize Cycle</h2>
                 <button onClick={() => setShowCompleteModal(false)} className="scrap-modal-close">
                    <X size={18} />
                 </button>
              </div>
              <form onSubmit={handleComplete} className="asset-modal-body">
                 <div className="asset-form-field">
                    <label>Actual Ledger Impact (₹)*</label>
                    <input 
                      required
                      type="number"
                      placeholder="0.00"
                      value={completeData.amountSpent}
                      onChange={(e) => setCompleteData({ ...completeData, amountSpent: e.target.value })}
                      className="input-modern"
                    />
                 </div>
                 <div className="asset-form-field">
                    <label>Engineering Report</label>
                    <textarea 
                      value={completeData.notes}
                      onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                      className="input-modern"
                    />
                 </div>
                 <div className="asset-form-actions">
                    <button type="submit" className="asset-btn primary">Finalize and Sync Archive</button>
                    <button type="button" onClick={() => setShowCompleteModal(false)} className="asset-btn secondary">Back</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetMaintenance;
