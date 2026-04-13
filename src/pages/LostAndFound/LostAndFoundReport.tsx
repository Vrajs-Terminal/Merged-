import React, { useState, useEffect } from "react";
import { BarChart2, Search, RefreshCcw, TrendingUp, Package, CheckCircle, AlertTriangle, User, ArrowRight, Shield, Info } from "lucide-react";
import { toast } from "../../components/Toast";
import { lostAndFoundAPI } from "../../services/apiService";
import PageTitle from "../../components/PageTitle";

export default function LostAndFoundReport() {
  const [items, setItems] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resItems, resClaims] = await Promise.all([
        lostAndFoundAPI.getItems().catch(() => ({ data: [] })),
        lostAndFoundAPI.getClaims().catch(() => ({ data: [] }))
      ]);
      setItems(Array.isArray(resItems?.data) ? resItems.data : Array.isArray(resItems?.data?.data) ? resItems.data.data : []);
      setClaims(Array.isArray(resClaims?.data) ? resClaims.data : Array.isArray(resClaims?.data?.data) ? resClaims.data.data : []);
    } catch (e) {
      toast.info("ℹ️ Operating in offline mode - analytics may not be real-time");
    } finally {
      setLoading(false);
    }
  };

  const totalLost = items.filter(i => i.type === 'Lost').length;
  const totalFound = items.filter(i => i.type === 'Found').length;
  const returnedItems = items.filter(i => i.status === 'Returned').length;
  const pendingClaims = claims.filter(c => c.status === 'Pending').length;

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ padding: "8px", background: "rgba(79, 70, 229, 0.1)", borderRadius: "10px" }}>
                 <BarChart2 size={24} color="var(--primary)" />
              </div>
              <PageTitle title="Anomalous Data Analytics" />
           </div>
           <p className="page-subtitle">Infrastructure recovery statistics and trend matrix</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button onClick={fetchData} className="btn btn-secondary shadow-sm">
              <RefreshCcw size={18} /> Sync Real-time
           </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="glass-card" style={{ padding: "32px", borderLeft: "6px solid #ef4444" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "800", letterSpacing: "0.05em" }}>TOTAL LOST ITEMS</p>
                 <h3 style={{ fontSize: "40px", fontWeight: "900", color: "#ef4444", marginTop: "4px" }}>{totalLost}</h3>
              </div>
              <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "12px" }}>
                 <AlertTriangle size={24} color="#ef4444" />
              </div>
           </div>
           <p style={{ fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>Missing Infrastructure Nodes</p>
        </div>

        <div className="glass-card" style={{ padding: "32px", borderLeft: "6px solid #10b981" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "800", letterSpacing: "0.05em" }}>TOTAL FOUND ITEMS</p>
                 <h3 style={{ fontSize: "40px", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>{totalFound}</h3>
              </div>
              <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "12px" }}>
                 <Package size={24} color="#10b981" />
              </div>
           </div>
           <p style={{ fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>Recovered / Register Status</p>
        </div>

        <div className="glass-card" style={{ padding: "32px", borderLeft: "6px solid var(--primary)" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "800", letterSpacing: "0.05em" }}>PROTOCOL CLOSED</p>
                 <h3 style={{ fontSize: "40px", fontWeight: "900", color: "var(--primary)", marginTop: "4px" }}>{returnedItems}</h3>
              </div>
              <div style={{ padding: "12px", background: "rgba(79, 70, 229, 0.05)", borderRadius: "12px" }}>
                 <CheckCircle size={24} color="var(--primary)" />
              </div>
           </div>
           <p style={{ fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>Hardware Successfully Reintegrated</p>
        </div>

        <div className="glass-card" style={{ padding: "32px", borderLeft: "6px solid #f59e0b" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "800", letterSpacing: "0.05em" }}>PENDING CLAIMS</p>
                 <h3 style={{ fontSize: "40px", fontWeight: "900", color: "#f59e0b", marginTop: "4px" }}>{pendingClaims}</h3>
              </div>
              <div style={{ padding: "12px", background: "rgba(245, 158, 11, 0.05)", borderRadius: "12px" }}>
                 <TrendingUp size={24} color="#f59e0b" />
              </div>
           </div>
           <p style={{ fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>Active Adjudication Protocols</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8" style={{ width: '100%' }}>
         {/* Recent Activity Card */}
         <div className="xl:col-span-3">
            <div className="glass-card" style={{ padding: "40px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-main)" }}>Recent Verification activity</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Audit log of the last claim state transitions</p>
                  </div>
                  <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "8px 16px" }}>Last 5 Adjudications</span>
               </div>
               
               <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {loading ? (
                     <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                        <RefreshCcw size={32} className="animate-spin" style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                        <p>Synchronizing Ledger Matrix...</p>
                     </div>
                  ) : claims.length === 0 ? (
                     <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", background: "var(--bg-app)", borderRadius: "24px", border: "1px dashed var(--border-light)" }}>
                        <Info size={32} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                        <p>No recent claim activity detected in this cycle.</p>
                     </div>
                  ) : claims.slice(0, 5).map(c => (
                     <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", background: "white", borderRadius: "20px", border: "1px solid var(--border-light)", transition: "all 0.2s" }} className="hover:shadow-md hover:translate-x-1">
                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                           <div style={{ padding: "14px", borderRadius: "14px", background: "var(--bg-app)" }}>
                              <Package size={24} color="var(--primary)" />
                           </div>
                           <div>
                              <p style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "15px" }}>{c.item?.itemName}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                                    <User size={14} /> {c.claimedBy?.firstName} {c.claimedBy?.lastName}
                                 </div>
                                 <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-light)" }}></div>
                                 <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Protocol Match</span>
                              </div>
                           </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                           <span className="badge" style={{ 
                              padding: "10px 20px",
                              fontSize: "11px",
                              fontWeight: "800",
                              background: c.status === 'Approved' ? "rgba(16, 185, 129, 0.08)" : c.status === 'Rejected' ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)", 
                              color: c.status === 'Approved' ? "#10b981" : c.status === 'Rejected' ? "#ef4444" : "#f59e0b" 
                           }}>
                              {c.status.toUpperCase()}
                           </span>
                           <ArrowRight size={20} color="var(--border-light)" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Guard Card */}
         <div className="xl:col-span-1">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
               <div className="glass-card" style={{ background: "var(--text-main)", color: "white", padding: "32px", position: "relative", overflow: "hidden" }}>
                     <Shield size={120} style={{ position: "absolute", right: "-20px", bottom: "-20px", opacity: 0.1, transform: "rotate(15deg)" }} />
                     <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>Security Audit</h3>
                     <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>Monitoring corporate recovery cycles.</p>
                     
                     <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <p style={{ fontSize: "10px", fontWeight: "800", color: "rgba(255,255,255,0.4)" }}>RECOVERY RATE</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                           <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${Math.round((returnedItems / (items.length || 1)) * 100)}%`, height: "100%", background: "#10b981" }}></div>
                           </div>
                           <span style={{ fontSize: "14px", fontWeight: "800" }}>{Math.round((returnedItems / (items.length || 1)) * 100)}%</span>
                        </div>
                     </div>
               </div>

               <div className="glass-card" style={{ background: "rgba(79, 70, 229, 0.03)", border: "1px solid rgba(79, 70, 229, 0.1)", padding: "24px" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                     <Info size={18} color="var(--primary)" />
                     <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)" }}>Integrity Note</h4>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                     Found company property must be reported to the sovereign matrix.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
