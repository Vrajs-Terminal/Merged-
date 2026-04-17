import React, { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  Loader2,
  TrendingUp,
  RefreshCw,
  Building2,
  Layers,
  Calendar,
} from "lucide-react";
import { ledgerAPI, branchAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./BalanceSheet.css";

type LedgerCategory = "Income" | "Expense" | "Asset" | "Liability";

interface BranchItem {
  id: string | number;
  branchName?: string;
  name?: string;
}

interface LedgerEntry {
  id: number;
  date: string;
  type: string;
  category: LedgerCategory;
  amount: string | number;
  remark?: string;
  paymentMode?: string;
  branch?: {
    id?: string | number;
    branchName?: string;
    name?: string;
  };
}

const CATEGORY_OPTIONS: Array<"All Primary Categories" | LedgerCategory> = [
  "All Primary Categories",
  "Income",
  "Expense",
  "Asset",
  "Liability",
];

const normalizeLedgerData = (payload: any): LedgerEntry[] => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeBranches = (payload: any): BranchItem[] => {
  if (Array.isArray(payload?.data?.branches)) return payload.data.branches;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const BalanceSheetReport: React.FC = () => {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    branchId: "",
    accountType: "All Identified Accounts",
    category: "All Primary Categories",
    startDate: "",
  });

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(normalizeBranches(response));
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Unable to load branch list");
    }
  };

  const fetchTransactions = async (showToast = false) => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.category !== "All Primary Categories") params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;

      const response = await ledgerAPI.getTransactions(params);
      const list = normalizeLedgerData(response);
      setTransactions(list);
      if (showToast) toast.success(`Report processed with ${list.length} records`);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to process report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchTransactions();
  }, []);

  const accountTypeOptions = useMemo(
    () => [
      "All Identified Accounts",
      ...Array.from(new Set(transactions.map((item) => item.type).filter(Boolean))),
    ],
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const dateMatch = !filters.startDate || (item.date ? item.date.slice(0, 10) === filters.startDate : false);
      const categoryMatch =
        filters.category === "All Primary Categories" || item.category === filters.category;
      const typeMatch =
        filters.accountType === "All Identified Accounts" || item.type === filters.accountType;
      return dateMatch && categoryMatch && typeMatch;
    });
  }, [transactions, filters.category, filters.startDate, filters.accountType]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, item) => {
        const amount = Number(item.amount || 0);
        if (item.category === "Income") acc.income += amount;
        if (item.category === "Expense") acc.expense += amount;
        if (item.category === "Asset") acc.assets += amount;
        if (item.category === "Liability") acc.liabilities += amount;
        return acc;
      },
      { income: 0, expense: 0, assets: 0, liabilities: 0 },
    );
  }, [filteredTransactions]);

  const formatCurrency = (amt: number) => {
    if (amt >= 10000000) return `₹ ${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹ ${(amt / 100000).toFixed(2)} L`;
    return `₹ ${amt.toLocaleString()}`;
  };

  const handleReset = () => {
    setFilters({
      branchId: "",
      accountType: "All Identified Accounts",
      category: "All Primary Categories",
      startDate: "",
    });
    toast.info("Report filters reset");
  };

  const exportAsCsv = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No records available to export");
      return;
    }

    const rows = [
      ["Date", "Type", "Category", "Branch", "Amount", "Payment", "Remark"],
      ...filteredTransactions.map((item) => [
        item.date ? new Date(item.date).toLocaleDateString() : "-",
        item.type || "-",
        item.category || "-",
        item.branch?.branchName || item.branch?.name || "Consolidated",
        Number(item.amount || 0).toFixed(2),
        item.paymentMode || "N/A",
        item.remark || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `balance_sheet_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Financial Excel exported");
  };

  const exportAsPdf = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No records available to export");
      return;
    }

    const reportRows = filteredTransactions
      .slice(0, 200)
      .map(
        (item) => `
          <tr>
            <td>${item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
            <td>${item.type || "-"}</td>
            <td>${item.category || "-"}</td>
            <td>${item.branch?.branchName || item.branch?.name || "Consolidated"}</td>
            <td style="text-align:right;">${Number(item.amount || 0).toLocaleString("en-IN")}</td>
          </tr>
        `,
      )
      .join("");

    const win = window.open("", "_blank", "width=1024,height=760");
    if (!win) {
      toast.error("Popup blocked. Please allow popups to generate PDF.");
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Balance Sheet Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 24px; }
            p { margin: 0 0 16px; color: #475569; }
            .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
            .meta div { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Balance Sheet Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <div class="meta">
            <div><strong>Total Income</strong><br/>${formatCurrency(totals.income)}</div>
            <div><strong>Total Expense</strong><br/>${formatCurrency(totals.expense)}</div>
            <div><strong>Net Balance</strong><br/>${formatCurrency(totals.income - totals.expense)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Branch</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>${reportRows}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    toast.success("Balance Sheet PDF ready for print");
  };

  const branchOptions = branches
    .map((branch) => ({ id: String(branch.id ?? ""), name: branch.branchName || branch.name || "" }))
    .filter((branch) => branch.id && branch.name);

  return (
    <div className="main-content animate-fade-in bs-report-page">
      <div className="page-header bs-report-header">
        <div>
          <PageTitle
            title="Balance Sheet Report"
            subtitle="Deep financial analysis and consolidated balance sheets for strategic auditing"
            icon={<TrendingUp size={22} />}
          />
        </div>
        <div className="bs-report-header-actions">
          <button className="btn btn-secondary shadow-sm" onClick={exportAsCsv}>
            <FileSpreadsheet size={18} color="#16a34a" /> Financial Excel
          </button>
          <button className="btn btn-secondary shadow-sm" onClick={exportAsPdf}>
            <FileText size={18} color="#dc2626" /> Balance Sheet PDF
          </button>
        </div>
      </div>

      <div className="glass-card bs-report-filter-card">
        <div className="bs-report-filter-grid">
          <div>
            <label className="input-label">Select Branch</label>
            <select
              className="select-modern"
              value={filters.branchId}
              onChange={(e) => setFilters((prev) => ({ ...prev, branchId: e.target.value }))}
            >
              <option value="">Consolidated (All)</option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Select Account Type</label>
            <select
              className="select-modern"
              value={filters.accountType}
              onChange={(e) => setFilters((prev) => ({ ...prev, accountType: e.target.value }))}
            >
              {accountTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Category</label>
            <select
              className="select-modern"
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Audit Period</label>
            <input
              type="date"
              className="input-modern"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div className="bs-report-filter-actions">
            <button
              className="btn btn-primary shadow-glow"
              onClick={() => fetchTransactions(true)}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <PieChart size={18} />} Process Report
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bs-report-kpi-grid">
        <div className="glass-card bs-report-kpi-card is-income">
          <div className="bs-report-kpi-icon is-income">
            <ArrowUpCircle size={24} color="#10b981" />
          </div>
          <div>
            <p>Total Consolidated Income</p>
            <h3>{formatCurrency(totals.income)}</h3>
          </div>
        </div>

        <div className="glass-card bs-report-kpi-card is-expense">
          <div className="bs-report-kpi-icon is-expense">
            <ArrowDownCircle size={24} color="#dc2626" />
          </div>
          <div>
            <p>Total Group Expenses</p>
            <h3>{formatCurrency(totals.expense)}</h3>
          </div>
        </div>

        <div className="glass-card bs-report-kpi-card is-balance">
          <div className="bs-report-kpi-icon is-balance">
            <Wallet size={24} color="var(--primary)" />
          </div>
          <div>
            <p>Net Financial Balance</p>
            <h3>{formatCurrency(totals.income - totals.expense)}</h3>
          </div>
        </div>

        <div className="glass-card bs-report-kpi-card is-assets">
          <div className="bs-report-kpi-icon is-assets">
            <Layers size={24} color="#0f766e" />
          </div>
          <div>
            <p>Assets + Liabilities Snapshot</p>
            <h3>{formatCurrency(totals.assets + totals.liabilities)}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card bs-report-table-card">
        <div className="bs-report-table-head">
          <h3>Account-wise Performance Breakdown</h3>
          <div className="bs-report-live-tags">
            <span className="badge badge-primary">Live Financial Status</span>
            <span className="badge badge-gray">
              <Building2 size={12} /> {filters.branchId ? "Branch Filtered" : "Consolidated"}
            </span>
            <span className="badge badge-gray">
              <Calendar size={12} /> {filters.startDate || "All Dates"}
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div className="bs-report-loader">
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
              <p>Processing report data...</p>
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
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td><span style={{ fontWeight: "700" }}>{item.type}</span></td>
                      <td>{item.branch?.branchName || item.branch?.name || "Consolidated"}</td>
                      <td style={{ fontWeight: "800", color: item.category === "Income" ? "#166534" : "var(--color-text-primary)" }}>
                        ₹ {Number(item.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`badge ${
                          item.category === "Income" ? "badge-success" :
                          item.category === "Expense" ? "badge-danger" :
                          item.category === "Asset" ? "badge-primary" : "badge-warning"
                        }`}>
                          {item.category}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
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

