import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Search, ToggleLeft, ToggleRight, Map } from "lucide-react";
import { beatPlanAPI } from "../../services/apiService";

interface BeatPlan {
  id: number;
  employeeId?: number;
  name: string;
  weekDay: string;
  retailerCount?: number;
  city: string;
  status: "Active" | "Inactive";
}

export default function RetailerBeatPlan() {
  const [beatPlans, setBeatPlans] = useState<BeatPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: "", state: "", city: "", employee: "", route: "", weekDay: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    weekDay: "",
    city: "",
    retailerCount: 0
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await beatPlanAPI.getAll(currentPage, itemsPerPage);
      setBeatPlans(response.data || []);
      setLoading(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to fetch beat plans" });
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.weekDay) {
      setMsg({ type: "error", text: "Name and week day are required" });
      return;
    }

    try {
      if (editingId) {
        await beatPlanAPI.update(editingId, formData);
        setMsg({ type: "success", text: "Beat plan updated successfully" });
      } else {
        await beatPlanAPI.create(formData);
        setMsg({ type: "success", text: "Beat plan added successfully" });
      }
      fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", weekDay: "", city: "", retailerCount: 0 });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save beat plan" });
    }
  };

  const handleEdit = (plan: BeatPlan) => {
    setEditingId(plan.id);
    setFormData({ name: plan.name, weekDay: plan.weekDay, city: plan.city, retailerCount: plan.retailerCount || 0 });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await beatPlanAPI.delete(id);
      fetchData();
      setMsg({ type: "success", text: "Beat plan deleted successfully" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete beat plan" });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await beatPlanAPI.toggleStatus(id);
      fetchData();
      setMsg({ type: "success", text: "Status updated successfully" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update status" });
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Map size={22} /> Retailer Beat Plan</h2>
          <p className="lm-page-subtitle">Schedule which retailers an employee should visit on specific days and routes</p>
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
            <label className="lm-label">Employee</label>
            <input type="text" className="lm-input" placeholder="Enter employee" value={filters.employee} onChange={e => setFilters({ ...filters, employee: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Route</label>
            <input type="text" className="lm-input" placeholder="Enter route" value={filters.route} onChange={e => setFilters({ ...filters, route: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Week Day</label>
            <select className="lm-select" value={filters.weekDay} onChange={e => setFilters({ ...filters, weekDay: e.target.value })}>
              <option value="">All Days</option>
              {weekDays.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
        </div>
        <button onClick={fetchData} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Get Data</button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Add Beat Plan
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Import Bulk
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
            <input type="text" className="lm-input" placeholder="Search by name, city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Beat Plan</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Beat Plan Name</label>
              <input type="text" className="lm-input" placeholder="Enter beat plan name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Week Day</label>
              <select className="lm-select" value={formData.weekDay} onChange={e => setFormData({ ...formData, weekDay: e.target.value })}>
                <option value="">Select Day</option>
                {weekDays.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">City</label>
              <input type="text" className="lm-input" placeholder="Enter city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Retailer Count</label>
              <input type="number" className="lm-input" placeholder="Enter retailer count" value={formData.retailerCount} onChange={e => setFormData({ ...formData, retailerCount: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"} Beat Plan</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", weekDay: "", city: "", retailerCount: 0 }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Beat Plans ({beatPlans.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Beat Plan Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Week Day</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>City</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Retailer Count</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {beatPlans.map((plan, idx) => (
                <tr key={plan.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(plan)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(plan.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                  </td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{plan.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{plan.weekDay || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{plan.city || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{plan.retailerCount || "—"}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                    <button onClick={() => handleToggleStatus(plan.id)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}>
                      {plan.status === "Active" ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} color="#94a3b8" />}
                      <span style={{ color: plan.status === "Active" ? "#166534" : "#64748b", fontWeight: 600, fontSize: "0.75rem" }}>{plan.status}</span>
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
          {Array.from({ length: Math.ceil(beatPlans.length / itemsPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === i + 1 ? "#6366f1" : "#f1f5f9", color: currentPage === i + 1 ? "white" : "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(beatPlans.length / itemsPerPage)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === Math.ceil(beatPlans.length / itemsPerPage) ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === Math.ceil(beatPlans.length / itemsPerPage) ? "default" : "pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
