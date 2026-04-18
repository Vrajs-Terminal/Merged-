import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
import "./OrderProductWorkspace.css";
import {
  copyRowsToClipboard,
  downloadRowsAsCsv,
  exportRowsToExcel,
  exportRowsToPdf,
  formatDate,
  formatDateTime
} from "./orderProductReportHelpers";

interface StockRecord {
  id: number;
  stockDate: string;
  stockTime: string;
  quantity: number;
  type: string;
  performBy: string;
  category: string;
  product: string;
  distributor: string;
  orderId: string;
}

const ITEMS_PER_PAGE = 10;

const getTypeTone = (type: string) => {
  if (type === "Stock In") {
    return "is-success";
  }

  if (type === "Stock Out") {
    return "is-danger";
  }

  if (type === "Adjustment") {
    return "is-warning";
  }

  return "is-neutral";
};

export default function StockInOutReport() {
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    distributor: "",
    stockType: "",
    product: "",
    startDate: "",
    endDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    void fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/product-stock/logs");
      const rawLogs = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const nextRecords = rawLogs.map((log: any) => {
        const stockDate = log.stockDate ? new Date(log.stockDate) : null;

        return {
          id: log.id,
          stockDate: stockDate && !Number.isNaN(stockDate.getTime()) ? stockDate.toISOString().split("T")[0] : "—",
          stockTime: stockDate && !Number.isNaN(stockDate.getTime())
            ? stockDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : (log.stockTime || "—"),
          quantity: log.quantity || 0,
          type: log.type || "Adjustment",
          performBy: log.performBy || "System",
          category: log.product?.category?.name || "General",
          product: log.variant?.variantName ? `${log.product?.name} (${log.variant?.variantName})` : (log.product?.name || "Unknown"),
          distributor: log.distributor?.name || "Main Warehouse",
          orderId: log.orderId ? String(log.orderId) : "—"
        } as StockRecord;
      });
      setStockRecords(nextRecords);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to fetch stock logs: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const distributors = useMemo(
    () => Array.from(new Set(stockRecords.map((record) => record.distributor))).sort(),
    [stockRecords]
  );

  const filteredRecords = useMemo(
    () => stockRecords.filter((record) => {
      const query = searchTerm.toLowerCase();

      return (
        (!filters.distributor || record.distributor === filters.distributor) &&
        (!filters.stockType || record.type === filters.stockType) &&
        (!filters.product || record.product.toLowerCase().includes(filters.product.toLowerCase())) &&
        (!filters.startDate || new Date(record.stockDate) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(record.stockDate) <= new Date(filters.endDate)) &&
        (!searchTerm
          || record.product.toLowerCase().includes(query)
          || record.distributor.toLowerCase().includes(query)
          || record.orderId.toLowerCase().includes(query)
          || record.performBy.toLowerCase().includes(query))
      );
    }),
    [filters, searchTerm, stockRecords]
  );

  const totals = useMemo(() => ({
    stockIn: filteredRecords.filter((record) => record.type === "Stock In").reduce((sum, record) => sum + record.quantity, 0),
    stockOut: filteredRecords.filter((record) => record.type === "Stock Out").reduce((sum, record) => sum + record.quantity, 0),
    adjustment: filteredRecords.filter((record) => record.type === "Adjustment").reduce((sum, record) => sum + record.quantity, 0)
  }), [filteredRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredRecords]
  );

  const exportRows = useMemo(
    () => filteredRecords.map((record) => ({
      stock_date: record.stockDate,
      stock_time: record.stockTime,
      product: record.product,
      distributor: record.distributor,
      type: record.type,
      quantity: record.quantity,
      performed_by: record.performBy,
      category: record.category,
      order_id: record.orderId
    })),
    [filteredRecords]
  );

  const exportKeys = [
    "stock_date",
    "stock_time",
    "product",
    "distributor",
    "type",
    "quantity",
    "performed_by",
    "category",
    "order_id"
  ];

  const visibleStart = filteredRecords.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length);
  const netMovement = totals.stockIn - totals.stockOut;

  const handleCopy = async () => {
    const copied = await copyRowsToClipboard(exportRows, exportKeys);
    setMsg({
      type: copied ? "success" : "error",
      text: copied ? "Stock movement data copied to clipboard." : "No stock movement data available to copy."
    });
  };

  const handleCsvExport = () => {
    const exported = downloadRowsAsCsv(exportRows, "stock_in_out_report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Stock movement data exported as CSV." : "No stock movement data available to export."
    });
  };

  const handleExcelExport = () => {
    const exported = exportRowsToExcel(exportRows, "stock_in_out_report", "Stock In Out");
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Stock movement data exported to Excel." : "No stock movement data available to export."
    });
  };

  const handlePdfExport = () => {
    const exported = exportRowsToPdf(exportRows, "stock_in_out_report", "Stock In Out Report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Stock movement data exported to PDF." : "No stock movement data available to export."
    });
  };

  const handleClearFilters = () => {
    setFilters({
      distributor: "",
      stockType: "",
      product: "",
      startDate: "",
      endDate: ""
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><BarChart3 size={14} /> Inventory flow</span>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Stock In/Out Report</h2>
          <p className="lm-page-subtitle">
            Track incoming, outgoing, and adjusted inventory movements with a more professional stock-control reporting surface.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Movement analytics</span>
            <span className="opw-hero-pill">Distributor visibility</span>
            <span className="opw-hero-pill">Export-ready audit log</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Logs</span>
            <strong>{filteredRecords.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Stock In</span>
            <strong>{totals.stockIn}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Stock Out</span>
            <strong>{totals.stockOut}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Net Movement</span>
            <strong>{netMovement}</strong>
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
              <h3>Filter Movement Logs</h3>
              <p>Focus on a location, stock type, product, or time period for closer inventory review.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredRecords.length} records</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <select
              className="lm-select"
              value={filters.distributor}
              onChange={(event) => setFilters((current) => ({ ...current, distributor: event.target.value }))}
            >
              <option value="">All Distributors</option>
              {distributors.map((distributor) => (
                <option key={distributor} value={distributor}>
                  {distributor}
                </option>
              ))}
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Stock Type</label>
            <select
              className="lm-select"
              value={filters.stockType}
              onChange={(event) => setFilters((current) => ({ ...current, stockType: event.target.value }))}
            >
              <option value="">All Types</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <input
              className="lm-input"
              placeholder="Search product"
              value={filters.product}
              onChange={(event) => setFilters((current) => ({ ...current, product: event.target.value }))}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Start Date</label>
            <input
              type="date"
              className="lm-input"
              value={filters.startDate}
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">End Date</label>
            <input
              type="date"
              className="lm-input"
              value={filters.endDate}
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
            />
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-primary-btn" onClick={() => { setCurrentPage(1); void fetchLogs(); }}>
              <RefreshCcw size={16} />
              Apply & Refresh
            </button>
            <button type="button" className="opw-secondary-btn" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="opw-metric-grid">
        <div className="opw-metric-card is-success">
          <span className="opw-metric-label">Total Stock In</span>
          <strong className="opw-metric-value">{totals.stockIn}</strong>
          <span className="opw-metric-note">All inventory additions in the current view.</span>
        </div>
        <div className="opw-metric-card is-danger">
          <span className="opw-metric-label">Total Stock Out</span>
          <strong className="opw-metric-value">{totals.stockOut}</strong>
          <span className="opw-metric-note">All stock reductions and dispatch movements.</span>
        </div>
        <div className="opw-metric-card is-warning">
          <span className="opw-metric-label">Adjustments</span>
          <strong className="opw-metric-value">{totals.adjustment}</strong>
          <span className="opw-metric-note">Manual or system balance corrections.</span>
        </div>
        <div className="opw-metric-card is-info">
          <span className="opw-metric-label">Net Movement</span>
          <strong className="opw-metric-value">{netMovement}</strong>
          <span className="opw-metric-note">Stock in minus stock out for the current filter set.</span>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Search size={18} />
            <div>
              <h3>Search & Export</h3>
              <p>Search log details and export the filtered stock movement trail.</p>
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
              <label htmlFor="stock-log-search">Search movement logs</label>
              <input
                id="stock-log-search"
                type="text"
                className="lm-input"
                placeholder="Search product, distributor, performer, or order reference"
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
              <h3>Stock Movement Table</h3>
              <p>Audit the detailed stock trail with clearer quantity, source, and location context.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{loading ? "Loading..." : "Live DB"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredRecords.length} logs</span>
          <span>{formatDateTime(new Date().toISOString())}</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Product</th>
                <th>Distributor</th>
                <th>Type</th>
                <th className="opw-value-cell">Qty</th>
                <th>Performed By</th>
                <th>Order Ref</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="opw-empty">
                      <h4>Loading stock movement</h4>
                      <p>Pulling the latest inventory movement trail from the database.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="opw-empty">
                      <h4>No stock logs found</h4>
                      <p>No inventory movement matches the selected filters right now.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.stockDate)}</td>
                  <td>{record.stockTime}</td>
                  <td>
                    <div className="opw-entity">
                      <strong>{record.product}</strong>
                      <small>{record.category}</small>
                    </div>
                  </td>
                  <td>{record.distributor}</td>
                  <td>
                    <span className={`opw-status-badge ${getTypeTone(record.type)}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="opw-value-cell">{record.quantity}</td>
                  <td>{record.performBy}</td>
                  <td>{record.orderId}</td>
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
