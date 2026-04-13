import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { unitMeasureAPI } from "../../services/apiService";

interface Unit {
  id: number;
  unitName: string;
  symbol: string;
  status: "Show" | "Hide" | string;
  createdAt?: string;
}

export default function UnitMeasurement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  const [formData, setFormData] = useState<Omit<Unit, "id" | "createdAt">>({
    unitName: "",
    symbol: "",
    status: "Active"
  });

  const itemsPerPage = 25;

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await unitMeasureAPI.getAll();
      setUnits(res.data);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load units: " + err.message });
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.symbol && unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSave = async () => {
    if (!formData.unitName || !formData.symbol) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await unitMeasureAPI.update(editingId, formData);
        await fetchUnits();
        setMsg({ type: "success", text: "Unit updated successfully!" });
      } else {
        await unitMeasureAPI.create(formData);
        await fetchUnits();
        setMsg({ type: "success", text: "Unit added successfully!" });
      }
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to save unit." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ unitName: "", symbol: "", status: "Active" });
    setEditingId(null);
  };

  const handleEdit = (unit: Unit) => {
    setFormData(unit);
    setEditingId(unit.id);
    setShowForm(true);
  };

  const toggleStatus = (id: number) => {
    (async () => {
      try {
        await unitMeasureAPI.toggleStatus(id);
        await fetchUnits();
        setMsg({ type: "success", text: "Status updated successfully!" });
      } catch (err: any) {
        setMsg({ type: "error", text: "Failed to toggle status." });
      }
    })();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this unit?")) {
      (async () => {
        try {
          await unitMeasureAPI.delete(id);
          await fetchUnits();
          setMsg({ type: "success", text: "Unit deleted successfully!" });
        } catch (err: any) {
          setMsg({ type: "error", text: "Failed to delete unit." });
        }
      })();
    }
  };

  const handleBulkDelete = () => {
    if (checkedRows.length === 0) {
      alert("Select units to delete!");
      return;
    }
    if (window.confirm(`Delete ${checkedRows.length} unit(s)?`)) {
      (async () => {
        try {
          await Promise.all(checkedRows.map((id) => unitMeasureAPI.delete(id)));
          await fetchUnits();
          setCheckedRows([]);
          setMsg({ type: "success", text: "Units deleted successfully!" });
        } catch {
          setMsg({ type: "error", text: "Failed to delete selected units." });
        }
      })();
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Search size={22} /> Unit Measurement</h2>
          <p className="lm-page-subtitle">Dynamic units via MySQL/Prisma API integration</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Top Buttons and Search */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button
          className="lm-btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", transition: "all 0.3s ease" }}
        >
          <Plus size={16} /> Add Unit
        </button>
        {checkedRows.length > 0 && (
          <button
            className="action-btn action-btn-delete"
            onClick={handleBulkDelete}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "6px 12px" }}
          >
            <Trash2 size={16} /> Delete Selected ({checkedRows.length})
          </button>
        )}

        <div style={{ marginLeft: "auto", position: "relative", minWidth: "250px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="lm-input"
            placeholder="Search unit or symbol..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit Unit" : "Add New Unit"}</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Unit Name*</label>
              <input
                className="lm-input"
                placeholder="e.g., Kilogram, Bottle, Box"
                value={formData.unitName}
                onChange={e => setFormData({ ...formData, unitName: e.target.value })}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Symbol*</label>
              <input
                className="lm-input"
                placeholder="e.g., kg, btl, box"
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Status*</label>
              <select
                className="lm-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="lm-form-footer lm-col-4" style={{ display: "flex", gap: "1rem" }}>
              <button
                className="lm-btn-primary"
                onClick={handleSave}
                disabled={loading}
                style={{ flex: 1, padding: "0.7rem 1rem" }}
              >
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="lm-btn-secondary"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{ flex: 1, padding: "0.7rem 1rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Live Dynamic Database Items ({filteredUnits.length} total)</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Sr. No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Unit Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Symbol</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUnits.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No units found</td></tr>
              ) : (
                paginatedUnits.map((unit, idx) => (
                  <tr key={unit.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem", color: "#475569" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{unit.unitName}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontWeight: 500 }}>{unit.symbol}</td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.825rem",
                          fontWeight: 500,
                          backgroundColor: unit.status === "Active" ? "#d1fae5" : "#fee2e2",
                          color: unit.status === "Active" ? "#065f46" : "#991b1b"
                        }}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleEdit(unit)} style={{ padding: "0.5rem", borderRadius: "0.375rem", backgroundColor: "#dbeafe", border: "none" }}>Edit</button>
                        <button onClick={() => toggleStatus(unit.id)} style={{ padding: "0.5rem", borderRadius: "0.375rem", backgroundColor: "#e2e8f0", border: "none" }}>Toggle</button>
                        <button onClick={() => handleDelete(unit.id)} style={{ padding: "0.5rem", borderRadius: "0.375rem", backgroundColor: "#fee2e2", border: "none" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
