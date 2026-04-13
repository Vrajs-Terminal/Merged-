import React, { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Wallet, ArrowUpCircle, ArrowDownCircle, PieChart, Loader2, TrendingUp } from "lucide-react";
import { ledgerAPI, branchAPI } from "../../services/apiService";

const BalanceSheetReport: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    branchId: "",
    category: "All Primary Categories",
    startDate: "",
  });

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data.branches || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.category !== "All Primary Categories") params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;

      const response = await ledgerAPI.getTransactions(params);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchTransactions();
  }, []);

  const calculateTotals = () => {
    const totals = {
      income: 0,
      expense: 0,
      assets: 0,
      liabilities: 0,
    };

    transactions.forEach(t => {
      const amt = parseFloat(t.amount);
      if (t.category === "Income") totals.income += amt;
      else if (t.category === "Expense") totals.expense += amt;
      else if (t.category === "Asset") totals.assets += amt;
      else if (t.category === "Liability") totals.liabilities += amt;
    });

    return totals;
  };

  const totals = calculateTotals();
  const formatCurrency = (amt: number) => {
    if (amt >= 10000000) return `₹ ${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹ ${(amt / 100000).toFixed(2)} L`;
    return `₹ ${amt.toLocaleString()}`;
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><TrendingUp size={22} /> Balance Sheet Report</h1>
          <p className="page-subtitle">Deep financial analysis and consolidated balance sheets for strategic auditing</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary shadow-sm">
            <FileSpreadsheet size={18} color="#16a34a" /> Financial Excel
          </button>
          <button className="btn btn-secondary shadow-sm">
            <FileText size={18} color="#dc2626" /> Balance Sheet PDF
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
          <div>
            <label className="input-label">Select Branch</label>
            <select 
              className="select-modern"
              value={filters.branchId}
              onChange={(e) => setFilters({...filters, branchId: e.target.value})}
            >
               <option value="">Consolidated (All)</option>
               {branches.map(b => (
                 <option key={b.id} value={b.id}>{b.branchName}</option>
               ))}
            </select>
          </div>
           <div>
            <label className="input-label">Select Account Type</label>
            <select className="select-modern">
               <option>All Identified Accounts</option>
               <option>Revenue Sources</option>
               <option>Operational Expense</option>
            </select>
          </div>
          <div>
            <label className="input-label">Category</label>
            <select 
              className="select-modern"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
               <option>All Primary Categories</option>
               <option>Income</option>
               <option>Expense</option>
               <option>Asset</option>
               <option>Liability</option>
            </select>
          </div>
          <div>
            <label className="input-label">Audit Period</label>
            <input 
              type="date" 
              className="input-modern" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button 
              className="btn btn-primary shadow-glow" 
              style={{ width: "100%" }}
              onClick={fetchTransactions}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <PieChart size={18} />} Process Report
            </button>
          </div>
        </div>
      </div>

       {/* Consolidated Financial Summary */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
             <div style={{ background: "#ecfdf5", padding: "14px", borderRadius: "14px" }}>
                <ArrowUpCircle size={28} color="#10b981" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "700" }}>Total Consolidated Income</p>
                <h3 style={{ fontSize: "24px", color: "#065f46" }}>{formatCurrency(totals.income)}</h3>
             </div>
          </div>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px", background: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.1)" }}>
             <div style={{ background: "#fef2f2", padding: "14px", borderRadius: "14px" }}>
                <ArrowDownCircle size={28} color="#dc2626" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "700" }}>Total Group Expenses</p>
                <h3 style={{ fontSize: "24px", color: "#991b1b" }}>{formatCurrency(totals.expense)}</h3>
             </div>
          </div>
           <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px", background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.1)" }}>
             <div style={{ background: "#eef2ff", padding: "14px", borderRadius: "14px" }}>
                <Wallet size={28} color="var(--primary)" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "700" }}>Net Financial Balance</p>
                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>{formatCurrency(totals.income - totals.expense)}</h3>
             </div>
          </div>
       </div>

      <div className="glass-card">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>Account-wise Performance Breakdown</h3>
            <span className="badge badge-primary" style={{ padding: "6px 14px", fontSize: "10px" }}>Live Financial Status</span>
         </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sub-Account Type</th>
                  <th>Branch</th>
                  <th>Consolidated Amount</th>
                  <th>Primary Category Tag</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td><span style={{ fontWeight: "700" }}>{item.type}</span></td>
                      <td>{item.branch?.branchName || "N/A"}</td>
                      <td style={{ fontWeight: "800", color: item.category === 'Income' ? '#166534' : 'var(--text-main)' }}>₹ {parseFloat(item.amount).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          item.category === "Income" ? "badge-success" : 
                          item.category === "Expense" ? "badge-danger" : 
                          item.category === "Asset" ? "badge-primary" : "badge-warning"
                        }`} style={{ fontSize: "10px", fontWeight: "800" }}>
                          {item.category}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No financial records found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetReport;

