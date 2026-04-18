import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeftRight,
  Pencil,
  Package,
} from "lucide-react";
import { unitMeasureAPI } from "../../services/apiService";
import "./UnitMeasurement.css";

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

  const filteredUnits = useMemo(
    () => units.filter(unit =>
      unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.symbol && unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [searchTerm, units]
  );

  const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const activeCount = units.filter(unit => unit.status === "Active").length;
  const selectedCount = checkedRows.length;

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
    <div className="lm-container lm-fade unit-measurement-page">
      <div className="unit-measurement-hero lm-card">
        <div className="unit-measurement-copy">
          <div className="unit-measurement-kicker"><Package size={16} /> Inventory vocabulary</div>
          <h2>Unit Measurement</h2>
          <p>Manage units, symbols, and publishing status from a focused admin surface with fast search and bulk controls.</p>
        </div>
        <div className="unit-measurement-stats">
          <div className="unit-measurement-stat">
            <span>Total units</span>
            <strong>{units.length}</strong>
          </div>
          <div className="unit-measurement-stat">
            <span>Active units</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="unit-measurement-stat">
            <span>Selected</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="unit-measurement-toolbar lm-card">
        <div className="unit-measurement-actions">
          <button
            className="unit-btn unit-btn-primary"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            <Plus size={16} /> Add Unit
          </button>
          <button
            className="unit-btn unit-btn-danger"
            onClick={handleBulkDelete}
            disabled={checkedRows.length === 0}
          >
            <Trash2 size={16} /> Delete Selected ({checkedRows.length})
          </button>
        </div>

        <div className="unit-measurement-search">
          <Search size={16} />
          <div>
            <span>Search units</span>
            <input
              type="text"
              className="lm-input"
              placeholder="Search unit name or symbol"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="lm-card unit-measurement-form-card">
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
                className="unit-btn unit-btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="unit-btn unit-btn-secondary"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card unit-measurement-table-card">
        <div className="unit-measurement-table-head">
          <div>
            <h3>Live dynamic database items</h3>
            <p>{filteredUnits.length} unit record(s) matched your current search</p>
          </div>
          <div className="unit-measurement-table-pill">Toggle and edit actions are connected to the live API</div>
        </div>
        <div className="lm-table-wrap unit-measurement-table-wrap">
          <table className="lm-table unit-measurement-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th>Sr. No</th>
                <th>Unit Name</th>
                <th>Symbol</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUnits.length === 0 ? (
                <tr><td colSpan={6} className="unit-measurement-empty-state">No units found</td></tr>
              ) : (
                paginatedUnits.map((unit, idx) => (
                  <tr key={unit.id}>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="unit-measurement-unit-name">{unit.unitName}</td>
                    <td className="unit-measurement-symbol">{unit.symbol}</td>
                    <td>
                      <span className={`unit-status-badge ${unit.status === "Active" ? "is-active" : "is-inactive"}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td>
                      <div className="unit-measurement-row-actions">
                        <button className="unit-row-btn is-edit" onClick={() => handleEdit(unit)}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button className="unit-row-btn is-toggle" onClick={() => toggleStatus(unit.id)}>
                          <ArrowLeftRight size={14} /> Toggle
                        </button>
                        <button className="unit-row-btn is-delete" onClick={() => handleDelete(unit.id)}>
                          <Trash2 size={14} /> Delete
                        </button>
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
