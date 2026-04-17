import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Building2,
  CreditCard,
  Loader2,
  TrendingUp,
  Calendar,
  RefreshCw,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ledgerAPI, branchAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./BalanceSheet.css";

interface BranchItem {
  id: string | number;
  branchName: string;
}

interface LedgerEntry {
  id: number;
  date: string;
  type: string;
  category: "Income" | "Expense" | "Asset" | "Liability";
  branch?: {
    id?: string | number;
    branchName?: string;
    name?: string;
  };
  amount: number | string;
  paymentMode?: string;
  remark?: string;
}

const ManageBalanceSheet: React.FC<{ setActivePage?: (p: string) => void }> = ({ setActivePage }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<LedgerEntry[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<LedgerEntry | null>(null);
  const [filters, setFilters] = useState({
    branchId: "",
    category: "All Accounts",
    type: "All Identified Types",
    startDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ledgerAPI.getTransactions({
        branchId: filters.branchId || undefined,
        category: filters.category !== "All Accounts" ? filters.category : undefined,
        startDate: filters.startDate || undefined,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

      setData(list);
      setSelectedRows([]);
    } catch (err) {
      console.error("Failed to fetch ledger data", err);
      toast.error("Failed to fetch ledger records");
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
      toast.error("Unable to load branches");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await ledgerAPI.deleteTransaction(id);
        toast.success("Transaction deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete transaction");
      }
    }
  };

  const accountTypes = useMemo(() => {
    const fromData = data.map((item) => item.type).filter(Boolean);
    return ["All Identified Types", ...Array.from(new Set(fromData))];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const branchName = item.branch?.branchName || item.branch?.name || "All";

      const branchMatch =
        !filters.branchId ||
        String(item.branch?.id || "") === String(filters.branchId) ||
        (filters.branchId === "all" && !item.branch?.id);

      const categoryMatch = filters.category === "All Accounts" || item.category === filters.category;
      const typeMatch = filters.type === "All Identified Types" || item.type === filters.type;

      const searchMatch =
        !searchTerm.trim() ||
        (item.remark || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        branchName.toLowerCase().includes(searchTerm.toLowerCase());

      return branchMatch && categoryMatch && typeMatch && searchMatch;
    });
  }, [data, filters, searchTerm]);

  const totalAmount = useMemo(
    () =>
      filteredData.reduce((acc, item) => {
        const amount = Number(item.amount || 0);
        return acc + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [filteredData],
  );

  const handleToggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((entryId) => entryId !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    const ids = filteredData.map((item) => item.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedRows.includes(id));
    setSelectedRows(allSelected ? [] : ids);
  };

  const handleDownloadLedger = () => {
    if (filteredData.length === 0) {
      toast.info("No ledger entries available to download");
      return;
    }

    const csvRows = [
      [
        "Transaction Date",
        "Account Type",
        "Category",
        "Center Branch",
        "Financial Amount",
        "Payment Path",
        "Audit Remark",
      ],
      ...filteredData.map((item) => [
        new Date(item.date).toLocaleDateString(),
        item.type,
        item.category,
        item.branch?.branchName || item.branch?.name || "All",
        Number(item.amount || 0).toFixed(2),
        item.paymentMode || "N/A",
        item.remark || "",
      ]),
    ];

    const csv = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Ledger CSV downloaded");
  };

  const handleResetFilters = () => {
    setFilters({
      branchId: "",
      category: "All Accounts",
      type: "All Identified Types",
      startDate: "",
    });
    setSearchTerm("");
    setSelectedRows([]);
    toast.info("Filters reset");
  };

  const handleUseAsTemplate = (item: LedgerEntry) => {
    localStorage.setItem(
      "bsAddDraft",
      JSON.stringify({
        category: item.category,
        branchId: item.branch?.id ? String(item.branch.id) : "",
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        amount: String(item.amount || ""),
        type: item.type || "",
        paymentMode: item.paymentMode || "Cash on Hand",
        remark: item.remark || "",
      }),
    );

    toast.success("Entry copied to New Entry form");
    if (setActivePage) {
      setActivePage("balanceSheetAdd");
      return;
    }
    navigate("/modules/balanceSheetAdd");
  };

  const handleNavigateToNewEntry = () => {
    if (setActivePage) {
      setActivePage("balanceSheetAdd");
      return;
    }
    navigate("/modules/balanceSheetAdd");
  };

  return (
    <div className="main-content animate-fade-in bs-manage-page">
      <div className="page-header bs-manage-header">
        <div>
          <PageTitle
            title="Manage Balance Sheet"
            subtitle="Central ledger for tracking all organizational financial events and balances"
            icon={<TrendingUp size={22} />}
          />
        </div>
        <div className="bs-manage-header-actions">
          <button className="btn btn-secondary shadow-sm" onClick={handleDownloadLedger}>
            <FileSpreadsheet size={18} color="#16a34a" /> Download Ledger
          </button>
           <button 
             onClick={handleNavigateToNewEntry}
             className="btn btn-primary shadow-glow text-[11px] font-black uppercase tracking-widest"
           >
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      <div className="glass-card bs-manage-filter-card">
        <div className="bs-manage-filter-grid">
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
            <select name="type" className="select-modern" value={filters.type} onChange={handleFilterChange}>
              {accountTypes.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {typeOption}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Timeline Range</label>
            <input type="date" name="startDate" className="input-modern" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="bs-manage-filter-actions">
            <button className="btn btn-primary shadow-glow" style={{ width: "100%" }} onClick={fetchData}>
              <Filter size={18} /> Apply Filter
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleResetFilters}>
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card bs-manage-table-card">
        <div className="bs-manage-toolbar">
            <div className="bs-manage-search-wrap">
               <Search size={18} className="bs-manage-search-icon" />
               <input 
                 type="text" 
                 className="input-modern" 
                 placeholder="Search by remark..." 
                 style={{ paddingLeft: "40px", paddingRight: "36px" }}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && fetchData()}
               />
               {searchTerm && (
                <button className="bs-manage-clear" onClick={() => setSearchTerm("")}>
                  <X size={14} />
                </button>
               )}
            </div>
            <div className="bs-manage-metrics">
               <span>{filteredData.length} Transactions Listed</span>
               <span>Total Amount: INR {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div className="bs-manage-loader">
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
              <p>Loading ledger data...</p>
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={filteredData.length > 0 && filteredData.every((item) => selectedRows.includes(item.id))}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
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
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleToggleRow(item.id)}
                      />
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: "700", color: "var(--primary)" }}>{item.type}</span>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: item.category === "Income" ? "#10b981" : "#dc2626" }}>
                          {(item.category || "N/A").toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-muted)" }}>
                         <Building2 size={13} />
                         {item.branch?.branchName || "All"}
                      </div>
                    </td>
                    <td style={{ fontWeight: "800", color: item.category === "Income" ? "#166534" : "var(--color-text-primary)" }}>
                      INR {Number(item.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--color-text-muted)" }}>
                         <CreditCard size={13} />
                         {item.paymentMode || "N/A"}
                      </div>
                    </td>
                    <td style={{ fontSize: "13px", maxWidth: "220px" }}>{item.remark || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setSelectedItem(item)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => handleUseAsTemplate(item)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: "6px" }} onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                      No transactions found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="bs-type-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="bs-type-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="bs-type-modal-head">
              <h3>Ledger Entry Details</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setSelectedItem(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="bs-summary-row"><span>Transaction Date</span><strong>{new Date(selectedItem.date).toLocaleDateString()}</strong></div>
            <div className="bs-summary-row"><span>Account Type</span><strong>{selectedItem.type}</strong></div>
            <div className="bs-summary-row"><span>Category</span><strong>{selectedItem.category}</strong></div>
            <div className="bs-summary-row"><span>Branch</span><strong>{selectedItem.branch?.branchName || "All"}</strong></div>
            <div className="bs-summary-row"><span>Amount</span><strong>INR {Number(selectedItem.amount || 0).toLocaleString("en-IN")}</strong></div>
            <div className="bs-summary-row"><span>Payment Path</span><strong>{selectedItem.paymentMode || "N/A"}</strong></div>
            <div className="bs-summary-row"><span>Remark</span><strong>{selectedItem.remark || "-"}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBalanceSheet;


