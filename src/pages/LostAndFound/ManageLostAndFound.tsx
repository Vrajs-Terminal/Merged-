import React, { useState, useEffect } from "react";
import { Trash2, Search, Filter, RefreshCcw, Package, AlertTriangle, Eye, CheckCircle2, XCircle, MapPin, Calendar, User, X } from "lucide-react";
import { toast } from "../../components/Toast";
import { lostAndFoundAPI } from "../../services/apiService";
import PageTitle from "../../components/PageTitle";

export default function ManageLostAndFound() {
  const [items, setItems] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [filterType]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = filterType !== "All" ? { type: filterType } : {};
      const res = await lostAndFoundAPI.getItems(params).catch(() => ({ data: [] }));
      setItems(Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      toast.info("ℹ️ Operating in offline mode - inventory may not sync");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await lostAndFoundAPI.updateItemStatus(id, status);
      toast.success("Protocol state transitioned: " + status);
      fetchItems();
    } catch (e) {
      toast.error("State transition failure");
    }
  };

  const deleteItem = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
      await lostAndFoundAPI.deleteItem(id);
      toast.success("Item permanently purged from registry");
      fetchItems();
    } catch (e) {
      toast.error("Decommissioning failed");
    }
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
           <PageTitle title="Lost & Found Hub" subtitle="Centralized infrastructure for anomalous item tracking" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <div style={{ display: "flex", alignItems: "center", background: "white", padding: "6px 12px", borderRadius: "12px", border: "1px solid var(--color-border)", gap: "10px" }}>
              <Filter size={16} color="var(--text-muted)" />
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)} 
                className="select-modern" 
                style={{ border: "none", background: "none", width: "120px", padding: 0 }}
              >
                <option value="All">All Matrix</option>
                <option value="Lost">Lost (Missing)</option>
                <option value="Found">Found (Registry)</option>
              </select>
           </div>
           <button onClick={fetchItems} className="btn btn-secondary shadow-sm">
              <RefreshCcw size={18} />
           </button>
        </div>
      </div>

      {/* Analytics Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "32px", borderLeft: "6px solid #ef4444" }}>
           <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "16px", borderRadius: "16px" }}>
              <AlertTriangle size={32} color="#ef4444" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em" }}>MISSING PROTOCOLS</p>
              <h3 style={{ fontSize: "32px", fontWeight: "900", marginTop: "4px" }}>{items.filter(i => i.type === 'Lost').length}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "32px", borderLeft: "6px solid #10b981" }}>
           <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "16px", borderRadius: "16px" }}>
              <Package size={32} color="#10b981" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em" }}>RECOVERED ITEMS</p>
              <h3 style={{ fontSize: "32px", fontWeight: "900", marginTop: "4px" }}>{items.filter(i => i.type === 'Found').length}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "32px", borderLeft: "6px solid var(--primary)" }}>
           <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "16px", borderRadius: "16px" }}>
              <CheckCircle2 size={32} color="var(--primary)" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em" }}>CLOSE-OUT RATE</p>
              <h3 style={{ fontSize: "32px", fontWeight: "900", marginTop: "4px" }}>{Math.round((items.filter(i => i.status === 'Returned').length / (items.length || 1)) * 100)}%</h3>
           </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)" }}>Anomalous Inventory Matrix</h3>
           <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>{items.length} Slots Occupied</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Hardware/Item Identity</th>
                <th>Type Status</th>
                <th>Reporting Entity</th>
                <th>Audit Date</th>
                <th>Isolation Location</th>
                <th>Protocol State</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={7} style={{ padding: "16px", textAlign: "center" }}>Synchronizing Matrix...</td></tr>)
              ) : items.length === 0 ? (
                <tr>
                   <td colSpan={7} style={{ padding: "80px", textAlign: "center" }}>
                      <div style={{ background: "rgba(79, 70, 229, 0.04)", padding: "24px", borderRadius: "24px", display: "inline-block", marginBottom: "16px" }}>
                          <Search size={48} color="var(--text-muted)" />
                      </div>
                      <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)" }}>Matrix Vacuum</h3>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Zero anomalous items found in current chronological slot.</p>
                   </td>
                </tr>
              ) : items.map(n => (
                <tr key={n.id}>
                  <td className="px-6 py-4">
                    <div style={{ fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                       <div style={{ padding: "8px", borderRadius: "8px", background: n.type === 'Lost' ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)", border: "1px solid " + (n.type === 'Lost' ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)") }}>
                          <Package size={16} color={n.type === 'Lost' ? "#ef4444" : "#10b981"} />
                       </div>
                       {n.itemName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge" style={{ background: n.type === 'Lost' ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)", color: n.type === 'Lost' ? "#ef4444" : "#10b981" }}>
                      {n.type === 'Lost' ? "MISSING" : "RECOVERED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={12} color="var(--text-muted)" />
                       </div>
                       <span style={{ fontSize: "13px", fontWeight: "600" }}>{n.reportedBy?.firstName} {n.reportedBy?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <Calendar size={14} /> {new Date(n.date).toLocaleDateString()}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                     <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <MapPin size={14} color="#f59e0b" /> {n.location}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <select 
                       value={n.status} 
                       onChange={e => updateStatus(n.id, e.target.value)} 
                       className="select-modern" 
                       style={{ padding: "6px 12px", fontSize: "12px", background: n.status === 'Open' ? "rgba(245, 158, 11, 0.05)" : "rgba(16, 185, 129, 0.05)", color: n.status === 'Open' ? "#f59e0b" : "#10b981", border: "none" }}
                     >
                        <option value="Open">Open Loop</option>
                        <option value="Matched">Match Detected</option>
                        <option value="Returned">Protocol Closed</option>
                     </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteItem(n.id)} style={{ padding: "8px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                       <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

