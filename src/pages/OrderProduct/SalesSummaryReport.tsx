import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCcw,
  Search,
  X
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

interface Order {
  id: number;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  freightAmount?: number;
  status: string;
  orderSource?: string;
  retailer?: { businessName?: string; contactNumber?: string; address?: string };
  distributor?: { companyName?: string };
  employee?: { firstName?: string; lastName?: string; employeeId?: string };
  items?: { quantity: number; product?: { productName?: string }; variantPrice?: number }[];
  remarks?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
}

const ITEMS_PER_PAGE = 10;

const getStatusTone = (status: string) => {
  if (status === "Delivered" || status === "Approved") {
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

export default function SalesSummaryReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: "",
    retailer: "",
    distributor: "",
    orderStatus: "",
    startDate: "",
    endDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/orders?page=1&limit=1000");
      setOrders(response.data.orders || response.data || []);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to fetch orders: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(
    () => orders.filter((order) => {
      const employeeName = `${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim().toLowerCase();
      const retailerName = (order.retailer?.businessName || "").toLowerCase();
      const distributorName = (order.distributor?.companyName || "").toLowerCase();
      const orderNo = `#${order.id}`;
      const query = searchTerm.toLowerCase();

      return (
        (!filters.employee || employeeName.includes(filters.employee.toLowerCase())) &&
        (!filters.retailer || retailerName.includes(filters.retailer.toLowerCase())) &&
        (!filters.distributor || distributorName.includes(filters.distributor.toLowerCase())) &&
        (!filters.orderStatus || order.status === filters.orderStatus) &&
        (!filters.startDate || new Date(order.createdAt) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(order.createdAt) <= new Date(filters.endDate)) &&
        (!searchTerm || orderNo.includes(query) || employeeName.includes(query) || retailerName.includes(query) || distributorName.includes(query))
      );
    }),
    [filters, orders, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(
    () => filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredOrders]
  );

  const totals = useMemo(() => {
    const quantity = filteredOrders.reduce((sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
    const revenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const discount = filteredOrders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    const tax = filteredOrders.reduce((sum, order) => sum + (order.taxAmount || 0), 0);

    return {
      quantity,
      revenue,
      discount,
      tax,
      averageOrderValue: filteredOrders.length ? revenue / filteredOrders.length : 0
    };
  }, [filteredOrders]);

  const exportRows = useMemo(
    () => filteredOrders.map((order) => ({
      order_no: `#${order.id}`,
      date: formatDate(order.createdAt),
      employee: `${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim() || "—",
      retailer: order.retailer?.businessName || "—",
      distributor: order.distributor?.companyName || "—",
      quantity: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      total_amount: order.totalAmount || 0,
      discount: order.discountAmount || 0,
      tax: order.taxAmount || 0,
      freight: order.freightAmount || 0,
      status: order.status,
      order_via: order.orderSource || "App",
      remarks: order.remarks || "—"
    })),
    [filteredOrders]
  );

  const exportKeys = [
    "order_no",
    "date",
    "employee",
    "retailer",
    "distributor",
    "quantity",
    "total_amount",
    "discount",
    "tax",
    "freight",
    "status",
    "order_via",
    "remarks"
  ];

  const visibleStart = filteredOrders.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length);

  const handleCopy = async () => {
    const copied = await copyRowsToClipboard(exportRows, exportKeys);
    setMsg({
      type: copied ? "success" : "error",
      text: copied ? "Sales summary copied to clipboard." : "No sales data available to copy."
    });
  };

  const handleCsvExport = () => {
    const exported = downloadRowsAsCsv(exportRows, "sales_summary_report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Sales summary exported as CSV." : "No sales data available to export."
    });
  };

  const handleExcelExport = () => {
    const exported = exportRowsToExcel(exportRows, "sales_summary_report", "Sales Summary");
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Sales summary exported to Excel." : "No sales data available to export."
    });
  };

  const handlePdfExport = () => {
    const exported = exportRowsToPdf(exportRows, "sales_summary_report", "Sales Summary Report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Sales summary exported to PDF." : "No sales data available to export."
    });
  };

  const handleClearFilters = () => {
    setFilters({
      employee: "",
      retailer: "",
      distributor: "",
      orderStatus: "",
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
          <span className="opw-eyebrow"><BarChart3 size={14} /> Revenue overview</span>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Sales Summary Report</h2>
          <p className="lm-page-subtitle">
            Review live order performance, revenue, quantity, and commercial status from a cleaner executive-ready report.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Searchable live orders</span>
            <span className="opw-hero-pill">Export-ready views</span>
            <span className="opw-hero-pill">Order detail drill-down</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Orders</span>
            <strong>{filteredOrders.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Total Qty</span>
            <strong>{totals.quantity}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Revenue</span>
            <strong>{formatCurrency(totals.revenue)}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Avg. Order</span>
            <strong>{formatCurrency(totals.averageOrderValue)}</strong>
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
              <h3>Filter Sales</h3>
              <p>Refine by employee, retailer, distributor, date range, and order status.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredOrders.length} matching</span>
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
            <button type="button" className="opw-primary-btn" onClick={() => { setCurrentPage(1); void fetchOrders(); }}>
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
          <strong className="opw-metric-value">{filteredOrders.length}</strong>
          <span className="opw-metric-note">Live records matching your current filters.</span>
        </div>
        <div className="opw-metric-card is-success">
          <span className="opw-metric-label">Revenue</span>
          <strong className="opw-metric-value">{formatCurrency(totals.revenue)}</strong>
          <span className="opw-metric-note">Order totals aggregated from the filtered result set.</span>
        </div>
        <div className="opw-metric-card is-warning">
          <span className="opw-metric-label">Discount</span>
          <strong className="opw-metric-value">{formatCurrency(totals.discount)}</strong>
          <span className="opw-metric-note">Discount value applied across the visible orders.</span>
        </div>
        <div className="opw-metric-card is-danger">
          <span className="opw-metric-label">Tax</span>
          <strong className="opw-metric-value">{formatCurrency(totals.tax)}</strong>
          <span className="opw-metric-note">Tax component included in the report selection.</span>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Search size={18} />
            <div>
              <h3>Search & Export</h3>
              <p>Search the filtered data and export exactly what you see in the report.</p>
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
              <label htmlFor="sales-summary-search">Search orders</label>
              <input
                id="sales-summary-search"
                type="text"
                className="lm-input"
                placeholder="Search by order no, employee, retailer, or distributor"
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
              <h3>Sales Orders</h3>
              <p>Review order performance with clearer commercial and routing context.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{loading ? "Loading..." : "Live DB"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredOrders.length} orders</span>
          <span>{formatCurrency(totals.revenue)} revenue</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Employee</th>
                <th className="opw-value-cell">Qty</th>
                <th className="opw-value-cell">Total</th>
                <th>Distributor</th>
                <th>Retailer</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="opw-empty">
                      <h4>Loading sales orders</h4>
                      <p>Pulling the latest sales summary from the database.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="opw-empty">
                      <h4>No orders match this view</h4>
                      <p>Adjust the filters or refresh the dataset to widen the report.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.map((order) => {
                const employeeName = `${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim() || "—";
                const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                return (
                  <tr key={order.id}>
                    <td>
                      <div className="opw-entity">
                        <strong>#{order.id}</strong>
                        <small>{order.orderSource || "App Order"}</small>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="opw-entity">
                        <strong>{employeeName}</strong>
                        <small>{order.employee?.employeeId || "No employee code"}</small>
                      </div>
                    </td>
                    <td className="opw-value-cell">{totalQuantity}</td>
                    <td className="opw-value-cell">{formatCurrency(order.totalAmount || 0)}</td>
                    <td>{order.distributor?.companyName || "—"}</td>
                    <td>{order.retailer?.businessName || "—"}</td>
                    <td>
                      <span className={`opw-status-badge ${getStatusTone(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="opw-row-actions">
                        <button type="button" className="opw-row-btn is-info" onClick={() => setSelectedOrder(order)}>
                          <Eye size={14} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 0 && (
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

      {selectedOrder && (
        <div className="lm-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="lm-modal-content opw-modal-wide" onClick={(event) => event.stopPropagation()}>
            <div className="lm-modal-header">
              <div>
                <h3>Order {selectedOrder.orderNumber || `#${selectedOrder.id}`}</h3>
                <p className="opw-subtle">Detailed commercial snapshot for this order.</p>
              </div>
              <button type="button" className="opw-icon-btn" onClick={() => setSelectedOrder(null)} aria-label="Close order details">
                <X size={16} />
              </button>
            </div>
            <div className="lm-modal-body">
              <div className="opw-detail-grid">
                <div className="opw-detail-card">
                  <span>Date</span>
                  <strong>{formatDate(selectedOrder.createdAt)}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Status</span>
                  <strong>{selectedOrder.status}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Employee</span>
                  <strong>{`${selectedOrder.employee?.firstName || ""} ${selectedOrder.employee?.lastName || ""}`.trim() || "—"}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Distributor</span>
                  <strong>{selectedOrder.distributor?.companyName || "—"}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Retailer</span>
                  <strong>{selectedOrder.retailer?.businessName || "—"}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(selectedOrder.totalAmount || 0)}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Discount</span>
                  <strong>{formatCurrency(selectedOrder.discountAmount || 0)}</strong>
                </div>
                <div className="opw-detail-card">
                  <span>Tax</span>
                  <strong>{formatCurrency(selectedOrder.taxAmount || 0)}</strong>
                </div>
              </div>

              <div className="opw-items-list">
                {(selectedOrder.items || []).length > 0 ? (
                  selectedOrder.items?.map((item, index) => (
                    <div key={`${selectedOrder.id}-item-${index}`} className="opw-item-row">
                      {(item.product?.productName || "Product")} × {item.quantity}
                    </div>
                  ))
                ) : (
                  <div className="opw-note">No line items available for this order.</div>
                )}
              </div>

              <div className="opw-note">
                <strong>Remarks:</strong> {selectedOrder.remarks || "No remarks added for this order."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
