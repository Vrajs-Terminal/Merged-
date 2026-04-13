import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Search, Filter, Eye, FileSpreadsheet, Building2, CreditCard, Loader2, TrendingUp } from "lucide-react";
import { ledgerAPI, branchAPI } from "../../services/apiService";
import PageTitle from "../../components/PageTitle";

const ManageBalanceSheet: React.FC<{ setActivePage?: (p: string) => void }> = ({ setActivePage }) => {
  const [data, setData] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    branchId: "",
    category: "All Accounts",
    startDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ledgerAPI.getTransactions({
        ...filters,
        search: searchTerm,
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch ledger data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data.branches || response.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await ledgerAPI.deleteTransaction(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete transaction");
      }
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <PageTitle title="Manage Balance Sheet" subtitle="Central ledger for tracking all organizational financial events and balances" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-secondary shadow-sm">
            <FileSpreadsheet size={18} color="#16a34a" /> Download Ledger
          </button>
           <button 
             onClick={() => setActivePage && setActivePage('balanceSheetAdd')}
             className="btn btn-primary shadow-glow text-[11px] font-black uppercase tracking-widest"
           >
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
          <div>
            <label className="input-label">Branch Select</label>
            <select name="branchId" className="select-modern" value={filters.branchId} onChange={handleFilterChange}>
               <option value="">All Locations</option>
               {branches.map(b => (
                 <option key={b.id} value={b.id}>{b.branchName}</option>
               ))}
            </select>
          </div>
          <div>
            <label className="input-label">Category</label>
            <select name="category" className="select-modern" value={filters.category} onChange={handleFilterChange}>
               <option>All Accounts</option>
               <option>Income</option>
               <option>Expense</option>
               <option>Asset</option>
               <option>Liability</option>
            </select>
          </div>
          <div>
            <label className="input-label">Type Mapping</label>
            <select className="select-modern">
               <option>All Identified Types</option>
            </select>
          </div>
          <div>
            <label className="input-label">Timeline Range</label>
            <input type="date" name="startDate" className="input-modern" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-primary shadow-glow" style={{ width: "100%" }} onClick={fetchData}>
              <Filter size={18} /> Apply Filter
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: "400px" }}>
               <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
               <input 
                 type="text" 
                 className="input-modern" 
                 placeholder="Search by remark..." 
                 style={{ paddingLeft: "40px" }}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && fetchData()}
               />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
               <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>{data.length} Transactions Listed</span>
            </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
              <p>Loading ledger data...</p>
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Transaction Date</th>
                  <th>Account Type</th>
                  <th>Center Branch</th>
                  <th>Financial Amount</th>
                  <th>Payment Path</th>
                  <th>Audit Remark</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td><input type="checkbox" /></td>
                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                         <span style={{ fontWeight: "700", color: "var(--primary)" }}>{item.type}</span>
                         <span style={{ fontSize: "10px", fontWeight: "800", color: item.category === 'Income' ? '#10b981' : '#dc2626' }}>{item.category.toUpperCase()}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                         <Building2 size={13} />
                         {item.branch?.branchName || "All"}
                      </div>
                    </td>
                    <td style={{ fontWeight: "800", color: item.category === 'Income' ? '#166534' : 'var(--text-main)' }}>â‚¹ {parseFloat(item.amount).toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
                         <CreditCard size={13} />
                         {item.paymentMode}
                      </div>
                    </td>
                    <td style={{ fontSize: "13px", maxWidth: "200px" }}>{item.remark}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                         <button className="btn btn-secondary" style={{ padding: "6px" }}><Eye size={14} /></button>
                         <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                         <button className="btn btn-danger" style={{ padding: "6px" }} onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No transactions found for the selected filters.</td>
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

export default ManageBalanceSheet;


