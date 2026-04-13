import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Edit2, Eye, Filter, Search, Save, CheckCircle, AlertCircle, MapPin
} from "lucide-react";

interface City { id: number; name: string; state: { name: string; country: { name: string } } }
interface Area {
  id: number; name: string; status: string;
  city: { id: number; name: string; state: { name: string; country: { name: string } } };
}

export default function ManageArea() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filters, setFilters] = useState({ cityId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({ name: "", cityId: 0, status: "Active" });
  const itemsPerPage = 25;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [areasRes, citiesRes] = await Promise.all([
        axios.get('/api/geo/areas'),
        axios.get('/api/geo/cities')
      ]);
      const safeAreas = Array.isArray(areasRes?.data)
        ? areasRes.data
        : Array.isArray(areasRes?.data?.data)
          ? areasRes.data.data
          : [];
      const safeCities = Array.isArray(citiesRes?.data)
        ? citiesRes.data
        : Array.isArray(citiesRes?.data?.data)
          ? citiesRes.data.data
          : [];
      setAreas(safeAreas);
      setCities(safeCities);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load: " + err.message });
    }
  };

  const filteredAreas = areas.filter(a =>
    (!filters.cityId || a.city?.id?.toString() === filters.cityId) &&
    (a.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedAreas = filteredAreas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);

  const handleSave = async () => {
    if (!formData.name || !formData.cityId) { alert("All fields required!"); return; }
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/geo/areas/${editingId}`, formData);
        await fetchData();
        setMsg({ type: "success", text: "Area updated!" });
      } else {
        await axios.post('/api/geo/areas', formData);
        await fetchData();
        setMsg({ type: "success", text: "Area added!" });
      }
      resetForm(); setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to save: " + err.message });
    } finally { setLoading(false); }
  };

  const resetForm = () => { setFormData({ name: "", cityId: 0, status: "Active" }); setEditingId(null); };

  const handleEdit = (area: Area) => {
    setFormData({ name: area.name, cityId: area.city.id, status: area.status });
    setEditingId(area.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this area?")) return;
    try {
      await axios.delete(`/api/geo/areas/${id}`);
      setAreas(areas.filter(a => a.id !== id));
      setMsg({ type: "success", text: "Area deleted!" });
    } catch { setMsg({ type: "error", text: "Failed." }); }
  };

  const handleBulkDelete = async () => {
    if (!checkedRows.length) { alert("Select areas first!"); return; }
    if (!window.confirm(`Delete ${checkedRows.length} areas?`)) return;
    for (const id of checkedRows) { try { await axios.delete(`/api/geo/areas/${id}`); } catch {} }
    await fetchData(); setCheckedRows([]);
    setMsg({ type: "success", text: "Deleted!" });
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><MapPin size={22} /> Manage Area</h2>
          <p className="lm-page-subtitle">Dynamic area management via live TiDB API</p>
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
        <div className="lm-form-grid">
          <div className="lm-field">
            <label className="lm-label">City</label>
            <select className="lm-select" value={filters.cityId} onChange={e => setFilters({ cityId: e.target.value })}>
              <option value="">All Cities</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Top Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button className="lm-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem" }}>
          <Plus size={16} /> Add Area
        </button>
        {checkedRows.length > 0 && (
          <button onClick={handleBulkDelete} style={{ padding: "0.7rem 1.2rem", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "0.375rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Trash2 size={16} /> Delete Selected ({checkedRows.length})
          </button>
        )}
        <div style={{ marginLeft: "auto", position: "relative", minWidth: "250px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input type="text" className="lm-input" placeholder="Search area..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: "2.5rem" }} />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit Area" : "Add New Area"}</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Area Name*</label>
              <input className="lm-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Area name" />
            </div>
            <div className="lm-field">
              <label className="lm-label">City*</label>
              <select className="lm-select" value={formData.cityId} onChange={e => setFormData({ ...formData, cityId: Number(e.target.value) })}>
                <option value={0}>Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Status</label>
              <select className="lm-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="lm-form-footer lm-col-4" style={{ display: "flex", gap: "1rem" }}>
              <button className="lm-btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 1, padding: "0.7rem 1rem" }}>
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button className="lm-btn-secondary" onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, padding: "0.7rem 1rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Area Records ({filteredAreas.length} total) — Live DB</div>
        <div className="lm-table-wrap">
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "center", width: "50px" }}>
                  <input type="checkbox" onChange={e => setCheckedRows(e.target.checked ? areas.map(a => a.id) : [])} checked={checkedRows.length === areas.length && areas.length > 0} />
                </th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>S.No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Area Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>City</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>State</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAreas.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No areas in database — add one to start!</td></tr>
              ) : (
                paginatedAreas.map((area, idx) => (
                  <tr key={area.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <input type="checkbox" checked={checkedRows.includes(area.id)}
                        onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, area.id] : checkedRows.filter(id => id !== area.id))} />
                    </td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{area.name}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{area.city?.name}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{area.city?.state?.name}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.3rem 0.7rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600, backgroundColor: area.status === "Active" ? "#d1fae5" : "#fee2e2", color: area.status === "Active" ? "#047857" : "#dc2626" }}>{area.status}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => { setSelectedArea(area); setShowViewModal(true); }} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}><Eye size={14} color="#0284c7" /></button>
                        <button onClick={() => handleEdit(area)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}><Edit2 size={14} color="#0284c7" /></button>
                        <button onClick={() => handleDelete(area.id)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.375rem", cursor: "pointer" }}><Trash2 size={14} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAreas.length)}–{Math.min(currentPage * itemsPerPage, filteredAreas.length)} of {filteredAreas.length}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem" }}>Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem" }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedArea && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.5rem", padding: "2rem", maxWidth: "400px", width: "90%" }}>
            <h3 style={{ marginBottom: "1rem" }}>View Area</h3>
            <p><strong>Area:</strong> {selectedArea.name}</p>
            <p><strong>City:</strong> {selectedArea.city?.name}</p>
            <p><strong>State:</strong> {selectedArea.city?.state?.name}</p>
            <p><strong>Status:</strong> {selectedArea.status}</p>
            <button onClick={() => setShowViewModal(false)} style={{ marginTop: "1rem", padding: "0.7rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", width: "100%" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
