import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Search, Loader2, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";

const TaskCategory: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> Task Category</h1>
          <p className="page-subtitle">Organize your tasks into logical categories</p>
        </div>
        <button className="btn btn-primary shadow-glow">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              className="input-modern" 
              placeholder="Search categories..." 
              style={{ paddingLeft: "40px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary shadow-sm">Export</button>
            <button className="btn btn-danger shadow-sm"><Trash2 size={16} /> Delete Selected</button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat, idx) => (
                    <tr key={cat.id}>
                      <td><input type="checkbox" /></td>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: "600" }}>{cat.name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{cat.description}</td>
                      <td>
                        <span className={`badge ${cat.status === "Active" ? "badge-success" : "badge-gray"}`}>
                          {cat.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                          <button className="btn btn-secondary" style={{ padding: "6px", color: "var(--danger)" }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No categories found. Click "Add Category" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCategory;

