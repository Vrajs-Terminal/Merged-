import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, User, Tag, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const MyTaskCategory: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

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
        toast.error("Failed to load task categories");
        setTasks([]);
        setCategories([]);
      }
    };

    load();
  }, []);

  const data = useMemo(() => {
    const usedCategoryIds = new Set(tasks.map((task: any) => task.categoryId).filter(Boolean));
    return categories
      .filter((category: any) => usedCategoryIds.has(category.id))
      .map((category: any, index: number) => {
        const relatedTask = tasks.find((task: any) => task.categoryId === category.id && task.assignedTo);
        const employee = relatedTask?.assignedTo
          ? `${relatedTask.assignedTo.firstName || ""} ${relatedTask.assignedTo.lastName || ""}`.trim() || "Unassigned"
          : "Unassigned";
        return {
          id: category.id || index + 1,
          employee,
          category: category.name || "Uncategorized",
        };
      });
  }, [tasks, categories]);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> My Task Category</h1>
          <p className="page-subtitle">Employee-specific personalized task classifications</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Add Sub Category
        </button>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee / Self</th>
                <th>Personal Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <User size={16} color="var(--primary)" />
                      <span style={{ fontWeight: "600" }}>{item.employee}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Tag size={14} color="var(--text-muted)" />
                      <span>{item.category}</span>
                    </div>
                  </td>
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
                  <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No task categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyTaskCategory;
