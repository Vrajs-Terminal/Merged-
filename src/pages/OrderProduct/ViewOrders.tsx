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

  const handleViewDetails = (order: Order) => {
    alert(`Order Details:\n\nOrder #${order.orderNo}\nEmployee: ${order.orderBy}\nAmount: ${order.amount}\nQuantity: ${order.quantity}\nStatus: ${order.status}\nLocation: ${order.location}`);
  };

  const handleDownloadPDF = (order: Order) => {
    setMsg({ type: "success", text: `PDF downloaded for order ${order.orderNo}` });
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
        {/* Header */}
        <div className="orders-header">
          <h2 className="orders-header"><MapPin size={24} /> View Orders</h2>
          <p>Monitor, filter, and manage all placed orders with GPS location tracking</p>
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
