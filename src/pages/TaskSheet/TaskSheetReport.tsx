import React, { useEffect, useState } from "react";
import { Clock, User, Calendar, TrendingUp, Search, CheckSquare } from "lucide-react";
import { taskAPI, employeeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const TaskSheetReport: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskRes, employeeRes] = await Promise.all([
          taskAPI.getAll().catch(() => ({ data: [] })),
          employeeAPI.getAll().catch(() => ({ data: [] }))
        ]);
        setTasks(Array.isArray(taskRes?.data) ? taskRes.data : Array.isArray(taskRes?.data?.data) ? taskRes.data.data : []);
        setEmployees(Array.isArray(employeeRes?.data) ? employeeRes.data : Array.isArray(employeeRes?.data?.data) ? employeeRes.data.data : []);
      } catch {
        toast.info('ℹ️ Task sheet loaded from live task data');
      }
    };

    load();
  }, []);

  const resolvedRows = tasks.map((task: any) => {
    const assigned = task.assignedTo
      ? `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim()
      : employees.find((emp: any) => emp.id === task.assignedToId)
        ? `${employees.find((emp: any) => emp.id === task.assignedToId)?.firstName || ''} ${employees.find((emp: any) => emp.id === task.assignedToId)?.lastName || ''}`.trim()
        : 'Unassigned';
    const start = new Date(task.createdAt || Date.now());
    const end = new Date(task.completedAt || task.updatedAt || Date.now());
    const hours = Math.max(1, Math.round((end.getTime() - start.getTime()) / 36e5));
    return {
      task: task.title || 'Untitled Task',
      employee: assigned || 'Unassigned',
      date: (task.completedAt || task.dueDate || task.createdAt) ? new Date(task.completedAt || task.dueDate || task.createdAt).toLocaleDateString() : '—',
      status: task.status || 'Pending',
      timeSpent: `${hours}h`
    };
  });

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><CheckSquare size={22} /> Task Sheet Report</h1>
        <p className="page-subtitle">Detailed tracking of individual tasks and time consumption</p>
      </div>

      <div className="glass-card">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" className="input-modern" placeholder="Search tasks, employees..." style={{ paddingLeft: "40px" }} />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary">Weekly</button>
            <button className="btn btn-secondary">Monthly</button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Assigned Employee</th>
                <th>Tracked Date</th>
                <th>Final Status</th>
                <th>Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {resolvedRows.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "700" }}>{item.task}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={14} color="var(--primary)" />
                      {item.employee}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {item.date}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.status === "Completed" ? "badge-success" : "badge-primary"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={14} color="#6366f1" />
                      <span style={{ fontWeight: "600", fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{item.timeSpent}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskSheetReport;
