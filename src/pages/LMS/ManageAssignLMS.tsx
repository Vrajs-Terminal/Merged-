import React, { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Edit2,
  UserPlus,
  Filter,
  Search,
  Calendar,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  BookOpen,
  RefreshCw,
  X,
  Clock3,
  CheckSquare,
} from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { branchAPI, departmentAPI, employeeAPI, lmsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./LMS.css";

interface AssignmentItem {
  id: number | string;
  employeeId: number | null;
  employee: string;
  course: string;
  date: string;
  due: string;
  dueISO: string;
  mandatory: boolean;
  status: string;
  branch: string;
  department: string;
}

interface OptionItem {
  id: string;
  name: string;
}

const ManageAssignLMS: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [branches, setBranches] = useState<OptionItem[]>([]);
  const [departments, setDepartments] = useState<OptionItem[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: number; name: string; branch: string; department: string }>>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filters, setFilters] = useState({
    branch: "All Locations",
    department: "All Departments",
    status: "All Statuses",
  });
  const [draftAssign, setDraftAssign] = useState({
    employeeId: "",
    course: "",
    dueDate: "",
    mandatory: true,
  });
  const [bulkDraft, setBulkDraft] = useState({
    branch: "All Locations",
    department: "All Departments",
    course: "",
    dueDate: "",
    mandatory: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [reportRes, branchRes, deptRes, empRes] = await Promise.all([
          lmsAPI.getReport(),
          branchAPI.getAll().catch(() => ({ data: [] })),
          departmentAPI.getAll().catch(() => ({ data: [] })),
          employeeAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const reportRows =
          Array.isArray(reportRes?.data) ? reportRes.data : Array.isArray(reportRes?.data?.data) ? reportRes.data.data : [];
        const branchRows =
          Array.isArray(branchRes?.data) ? branchRes.data : Array.isArray(branchRes?.data?.data) ? branchRes.data.data : [];
        const deptRows =
          Array.isArray(deptRes?.data) ? deptRes.data : Array.isArray(deptRes?.data?.data) ? deptRes.data.data : [];
        const employeeRows = Array.isArray(empRes?.data) ? empRes.data : Array.isArray(empRes?.data?.data) ? empRes.data.data : [];

        const emap: Record<number, any> = {};
        employeeRows.forEach((employee: any) => {
          if (employee?.id) emap[employee.id] = employee;
        });

        setBranches(
          branchRows.map((branch: any) => ({
            id: String(branch.id),
            name: branch.branchName || branch.name || "Unknown Branch",
          })),
        );
        setDepartments(
          deptRows.map((department: any) => ({
            id: String(department.id),
            name: department.departmentName || department.name || "Unknown Department",
          })),
        );
        setEmployees(
          employeeRows
            .map((employee: any) => ({
              id: Number(employee.id),
              name:
                employee.fullName ||
                `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                employee.name ||
                `Employee #${employee.id}`,
              branch: employee.branch?.branchName || employee.branchName || "General",
              department: employee.department?.departmentName || employee.departmentName || "General",
            }))
            .filter((employee: any) => Number.isFinite(employee.id)),
        );

        setAssignments(
          reportRows.map((row: any) => {
            const employee = row.employeeId ? emap[row.employeeId] : null;
            const employeeName =
              row.employeeName ||
              (employee
                ? employee.fullName || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name
                : "") ||
              "Unassigned";
            const dueDate = row.completedDate ? new Date(row.completedDate) : null;
            const status = row.status || "Not Started";
            return {
              id: row.id,
              employeeId: row.employeeId || null,
              employee: employeeName,
              course: row.course?.name || "Untitled Course",
              date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "--",
              due: dueDate ? dueDate.toLocaleDateString() : "--",
              dueISO: dueDate ? dueDate.toISOString().slice(0, 10) : "",
              mandatory: false,
              status,
              branch: employee?.branch?.branchName || employee?.branchName || "General",
              department:
                employee?.department?.departmentName || employee?.departmentName || "General",
            };
          }),
        );
      } catch {
        toast.error("Failed to load LMS assignments");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredAssignments = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return assignments.filter((item) => {
      const searchMatch =
        !q ||
        String(item.employee || "").toLowerCase().includes(q) ||
        String(item.course || "").toLowerCase().includes(q) ||
        String(item.status || "").toLowerCase().includes(q);
      const branchMatch = filters.branch === "All Locations" || item.branch === filters.branch;
      const departmentMatch =
        filters.department === "All Departments" || item.department === filters.department;
      const statusMatch = filters.status === "All Statuses" || item.status === filters.status;
      return searchMatch && branchMatch && departmentMatch && statusMatch;
    });
  }, [assignments, searchText, filters]);

  const assignmentStats = useMemo(() => {
    return {
      overdue: filteredAssignments.filter((assignment) => assignment.status === "Overdue").length,
      completed: filteredAssignments.filter((assignment) => assignment.status === "Submitted").length,
      pending: filteredAssignments.filter((assignment) => assignment.status === "Pending").length,
      total: filteredAssignments.length,
    };
  }, [filteredAssignments]);

  const handleApplyFilters = () => {
    toast.info(`${filteredAssignments.length} assignments matched your filters`);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setFilters({ branch: "All Locations", department: "All Departments", status: "All Statuses" });
    toast.info("Assignment filters reset");
  };

  const handleCreateAssignment = () => {
    if (!draftAssign.employeeId || !draftAssign.course.trim() || !draftAssign.dueDate) {
      toast.error("Employee, course and due date are required");
      return;
    }

    const selectedEmployee = employees.find((employee) => String(employee.id) === draftAssign.employeeId);
    if (!selectedEmployee) {
      toast.error("Select a valid employee");
      return;
    }

    const newAssignment: AssignmentItem = {
      id: `local-${Date.now()}`,
      employeeId: selectedEmployee.id,
      employee: selectedEmployee.name,
      course: draftAssign.course.trim(),
      date: new Date().toLocaleDateString(),
      due: new Date(draftAssign.dueDate).toLocaleDateString(),
      dueISO: draftAssign.dueDate,
      mandatory: draftAssign.mandatory,
      status: "Pending",
      branch: selectedEmployee.branch,
      department: selectedEmployee.department,
    };

    setAssignments((prev) => [newAssignment, ...prev]);
    setShowAssignModal(false);
    setDraftAssign({ employeeId: "", course: "", dueDate: "", mandatory: true });
    toast.success("Course assigned successfully");
  };

  const handleDeleteAssignment = (id: number | string) => {
    const confirmed = window.confirm("Delete this assignment?");
    if (!confirmed) return;

    setAssignments((prev) => prev.filter((item) => item.id !== id));
    toast.success("Assignment deleted");
  };

  const eligibleBulkEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const branchMatch = bulkDraft.branch === "All Locations" || employee.branch === bulkDraft.branch;
      const departmentMatch =
        bulkDraft.department === "All Departments" || employee.department === bulkDraft.department;
      return branchMatch && departmentMatch;
    });
  }, [employees, bulkDraft.branch, bulkDraft.department]);

  const handleCreateBulkAssignments = () => {
    if (!bulkDraft.course.trim() || !bulkDraft.dueDate) {
      toast.error("Course and due date are required for bulk assignment");
      return;
    }
    if (eligibleBulkEmployees.length === 0) {
      toast.info("No employees match selected branch/department scope");
      return;
    }

    const now = Date.now();
    const generated: AssignmentItem[] = eligibleBulkEmployees.map((employee, index) => ({
      id: `bulk-${now}-${index}`,
      employeeId: employee.id,
      employee: employee.name,
      course: bulkDraft.course.trim(),
      date: new Date().toLocaleDateString(),
      due: new Date(bulkDraft.dueDate).toLocaleDateString(),
      dueISO: bulkDraft.dueDate,
      mandatory: bulkDraft.mandatory,
      status: "Pending",
      branch: employee.branch,
      department: employee.department,
    }));

    setAssignments((prev) => [...generated, ...prev]);
    setShowBulkModal(false);
    setBulkDraft({ branch: "All Locations", department: "All Departments", course: "", dueDate: "", mandatory: true });
    toast.success(`Bulk assignment completed for ${generated.length} employees`);
  };

  const handleReschedule = (id: number | string, currentDueISO: string) => {
    const nextDate = window.prompt("Enter new due date (YYYY-MM-DD)", currentDueISO || "");
    if (!nextDate) return;
    const parsed = new Date(nextDate);
    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, dueISO: nextDate, due: parsed.toLocaleDateString(), status: "Pending" }
          : item,
      ),
    );
    toast.success("Assignment deadline updated");
  };

  return (
    <div className="main-content animate-fade-in lms-page">
      <div className="page-header lms-page-header">
        <PageTitle
          title="Manage Assign LMS"
          subtitle="Structured training delegation for employees and departments"
          icon={<BookOpen size={22} />}
        />
        <div className="lms-page-header-actions">
            <button className="btn btn-secondary shadow-sm" onClick={() => setShowBulkModal(true)}>
            <Users size={18} /> Bulk Assignment
          </button>
           <button className="btn btn-primary shadow-glow" onClick={() => setShowAssignModal(true)}>
            <UserPlus size={18} /> Direct Assign Course
          </button>
        </div>
      </div>

      <div className="glass-card lms-filter-card">
        <div className="lms-filter-grid lms-filter-grid-4">
          <div>
            <label className="input-label">Branch Selection</label>
            <select
              className="select-modern"
              value={filters.branch}
              onChange={(event) => setFilters((prev) => ({ ...prev, branch: event.target.value }))}
            >
               <option>All Locations</option>
              {branches.map((branch) => (
               <option key={branch.id} value={branch.name}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Select Department</label>
            <select
              className="select-modern"
              value={filters.department}
              onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
            >
               <option>All Departments</option>
              {departments.map((department) => (
               <option key={department.id} value={department.name}>{department.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select
              className="select-modern"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Submitted</option>
              <option>Overdue</option>
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
              placeholder="Search personnel, course or status..."
              style={{ paddingLeft: "40px" }}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
          <div className="lms-filter-actions lms-filter-actions-compact">
            <button className="btn btn-primary shadow-glow" onClick={handleApplyFilters}>
              <Filter size={16} /> Apply
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              <RefreshCw size={16} /> Reset
            </button>
            <button className="btn btn-secondary" onClick={() => setSearchText("")}>
              <X size={14} /> Clear Search
            </button>
          </div>
        </div>
      </div>

      <div className="lms-kpi-grid">
        <div className="glass-card lms-kpi-card lms-kpi-card-courses">
          <div className="lms-kpi-icon primary"><BookOpen size={20} color="var(--color-primary-600)" /></div>
          <div><p>Total Assigns</p><h3>{assignmentStats.total}</h3></div>
        </div>
        <div className="glass-card lms-kpi-card lms-kpi-card-published">
          <div className="lms-kpi-icon success"><CheckCircle2 size={20} color="#059669" /></div>
          <div><p>Completed</p><h3>{assignmentStats.completed}</h3></div>
        </div>
        <div className="glass-card lms-kpi-card lms-kpi-card-assigned">
          <div className="lms-kpi-icon warning"><Clock3 size={20} color="#d97706" /></div>
          <div><p>Pending</p><h3>{assignmentStats.pending}</h3></div>
        </div>
        <div className="glass-card lms-kpi-card lms-kpi-card-duration">
          <div className="lms-kpi-icon info"><AlertCircle size={20} color="#b91c1c" /></div>
          <div><p>Overdue</p><h3>{assignmentStats.overdue}</h3></div>
        </div>
      </div>

      <div className="glass-card lms-table-card">
         <div className="lms-table-head">
            <div className="lms-table-title-wrap">
              <Building2 size={20} color="var(--primary)" />
              <h3 style={{ fontSize: "16px" }}>Assignment Master List</h3>
            </div>
            <div className="lms-toolbar-meta">
              <span className="badge badge-warning">{assignmentStats.overdue} OVERDUE</span>
              <span className="badge badge-primary">{assignmentStats.total} TOTAL ASSIGNS</span>
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
              {!loading && filteredAssignments.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="lms-user-cell">
                       <div className="lms-avatar">{item.employee.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                       <span style={{ fontWeight: "700" }}>{item.employee}</span>
                    </div>
                  </td>
                  <td>
                    <div className="lms-inline-meta">
                       <GraduationCap size={14} color="var(--primary)" />
                       <span style={{ fontWeight: "600", fontSize: "13px" }}>{item.course}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{item.date}</td>
                  <td style={{ fontSize: "13px", fontWeight: "600", color: item.status === "Overdue" ? "#be123c" : "var(--color-text-primary)" }}>{item.due}</td>
                  <td>
                    {item.mandatory ? (
                       <span className="badge badge-danger">COMPULSORY</span>
                    ) : (
                       <span className="badge badge-gray">OPTIONAL</span>
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
                    <div className="lms-row-actions">
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => toast.info(`Edit assignment for ${item.employee}`)}><Edit2 size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => handleReschedule(item.id, item.dueISO)}><Calendar size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }} onClick={() => handleDeleteAssignment(item.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={8} className="lms-empty-row">No LMS assignments found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="lms-empty-row">Loading assignments...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignModal && (
        <div className="lms-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="lms-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="lms-modal-header">
              <h3>Direct Assign Course</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowAssignModal(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="lms-form-grid">
              <div>
                <label className="input-label">Employee*</label>
                <select
                  className="select-modern"
                  value={draftAssign.employeeId}
                  onChange={(event) => setDraftAssign((prev) => ({ ...prev, employeeId: event.target.value }))}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Course Name*</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g., Compliance Essentials"
                  value={draftAssign.course}
                  onChange={(event) => setDraftAssign((prev) => ({ ...prev, course: event.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Due Date*</label>
                <input
                  type="date"
                  className="input-modern"
                  value={draftAssign.dueDate}
                  onChange={(event) => setDraftAssign((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Requirement</label>
                <select
                  className="select-modern"
                  value={draftAssign.mandatory ? "Mandatory" : "Optional"}
                  onChange={(event) => setDraftAssign((prev) => ({ ...prev, mandatory: event.target.value === "Mandatory" }))}
                >
                  <option>Mandatory</option>
                  <option>Optional</option>
                </select>
              </div>
            </div>

            <div className="lms-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateAssignment}>
                <Clock3 size={16} /> Assign Course
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="lms-modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="lms-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="lms-modal-header">
              <h3>Bulk Assignment</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowBulkModal(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="lms-form-grid">
              <div>
                <label className="input-label">Branch Scope</label>
                <select
                  className="select-modern"
                  value={bulkDraft.branch}
                  onChange={(event) => setBulkDraft((prev) => ({ ...prev, branch: event.target.value }))}
                >
                  <option>All Locations</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Department Scope</label>
                <select
                  className="select-modern"
                  value={bulkDraft.department}
                  onChange={(event) => setBulkDraft((prev) => ({ ...prev, department: event.target.value }))}
                >
                  <option>All Departments</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.name}>{department.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Course Name*</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g., Security Awareness"
                  value={bulkDraft.course}
                  onChange={(event) => setBulkDraft((prev) => ({ ...prev, course: event.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Due Date*</label>
                <input
                  type="date"
                  className="input-modern"
                  value={bulkDraft.dueDate}
                  onChange={(event) => setBulkDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
              </div>
              <div className="lms-form-full">
                <label className="lms-checkbox-row">
                  <input
                    type="checkbox"
                    checked={bulkDraft.mandatory}
                    onChange={(event) => setBulkDraft((prev) => ({ ...prev, mandatory: event.target.checked }))}
                  />
                  Mark as mandatory for all selected employees
                </label>
              </div>
              <div className="lms-form-full">
                <div className="lms-bulk-preview">
                  <CheckSquare size={16} />
                  <span>{eligibleBulkEmployees.length} employees will receive this assignment</span>
                </div>
              </div>
            </div>

            <div className="lms-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBulkAssignments}>
                <Users size={16} /> Assign To All Matched
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssignLMS;
