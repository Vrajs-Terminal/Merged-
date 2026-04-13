import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Search, Filter, Eye, Laptop, Wifi, Zap, TrendingUp, ShoppingCart } from "lucide-react";
import { ledgerAPI, branchAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const WFHBalanceSheet: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ledgerRes, branchRes] = await Promise.all([
          ledgerAPI.getTransactions({}).catch(() => ({ data: [] })),
          branchAPI.getAll().catch(() => ({ data: [] }))
        ]);
        setTransactions(Array.isArray(ledgerRes?.data) ? ledgerRes.data : Array.isArray(ledgerRes?.data?.data) ? ledgerRes.data.data : []);
        setBranches(Array.isArray(branchRes?.data) ? branchRes.data : Array.isArray(branchRes?.data?.data) ? branchRes.data.data : []);
      } catch {
        toast.error("Failed to load live ledger data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalSpend = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const internetSpend = transactions.reduce((sum, item) => {
    const text = `${item.type || ''} ${item.remark || ''} ${item.category || ''}`.toLowerCase();
    return text.includes('internet') || text.includes('broadband') ? sum + Number(item.amount || 0) : sum;
  }, 0);
  const equipmentSpend = transactions.reduce((sum, item) => {
    const text = `${item.type || ''} ${item.remark || ''} ${item.category || ''}`.toLowerCase();
    return text.includes('equipment') || text.includes('laptop') || text.includes('device') ? sum + Number(item.amount || 0) : sum;
  }, 0);
  const remoteExpenseCount = transactions.filter(item => {
    const text = `${item.type || ''} ${item.remark || ''} ${item.category || ''}`.toLowerCase();
    return text.includes('wfh') || text.includes('remote') || text.includes('internet') || text.includes('electric') || text.includes('equipment');
  }).length;
  const filteredTransactions = transactions.filter(item => {
    const text = `${item.type || ''} ${item.remark || ''} ${item.branch?.name || ''}`.toLowerCase();
    return text.includes('wfh') || text.includes('remote') || text.includes('internet') || text.includes('electric') || text.includes('equipment');
  });

  const branchOptions = branches.map((branch: any) => branch.branchName || branch.name).filter(Boolean);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><TrendingUp size={22} /> WFH Balance Sheet</h1>
          <p className="page-subtitle">Track, approve and manage Work From Home related expenses and reimbursements</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-primary shadow-glow">
            <Plus size={18} /> Record WFH Spend
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
           <div>
            <label className="input-label">Select Employee</label>
            <select className="select-modern">
               <option>All Branches</option>
               {branchOptions.map((branch: string) => <option key={branch}>{branch}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Timeline Filter</label>
            <input type="date" className="input-modern" />
          </div>
          <div>
            <label className="input-label">Expense Category</label>
            <select className="select-modern">
               <option>All Ledger Entries</option>
               {Array.from(new Set(transactions.map(item => item.category).filter(Boolean))).map((category: any) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-primary shadow-glow" style={{ width: "100%" }}>
              <Filter size={18} /> Filter List
            </button>
          </div>
        </div>
      </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "12px", borderRadius: "12px" }}>
                <Wifi size={24} color="var(--primary)" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Total Broadband Spends</p>
                <h3 style={{ fontSize: "20px" }}>₹ {internetSpend.toLocaleString()}</h3>
             </div>
          </div>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "rgba(22, 163, 74, 0.08)", padding: "12px", borderRadius: "12px" }}>
                <Zap size={24} color="#16a34a" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Energy Allowances</p>
               <h3 style={{ fontSize: "20px" }}>₹ {(totalSpend - internetSpend - equipmentSpend).toLocaleString()}</h3>
             </div>
          </div>
           <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "rgba(14, 165, 233, 0.08)", padding: "12px", borderRadius: "12px" }}>
                <Laptop size={24} color="#0ea5e9" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Remote IT Asset Spends</p>
               <h3 style={{ fontSize: "20px" }}>₹ {equipmentSpend.toLocaleString()}</h3>
             </div>
           </div>
            <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "rgba(234, 88, 12, 0.08)", padding: "12px", borderRadius: "12px" }}>
               <ShoppingCart size={24} color="#ea580c" />
             </div>
             <div>
               <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>WFH Ledger Items</p>
               <h3 style={{ fontSize: "20px" }}>{remoteExpenseCount}</h3>
             </div>
          </div>
       </div>

      <div className="glass-card">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: "400px" }}>
               <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
               <input type="text" className="input-modern" placeholder="Search by name, remark or type..." style={{ paddingLeft: "40px" }} />
            </div>
             <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="btn btn-secondary shadow-sm" style={{ padding: "8px" }}><ShoppingCart size={16} /></button>
             </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Branch</th>
                <th>Billing Date</th>
                <th>WFH Expense Type</th>
                <th>Financial Amount</th>
                <th>System Remark</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : filteredTransactions).map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>{(item.branch?.name || item.branch?.branchName || 'GL').split(' ').map((n: string) => n[0]).join('')}</div>
                       <span style={{ fontWeight: "700" }}>{item.branch?.name || item.branch?.branchName || 'General Ledger'}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       {String(item.type || '').includes('Internet') ? <Wifi size={14} color="var(--primary)" /> : String(item.type || '').includes('Elect') ? <Zap size={14} color="#eab308" /> : <Laptop size={14} color="#0ea5e9" />}
                       <span style={{ fontWeight: "600", fontSize: "13px" }}>{item.type || 'Ledger Entry'}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: "800", color: "#166534" }}>₹ {Number(item.amount || 0).toLocaleString()}</td>
                  <td style={{ fontSize: "13px", maxWidth: "250px" }}>{item.remark}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Eye size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && !loading && (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No ledger transactions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WFHBalanceSheet;
