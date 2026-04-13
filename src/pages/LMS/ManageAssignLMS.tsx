import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, UserPlus, Filter, Search, Calendar, GraduationCap, CheckCircle2, AlertCircle, Building2, Users, BookOpen } from "lucide-react";
import { branchAPI, departmentAPI, employeeAPI, lmsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const ManageAssignLMS: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<number, any>>({});
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [reportRes, branchRes, deptRes, empRes] = await Promise.all([
          lmsAPI.getReport(),
          branchAPI.getAll().catch(() => ({ data: [] })),
          departmentAPI.getAll().catch(() => ({ data: [] })),
          employeeAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const reportRows = Array.isArray(reportRes?.data) ? reportRes.data : [];
        const branchRows = Array.isArray(branchRes?.data) ? branchRes.data : [];
        const deptRows = Array.isArray(deptRes?.data) ? deptRes.data : [];
        const employeeRows = Array.isArray(empRes?.data) ? empRes.data : Array.isArray(empRes?.data?.data) ? empRes.data.data : [];

        const emap: Record<number, any> = {};
        employeeRows.forEach((employee: any) => {
          if (employee?.id) emap[employee.id] = employee;
        });

        setEmployeeMap(emap);
        setBranches(branchRows);
        setDepartments(deptRows);
        setAssignments(reportRows.map((row: any) => {
          const employee = row.employeeId ? emap[row.employeeId] : null;
          const employeeName = row.employeeName || (employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "Unassigned") || "Unassigned";
          const status = row.status || "Not Started";
          return {
            id: row.id,
            employee: employeeName,
            course: row.course?.name || "Untitled Course",
            date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "--",
            due: row.completedDate ? new Date(row.completedDate).toLocaleDateString() : "--",
            mandatory: false,
            status,
            branch: employee?.branch || "",
            department: employee?.department || "",
          };
        }));
      } catch {
        toast.error("Failed to load LMS assignments");
        setAssignments([]);
      }
    };

    load();
  }, []);

  const filteredAssignments = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((item) =>
      String(item.employee || "").toLowerCase().includes(q) ||
      String(item.course || "").toLowerCase().includes(q) ||
      String(item.status || "").toLowerCase().includes(q)
    );
  }, [assignments, searchText]);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><BookOpen size={22} /> Manage Assign LMS</h1>
          <p className="page-subtitle">Structured training delegation for employees and departments</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-secondary shadow-sm">
            <Users size={18} /> Bulk Assignment
          </button>
           <button className="btn btn-primary shadow-glow">
            <UserPlus size={18} /> Direct Assign Course
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <div>
            <label className="input-label">Branch Selection</label>
            <select className="select-modern">
               <option>All Locations</option>
              {branches.map((branch: any) => (
               <option key={branch.id} value={branch.id}>{branch.branchName || branch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Select Department</label>
            <select className="select-modern">
               <option>All Departments</option>
              {departments.map((department: any) => (
               <option key={department.id} value={department.id}>{department.departmentName || department.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Search Personnel</label>
            <div style={{ position: "relative" }}>
               <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="text" className="input-modern" placeholder="E.g., John Doe" style={{ paddingLeft: "32px" }} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
          </div>
          <div style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-secondary" style={{ width: "100%" }}>
              <Filter size={18} /> Search Filters
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card">
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Building2 size={20} color="var(--primary)" />
              <h3 style={{ fontSize: "16px" }}>Assignment Master List</h3>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span className="badge badge-warning" style={{ fontSize: "10px" }}>{filteredAssignments.filter(a => a.status === 'Overdue').length} OVERDUE</span>
              <span className="badge badge-primary" style={{ fontSize: "10px" }}>{filteredAssignments.length} TOTAL ASSIGNS</span>
            </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Assigned Target</th>
                <th>Course Name</th>
                <th>Delegation Date</th>
                <th>Final Deadline</th>
                <th>Requirement</th>
                <th>Stage Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>{item.employee.split(' ').map((n: string) => n[0]).join('')}</div>
                       <span style={{ fontWeight: "700" }}>{item.employee}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <GraduationCap size={14} color="var(--primary)" />
                       <span style={{ fontWeight: "600", fontSize: "13px" }}>{item.course}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.date}</td>
                  <td style={{ fontSize: "13px", fontWeight: "600", color: item.status === 'Overdue' ? 'var(--danger)' : 'var(--text-main)' }}>{item.due}</td>
                  <td>
                    {item.mandatory ? (
                       <span className="badge badge-danger" style={{ fontSize: "10px" }}>COMPULSORY</span>
                    ) : (
                       <span className="badge badge-gray" style={{ fontSize: "10px" }}>OPTIONAL</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === "Submitted" ? "badge-success" : 
                      item.status === "Overdue" ? "badge-danger" : 
                      item.status === "Pending" ? "badge-warning" : "badge-primary"
                    }`} style={{ gap: "6px" }}>
                      {item.status === "Submitted" ? <CheckCircle2 size={12} /> : 
                       item.status === "Overdue" ? <AlertCircle size={12} /> : null}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Calendar size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No LMS assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAssignLMS;
