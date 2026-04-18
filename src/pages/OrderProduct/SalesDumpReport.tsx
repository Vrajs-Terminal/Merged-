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
  formatCurrency,
  formatDate
} from "./orderProductReportHelpers";

interface OrderItem {
  quantity: number;
  variantPrice?: number;
  product?: { productName?: string; productCategory?: { categoryName?: string } };
  variant?: { variantName?: string };
}

interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  freightAmount?: number;
  status: string;
  orderSource?: string;
  remarks?: string;
  retailer?: { businessName?: string; contactNumber?: string; address?: string; retailerGst?: string; pincode?: string };
  distributor?: { companyName?: string };
  employee?: { firstName?: string; lastName?: string; employeeId?: string };
  items?: OrderItem[];
  route?: { routeName?: string };
}

const ITEMS_PER_PAGE = 10;

const getStatusTone = (status: string) => {
  if (status === "Approved" || status === "Delivered") {
    return "is-success";
  }

  if (status === "Pending") {
    return "is-warning";
  }

  if (status === "Cancelled") {
    return "is-danger";
  }

  return "is-neutral";
};

export default function SalesDumpReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: "",
    retailer: "",
    distributor: "",
    orderStatus: "",
    product: "",
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
      const response = await axios.get("/api/orders?page=1&limit=2000");
      setOrders(response.data.orders || response.data || []);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to load order dump: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const dumpRows = useMemo(
    () => orders.flatMap((order) =>
      (order.items && order.items.length > 0 ? order.items : [null]).map((item) => ({ order, item }))
    ),
    [orders]
  );

  const filteredRows = useMemo(
    () => dumpRows.filter(({ order, item }) => {
      const employeeName = `${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim().toLowerCase();
      const retailerName = (order.retailer?.businessName || "").toLowerCase();
      const distributorName = (order.distributor?.companyName || "").toLowerCase();
      const productName = (item?.product?.productName || "").toLowerCase();
      const orderNo = `#${order.id}`;
      const query = searchTerm.toLowerCase();

      return (
        (!filters.employee || employeeName.includes(filters.employee.toLowerCase())) &&
        (!filters.retailer || retailerName.includes(filters.retailer.toLowerCase())) &&
        (!filters.distributor || distributorName.includes(filters.distributor.toLowerCase())) &&
        (!filters.orderStatus || order.status === filters.orderStatus) &&
        (!filters.product || productName.includes(filters.product.toLowerCase())) &&
        (!filters.startDate || new Date(order.createdAt) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(order.createdAt) <= new Date(filters.endDate)) &&
        (!searchTerm
          || orderNo.includes(query)
          || employeeName.includes(query)
          || retailerName.includes(query)
          || productName.includes(query)
          || distributorName.includes(query))
      );
    }),
    [dumpRows, filters, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredRows]
  );

  const totals = useMemo(() => {
    const uniqueOrderIds = Array.from(new Set(filteredRows.map((row) => row.order.id)));
    const totalSales = uniqueOrderIds.reduce((sum, orderId) => {
      const order = orders.find((entry) => entry.id === orderId);
      return sum + (order?.totalAmount || 0);
    }, 0);
    const totalDiscount = uniqueOrderIds.reduce((sum, orderId) => {
      const order = orders.find((entry) => entry.id === orderId);
      return sum + (order?.discountAmount || 0);
    }, 0);
    const totalUnits = filteredRows.reduce((sum, row) => sum + (row.item?.quantity || 0), 0);

    return {
      totalOrders: uniqueOrderIds.length,
      totalSales,
      totalDiscount,
      totalUnits
    };
  }, [filteredRows, orders]);

  const exportRows = useMemo(
    () => filteredRows.map(({ order, item }) => ({
      order_no: `#${order.id}`,
      date: formatDate(order.createdAt),
      employee: `${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim() || "—",
      retailer: order.retailer?.businessName || "—",
      distributor: order.distributor?.companyName || "—",
      product: item?.product?.productName || "—",
      category: item?.product?.productCategory?.categoryName || "—",
      quantity: item?.quantity || 0,
      total_amount: order.totalAmount || 0,
      discount: order.discountAmount || 0,
      status: order.status,
      order_via: order.orderSource || "App",
      route: order.route?.routeName || "—"
    })),
    [filteredRows]
  );

  const exportKeys = [
    "order_no",
    "date",
    "employee",
    "retailer",
    "distributor",
    "product",
    "category",
    "quantity",
    "total_amount",
    "discount",
    "status",
    "order_via",
    "route"
  ];

  const visibleStart = filteredRows.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length);

  const handleCopy = async () => {
    const copied = await copyRowsToClipboard(exportRows, exportKeys);
    setMsg({
      type: copied ? "success" : "error",
      text: copied ? "Sales dump copied to clipboard." : "No dump data available to copy."
    });
  };

  const handleCsvExport = () => {
    const exported = downloadRowsAsCsv(exportRows, "sales_dump_report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Sales dump exported as CSV." : "No dump data available to export."
    });
  };

  const handleExcelExport = () => {
    const exported = exportRowsToExcel(exportRows, "sales_dump_report", "Sales Dump");
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Sales dump exported to Excel." : "No dump data available to export."
    });
  };

  const handlePdfExport = () => {
    const exported = exportRowsToPdf(exportRows, "sales_dump_report", "Sales Dump Report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Sales dump exported to PDF." : "No dump data available to export."
    });
  };

  const handleClearFilters = () => {
    setFilters({
      employee: "",
      retailer: "",
      distributor: "",
      orderStatus: "",
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
          <span className="opw-eyebrow"><BarChart3 size={14} /> Raw sales analysis</span>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Sales Dump Report</h2>
          <p className="lm-page-subtitle">
            Analyze item-level order rows from the live database with stronger hierarchy, filters, and export controls.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Item-level data</span>
            <span className="opw-hero-pill">Finance-ready exports</span>
            <span className="opw-hero-pill">Product and route context</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Orders</span>
            <strong>{totals.totalOrders}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Line Rows</span>
            <strong>{filteredRows.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Revenue</span>
            <strong>{formatCurrency(totals.totalSales)}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Units</span>
            <strong>{totals.totalUnits}</strong>
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
              <h3>Filter Dump Data</h3>
              <p>Cut through the raw order rows with employee, retailer, product, status, and date filters.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredRows.length} rows</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field">
            <label className="lm-label">Employee</label>
            <input
              className="lm-input"
              placeholder="Employee name"
              value={filters.employee}
              onChange={(event) => setFilters((current) => ({ ...current, employee: event.target.value }))}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Retailer</label>
            <input
              className="lm-input"
              placeholder="Retailer name"
              value={filters.retailer}
              onChange={(event) => setFilters((current) => ({ ...current, retailer: event.target.value }))}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input
              className="lm-input"
              placeholder="Distributor name"
              value={filters.distributor}
              onChange={(event) => setFilters((current) => ({ ...current, distributor: event.target.value }))}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Order Status</label>
            <select
              className="lm-select"
              value={filters.orderStatus}
              onChange={(event) => setFilters((current) => ({ ...current, orderStatus: event.target.value }))}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <input
              className="lm-input"
              placeholder="Product name"
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
            <button type="button" className="opw-primary-btn" onClick={() => { setCurrentPage(1); void fetchData(); }}>
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
        <div className="opw-metric-card is-info">
          <span className="opw-metric-label">Total Orders</span>
          <strong className="opw-metric-value">{totals.totalOrders}</strong>
          <span className="opw-metric-note">Unique orders represented by the current line-item selection.</span>
        </div>
        <div className="opw-metric-card is-success">
          <span className="opw-metric-label">Total Revenue</span>
          <strong className="opw-metric-value">{formatCurrency(totals.totalSales)}</strong>
          <span className="opw-metric-note">Sales value across the unique orders in the dump view.</span>
        </div>
        <div className="opw-metric-card is-warning">
          <span className="opw-metric-label">Discount</span>
          <strong className="opw-metric-value">{formatCurrency(totals.totalDiscount)}</strong>
          <span className="opw-metric-note">Discount applied across the included order set.</span>
        </div>
        <div className="opw-metric-card is-danger">
          <span className="opw-metric-label">Units</span>
          <strong className="opw-metric-value">{totals.totalUnits}</strong>
          <span className="opw-metric-note">Total units from every visible item-level row.</span>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Search size={18} />
            <div>
              <h3>Search & Export</h3>
              <p>Search the raw order dump and export the active data slice for analysis.</p>
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
              <label htmlFor="sales-dump-search">Search dump rows</label>
              <input
                id="sales-dump-search"
                type="text"
                className="lm-input"
                placeholder="Search by order, employee, retailer, distributor, or product"
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
              <h3>Sales Dump Table</h3>
              <p>Item-level rows with product, commercial, and route context in a denser but cleaner layout.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{loading ? "Loading..." : "Live DB"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredRows.length} rows</span>
          <span>{formatCurrency(totals.totalSales)} total value</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Employee</th>
                <th>Retailer</th>
                <th>Distributor</th>
                <th>Product</th>
                <th>Category</th>
                <th className="opw-value-cell">Qty</th>
                <th className="opw-value-cell">Total</th>
                <th>Status</th>
                <th>Via</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11}>
                    <div className="opw-empty">
                      <h4>Loading raw sales rows</h4>
                      <p>Building the latest item-level order dataset from the database.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <div className="opw-empty">
                      <h4>No dump rows found</h4>
                      <p>Try a broader date range or clear the active filters to expand the dump view.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRows.map(({ order, item }, index) => (
                <tr key={`${order.id}-${index}`}>
                  <td>
                    <div className="opw-entity">
                      <strong>#{order.id}</strong>
                      <small>{order.route?.routeName || "No route"}</small>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{`${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim() || "—"}</td>
                  <td>{order.retailer?.businessName || "—"}</td>
                  <td>{order.distributor?.companyName || "—"}</td>
                  <td>
                    <div className="opw-entity">
                      <strong>{item?.product?.productName || "—"}</strong>
                      <small>{item?.variant?.variantName || "Base item"}</small>
                    </div>
                  </td>
                  <td>{item?.product?.productCategory?.categoryName || "—"}</td>
                  <td className="opw-value-cell">{item?.quantity || 0}</td>
                  <td className="opw-value-cell">{formatCurrency(order.totalAmount || 0)}</td>
                  <td>
                    <span className={`opw-status-badge ${getStatusTone(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.orderSource || "App"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length > 0 && (
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
