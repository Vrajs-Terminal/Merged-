import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Plus, RefreshCcw, 
  Clock, AlertTriangle, CheckCircle2, 
  CalendarRange,
   DollarSign, Shield, X, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';

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
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
         <div>
            <h1 className="page-title"><Package size={22} /> Infrastructure Health</h1>
            <p className="page-subtitle">Preventive Engineering Control</p>
         </div>
         <div style={{ display: "flex", gap: "10px" }}>
            {activeTab !== 'Completed' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary shadow-glow"
              >
                 <Plus size={18} /> Schedule
              </button>
            )}
            <button onClick={fetchData} className="btn btn-secondary shadow-sm">
               <RefreshCcw size={18} />
            </button>
         </div>
      </div>

      {/* Analytics Dashboard Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <Clock size={24} color="var(--primary)" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Upcoming Cycle</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{activeTab === 'Upcoming' ? maintenance.length : '--'}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <AlertTriangle size={24} color="#ef4444" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Overdue Protocol</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{activeTab === 'Missing' ? maintenance.length : '--'}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <DollarSign size={24} color="#10b981" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Recovery/Spent (YTD)</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>₹ {totalSpent.toLocaleString() || 0}</h3>
           </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card" style={{ minHeight: "600px", padding: 0 }}>
         {/* Navigation Tabs */}
         <div className="tabs-underline-container">
            {(['Upcoming', 'Missing', 'Completed'] as const).map((tab) => (
               <button
                 key={tab}
                 className={`tab-underline ${activeTab === tab ? "active" : ""}`}
                 onClick={() => setActiveTab(tab)}
               >
                 {tab === 'Missing' ? <AlertTriangle size={16} color={activeTab === tab ? "#ef4444" : "var(--text-muted)"} /> : tab === 'Completed' ? <CheckCircle2 size={16} color={activeTab === tab ? "#10b981" : "var(--text-muted)"} /> : <CalendarRange size={16} />}
                 {tab}
               </button>
            ))}
         </div>

         <div style={{ padding: "24px" }}>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Synchronizing health records...</div>
            ) : maintenance.length === 0 ? (
              <div style={{ padding: "80px", textAlign: "center" }}>
                 <div style={{ background: "rgba(79, 70, 229, 0.04)", padding: "24px", borderRadius: "24px", display: "inline-block", marginBottom: "16px" }}>
                    <Shield size={48} color="var(--text-muted)" />
                 </div>
                 <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>System Integrity Verified</h3>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No pending maintenance protocols for the current window.</p>
              </div>
            ) : (
               <table className="table-modern">
                  <thead>
                     <tr>
                        <th>Unit Target</th>
                        <th>Protocol Type</th>
                        <th>Service Node</th>
                        <th>Execution Date</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {maintenance.map((m) => (
                        <tr key={m.id}>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                                    <Clock size={18} />
                                 </div>
                                 <div>
                                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{m.asset?.itemName}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.asset?.assetCode}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>{m.maintenanceType}</span>
                           </td>
                           <td className="px-6 py-4">
                              <div style={{ fontSize: "13px", fontWeight: "600" }}>{m.vendorName || 'Internal Engineering'}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{new Date(m.nextMaintenanceDate).toLocaleDateString()}</div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              {m.status !== 'Completed' && (
                                 <button 
                                    onClick={() => { setSelectedMaint(m); setShowCompleteModal(true); }}
                                    className="btn btn-primary"
                                    style={{ padding: "8px 16px", fontSize: "12px" }}
                                 >
                                    Finalize Cycle
                                 </button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="glass-card w-full max-w-2xl shadow-2xl animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "24px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Schedule Maintenance</h2>
                 <button onClick={() => setShowAddModal(false)} style={{ padding: "8px", borderRadius: "8px", background: "white", border: "1px solid var(--color-border)" }}>
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
                         onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                         className="select-modern"
                       >
                          <option value="">Select Target Unit</option>
                          {assets.map(a => <option key={a.id} value={a.id}>{a.itemName} ({a.assetCode})</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="label-modern">Protocol Type</label>
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

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div>
                       <label className="label-modern">Frequency Sync</label>
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
                    <div>
                       <label className="label-modern">Scheduled Date*</label>
                       <input 
                         required
                         type="date"
                         value={formData.nextMaintenanceDate}
                         onChange={(e) => setFormData({...formData, nextMaintenanceDate: e.target.value})}
                         className="input-modern"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="label-modern">Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="input-modern"
                      style={{ minHeight: "100px" }}
                    />
                 </div>

                 <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Start Health Sequence</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Discard</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="glass-card w-full max-w-lg shadow-2xl animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "24px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Finalize Cycle</h2>
                 <button onClick={() => setShowCompleteModal(false)} style={{ padding: "8px", borderRadius: "8px", background: "white", border: "1px solid var(--color-border)" }}>
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleComplete} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                 <div>
                    <label className="label-modern">Actual Ledger Impact (₹)*</label>
                    <input 
                      required
                      type="number"
                      placeholder="0.00"
                      value={completeData.amountSpent}
                      onChange={(e) => setCompleteData({ ...completeData, amountSpent: e.target.value })}
                      className="input-modern"
                      style={{ fontSize: "24px", fontWeight: "700" }}
                    />
                 </div>
                 <div>
                    <label className="label-modern">Engineering Report</label>
                    <textarea 
                      value={completeData.notes}
                      onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                      className="input-modern"
                      style={{ minHeight: "120px" }}
                    />
                 </div>
                 <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Finalize & Sync Archive</button>
                    <button type="button" onClick={() => setShowCompleteModal(false)} className="btn btn-secondary">Back</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetMaintenance;
