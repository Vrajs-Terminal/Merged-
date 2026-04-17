import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Eye,
  Laptop,
  Wifi,
  Zap,
  TrendingUp,
  ShoppingCart,
  Loader2,
  X,
  Save,
  Calendar,
  CreditCard,
} from "lucide-react";
import { ledgerAPI, branchAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./BalanceSheet.css";

interface BranchItem {
  id: string | number;
  branchName?: string;
  name?: string;
}

interface LedgerEntry {
  id: number;
  date: string;
  type: string;
  category: string;
  amount: number | string;
  paymentMode?: string;
  remark?: string;
  branch?: {
    id?: string | number;
    name?: string;
    branchName?: string;
  };
}

interface WfhFormData {
  branchId: string;
  date: string;
  type: string;
  amount: string;
  paymentMode: string;
  remark: string;
}

const getInitialWfhForm = (): WfhFormData => ({
  branchId: "",
  date: new Date().toISOString().slice(0, 10),
  type: "Internet Reimbursement",
  amount: "",
  paymentMode: "Bank Transfer",
  remark: "",
});

const isWfhEntry = (entry: LedgerEntry) => {
  const text = `${entry.type || ""} ${entry.remark || ""} ${entry.category || ""}`.toLowerCase();
  return (
    text.includes("wfh") ||
    text.includes("remote") ||
    text.includes("internet") ||
    text.includes("broadband") ||
    text.includes("electric") ||
    text.includes("equipment") ||
    text.includes("laptop") ||
    text.includes("device")
  );
};

const WFHBalanceSheet: React.FC<{ setActivePage?: (p: string) => void }> = ({ setActivePage }) => {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LedgerEntry | null>(null);
  const [formData, setFormData] = useState<WfhFormData>(getInitialWfhForm());
  const [filters, setFilters] = useState({
    branchId: "",
    date: "",
    category: "All Ledger Entries",
    search: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, branchRes] = await Promise.all([
        ledgerAPI.getTransactions({}).catch(() => ({ data: [] })),
        branchAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const ledgerList = Array.isArray(ledgerRes?.data)
        ? ledgerRes.data
        : Array.isArray(ledgerRes?.data?.data)
          ? ledgerRes.data.data
          : [];

      const branchList = Array.isArray(branchRes?.data)
        ? branchRes.data
        : Array.isArray(branchRes?.data?.data)
          ? branchRes.data.data
          : [];

      setTransactions(ledgerList);
      setBranches(branchList);
    } catch {
      toast.error("Failed to load live ledger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const remoteEntries = useMemo(() => transactions.filter(isWfhEntry), [transactions]);

  const categoryOptions = useMemo(
    () => ["All Ledger Entries", ...Array.from(new Set(remoteEntries.map((item) => item.category).filter(Boolean)))],
    [remoteEntries],
  );

  const filteredTransactions = useMemo(() => {
    return remoteEntries.filter((item) => {
      const branchId = item.branch?.id ? String(item.branch.id) : "";
      const branchName = item.branch?.name || item.branch?.branchName || "General Ledger";
      const text = `${item.type || ""} ${item.remark || ""} ${branchName || ""}`.toLowerCase();

      const branchMatch = !filters.branchId || branchId === filters.branchId;
      const dateMatch = !filters.date || (item.date ? item.date.slice(0, 10) === filters.date : false);
      const categoryMatch = filters.category === "All Ledger Entries" || item.category === filters.category;
      const searchMatch = !filters.search || text.includes(filters.search.toLowerCase());

      return branchMatch && dateMatch && categoryMatch && searchMatch;
    });
  }, [remoteEntries, filters]);

  const totalSpend = useMemo(
    () => filteredTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [filteredTransactions],
  );

  const internetSpend = useMemo(
    () =>
      filteredTransactions.reduce((sum, item) => {
        const text = `${item.type || ""} ${item.remark || ""}`.toLowerCase();
        return text.includes("internet") || text.includes("broadband") ? sum + Number(item.amount || 0) : sum;
      }, 0),
    [filteredTransactions],
  );

  const equipmentSpend = useMemo(
    () =>
      filteredTransactions.reduce((sum, item) => {
        const text = `${item.type || ""} ${item.remark || ""}`.toLowerCase();
        return text.includes("equipment") || text.includes("laptop") || text.includes("device")
          ? sum + Number(item.amount || 0)
          : sum;
      }, 0),
    [filteredTransactions],
  );

  const energySpend = useMemo(() => totalSpend - internetSpend - equipmentSpend, [totalSpend, internetSpend, equipmentSpend]);

  const branchOptions = branches
    .map((branch) => ({ id: String(branch.id ?? ""), name: branch.branchName || branch.name || "" }))
    .filter((branch) => branch.id && branch.name);

  const handleCreateSpend = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (!formData.type.trim()) {
      toast.error("Expense type is required");
      return;
    }

    try {
      setSubmitting(true);
      await ledgerAPI.createTransaction({
        branchId: formData.branchId || undefined,
        date: formData.date,
        amount: Number(formData.amount),
        type: formData.type,
        category: "Expense",
        paymentMode: formData.paymentMode,
        remark: formData.remark || "WFH expense",
      });

      toast.success("WFH spend recorded successfully");
      setShowModal(false);
      setFormData(getInitialWfhForm());
      fetchData();
    } catch (error) {
      console.error("Failed to create WFH spend", error);
      toast.error("Unable to record WFH spend");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this WFH ledger entry?");
    if (!confirmed) return;

    try {
      await ledgerAPI.deleteTransaction(id);
      toast.success("Entry deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const handleUseAsTemplate = (item: LedgerEntry) => {
    localStorage.setItem(
      "bsAddDraft",
      JSON.stringify({
        category: "Expense",
        branchId: item.branch?.id ? String(item.branch.id) : "",
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        amount: String(item.amount || ""),
        type: item.type || "",
        paymentMode: item.paymentMode || "Bank Transfer",
        remark: item.remark || "WFH expense",
      }),
    );

    toast.success("Entry copied to Add Balance Entry");
    if (setActivePage) setActivePage("balanceSheetAdd");
  };

  const handleFilterList = () => {
    toast.info(`${filteredTransactions.length} WFH entries matched your filters`);
  };

  const handleExportWfh = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No WFH entries to export");
      return;
    }

    const rows = [
      ["Branch", "Billing Date", "WFH Expense Type", "Financial Amount", "System Remark"],
      ...filteredTransactions.map((item) => [
        item.branch?.name || item.branch?.branchName || "General Ledger",
        item.date ? new Date(item.date).toLocaleDateString() : "-",
        item.type || "Ledger Entry",
        Number(item.amount || 0).toFixed(2),
        item.remark || "",
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wfh_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("WFH ledger exported");
  };

  const resetFilters = () => {
    setFilters({
      branchId: "",
      date: "",
      category: "All Ledger Entries",
      search: "",
    });
    toast.info("WFH filters reset");
  };

  return (
    <div className="main-content animate-fade-in bs-wfh-page">
      <div className="page-header bs-wfh-header">
        <div>
          <PageTitle
            title="WFH Balance Sheet"
            subtitle="Track, approve and manage Work From Home related expenses and reimbursements"
            icon={<TrendingUp size={22} />}
          />
        </div>
        <div className="bs-wfh-header-actions">
           <button className="btn btn-primary shadow-glow" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Record WFH Spend
          </button>
        </div>
      </div>

      <div className="glass-card bs-wfh-filter-card">
        <div className="bs-wfh-filter-grid">
           <div>
            <label className="input-label">Select Employee</label>
            <select className="select-modern" value={filters.branchId} onChange={(event) => setFilters((prev) => ({ ...prev, branchId: event.target.value }))}>
               <option value="">All Branches</option>
               {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
               ))}
            </select>
          </div>
          <div>
            <label className="input-label">Timeline Filter</label>
            <input type="date" className="input-modern" value={filters.date} onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))} />
          </div>
          <div>
            <label className="input-label">Expense Category</label>
            <select className="select-modern" value={filters.category} onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}>
               {categoryOptions.map((category) => (
                <option key={category}>{category}</option>
               ))}
            </select>
          </div>
          <div className="bs-wfh-filter-actions">
            <button className="btn btn-primary shadow-glow" style={{ width: "100%" }} onClick={handleFilterList}>
              <Filter size={18} /> Filter List
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={resetFilters}>
              <X size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bs-wfh-stat-grid">
          <div className="glass-card bs-wfh-stat-card">
             <div className="bs-wfh-stat-icon is-primary">
                <Wifi size={24} color="var(--primary)" />
             </div>
             <div>
                <p>Total Broadband Spends</p>
                <h3 style={{ fontSize: "20px" }}>₹ {internetSpend.toLocaleString()}</h3>
             </div>
          </div>
          <div className="glass-card bs-wfh-stat-card">
             <div className="bs-wfh-stat-icon is-success">
                <Zap size={24} color="#16a34a" />
             </div>
             <div>
                <p>Energy Allowances</p>
               <h3 style={{ fontSize: "20px" }}>₹ {energySpend.toLocaleString()}</h3>
             </div>
          </div>
           <div className="glass-card bs-wfh-stat-card">
             <div className="bs-wfh-stat-icon is-info">
                <Laptop size={24} color="#0ea5e9" />
             </div>
             <div>
                <p>Remote IT Asset Spends</p>
               <h3 style={{ fontSize: "20px" }}>₹ {equipmentSpend.toLocaleString()}</h3>
             </div>
           </div>
            <div className="glass-card bs-wfh-stat-card">
             <div className="bs-wfh-stat-icon is-warning">
               <ShoppingCart size={24} color="#ea580c" />
             </div>
             <div>
               <p>WFH Ledger Items</p>
               <h3 style={{ fontSize: "20px" }}>{filteredTransactions.length}</h3>
             </div>
          </div>
       </div>

      <div className="glass-card bs-wfh-table-card">
         <div className="bs-wfh-toolbar">
            <div className="bs-wfh-search-wrap">
               <Search size={18} className="bs-wfh-search-icon" />
               <input
                type="text"
                className="input-modern"
                placeholder="Search by name, remark or type..."
                style={{ paddingLeft: "40px", paddingRight: "36px" }}
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
               />
               {filters.search && (
                <button className="bs-wfh-search-clear" onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}>
                  <X size={14} />
                </button>
               )}
            </div>
             <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="btn btn-secondary shadow-sm" style={{ padding: "8px" }} onClick={handleExportWfh}>
                  <ShoppingCart size={16} />
                </button>
             </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div className="bs-wfh-loader">
              <Loader2 size={32} className="animate-spin" color="var(--primary)" />
              <p>Loading WFH ledger...</p>
            </div>
          ) : (
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
              {filteredTransactions.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>
                        {(item.branch?.name || item.branch?.branchName || "GL").split(" ").map((n: string) => n[0]).join("")}
                       </div>
                       <span style={{ fontWeight: "700" }}>{item.branch?.name || item.branch?.branchName || "General Ledger"}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       {String(item.type || "").toLowerCase().includes("internet") ? <Wifi size={14} color="var(--primary)" /> : String(item.type || "").toLowerCase().includes("elect") ? <Zap size={14} color="#eab308" /> : <Laptop size={14} color="#0ea5e9" />}
                       <span style={{ fontWeight: "600", fontSize: "13px" }}>{item.type || "Ledger Entry"}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: "800", color: "#166534" }}>₹ {Number(item.amount || 0).toLocaleString()}</td>
                  <td style={{ fontSize: "13px", maxWidth: "250px" }}>{item.remark || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setSelectedItem(item)}><Eye size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => handleUseAsTemplate(item)}><Edit2 size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }} onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}

          {filteredTransactions.length === 0 && !loading && (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No ledger transactions found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="bs-type-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bs-type-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="bs-type-modal-head">
              <h3>Record WFH Spend</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="bs-type-modal-grid">
              <div>
                <label className="input-label">Branch</label>
                <select
                  className="select-modern"
                  value={formData.branchId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, branchId: event.target.value }))}
                >
                  <option value="">All Branches</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Billing Date*</label>
                <input
                  type="date"
                  className="input-modern"
                  value={formData.date}
                  onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>

              <div>
                <label className="input-label">WFH Expense Type*</label>
                <select
                  className="select-modern"
                  value={formData.type}
                  onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option>Internet Reimbursement</option>
                  <option>Electricity Allowance</option>
                  <option>Laptop/Device Purchase</option>
                  <option>Ergonomic Setup Expense</option>
                  <option>Other WFH Expense</option>
                </select>
              </div>

              <div>
                <label className="input-label">Financial Amount*</label>
                <input
                  type="number"
                  className="input-modern"
                  value={formData.amount}
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                  onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>

              <div>
                <label className="input-label">Payment Path*</label>
                <select
                  className="select-modern"
                  value={formData.paymentMode}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paymentMode: event.target.value }))}
                >
                  <option>Bank Transfer</option>
                  <option>UPI / Card</option>
                  <option>Cash on Hand</option>
                </select>
              </div>

              <div className="bs-type-modal-full">
                <label className="input-label">System Remark</label>
                <textarea
                  className="input-modern"
                  rows={3}
                  placeholder="Add a short description for audit"
                  value={formData.remark}
                  onChange={(event) => setFormData((prev) => ({ ...prev, remark: event.target.value }))}
                />
              </div>
            </div>

            <div className="bs-type-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateSpend} disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Spend
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="bs-type-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="bs-type-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="bs-type-modal-head">
              <h3>WFH Entry Details</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setSelectedItem(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="bs-summary-row"><span>Branch</span><strong>{selectedItem.branch?.name || selectedItem.branch?.branchName || "General Ledger"}</strong></div>
            <div className="bs-summary-row"><span>Billing Date</span><strong>{selectedItem.date ? new Date(selectedItem.date).toLocaleDateString() : "-"}</strong></div>
            <div className="bs-summary-row"><span>WFH Expense Type</span><strong>{selectedItem.type || "-"}</strong></div>
            <div className="bs-summary-row"><span>Financial Amount</span><strong>₹ {Number(selectedItem.amount || 0).toLocaleString()}</strong></div>
            <div className="bs-summary-row"><span>Payment Path</span><strong>{selectedItem.paymentMode || "N/A"}</strong></div>
            <div className="bs-summary-row"><span>Remark</span><strong>{selectedItem.remark || "-"}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WFHBalanceSheet;
