import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Search, ToggleLeft, ToggleRight, Truck } from "lucide-react";
import { superDistributorAPI } from "../../services/apiService";

interface SuperDistributor {
  id: number;
  name: string;
  contactPerson: string;
  contactNumber: string;
  orderEmail: string;
  photo?: string;
  status: "Active" | "Inactive";
}

export default function ManageSuperDistributor() {
  const [superDistributors, setSuperDistributors] = useState<SuperDistributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    contactNumber: "",
    orderEmail: "",
    photo: ""
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await superDistributorAPI.getAll(currentPage, itemsPerPage);
      setSuperDistributors(response.data || []);
      setLoading(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to fetch super distributors" });
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.contactNumber.trim() || !formData.orderEmail.trim()) {
      setMsg({ type: "error", text: "All fields are required" });
      return;
    }

    try {
      if (editingId) {
        await superDistributorAPI.update(editingId, formData);
        setMsg({ type: "success", text: "Super distributor updated successfully" });
      } else {
        await superDistributorAPI.create(formData);
        setMsg({ type: "success", text: "Super distributor added successfully" });
      }
      fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", contactPerson: "", contactNumber: "", orderEmail: "", photo: "" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save super distributor" });
    }
  };

  const handleEdit = (dist: SuperDistributor) => {
    setEditingId(dist.id);
    setFormData({ name: dist.name, contactPerson: dist.contactPerson, contactNumber: dist.contactNumber, orderEmail: dist.orderEmail, photo: dist.photo || "" });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await superDistributorAPI.toggleStatus(id);
      fetchData();
      setMsg({ type: "success", text: "Status updated successfully" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update status" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await superDistributorAPI.delete(id);
      fetchData();
      setMsg({ type: "success", text: "Super distributor deleted successfully" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete super distributor" });
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Truck size={22} /> Manage Super Distributors</h2>
          <p className="lm-page-subtitle">Add and manage super distributor accounts</p>
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
        <div className="lm-field" style={{ maxWidth: "200px" }}>
          <label className="lm-label">Country</label>
          <select className="lm-select" value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
            <option value="">All Countries</option>
            <option value="India">India</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Add
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Bulk Upload
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div className="lm-field" style={{ flex: 1 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" className="lm-input" placeholder="Search by name, contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Super Distributor</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Super Distributor Name</label>
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
              <label className="lm-label">Photo Upload</label>
              <input type="file" className="lm-input" accept="image/*" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"} Super Distributor</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", contactPerson: "", contactNumber: "", orderEmail: "", photo: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Super Distributors ({superDistributors.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Super Distributor Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Contact Person</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Contact Number</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Order Email</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {superDistributors.map((dist, idx) => (
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
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis" }}>{dist.orderEmail || "—"}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                    <button onClick={() => handleToggleStatus(dist.id)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}>
                      {dist.status === "Active" ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} color="#94a3b8" />}
                      <span style={{ color: dist.status === "Active" ? "#166534" : "#64748b", fontWeight: 600, fontSize: "0.75rem" }}>{dist.status}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === 1 ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === 1 ? "default" : "pointer" }}>Prev</button>
          {Array.from({ length: Math.ceil(superDistributors.length / itemsPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === i + 1 ? "#6366f1" : "#f1f5f9", color: currentPage === i + 1 ? "white" : "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(superDistributors.length / itemsPerPage)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === Math.ceil(superDistributors.length / itemsPerPage) ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === Math.ceil(superDistributors.length / itemsPerPage) ? "default" : "pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
