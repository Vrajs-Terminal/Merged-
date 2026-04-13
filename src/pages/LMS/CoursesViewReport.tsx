import React, { useEffect, useState } from "react";
import { Search, Download, Filter, FileSpreadsheet, FileText, User, CheckCircle2, Clock, AlertCircle, TrendingUp, BarChart3, Star, BookOpen } from "lucide-react";
import { lmsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const CoursesViewReport: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const employeeOptions = Array.from(new Set(data.map((item) => item.employee).filter(Boolean)));
  const courseOptions = Array.from(new Set(data.map((item) => item.course).filter(Boolean)));

  useEffect(() => {
    const loadReport = async () => {
      try {
        const res = await lmsAPI.getReport();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setData(rows.map((row: any) => ({
          id: row.id,
          employee: row.employeeName || `Employee #${row.employeeId || "N/A"}`,
          course: row.course?.name || "Unknown Course",
          progress: Number(row.progress || 0),
          status: row.status || "Not Started",
          score: row.score || "--",
          date: row.completedDate ? new Date(row.completedDate).toLocaleDateString() : "--",
        })));
      } catch {
        toast.error("Failed to load LMS report");
        setData([]);
      }
    };

    loadReport();
  }, []);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><BookOpen size={22} /> Courses View Report</h1>
          <p className="page-subtitle">Track learning benchmarks and employee skill progression</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary shadow-sm">
            <FileSpreadsheet size={18} color="#16a34a" /> Excel
          </button>
          <button className="btn btn-secondary shadow-sm">
            <FileText size={18} color="#dc2626" /> PDF
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
          <div>
            <label className="input-label">Select Employee</label>
            <select className="select-modern">
               <option>All Personnel</option>
              {employeeOptions.map((employee) => (
               <option key={employee} value={employee}>{employee}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="input-label">Select Course</label>
            <select className="select-modern">
               <option>All Active Courses</option>
              {courseOptions.map((course) => (
               <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Date Range</label>
            <input type="date" className="input-modern" />
          </div>
          <div>
            <label className="input-label">Status</label>
            <select className="select-modern">
               <option>All Statuses</option>
               <option>Completed</option>
               <option>In Progress</option>
               <option>Not Started</option>
            </select>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-primary shadow-glow" style={{ width: "100%" }}>
              <Filter size={18} /> Apply Filter
            </button>
          </div>
        </div>
      </div>

       {/* Quick Analytics Summary */}
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "12px" }}>
                <CheckCircle2 size={24} color="#10b981" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Total Graduated</p>
                <h3 style={{ fontSize: "20px" }}>{data.filter(d => d.status === "Completed").length} Learners</h3>
             </div>
          </div>
          <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "#fefce8", padding: "12px", borderRadius: "12px" }}>
                <TrendingUp size={24} color="#eab308" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Active Progress</p>
                <h3 style={{ fontSize: "20px" }}>{data.filter(d => d.status === "In Progress").length} Modules</h3>
             </div>
          </div>
           <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
             <div style={{ background: "#eef2ff", padding: "12px", borderRadius: "12px" }}>
                <Star size={24} color="#4f46e5" />
             </div>
             <div>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Avg. Final Score</p>
                <h3 style={{ fontSize: "20px" }}>{data.length ? `${Math.round(data.filter(d => d.score !== "--").reduce((acc, curr) => acc + Number(String(curr.score).replace("%", "") || 0), 0) / Math.max(1, data.filter(d => d.score !== "--").length))} %` : "0 %"}</h3>
             </div>
          </div>
       </div>

      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee / Self</th>
                <th>Enrolled Course</th>
                <th>Current Progress</th>
                <th>Final Status</th>
                <th>Quiz Score</th>
                <th>Graduation Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>{item.employee.split(' ').map((n: string) => n[0]).join('')}</div>
                       <span style={{ fontWeight: "600" }}>{item.employee}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontWeight: "500" }}>{item.course}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${item.progress}%`, height: "100%", background: item.progress === 100 ? "var(--success)" : "var(--primary)" }}></div>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "800", width: "35px" }}>{item.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === "Completed" ? "badge-success" : 
                      item.status === "In Progress" ? "badge-primary" : "badge-gray"
                    }`} style={{ gap: "6px" }}>
                      {item.status === "Completed" ? <CheckCircle2 size={12} /> : 
                       item.status === "In Progress" ? <TrendingUp size={12} /> : null}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.score !== "--" ? (
                       <span style={{ fontWeight: "800", color: "#166534" }}>{item.score}</span>
                    ) : (
                       <span style={{ color: "#94a3b8" }}>N/A</span>
                    )}
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoursesViewReport;
