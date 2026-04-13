import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Search, ToggleLeft, ToggleRight, Store } from "lucide-react";
import { retailerAPI } from "../../services/apiService";

interface Retailer {
  id: number;
  name: string;
  contactNumber?: string;
  distributorId?: number;
  area?: string;
  city?: string;
  retailerType?: string;
  state?: string;
  status: "Active" | "Inactive";
}

export default function ManageRetailer() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: "", state: "", city: "", area: "", distributor: "", employee: "", retailerType: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", contactNumber: "", distributorId: "", area: "", city: "", retailerType: "", state: "" });

  const retailerTypes = ["Grocery Store", "Super Market", "Medical Store", "Electronics Shop"];

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stateId = filters.state ? parseInt(filters.state) : undefined;
      const response = await retailerAPI.getAll(currentPage, itemsPerPage, undefined, stateId, filters.city, searchTerm);
      setRetailers(response.data.data || []);
    } catch (error) {
      setMsg({ type: "error", text: "Failed to load retailers" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      setMsg({ type: "error", text: "Retailer Name is required" });
      return;
    }
    try {
      const payload = {
        name: formData.name,
        contactNumber: formData.contactNumber,
        distributorId: formData.distributorId ? parseInt(formData.distributorId) : undefined,
        area: formData.area,
        city: formData.city,
        retailerType: formData.retailerType,
        state: formData.state
      };
      if (editingId) {
        await retailerAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Retailer updated successfully" });
        setEditingId(null);
      } else {
        await retailerAPI.create(payload);
        setMsg({ type: "success", text: "Retailer added successfully" });
      }
      fetchData();
      setFormData({ name: "", contactNumber: "", distributorId: "", area: "", city: "", retailerType: "", state: "" });
      setShowForm(false);
    } catch (error) {
      setMsg({ type: "error", text: editingId ? "Failed to update retailer" : "Failed to add retailer" });
      console.error(error);
    }
  };

  const handleEdit = (retailer: Retailer) => {
    setEditingId(retailer.id);
    setFormData({
      name: retailer.name,
      contactNumber: retailer.contactNumber || "",
      distributorId: retailer.distributorId?.toString() || "",
      area: retailer.area || "",
      city: retailer.city || "",
      retailerType: retailer.retailerType || "",
      state: retailer.state || ""
    });
    setShowForm(true);
  };

  const handleGetData = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await retailerAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Status updated successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to update status" });
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await retailerAPI.delete(id);
      setMsg({ type: "success", text: "Retailer deleted successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to delete retailer" });
      console.error(error);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Store size={22} /> Manage Retailers</h2>
          <p className="lm-page-subtitle">Add, manage, and maintain retailer details</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
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
          <div className="lm-field">
            <label className="lm-label">Area</label>
            <input type="text" className="lm-input" placeholder="Enter area" value={filters.area} onChange={e => setFilters({ ...filters, area: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input type="text" className="lm-input" placeholder="Enter distributor" value={filters.distributor} onChange={e => setFilters({ ...filters, distributor: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Retailer Type</label>
            <select className="lm-select" value={filters.retailerType} onChange={e => setFilters({ ...filters, retailerType: e.target.value })}>
              <option value="">All Types</option>
              {retailerTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleGetData} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Get Data</button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Add Retailer
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Import Bulk
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Retailer</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Retailer Name</label>
              <input type="text" className="lm-input" placeholder="Enter name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Contact Number</label>
              <input type="text" className="lm-input" placeholder="Enter number" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Area</label>
              <input type="text" className="lm-input" placeholder="Enter area" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">City</label>
              <input type="text" className="lm-input" placeholder="Enter city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Retailer Type</label>
              <select className="lm-select" value={formData.retailerType} onChange={e => setFormData({ ...formData, retailerType: e.target.value })}>
                <option value="">Select Type</option>
                {retailerTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", contactNumber: "", distributorId: "", area: "", city: "", retailerType: "", state: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div className="lm-field" style={{ flex: 1 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" className="lm-input" placeholder="Search by retailer name, contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Retailers ({retailers.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Retailer Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Contact Number</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Area</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>City</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Type</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {retailers.map((retailer, idx) => (
                <tr key={retailer.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(retailer)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(retailer.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                  </td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{retailer.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", fontFamily: "monospace" }}>{retailer.contactNumber || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{retailer.area || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{retailer.city || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{retailer.retailerType || "—"}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                    <button onClick={() => handleToggleStatus(retailer.id)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}>
                      {retailer.status === "Active" ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} color="#94a3b8" />}
                      <span style={{ color: retailer.status === "Active" ? "#166534" : "#64748b", fontWeight: 600, fontSize: "0.75rem" }}>{retailer.status}</span>
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
          {Array.from({ length: Math.ceil(retailers.length / itemsPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === i + 1 ? "#6366f1" : "#f1f5f9", color: currentPage === i + 1 ? "white" : "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(retailers.length / itemsPerPage)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === Math.ceil(retailers.length / itemsPerPage) ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === Math.ceil(retailers.length / itemsPerPage) ? "default" : "pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
