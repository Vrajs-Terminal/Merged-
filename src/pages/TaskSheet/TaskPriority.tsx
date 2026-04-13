import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Hexagon, Loader2, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";

const TaskPriority: React.FC = () => {
  const [priorities, setPriorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getPriorities();
      setPriorities(response.data);
    } catch (error) {
      console.error("Error fetching priorities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> Task Priority</h1>
          <p className="page-subtitle">Define task urgency levels and visual indicators</p>
        </div>
        <button className="btn btn-primary shadow-glow">
          <Plus size={18} /> Add Priority
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Priority Name</th>
                  <th>Priority Level</th>
                  <th>Color Indicator</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {priorities.length > 0 ? (
                  priorities.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Hexagon size={16} fill={item.color || "#ccc"} color={item.color || "#ccc"} />
                          <span style={{ fontWeight: "600", color: item.color }}>{item.name}</span>
                        </div>
                      </td>
                      <td>Level {item.level}</td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${item.color}10`, padding: "4px 12px", borderRadius: "12px", border: `1px solid ${item.color}20` }}>
                          <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: item.color }}></div>
                          <span style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums", color: item.color }}>{item.color}</span>
                        </div>
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
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No priorities defined. Click "Add Priority" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPriority;

