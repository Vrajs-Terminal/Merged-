import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Search, Truck } from "lucide-react";
import { distributorAPI } from "../../services/apiService";

interface Distributor {
  id: number;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  orderEmail?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  distributorType?: string;
  status: "Active" | "Inactive";
}

export default function ManageDistributor() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: "", state: "", city: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", contactPerson: "", contactNumber: "", orderEmail: "", email: "", country: "", state: "", city: "", distributorType: "" });

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await distributorAPI.getAll(currentPage, itemsPerPage, undefined, undefined, filters.city, searchTerm);
      setDistributors(response.data.data || []);
    } catch (error) {
      setMsg({ type: "error", text: "Failed to load distributors" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      setMsg({ type: "error", text: "Distributor Name is required" });
      return;
    }
    try {
      const payload = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        contactNumber: formData.contactNumber,
        orderEmail: formData.orderEmail,
        email: formData.email,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        distributorType: formData.distributorType
      };
      if (editingId) {
        await distributorAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Distributor updated successfully" });
        setEditingId(null);
      } else {
        await distributorAPI.create(payload);
        setMsg({ type: "success", text: "Distributor added successfully" });
      }
      fetchData();
      setFormData({ name: "", contactPerson: "", contactNumber: "", orderEmail: "", email: "", country: "", state: "", city: "", distributorType: "" });
      setShowForm(false);
    } catch (error) {
      setMsg({ type: "error", text: editingId ? "Failed to update distributor" : "Failed to add distributor" });
      console.error(error);
    }
  };

  const handleEdit = (dist: Distributor) => {
    setEditingId(dist.id);
    setFormData({
      name: dist.name,
      contactPerson: dist.contactPerson || "",
      contactNumber: dist.contactNumber || "",
      orderEmail: dist.orderEmail || "",
      email: dist.email || "",
      country: dist.country || "",
      state: dist.state || "",
      city: dist.city || "",
      distributorType: dist.distributorType || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await distributorAPI.delete(id);
      setMsg({ type: "success", text: "Distributor deleted successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to delete distributor" });
      console.error(error);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Truck size={22} /> Manage Distributors</h2>
          <p className="lm-page-subtitle">Add, manage, and maintain distributor information</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Country</label>
            <select className="lm-select" value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
              <option value="">All Countries</option>
              <option value="India">India</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">State</label>
            <input type="text" className="lm-input" placeholder="Enter state" value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">City</label>
            <input type="text" className="lm-input" placeholder="Enter city" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
          </div>
        </div>
        <button onClick={fetchData} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Get Data</button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Add Distributor
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Bulk Upload
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Distributor</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Distributor Name</label>
              <input type="text" className="lm-input" placeholder="Enter name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Contact Person</label>
              <input type="text" className="lm-input" placeholder="Enter name" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Contact Number</label>
              <input type="text" className="lm-input" placeholder="Enter number" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Order Email</label>
              <input type="email" className="lm-input" placeholder="Enter email" value={formData.orderEmail} onChange={e => setFormData({ ...formData, orderEmail: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Email</label>
              <input type="email" className="lm-input" placeholder="Enter email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">City</label>
              <input type="text" className="lm-input" placeholder="Enter city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", contactPerson: "", contactNumber: "", orderEmail: "", email: "", country: "", state: "", city: "", distributorType: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div className="lm-field" style={{ flex: 1 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" className="lm-input" placeholder="Search by distributor name, contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Distributors ({distributors.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Distributor Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Contact Person</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Contact Number</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Email</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>City</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((dist, idx) => (
                <tr key={dist.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(dist)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(dist.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                  </td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{dist.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{dist.contactPerson || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", fontFamily: "monospace" }}>{dist.contactNumber || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis" }}>{dist.email || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{dist.city || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === 1 ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === 1 ? "default" : "pointer" }}>Prev</button>
          {Array.from({ length: Math.ceil(distributors.length / itemsPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === i + 1 ? "#6366f1" : "#f1f5f9", color: currentPage === i + 1 ? "white" : "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(distributors.length / itemsPerPage)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === Math.ceil(distributors.length / itemsPerPage) ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === Math.ceil(distributors.length / itemsPerPage) ? "default" : "pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
