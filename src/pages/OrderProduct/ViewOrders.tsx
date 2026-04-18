import { useState, useEffect } from "react";
import axios from "axios";
import {
  Eye,
  Download,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  MapPin,
  Package
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ViewOrders.css";

interface Order {
  id: number;
  orderNo: string;
  orderBy: string;
  retailer: string;
  distributor: string;
  city: string;
  area: string;
  amount: number;
  quantity: number;
  unit: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled" | "Delivered";
  dateTime: string;
  location: string;
  outOfRange: "Yes" | "No";
  outOfRangeReason?: string;
  country: string;
  state: string;
  product: string;
}

export default function ViewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`);
      const safeOrders = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setOrders(safeOrders);
    } catch (err: any) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to load orders" });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
    area: "",
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

  const itemsPerPage = 10;

  const filteredOrders = orders.filter(order => {
    const matchFilters = (!filters.country || order.country === filters.country) &&
      (!filters.state || order.state === filters.state) &&
      (!filters.city || order.city === filters.city) &&
      (!filters.area || order.area === filters.area) &&
      (!filters.employee || (order.orderBy || "").toLowerCase().includes(filters.employee.toLowerCase())) &&
      (!filters.retailer || (order.retailer || "").toLowerCase().includes(filters.retailer.toLowerCase())) &&
      (!filters.distributor || order.distributor === filters.distributor) &&
      (!filters.orderStatus || order.status === filters.orderStatus) &&
      (!filters.product || order.product === filters.product) &&
      (!filters.startDate || new Date(order.dateTime) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(order.dateTime) <= new Date(filters.endDate));

    const matchSearch = (order.orderNo || "").includes(searchTerm) ||
      (order.orderBy || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.retailer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.distributor || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchFilters && matchSearch;
  });

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(order => order.status === "Pending").length;
  const deliveredOrders = filteredOrders.filter(order => order.status === "Delivered").length;
  const outOfRangeOrders = filteredOrders.filter(order => order.outOfRange === "Yes").length;

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleDownloadPDF = (order: Order) => {
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text(`Order ${order.orderNo}`, 14, 16);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: [
          ["Order Number", order.orderNo],
          ["Order By", order.orderBy],
          ["Retailer", order.retailer],
          ["Distributor", order.distributor],
          ["City", order.city],
          ["Area", order.area],
          ["Product", order.product],
          ["Quantity", String(order.quantity)],
          ["Unit", order.unit],
          ["Amount", `₹${order.amount.toFixed(2)}`],
          ["Status", order.status],
          ["Location", order.location],
          ["Out of Range", order.outOfRange],
          ["Reason", order.outOfRangeReason || "-"],
        ],
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [15, 23, 42] },
      });

      doc.save(`order-${order.orderNo}.pdf`);
      setMsg({ type: "success", text: `PDF downloaded for order ${order.orderNo}` });
    } catch (err) {
      setMsg({ type: "error", text: "Failed to generate PDF" });
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (window.confirm(`Cancel order ${order.orderNo}?`)) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/orders/${order.id}/status`, { status: 'Cancelled' });
        setOrders(orders.map(o => o.id === order.id ? { ...o, status: "Cancelled" as const } : o));
        setMsg({ type: "success", text: `Order ${order.orderNo} cancelled successfully!` });
      } catch (err) {
        setMsg({ type: "error", text: "Failed to cancel order" });
      }
    }
  };



  return (
    <div className="orders-container">
      <div className="orders-wrapper">
        <div className="orders-hero">
          <div className="orders-hero-copy">
            <div className="orders-kicker"><MapPin size={16} /> Order intelligence</div>
            <h2>View Orders</h2>
            <p>Monitor, filter, and manage all placed orders with GPS context, fast exports, and high-contrast row actions.</p>
          </div>
          <div className="orders-stats">
            <div className="orders-stat">
              <span>Total orders</span>
              <strong>{totalOrders}</strong>
            </div>
            <div className="orders-stat">
              <span>Pending</span>
              <strong>{pendingOrders}</strong>
            </div>
            <div className="orders-stat">
              <span>Delivered</span>
              <strong>{deliveredOrders}</strong>
            </div>
            <div className="orders-stat">
              <span>Out of range</span>
              <strong>{outOfRangeOrders}</strong>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {msg && (
          <div className={`orders-alert ${msg.type === "error" ? "error" : "success"}`}>
            {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            <span>{msg.text}</span>
            <button className="orders-alert-close" onClick={() => setMsg(null)}>&times;</button>
          </div>
        )}

        {/* Advanced Filters */}
        <div className="orders-filters">
          <div className="filters-header"><Filter size={20} /> Advanced Filters</div>
          <div className="filters-grid">
            <div className="filter-field">
              <label className="filter-label">Country</label>
              <select
                className="filter-select"
                value={filters.country}
                onChange={e => setFilters({ ...filters, country: e.target.value })}
              >
                <option value="">All Countries</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UAE">UAE</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">State</label>
              <select
                className="filter-select"
                value={filters.state}
                onChange={e => setFilters({ ...filters, state: e.target.value })}
              >
                <option value="">All States</option>
                <option value="Telangana">Telangana</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">City</label>
              <select
                className="filter-select"
                value={filters.city}
                onChange={e => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Shimoga">Shimoga</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Area</label>
              <input
                className="filter-input"
                placeholder="Enter area"
                value={filters.area}
                onChange={e => setFilters({ ...filters, area: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Employee</label>
              <input
                className="filter-input"
                placeholder="Enter employee name"
                value={filters.employee}
                onChange={e => setFilters({ ...filters, employee: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Retailer</label>
              <input
                className="filter-input"
                placeholder="Enter retailer name"
                value={filters.retailer}
                onChange={e => setFilters({ ...filters, retailer: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Distributor</label>
              <select
                className="filter-select"
                value={filters.distributor}
                onChange={e => setFilters({ ...filters, distributor: e.target.value })}
              >
                <option value="">All Distributors</option>
                <option value="Preet Demo Distributor">Preet Demo Distributor</option>
                <option value="gaurav sales">gaurav sales</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Order Status</label>
              <select
                className="filter-select"
                value={filters.orderStatus}
                onChange={e => setFilters({ ...filters, orderStatus: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Product</label>
              <input
                className="filter-input"
                placeholder="Enter product name"
                value={filters.product}
                onChange={e => setFilters({ ...filters, product: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Start Date</label>
              <input
                type="date"
                className="filter-input"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">End Date</label>
              <input
                type="date"
                className="filter-input"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Order #, Employee, Retailer, or Distributor..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Table */}
        <div className="orders-table-card">
          <div className="table-header">
            <span><Package size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} /> Orders</span>
            <span className="table-count">{filteredOrders.length} total</span>
          </div>
          <div className="table-wrapper">
            <table className="orders-table">
            <thead>
              <tr>
                <th className="row-number">#</th>
                <th>Action</th>
                <th>Order</th>
                <th>Order By</th>
                <th>Retailer</th>
                <th>Distributor</th>
                <th>City</th>
                <th>Area</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right" }}>Unit</th>
                <th>Status</th>
                <th>Date Time</th>
                <th>Location</th>
                <th style={{ textAlign: "center" }}>Out of Range</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={15} style={{ padding: "2rem", textAlign: "center" }}>
                    <div className="no-data">
                      <div className="no-data-icon">📭</div>
                      <div className="no-data-text">No orders found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, idx) => {
                  const getStatusClass = (status: string) => {
                    switch (status) {
                      case "Pending": return "status-pending";
                      case "Approved": return "status-approved";
                      case "Rejected": return "status-rejected";
                      case "Cancelled": return "status-cancelled";
                      case "Delivered": return "status-delivered";
                      default: return "";
                    }
                  };

                  return (
                    <tr key={order.id}>
                      <td className="row-number">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="action-btn action-btn-view"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            className="action-btn action-btn-download"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            disabled={order.status === "Cancelled" || order.status === "Delivered"}
                            className="action-btn action-btn-cancel"
                            title="Cancel Order"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                      <td className="order-number">{order.orderNo}</td>
                      <td className="employee-name">{order.orderBy}</td>
                      <td>{order.retailer}</td>
                      <td>{order.distributor}</td>
                      <td><strong>{order.city}</strong></td>
                      <td>{order.area}</td>
                      <td className="amount-cell">₹{order.amount.toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}><strong>{order.quantity}</strong></td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{order.dateTime}</td>
                      <td style={{ fontSize: "0.85rem" }}>{order.location}</td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        <span style={{ color: order.outOfRange === "Yes" ? "#dc2626" : "#16a34a" }}>
                          {order.outOfRange}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{order.outOfRangeReason || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <span className="pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </span>
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="orders-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="orders-modal" onClick={e => e.stopPropagation()}>
              <div className="orders-modal-head">
                <div>
                  <span>Order details</span>
                  <h3>{selectedOrder.orderNo}</h3>
                </div>
                <button className="orders-modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
              </div>

              <div className="orders-modal-grid">
                <div><strong>Order By</strong><span>{selectedOrder.orderBy}</span></div>
                <div><strong>Retailer</strong><span>{selectedOrder.retailer}</span></div>
                <div><strong>Distributor</strong><span>{selectedOrder.distributor}</span></div>
                <div><strong>Product</strong><span>{selectedOrder.product}</span></div>
                <div><strong>Quantity</strong><span>{selectedOrder.quantity} {selectedOrder.unit}</span></div>
                <div><strong>Amount</strong><span>₹{selectedOrder.amount.toFixed(2)}</span></div>
                <div><strong>Status</strong><span>{selectedOrder.status}</span></div>
                <div><strong>Location</strong><span>{selectedOrder.location}</span></div>
                <div><strong>Out of range</strong><span>{selectedOrder.outOfRange}</span></div>
                <div><strong>Reason</strong><span>{selectedOrder.outOfRangeReason || "-"}</span></div>
              </div>

              <div className="orders-modal-actions">
                <button className="orders-modal-btn is-secondary" onClick={() => handleDownloadPDF(selectedOrder)}>
                  <Download size={16} /> Download PDF
                </button>
                <button className="orders-modal-btn is-primary" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="benefits-card">
          <h3 className="benefits-title">✓ Key Features & Benefits</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-title">✔ Full Order Visibility</div>
              <p className="benefit-desc">See all orders with complete details including location, status, and customer information</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-title">✔ Advanced Filtering</div>
              <p className="benefit-desc">Filter by 12+ criteria for precise searches and detailed order analysis</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-title">✔ GPS Location Verification</div>
              <p className="benefit-desc">Automatic out-of-range detection and tracking with location-based insights</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-title">✔ Fraud Prevention</div>
              <p className="benefit-desc">Identifies unauthorized orders placed outside allowed trading areas</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-title">✔ Order Tracking</div>
              <p className="benefit-desc">View all statuses, actions, and historical data in one centralized location</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-title">✔ Export to PDF</div>
              <p className="benefit-desc">Download and share order records in PDF format for documentation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
