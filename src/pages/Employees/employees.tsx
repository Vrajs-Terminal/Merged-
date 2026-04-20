import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Eye, Edit, Trash2, Plus, Download, Users, UserCheck, Shield, Clock, Search } from "lucide-react";
import "./employees.css";
import PageTitle from "../../components/PageTitle";
import { branchAPI } from "../../services/apiService";
interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  branch: string;
  department: string;
  email: string;
  mobile: string;
  status: string;
}

function Employees({ setActivePage, setSelectedEmployee }: any) {
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [branches, setBranches] = useState<string[]>(["All"]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/employees`);

      if (!Array.isArray(response.data)) {
        console.error("Expected array but got:", response.data);
        return;
      }

      const fetchedEmployees = response.data
        .map((emp: any) => ({
          ...emp,
          id: emp.employeeId,
        }))
        .filter((emp: any) => emp.status === "Active"); // 🔥 only active employees

      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      const branchData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      const branchNames = branchData
        .map((branch: any) => branch.branchName || branch.name)
        .filter((name: string | undefined): name is string => Boolean(name)) as string[];
      setBranches(["All", ...Array.from(new Set(branchNames))]);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const handleRemove = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      try {
        await axios.put(
          `${API_BASE}/employees/${id}/disable`
        );
        fetchEmployees();
      } catch (error) {
        console.error("Failed to disable employee:", error);
        alert("Failed to remove employee.");
      }
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (selectedBranch === "All" || emp.branch === selectedBranch) &&
      (
        (emp.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
        (emp.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
        (emp.id || "").toLowerCase().includes(search.toLowerCase()) ||
        (emp.email || "").toLowerCase().includes(search.toLowerCase())
      )
  );

  const handleReset = () => {
    setSearch("");
    setSelectedBranch("All");
  };

  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.status === "Active").length;
  const permanentCount = employees.filter(e => e.status === "Permanent").length;
  const probationCount = employees.filter(e => e.status === "Probation").length;

  return (
    <div className="employees-container animate-fade-in">
      <div className="page-header">
        <PageTitle title="Workforce Directory" subtitle="Manage your global talent pool and employee records" />
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset Filters
          </button>
          <button className="btn btn-success">
            <Download size={18} /> Export List
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedEmployee(null);
              setActivePage("addEmployee");
            }}
          >
            <Plus size={18} /> Add New Hire
          </button>
        </div>
      </div>

      <div className="stats-grid animate-children">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Workforce</div>
            <div className="stat-value">{totalCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Talents</div>
            <div className="stat-value">{activeCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Permanent Status</div>
            <div className="stat-value">{permanentCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">On Probation</div>
            <div className="stat-value">{probationCount}</div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6 filter-card">
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by ID, name, email or designation"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Branch</label>
            <select
              className="filter-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        </div>

        <div className="branch-nav-wrapper">
          <div className="branch-nav">
            {branches.map((branch) => (
              <button
                key={branch}
                className={`branch-nav-item ${selectedBranch === branch ? "active" : ""}`}
                onClick={() => setSelectedBranch(branch)}
              >
                {branch}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrapper glass-card">
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }} className="flex-col flex-center">
            <div className="spinner mb-4"></div>
            <p className="text-muted">Connecting to employee database...</p>
          </div>
        ) : (
          <table className="table-modern">
            <thead>
              <tr>
                <th>Employee / Role</th>
                <th>Branch</th>
                <th>Email & Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm bg-primary text-white font-bold">
                        {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                      </div>
                      <div className="flex-col">
                        <span className="font-bold text-slate-900 leading-tight">{(emp.firstName || "")} {(emp.lastName || "")}</span>
                        <span className="text-xs text-muted leading-tight">{emp.designation || "No Title"} • {emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-slate-700">{emp.branch}</div>
                    <div className="text-xs text-muted">{emp.department}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium">{emp.email}</div>
                    <div className="text-xs text-muted">{emp.mobile}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${emp.status?.toLowerCase() || 'pending'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        className="act-btn view"
                        title="View Full Profile"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setActivePage("viewEmployee");
                        }}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="act-btn edit"
                        title="Quick Edit"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setActivePage("addEmployee");
                        }}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="act-btn delete"
                        title="Terminate / Disable"
                        onClick={() => handleRemove(emp.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "60px" }}>
                    <div className="flex-col flex-center text-muted">
                       <Users size={48} className="opacity-20 mb-4" />
                       <p className="text-lg font-bold">No Records Matched</p>
                       <p>Refine your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default Employees;