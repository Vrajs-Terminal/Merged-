import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, Tag, Trash2, Edit2, ShieldCheck, Search, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./TaskSheet.css";

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
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> Task Category Assign</h1>
          <p className="page-subtitle">Control category access for individuals or departments</p>
        </div>
      </div>

      <div className="tasksheet-grid-2">
        {/* Form Card */}
        <div className="glass-card tasksheet-main-card">
          <div className="tasksheet-card-heading">
            <span className="tasksheet-card-heading-icon"><UserPlus size={18} /></span>
            <h3>Assign New</h3>
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
        <div className="glass-card tasksheet-main-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="tasksheet-card-heading">
              <span className="tasksheet-card-heading-icon"><Search size={18} /></span>
              <h3>Quick Search</h3>
            </div>
            <input type="text" className="input-modern" placeholder="Filter by category or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="tasksheet-info-strip tasksheet-grid-3" style={{ marginTop: "20px" }}>
            <div className="tasksheet-stat-mini">
              <strong>{data.length}</strong>
              <span>Total Assigns</span>
            </div>
            <div className="tasksheet-stat-mini">
              <strong>{departmentCount}</strong>
              <span>Depts</span>
            </div>
            <div className="tasksheet-stat-mini">
              <strong>{individualCount}</strong>
              <span>Individs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card tasksheet-main-card">
        <div className="tasksheet-table-wrap">
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
                    <div className="tasksheet-name-cell">
                      <Tag size={16} color="var(--primary)" />
                      <strong>{item.category}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="tasksheet-name-cell">
                      <ShieldCheck size={16} color={item.type === "Department" ? "var(--success)" : "#6366f1"} />
                      <span>{item.assignedTo}</span>
                      <span className="tasksheet-chip">
                        {item.type}
                      </span>
                    </div>
                  </td>
                  <td><span className="badge badge-success">Full Access</span></td>
                  <td>
                    <div className="tasksheet-row-actions">
                      <button className="btn btn-secondary tasksheet-icon-btn"><Edit2 size={14} /></button>
                      <button className="btn btn-secondary tasksheet-icon-btn" style={{ color: "var(--danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="tasksheet-empty">No category assignments found.</td>
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
