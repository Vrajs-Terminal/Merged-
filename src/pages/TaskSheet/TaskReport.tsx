import React, { useEffect, useMemo, useState } from "react";
import { Filter, FileSpreadsheet, FileText, Clock, User, CheckCircle2, AlertCircle, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const TaskReport: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await taskAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setTasks(rows);
      } catch {
        toast.error("Failed to load task report");
        setTasks([]);
      }
    };

    load();
  }, []);

  const employees = useMemo(() => {
    return Array.from(new Set(tasks
      .map((task: any) => task.assignedTo ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim() : "Unassigned")
      .filter(Boolean)));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) => {
      const name = task.assignedTo ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim() || "Unassigned" : "Unassigned";
      const status = task.status || "Pending";
      const employeeOk = employeeFilter === "All Employees" || name === employeeFilter;
      const statusOk = statusFilter === "All Statuses" || String(status).toLowerCase() === statusFilter.toLowerCase();
      return employeeOk && statusOk;
    });
  }, [tasks, employeeFilter, statusFilter]);

  const data = useMemo(() => {
    const grouped: Record<string, { total: number; completed: number; pending: number; overdue: number }> = {};

    for (const task of filteredTasks) {
      const employee = task.assignedTo ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim() || "Unassigned" : "Unassigned";
      if (!grouped[employee]) {
        grouped[employee] = { total: 0, completed: 0, pending: 0, overdue: 0 };
      }

      grouped[employee].total += 1;
      const status = String(task.status || "pending").toLowerCase();
      if (status === "completed") grouped[employee].completed += 1;
      if (status === "pending") grouped[employee].pending += 1;
      if (status === "overdue") grouped[employee].overdue += 1;
    }

    return Object.entries(grouped).map(([employee, values]) => ({ employee, ...values }));
  }, [filteredTasks]);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> Task Report</h1>
          <p className="page-subtitle">Visualize overall task performance and completion metrics</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary">
            <FileSpreadsheet size={18} color="#16a34a" /> Excel
          </button>
          <button className="btn btn-secondary">
            <FileText size={18} color="#dc2626" /> PDF
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label className="input-label">Select Employee</label>
            <select className="select-modern" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option>All Employees</option>
              {employees.map((employee) => (
                <option key={employee} value={employee}>{employee}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Date Range</label>
            <input type="date" className="input-modern" />
          </div>
          <div>
            <label className="input-label">Task Status</label>
            <select className="select-modern" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
               <option>All Statuses</option>
               <option>Completed</option>
               <option>Pending</option>
               <option>Overdue</option>
            </select>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-primary" style={{ width: "100%" }}>
              <Filter size={18} /> Apply Filter
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Total Tasks</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Overdue</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "600" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <User size={16} color="var(--primary)" />
                      {item.employee}
                    </div>
                  </td>
                  <td>{item.total}</td>
                  <td><span className="badge badge-success"><CheckCircle2 size={12} style={{ marginRight: "4px" }} /> {item.completed}</span></td>
                  <td><span className="badge badge-warning"><Clock size={12} style={{ marginRight: "4px" }} /> {item.pending}</span></td>
                  <td><span className="badge badge-danger"><AlertCircle size={12} style={{ marginRight: "4px" }} /> {item.overdue}</span></td>
                  <td>
                    <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }}>
                      <div style={{ width: `${Math.round((item.completed / item.total) * 100)}%`, background: "var(--success)", height: "100%" }}></div>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{Math.round((item.completed / item.total) * 100)}% Success</span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No report data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskReport;
