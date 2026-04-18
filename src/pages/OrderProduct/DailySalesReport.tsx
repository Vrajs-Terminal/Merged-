import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCcw,
  Search
} from "lucide-react";
import { dailySalesReportAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import {
  copyRowsToClipboard,
  downloadRowsAsCsv,
  exportRowsToExcel,
  exportRowsToPdf,
  formatCurrency,
  formatDate
} from "./orderProductReportHelpers";
import { buildSearchText, extractApiList } from "./orderProductWorkspaceHelpers";

interface DailySalesRecord {
  id: number;
  employeeName?: string;
  employeeId?: number;
  orders?: number;
  quantity?: number;
  salesAmount?: number;
  distributor?: string;
  city?: string;
  date?: string;
}

const ITEMS_PER_PAGE = 10;

export default function DailySalesReport() {
  const [records, setRecords] = useState<DailySalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: "",
    distributor: "",
    city: "",
    startDate: "",
    endDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dailySalesReportAPI.getAll(1, 1000);
      const { rows } = extractApiList<DailySalesRecord>(response.data);
      setRecords(rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load daily sales report." });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(
    () => records.filter((record) => {
      const recordDate = record.date ? new Date(record.date) : null;
      const matchesDate = (
        (!filters.startDate || (recordDate && !Number.isNaN(recordDate.getTime()) && recordDate >= new Date(filters.startDate))) &&
        (!filters.endDate || (recordDate && !Number.isNaN(recordDate.getTime()) && recordDate <= new Date(filters.endDate)))
      );

      return (
        (!filters.employee || (record.employeeName || "").toLowerCase().includes(filters.employee.toLowerCase())) &&
        (!filters.distributor || (record.distributor || "").toLowerCase().includes(filters.distributor.toLowerCase())) &&
        (!filters.city || (record.city || "").toLowerCase().includes(filters.city.toLowerCase())) &&
        matchesDate &&
        buildSearchText(
          record.employeeName,
          record.employeeId,
          record.distributor,
          record.city,
          record.date
        ).includes(searchTerm.toLowerCase())
      );
    }),
    [filters, records, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredRecords]
  );

  const totals = useMemo(() => ({
    orders: filteredRecords.reduce((sum, record) => sum + (record.orders || 0), 0),
    quantity: filteredRecords.reduce((sum, record) => sum + (record.quantity || 0), 0),
    sales: filteredRecords.reduce((sum, record) => sum + (record.salesAmount || 0), 0),
    employees: new Set(filteredRecords.map((record) => record.employeeId || record.employeeName).filter(Boolean)).size
  }), [filteredRecords]);

  const exportRows = useMemo(
    () => filteredRecords.map((record) => ({
      employee_name: record.employeeName || "—",
      employee_id: record.employeeId || "—",
      distributor: record.distributor || "—",
      city: record.city || "—",
      date: formatDate(record.date || ""),
      orders: record.orders || 0,
      quantity: record.quantity || 0,
      sales_amount: record.salesAmount || 0
    })),
    [filteredRecords]
  );

  const exportKeys = [
    "employee_name",
    "employee_id",
    "distributor",
    "city",
    "date",
    "orders",
    "quantity",
    "sales_amount"
  ];

  const visibleStart = filteredRecords.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length);

  const handleCopy = async () => {
    const copied = await copyRowsToClipboard(exportRows, exportKeys);
    setMsg({
      type: copied ? "success" : "error",
      text: copied ? "Daily sales report copied to clipboard." : "No daily sales data available to copy."
    });
  };

  const handleCsvExport = () => {
    const exported = downloadRowsAsCsv(exportRows, "daily_sales_report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Daily sales report exported as CSV." : "No daily sales data available to export."
    });
  };

  const handleExcelExport = () => {
    const exported = exportRowsToExcel(exportRows, "daily_sales_report", "Daily Sales");
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Daily sales report exported to Excel." : "No daily sales data available to export."
    });
  };

  const handlePdfExport = () => {
    const exported = exportRowsToPdf(exportRows, "daily_sales_report", "Daily Sales Report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Daily sales report exported to PDF." : "No daily sales data available to export."
    });
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><BarChart3 size={14} /> Daily performance</span>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Daily Sales Report</h2>
          <p className="lm-page-subtitle">
            Review employee-wise sales activity with clearer totals, useful filters, and export actions that mirror the on-screen report.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Employee-wise totals</span>
            <span className="opw-hero-pill">Useful filters only</span>
            <span className="opw-hero-pill">Export-ready report</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Orders</span>
            <strong>{totals.orders}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Quantity</span>
            <strong>{totals.quantity}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Sales</span>
            <strong>{formatCurrency(totals.sales)}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Employees</span>
            <strong>{totals.employees}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert opw-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{msg.text}</span>
          <button type="button" className="opw-alert-close" onClick={() => setMsg(null)} aria-label="Close message">
            ×
          </button>
        </div>
      )}

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Filter size={18} />
            <div>
              <h3>Filter Report</h3>
              <p>Use employee, distributor, city, and date filters to narrow the report to a genuinely useful operational view.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredRecords.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field">
            <label className="lm-label">Employee</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Employee name"
              value={filters.employee}
              onChange={(event) => {
                setFilters((current) => ({ ...current, employee: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Distributor name"
              value={filters.distributor}
              onChange={(event) => {
                setFilters((current) => ({ ...current, distributor: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">City</label>
            <input
              type="text"
              className="lm-input"
              placeholder="City"
              value={filters.city}
              onChange={(event) => {
                setFilters((current) => ({ ...current, city: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Start Date</label>
            <input
              type="date"
              className="lm-input"
              value={filters.startDate}
              onChange={(event) => {
                setFilters((current) => ({ ...current, startDate: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">End Date</label>
            <input
              type="date"
              className="lm-input"
              value={filters.endDate}
              onChange={(event) => {
                setFilters((current) => ({ ...current, endDate: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchData()} disabled={loading}>
              <RefreshCcw size={16} />
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              type="button"
              className="opw-secondary-btn"
              onClick={() => {
                setFilters({
                  employee: "",
                  distributor: "",
                  city: "",
                  startDate: "",
                  endDate: ""
                });
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="opw-metric-grid">
        <div className="opw-metric-card is-info">
          <span className="opw-metric-label">Visible Rows</span>
          <strong className="opw-metric-value">{filteredRecords.length}</strong>
          <span className="opw-metric-note">Daily employee records currently matching the report filters.</span>
        </div>
        <div className="opw-metric-card is-success">
          <span className="opw-metric-label">Total Orders</span>
          <strong className="opw-metric-value">{totals.orders}</strong>
          <span className="opw-metric-note">Order volume rolled up from the visible records.</span>
        </div>
        <div className="opw-metric-card is-warning">
          <span className="opw-metric-label">Quantity</span>
          <strong className="opw-metric-value">{totals.quantity}</strong>
          <span className="opw-metric-note">Total quantities sold in the current filtered period.</span>
        </div>
        <div className="opw-metric-card is-danger">
          <span className="opw-metric-label">Sales Value</span>
          <strong className="opw-metric-value">{formatCurrency(totals.sales)}</strong>
          <span className="opw-metric-note">Commercial sales value from the visible report rows.</span>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Search size={18} />
            <div>
              <h3>Search & Export</h3>
              <p>Search the filtered result set and export exactly what the report is showing.</p>
            </div>
          </div>
          <div className="opw-toolbar-actions">
            <button type="button" className="opw-secondary-btn" onClick={() => void handleCopy()}>
              <Copy size={16} />
              Copy
            </button>
            <button type="button" className="opw-secondary-btn" onClick={handleCsvExport}>
              CSV
            </button>
            <button type="button" className="opw-secondary-btn" onClick={handleExcelExport}>
              <FileSpreadsheet size={16} />
              Excel
            </button>
            <button type="button" className="opw-primary-btn" onClick={handlePdfExport}>
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>

        <div className="opw-toolbar">
          <div className="opw-search">
            <Search size={16} />
            <div>
              <label htmlFor="daily-sales-search">Search rows</label>
              <input
                id="daily-sales-search"
                type="text"
                className="lm-input"
                placeholder="Search by employee, distributor, city, or date"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <BarChart3 size={18} />
            <div>
              <h3>Daily Sales Table</h3>
              <p>Review employee-wise daily performance with cleaner numeric scanning and location context.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{loading ? "Loading..." : "Live Report"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredRecords.length} rows</span>
          <span>{formatCurrency(totals.sales)} total sales</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Distributor</th>
                <th>City</th>
                <th>Date</th>
                <th className="opw-value-cell">Orders</th>
                <th className="opw-value-cell">Quantity</th>
                <th className="opw-value-cell">Sales</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>Loading daily sales</h4>
                      <p>Pulling the latest employee-wise sales performance from the report service.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>No daily sales match this view</h4>
                      <p>Adjust the report filters or refresh the dataset to widen the report.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{record.employeeName || "—"}</strong>
                      <small>{record.employeeId || "No employee ID"}</small>
                    </div>
                  </td>
                  <td>{record.distributor || "—"}</td>
                  <td>{record.city || "—"}</td>
                  <td>{formatDate(record.date || "")}</td>
                  <td className="opw-value-cell">{record.orders || 0}</td>
                  <td className="opw-value-cell">{record.quantity || 0}</td>
                  <td className="opw-value-cell">{formatCurrency(record.salesAmount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length > 0 && (
          <div className="opw-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="opw-pagination-controls">
              <button
                type="button"
                className="opw-pagination-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                className="opw-pagination-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
