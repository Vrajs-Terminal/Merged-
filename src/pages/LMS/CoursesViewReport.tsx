import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  TrendingUp,
  Star,
  BookOpen,
  RefreshCw,
  X,
  Award,
} from "lucide-react";
import { lmsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./LMS.css";

interface CourseReportItem {
  id: number | string;
  employee: string;
  course: string;
  progress: number;
  status: string;
  score: string;
  date: string;
  dateISO: string;
}

const CoursesViewReport: React.FC = () => {
  const [data, setData] = useState<CourseReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employee: "All Personnel",
    course: "All Active Courses",
    date: "",
    status: "All Statuses",
    search: "",
  });

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await lmsAPI.getReport();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setData(
          rows.map((row: any) => {
            const completedDate = row.completedDate ? new Date(row.completedDate) : null;
            return {
              id: row.id,
              employee: row.employeeName || `Employee #${row.employeeId || "N/A"}`,
              course: row.course?.name || "Unknown Course",
              progress: Number(row.progress || 0),
              status: row.status || "Not Started",
              score: row.score || "--",
              date: completedDate ? completedDate.toLocaleDateString() : "--",
              dateISO: completedDate ? completedDate.toISOString().slice(0, 10) : "",
            };
          }),
        );
      } catch {
        toast.error("Failed to load LMS report");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const employeeOptions = useMemo(
    () => ["All Personnel", ...Array.from(new Set(data.map((item) => item.employee).filter(Boolean)))],
    [data],
  );

  const courseOptions = useMemo(
    () => ["All Active Courses", ...Array.from(new Set(data.map((item) => item.course).filter(Boolean)))],
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const employeeMatch = filters.employee === "All Personnel" || item.employee === filters.employee;
      const courseMatch = filters.course === "All Active Courses" || item.course === filters.course;
      const dateMatch = !filters.date || item.dateISO === filters.date;
      const statusMatch = filters.status === "All Statuses" || item.status === filters.status;
      const q = filters.search.trim().toLowerCase();
      const searchMatch =
        !q ||
        item.employee.toLowerCase().includes(q) ||
        item.course.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      return employeeMatch && courseMatch && dateMatch && statusMatch && searchMatch;
    });
  }, [data, filters]);

  const stats = useMemo(() => {
    const completed = filteredData.filter((item) => item.status === "Completed").length;
    const inProgress = filteredData.filter((item) => item.status === "In Progress").length;
    const scores = filteredData
      .map((item) => Number(String(item.score).replace("%", "")))
      .filter((score) => Number.isFinite(score));
    const avgScore = scores.length ? Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length) : 0;
    return { completed, inProgress, avgScore };
  }, [filteredData]);

  const handleReset = () => {
    setFilters({
      employee: "All Personnel",
      course: "All Active Courses",
      date: "",
      status: "All Statuses",
      search: "",
    });
    toast.info("Report filters reset");
  };

  const handleApply = () => {
    toast.info(`${filteredData.length} report rows matched your filters`);
  };

  const exportCsv = () => {
    if (filteredData.length === 0) {
      toast.info("No report records to export");
      return;
    }

    const rows = [
      ["Employee", "Course", "Progress", "Status", "Score", "Date"],
      ...filteredData.map((item) => [item.employee, item.course, `${item.progress}%`, item.status, item.score, item.date]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `courses_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Courses report exported to Excel");
  };

  const exportPdf = () => {
    if (filteredData.length === 0) {
      toast.info("No report records to export");
      return;
    }

    const rowsHtml = filteredData
      .slice(0, 220)
      .map(
        (item) => `
          <tr>
            <td>${item.employee}</td>
            <td>${item.course}</td>
            <td>${item.progress}%</td>
            <td>${item.status}</td>
            <td>${item.score}</td>
            <td>${item.date}</td>
          </tr>
        `,
      )
      .join("");

    const popup = window.open("", "_blank", "width=1024,height=760");
    if (!popup) {
      toast.error("Popup blocked. Please allow popups to generate PDF.");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Courses View Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 6px; }
            p { color: #475569; margin: 0 0 14px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Courses View Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Course</th><th>Progress</th><th>Status</th><th>Score</th><th>Date</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    toast.success("Courses PDF ready for print");
  };

  return (
    <div className="main-content animate-fade-in lms-page">
      <div className="page-header lms-page-header">
        <PageTitle
          title="Courses View Report"
          subtitle="Track learning benchmarks and employee skill progression"
          icon={<BookOpen size={22} />}
        />
        <div className="lms-page-header-actions">
          <button className="btn btn-secondary shadow-sm" onClick={exportCsv}>
            <FileSpreadsheet size={18} color="#16a34a" /> Excel
          </button>
          <button className="btn btn-secondary shadow-sm" onClick={exportPdf}>
            <FileText size={18} color="#dc2626" /> PDF
          </button>
        </div>
      </div>

      <div className="glass-card lms-filter-card">
        <div className="lms-filter-grid lms-filter-grid-4">
          <div>
            <label className="input-label">Select Employee</label>
            <select
              className="select-modern"
              value={filters.employee}
              onChange={(event) => setFilters((prev) => ({ ...prev, employee: event.target.value }))}
            >
              {employeeOptions.map((employee) => (
               <option key={employee} value={employee}>{employee}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Select Course</label>
            <select
              className="select-modern"
              value={filters.course}
              onChange={(event) => setFilters((prev) => ({ ...prev, course: event.target.value }))}
            >
              {courseOptions.map((course) => (
               <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Date Range</label>
            <input
              type="date"
              className="input-modern"
              value={filters.date}
              onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Status</label>
            <select
              className="select-modern"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option>All Statuses</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Not Started</option>
            </select>
          </div>
        </div>

        <div className="lms-filter-footer mt-14">
          <div className="lms-search-wrap">
            <Search size={18} className="lms-search-icon" />
            <input
              type="text"
              className="input-modern"
              placeholder="Search by employee, course or status..."
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <div className="lms-filter-actions lms-filter-actions-compact">
            <button className="btn btn-primary shadow-glow" onClick={handleApply}>
              <Filter size={16} /> Apply
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <RefreshCw size={16} /> Reset
            </button>
            <button className="btn btn-secondary" onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}>
              <X size={14} /> Clear Search
            </button>
          </div>
        </div>
      </div>

      <div className="lms-kpi-grid">
          <div className="glass-card lms-kpi-card">
             <div className="lms-kpi-icon success">
                <CheckCircle2 size={24} color="#10b981" />
             </div>
             <div>
                <p>Total Graduated</p>
                <h3>{stats.completed} Learners</h3>
             </div>
          </div>
          <div className="glass-card lms-kpi-card">
             <div className="lms-kpi-icon warning">
                <TrendingUp size={24} color="#eab308" />
             </div>
             <div>
                <p>Active Progress</p>
                <h3>{stats.inProgress} Modules</h3>
             </div>
          </div>
          <div className="glass-card lms-kpi-card">
             <div className="lms-kpi-icon primary">
                <Award size={24} color="#4f46e5" />
             </div>
             <div>
                <p>Avg. Final Score</p>
                <h3>{stats.avgScore} %</h3>
             </div>
          </div>
          <div className="glass-card lms-kpi-card">
             <div className="lms-kpi-icon info">
                <Star size={24} color="#0284c7" />
             </div>
             <div>
               <p>Report Rows</p>
               <h3>{filteredData.length}</h3>
             </div>
          </div>
      </div>

      <div className="glass-card lms-table-card">
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
              {!loading && filteredData.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="lms-user-cell">
                       <div className="lms-avatar">{item.employee.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                       <span style={{ fontWeight: "600" }}>{item.employee}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)", fontWeight: "500" }}>{item.course}</td>
                  <td>
                    <div className="lms-progress-row">
                      <div className="lms-progress-rail">
                        <div
                          className="lms-progress-fill"
                          style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                        />
                      </div>
                      <span className="lms-progress-text">{item.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === "Completed" ? "badge-success" : 
                      item.status === "In Progress" ? "badge-primary" : "badge-gray"
                    }`}>
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
                  <td style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{item.date}</td>
                </tr>
              ))}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="lms-empty-row">No course report rows found for selected filters.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="lms-empty-row">Loading course report...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoursesViewReport;
