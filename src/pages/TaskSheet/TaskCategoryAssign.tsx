import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, Tag, Trash2, Edit2, ShieldCheck, Search, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const TaskCategoryAssign: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, categoryRes] = await Promise.all([
          taskAPI.getAll(),
          taskAPI.getCategories(),
        ]);
        const taskRows = Array.isArray(taskRes?.data) ? taskRes.data : Array.isArray(taskRes?.data?.data) ? taskRes.data.data : [];
        const categoryRows = Array.isArray(categoryRes?.data) ? categoryRes.data : Array.isArray(categoryRes?.data?.data) ? categoryRes.data.data : [];
        setTasks(taskRows);
        setCategories(categoryRows);
      } catch {
        toast.error("Failed to load task category assignments");
        setTasks([]);
        setCategories([]);
      }
    };

    load();
  }, []);

  const data = useMemo(() => {
    return categories.map((category: any, index: number) => {
      const relatedTask = tasks.find((task: any) => task.categoryId === category.id);
      const hasEmployee = Boolean(relatedTask?.assignedTo);
      const assignedTo = hasEmployee
        ? `${relatedTask.assignedTo.firstName || ""} ${relatedTask.assignedTo.lastName || ""}`.trim() || "Unassigned"
        : "Unassigned";

      return {
        id: category.id || index + 1,
        category: category.name || "Uncategorized",
        assignedTo,
        type: hasEmployee ? "Employee" : "Department",
      };
    }).filter((row) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return row.category.toLowerCase().includes(q) || row.assignedTo.toLowerCase().includes(q);
    });
  }, [tasks, categories, search]);

  const departmentCount = data.filter((item) => item.type === "Department").length;
  const individualCount = data.filter((item) => item.type === "Employee").length;

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> Task Category Assign</h1>
          <p className="page-subtitle">Control category access for individuals or departments</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Form Card */}
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--primary)" }}>
            <UserPlus size={20} />
            <h3 style={{ fontSize: "18px" }}>Assign New</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="input-label">Select Category</label>
              <select className="select-modern">
                <option>-- Select Category --</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Assign To</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                  <input type="radio" name="assignType" defaultChecked /> Employee
                </label>
                <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                  <input type="radio" name="assignType" /> Department
                </label>
              </div>
              <select className="select-modern">
                <option>-- Select Target --</option>
                {Array.from(new Set(tasks.map((task: any) => task.assignedTo ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim() : "Unassigned"))).filter(Boolean).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" style={{ marginTop: "10px" }}>
              <ShieldCheck size={18} /> Assign & Apply
            </button>
          </div>
        </div>

        {/* Search & Stats Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Search size={20} color="var(--primary)" />
              <h3 style={{ fontSize: "18px" }}>Quick Search</h3>
            </div>
            <input type="text" className="input-modern" placeholder="Filter by category or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ background: "var(--primary-light)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "20px" }}>{data.length}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Assigns</p>
            </div>
            <div style={{ width: "1px", background: "rgba(79, 70, 229, 0.2)" }}></div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "20px" }}>{departmentCount}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Depts</p>
            </div>
            <div style={{ width: "1px", background: "rgba(79, 70, 229, 0.2)" }}></div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--primary)", fontWeight: "700", fontSize: "20px" }}>{individualCount}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Individs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Assigned To</th>
                <th>Access Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Tag size={16} color="var(--primary)" />
                      <span style={{ fontWeight: "600" }}>{item.category}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ShieldCheck size={16} color={item.type === "Department" ? "var(--success)" : "#6366f1"} />
                      <span>{item.assignedTo}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {item.type}
                      </span>
                    </div>
                  </td>
                  <td><span className="badge badge-success">Full Access</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                      <button className="btn btn-secondary" style={{ padding: "6px", color: "var(--danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No category assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskCategoryAssign;
