import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, Search, Filter, Eye, ShoppingCart, CheckCircle2, XCircle, MoreVertical, FileText, BriefcaseBusiness } from "lucide-react";
import { orderAPI } from "../../services/apiService";
import "./Quotation.css";

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
    <div className="main-content animate-fade-in quotation-page-container qmanage-page">
      <div className="quotation-header qmanage-header">
        <div className="quotation-header-text">
          <h1><BriefcaseBusiness size={22} /> Manage Quotation</h1>
          <p>Central tracking for all issued and draft quotations</p>
        </div>
        <div className="quotation-header-actions qmanage-header-actions">
          <button className="btn btn-primary qmanage-btn-primary">
            <Plus size={18} /> Add Quotation
          </button>
        </div>
      </div>

      <div className="glass-card qmanage-filter-card">
        <div className="qmanage-filter-grid">
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
          <div className="qmanage-filter-btn-wrap">
            <button className="btn btn-secondary qmanage-filter-btn">
              <Filter size={18} /> Filter List
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card qmanage-table-card">
        <div className="qmanage-toolbar">
          <div className="qmanage-search-wrap">
            <Search size={18} className="qmanage-search-icon" />
              <input
               type="text"
               className="input-modern"
               placeholder="Search by Quotation No or Customer..."
               style={{ paddingLeft: "40px" }}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          <div className="qmanage-toolbar-right">
            <span className="qmanage-count-pill">{tableData.length} Total Quotations Found</span>
            <button className="btn btn-danger qmanage-icon-btn" aria-label="Delete quotations">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="qmanage-table-wrap">
          <table className="table-modern qmanage-table">
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
                  <td colSpan={8} className="qmanage-empty-row">
                    No quotation records found.
                  </td>
                </tr>
              )}
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td><input type="checkbox" /></td>
                  <td className="qmanage-no">{item.no}</td>
                  <td className="qmanage-date">{item.date}</td>
                  <td className="qmanage-customer">{item.customer}</td>
                  <td className="qmanage-amount">{formatCurrency(item.amount)}</td>
                  <td>
                    <span className={`badge ${
                      item.status === "Approved" ? "badge-success" : 
                      item.status === "Draft" ? "badge-gray" : 
                      item.status === "Rejected" ? "badge-danger" : "badge-primary"
                    } qmanage-status`}>
                      {item.status === "Approved" ? <CheckCircle2 size={12} /> : 
                       item.status === "Rejected" ? <XCircle size={12} /> : <FileText size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="qmanage-actions">
                       <button className="btn btn-secondary qmanage-icon-btn" aria-label="View quotation"><Eye size={14} /></button>
                       <button className="btn btn-secondary qmanage-icon-btn" aria-label="Edit quotation"><Edit2 size={14} /></button>
                       <button className="btn btn-secondary qmanage-icon-btn" aria-label="More actions"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                  <td>
                    {item.status === "Approved" && (
                      <button className="btn btn-success qmanage-convert-btn">
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

