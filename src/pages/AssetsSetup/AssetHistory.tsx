import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  History, Clock, User, ArrowRight, Package, 
  TrendingDown, TrendingUp, Info,
  Cpu
} from 'lucide-react';
import { toast } from '../../components/Toast';

const AssetHistory: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoadingAssets(true);
      const res = await assetsAPI.getAssets();
      setAssets(res.data);
    } catch (error) {
      toast.error('Failed to load asset index');
    } finally {
      setLoadingAssets(false);
    }
  };

  const loadHistory = async (asset: any) => {
    try {
      setLoading(true);
      setSelectedAsset(asset);
      const res = await assetsAPI.getHistory(asset.id);
      setHistory(res.data);
    } catch (error) {
      toast.error('Failed to load lifecycle record');
    } finally {
      setLoading(false);
    }
  };

  const getActionStyles = (action: string) => {
    switch (action) {
      case 'Created': return 'background: rgba(59, 130, 246, 0.08); color: #3b82f6;';
      case 'Assigned': return 'background: rgba(16, 185, 129, 0.08); color: #10b981;';
      case 'Transferred': return 'background: rgba(99, 102, 241, 0.08); color: #6366f1;';
      case 'Maintenance': return 'background: rgba(245, 158, 11, 0.08); color: #f59e0b;';
      case 'Scrapped': return 'background: rgba(239, 68, 68, 0.08); color: #ef4444;';
      case 'Returned': return 'background: rgba(107, 114, 128, 0.08); color: #6b7280;';
      default: return 'background: rgba(107, 114, 128, 0.05); color: #9ca3af;';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created': return <TrendingUp size={14} />;
      case 'Transferred': return <ArrowRight size={14} />;
      case 'Scrapped': return <TrendingDown size={14} />;
      case 'Maintenance': return <Cpu size={14} />;
      case 'Assigned': return <User size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
           <h1 className="page-title"><Package size={22} /> Asset Lifecycle Audit</h1>
           <p className="page-subtitle">Immutable infrastructure tracking</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button onClick={loadAssets} className="btn btn-secondary shadow-sm">
              <History size={18} /> Refresh Index
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Asset Selection List */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
           <div className="glass-card" style={{ minHeight: "600px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border)" }}>
                 <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)" }}>Registry Index</h3>
                 <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>{assets.length} Units</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "600px", overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
                {loadingAssets ? (
                  Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl"></div>)
                ) : assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => loadHistory(asset)}
                    className="glass-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px",
                      width: "100%",
                      textAlign: "left",
                      border: selectedAsset?.id === asset.id ? "2px solid var(--primary)" : "1px solid transparent",
                      background: selectedAsset?.id === asset.id ? "var(--primary-light)" : "var(--color-bg-secondary)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: selectedAsset?.id === asset.id ? "var(--primary)" : "var(--text-muted)" }}>
                       <Package size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                       <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{asset.itemName}</p>
                       <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{asset.assetCode || 'NO-REF'}</p>
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-12 xl:col-span-8">
           {!selectedAsset ? (
              <div className="glass-card" style={{ height: "660px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                 <div style={{ background: "rgba(79, 70, 229, 0.04)", padding: "24px", borderRadius: "24px", marginBottom: "24px" }}>
                    <Cpu size={48} color="var(--primary)" />
                 </div>
                 <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)" }}>Awaiting Asset Selection</h3>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "320px", marginTop: "8px", fontWeight: "500" }}>Choose a unit from the master index to view its complete lifecycle and chronological trail.</p>
              </div>
           ) : (
              <div className="animate-fade-in space-y-8">
                 <div className="glass-card" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                       <div>
                          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>{selectedAsset.itemName}</h2>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                             <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: "700" }}>{selectedAsset.assetCode}</span>
                             <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> Tracking Since Acquisition</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Protocol</p>
                          <span style={{ fontSize: "18px", fontWeight: "800", color: "#10b981" }}>{selectedAsset.status || 'Active'}</span>
                       </div>
                    </div>
                 </div>

                 <div style={{ paddingLeft: "32px", borderLeft: "2px solid var(--color-border)", marginLeft: "40px", display: "flex", flexDirection: "column", gap: "32px" }}>
                    {loading ? (
                       Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-xl"></div>)
                    ) : history.length === 0 ? (
                       <div className="glass-card" style={{ textAlign: "center", padding: "48px" }}>
                          <Info size={32} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
                          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>No lifecycle data found for this unit</p>
                       </div>
                    ) : history.map((event, index) => (
                       <div key={event.id} style={{ position: "relative" }}>
                          {/* Timeline Dot */}
                          <div style={{ 
                             position: "absolute", 
                             left: "-49px", 
                             top: "24px", 
                             width: "32px", 
                             height: "32px", 
                             borderRadius: "50%", 
                             background: index === 0 ? "var(--primary)" : "white", 
                             border: "4px solid white",
                             boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             zIndex: 2
                          }}>
                             <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: index === 0 ? "white" : "var(--color-border)" }} />
                          </div>

                          <div className="glass-card" style={{ padding: "24px" }}>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                   <span className="badge" style={{ ...Object.fromEntries(getActionStyles(event.action).split(';').filter(s => s.trim()).map(s => { const [k,v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase()), v.trim()] })), fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                                      {getActionIcon(event.action)} {event.action}
                                   </span>
                                   <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                      <Clock size={12} /> {new Date(event.createdAt).toLocaleString()}
                                   </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                   <div style={{ textAlign: "right" }}>
                                      <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", margin: 0 }}>Authorized By</p>
                                      <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{event.doneBy || 'System'}</p>
                                   </div>
                                   <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <User size={16} color="var(--text-muted)" />
                                   </div>
                                </div>
                             </div>

                             <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "var(--color-bg-secondary)", padding: "16px", borderRadius: "12px" }}>
                                <div style={{ flex: 1 }}>
                                   <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Origin</p>
                                   <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>{event.fromInfo || 'Inventory Stock'}</p>
                                </div>
                                <ArrowRight size={20} color="var(--color-border)" />
                                <div style={{ flex: 1 }}>
                                   <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Target</p>
                                   <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}>{event.toInfo || 'Active Stock'}</p>
                                </div>
                             </div>

                             {event.remark && (
                                <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(16, 185, 129, 0.04)", borderLeft: "4px solid #10b981", borderRadius: "8px" }}>
                                   <p style={{ fontSize: "13px", color: "#065f46", fontStyle: "italic", margin: 0 }}>" {event.remark} "</p>
                                </div>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AssetHistory;
