import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, Search, Filter, Eye, ShoppingCart, CheckCircle2, XCircle, MoreVertical, FileText } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { orderAPI } from "../../services/apiService";

type OrderRecord = {
  id: number;
  orderNo?: string;
  createdAt?: string;
  retailer?: string;
  amount?: number | string;
  status?: string;
  orderBy?: string;
  employee?: { fullName?: string; name?: string };
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const mapStatus = (status?: string) => {
  const value = (status || "Draft").toLowerCase();
  if (value.includes("approve") || value.includes("completed") || value.includes("success")) return "Approved";
  if (value.includes("reject") || value.includes("cancel")) return "Rejected";
  if (value.includes("draft") || value.includes("pending")) return "Draft";
  return "Sent";
};

const ManageQuotation: React.FC = () => {
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getAll();
        const payload = Array.isArray(res.data) ? res.data : [];
        setRecords(payload);
      } catch (error) {
        console.error("Failed to fetch quotation records", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const tableData = useMemo(() => {
    const normalized = records.map((item) => {
      const numericAmount = typeof item.amount === "number" ? item.amount : Number(item.amount || 0);
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;
      return {
        id: item.id,
        no: item.orderNo || `QT-${item.id}`,
        date: createdDate ? createdDate.toISOString().slice(0, 10) : "-",
        customer: item.retailer || "Unknown",
        amount: Number.isFinite(numericAmount) ? numericAmount : 0,
        status: mapStatus(item.status),
        employee: item.employee?.fullName || item.employee?.name || item.orderBy || "Unknown",
      };
    });

    return normalized.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || item.no.toLowerCase().includes(q) || item.customer.toLowerCase().includes(q);
      const matchCustomer = customerFilter === "All Customers" || item.customer === customerFilter;
      const matchEmployee = employeeFilter === "All Employees" || item.employee === employeeFilter;
      const matchStatus = statusFilter === "All Statuses" || item.status === statusFilter;
      return matchSearch && matchCustomer && matchEmployee && matchStatus;
    });
  }, [records, search, customerFilter, employeeFilter, statusFilter]);

  const customerOptions = useMemo(() => {
    return ["All Customers", ...Array.from(new Set(records.map((r) => r.retailer).filter(Boolean) as string[]))];
  }, [records]);

  const employeeOptions = useMemo(() => {
    return [
      "All Employees",
      ...Array.from(
        new Set(
          records
            .map((r) => r.employee?.fullName || r.employee?.name || r.orderBy)
            .filter(Boolean) as string[]
        )
      ),
    ];
  }, [records]);

  const statusOptions = useMemo(() => {
    return ["All Statuses", ...Array.from(new Set(records.map((r) => mapStatus(r.status))))];
  }, [records]);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <PageTitle title="Manage Quotation" subtitle="Central tracking for all issued and draft quotations" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-primary shadow-glow">
            <Plus size={18} /> Add Quotation
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <div>
            <label className="input-label">Customer / Retailer</label>
            <select className="select-modern" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
              {customerOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Employee</label>
            <select className="select-modern" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              {employeeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select className="select-modern" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-secondary" style={{ width: "100%" }}>
              <Filter size={18} /> Filter List
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: "400px" }}>
               <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
               type="text"
               className="input-modern"
               placeholder="Search by Quotation No or Customer..."
               style={{ paddingLeft: "40px" }}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>{tableData.length} Total Quotations Found</span>
               <button className="btn btn-danger" style={{ padding: "8px" }}><Trash2 size={16} /></button>
            </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Qtn. No</th>
                <th>Date Issued</th>
                <th>Target Customer</th>
                <th>Quoted Amount</th>
                <th>Stage Status</th>
                <th>Active Actions</th>
                <th>Convert</th>
              </tr>
            </thead>
            <tbody>
              {!loading && tableData.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                    No quotation records found.
                  </td>
                </tr>
              )}
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td><input type="checkbox" /></td>
                  <td style={{ fontWeight: "700", color: "var(--primary)" }}>{item.no}</td>
                  <td style={{ fontSize: "13px" }}>{item.date}</td>
                  <td style={{ fontWeight: "600" }}>{item.customer}</td>
                  <td style={{ fontWeight: "800", color: "#166534" }}>{formatCurrency(item.amount)}</td>
                  <td>
                    <span className={`badge ${
                      item.status === "Approved" ? "badge-success" : 
                      item.status === "Draft" ? "badge-gray" : 
                      item.status === "Rejected" ? "badge-danger" : "badge-primary"
                    }`} style={{ gap: "6px" }}>
                      {item.status === "Approved" ? <CheckCircle2 size={12} /> : 
                       item.status === "Rejected" ? <XCircle size={12} /> : <FileText size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Eye size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><MoreVertical size={14} /></button>
                    </div>
                  </td>
                  <td>
                    {item.status === "Approved" && (
                       <button className="btn btn-success" style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "800", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <ShoppingCart size={14} /> To Order
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageQuotation;

