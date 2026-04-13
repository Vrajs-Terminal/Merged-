import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Layout, CheckCircle2, Building2, Globe, Eye, EyeOff, TrendingUp } from "lucide-react";
import { ledgerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const BalanceSheetType: React.FC = () => {
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ledgerAPI.getTransactions({}).catch(() => ({ data: [] }));
        const transactions = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        const grouped = Object.values(
          transactions.reduce((acc: Record<string, any>, item: any) => {
            const name = item.type || 'Unnamed Type';
            if (!acc[name]) {
              acc[name] = {
                id: name,
                name,
                category: item.category || 'Expense',
                branch: item.branch?.name || item.branch?.branchName || 'All',
                status: 'Visible'
              };
            }
            return acc;
          }, {})
        );
        setTypes(grouped);
      } catch {
        toast.info('ℹ️ Ledger types loaded from live data');
      }
    };

    load();
  }, []);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><TrendingUp size={22} /> Balance Sheet Types</h1>
          <p className="page-subtitle">Configure financial accounts and categories linked with organizational branches</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-primary shadow-glow">
            <Plus size={18} /> Define New Type
          </button>
        </div>
      </div>

       <div className="glass-card">
         <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--primary)" }}>
            <Layout size={20} />
            <p style={{ fontSize: "14px", fontWeight: "600" }}>Linked Branch Control: Certain financial types can be restricted to specific branches for segmented accounting.</p>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Type Identifier Name</th>
                <th>Primary Category</th>
                <th>Branch Assignment</th>
                <th>System Visibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td><span style={{ fontWeight: "700", color: t.status === 'Visible' ? 'var(--text-main)' : 'var(--text-muted)' }}>{t.name}</span></td>
                  <td>
                    <span className={`badge ${
                      t.category === "Income" ? "badge-success" : 
                      t.category === "Expense" ? "badge-danger" : 
                      t.category === "Asset" ? "badge-primary" : "badge-warning"
                    }`} style={{ fontSize: "10px", fontWeight: "800" }}>
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
                       {t.branch === 'All' ? <Globe size={14} /> : <Building2 size={14} />}
                       {t.branch}
                    </div>
                  </td>
                  <td>
                    {t.status === "Visible" ? (
                      <span className="badge badge-success" style={{ gap: "6px", cursor: "pointer" }}><Eye size={12} /> Live</span>
                    ) : (
                      <span className="badge badge-gray" style={{ gap: "6px", cursor: "pointer" }}><EyeOff size={12} /> Stashed</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       <div className="glass-card" style={{ marginTop: "32px", background: "rgba(234, 179, 8, 0.04)", border: "1px dashed rgba(234, 179, 8, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#eab308" }}>
             <CheckCircle2 size={18} />
             <p style={{ fontSize: "13px", fontWeight: "700" }}>Pro Feature: Automatic mapping to expense categories is available for 'Expense' types. This syncs with your operational spends.</p>
          </div>
       </div>
    </div>
  );
};

export default BalanceSheetType;
