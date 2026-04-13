import { useState, useEffect } from "react";
import axios from "axios";
import {
  Copy, FileText, Filter, Search, CheckCircle, AlertCircle, Eye, BarChart3
} from "lucide-react";

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

export default function SalesSummaryReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: "", retailer: "", distributor: "", orderStatus: "", startDate: "", endDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const itemsPerPage = 10;

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders?page=1&limit=1000');
      setOrders(res.data.orders || res.data || []);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to fetch orders: " + err.message });
    } finally { setLoading(false); }
  };

  const filteredOrders = orders.filter(o => {
    const empName = `${o.employee?.firstName || ''} ${o.employee?.lastName || ''}`.toLowerCase();
    const retailerName = (o.retailer?.businessName || '').toLowerCase();
    const distributorName = (o.distributor?.companyName || '').toLowerCase();
    const orderNo = `#${o.id}`;

    return (
      (!filters.employee || empName.includes(filters.employee.toLowerCase())) &&
      (!filters.retailer || retailerName.includes(filters.retailer.toLowerCase())) &&
      (!filters.distributor || distributorName.includes(filters.distributor.toLowerCase())) &&
      (!filters.orderStatus || o.status === filters.orderStatus) &&
      (!filters.startDate || new Date(o.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(o.createdAt) <= new Date(filters.endDate)) &&
      (!searchTerm || orderNo.includes(searchTerm) || empName.includes(searchTerm.toLowerCase()) || retailerName.includes(searchTerm.toLowerCase()))
    );
  });

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const qtys = filteredOrders.map(o => o.items?.reduce((s, i) => s + i.quantity, 0) || 0);
  const totals = {
    qty: qtys.reduce((s, q) => s + q, 0),
    sales: filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
    discount: filteredOrders.reduce((s, o) => s + (o.discountAmount || 0), 0),
    gst: filteredOrders.reduce((s, o) => s + (o.taxAmount || 0), 0),
    freight: filteredOrders.reduce((s, o) => s + (o.freightAmount || 0), 0),
    totalAmount: filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Sales Summary Report</h2>
          <p className="lm-page-subtitle">Complete live order overview with financial details — powered by TiDB</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="lm-card" style={{ marginBottom: "2rem" }}>
        <div className="lm-card-title"><Filter size={18} /> Filters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Employee</label>
            <input className="lm-input" placeholder="Employee name" value={filters.employee} onChange={e => setFilters({ ...filters, employee: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Retailer</label>
            <input className="lm-input" placeholder="Retailer name" value={filters.retailer} onChange={e => setFilters({ ...filters, retailer: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input className="lm-input" placeholder="Distributor name" value={filters.distributor} onChange={e => setFilters({ ...filters, distributor: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Order Status</label>
            <select className="lm-select" value={filters.orderStatus} onChange={e => setFilters({ ...filters, orderStatus: e.target.value })}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Start Date</label>
            <input type="date" className="lm-input" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">End Date</label>
            <input type="date" className="lm-input" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
        </div>
        <button className="lm-btn-primary" onClick={() => { setCurrentPage(1); fetchOrders(); }} style={{ padding: "0.7rem 2rem" }}>Apply & Refresh</button>
      </div>

      {/* Export Tools */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={{ padding: "0.6rem 1rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, color: "#0c4a6e" }}>
          <Copy size={14} /> Copy
        </button>
        <button style={{ padding: "0.6rem 1rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, color: "#0c4a6e" }}>CSV</button>
        <button style={{ padding: "0.6rem 1rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, color: "#0c4a6e" }}>Excel</button>
        <button style={{ padding: "0.6rem 1rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, color: "#0c4a6e" }}>
          <FileText size={14} /> PDF
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem", position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        <input type="text" className="lm-input" placeholder="Search by order #, employee, retailer..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: "2.5rem", width: "100%" }} />
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">
          Sales Orders ({filteredOrders.length} total — Live DB) {loading && <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Loading...</span>}
        </div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Order No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Date</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Employee</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right" }}>Qty</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right" }}>Total</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Distributor</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Retailer</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading from database...</td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No orders found in DB</td></tr>
              ) : paginatedOrders.map((order, idx) => {
                const empName = `${order.employee?.firstName || ''} ${order.employee?.lastName || ''}`.trim() || '—';
                const totalQty = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid #e2e8f0" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                    <td style={{ padding: "1rem", textAlign: "center", color: "#475569", fontSize: "0.85rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#6366f1", fontSize: "0.85rem" }}>#{order.id}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "1rem", color: "#1f2937", fontWeight: 500, fontSize: "0.85rem" }}>{empName}</td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "#475569", fontSize: "0.85rem" }}>{totalQty}</td>
                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "#16a34a", fontSize: "0.85rem" }}>₹{(order.totalAmount || 0).toFixed(2)}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.75rem" }}>{order.distributor?.companyName || '—'}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.75rem" }}>{order.retailer?.businessName || '—'}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.3rem 0.6rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontWeight: 500, backgroundColor: order.status === "Approved" || order.status === "Delivered" ? "#d1fae5" : order.status === "Pending" ? "#fef3c7" : "#fee2e2", color: order.status === "Approved" || order.status === "Delivered" ? "#065f46" : order.status === "Pending" ? "#92400e" : "#991b1b" }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button onClick={() => setSelectedOrder(order)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}>
                        <Eye size={14} color="#0284c7" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Row */}
        {!loading && filteredOrders.length > 0 && (
          <div style={{ padding: "1rem", backgroundColor: "#f0f9ff", borderTop: "2px solid #0284c7", fontSize: "0.85rem", fontWeight: 600, display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <span>Total: {filteredOrders.length} orders</span>
            <span>Qty: {totals.qty}</span>
            <span>Revenue: ₹{totals.totalAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.5rem", padding: "2rem", maxWidth: "600px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "1rem" }}>Order #{selectedOrder.id} Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {selectedOrder.status}</div>
              <div><strong>Employee:</strong> {selectedOrder.employee?.firstName} {selectedOrder.employee?.lastName}</div>
              <div><strong>Distributor:</strong> {selectedOrder.distributor?.companyName || '—'}</div>
              <div><strong>Retailer:</strong> {selectedOrder.retailer?.businessName || '—'}</div>
              <div><strong>Total:</strong> ₹{(selectedOrder.totalAmount || 0).toFixed(2)}</div>
              <div><strong>Discount:</strong> ₹{(selectedOrder.discountAmount || 0).toFixed(2)}</div>
              <div><strong>Tax:</strong> ₹{(selectedOrder.taxAmount || 0).toFixed(2)}</div>
            </div>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <strong style={{ display: "block", marginBottom: "0.5rem" }}>Items:</strong>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem" }}>
                    {item.product?.productName || 'Product'} × {item.quantity}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setSelectedOrder(null)} style={{ marginTop: "1.5rem", padding: "0.7rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", width: "100%", fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
