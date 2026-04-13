import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Eye, Edit, RotateCcw, History } from "lucide-react";
import "./exEmployees.css";
import PageTitle from "../../components/PageTitle";

interface ExEmployee {
  id: string; // our mapped ID for rendering
  employeeId: string; // real ID
  firstName: string;
  lastName: string;
  designation: string;
  branch: string;
  department: string;
  exitDate: string;
  reason: string;
  eligibleForRehire: boolean;
}

function ExEmployees({ setActivePage, setSelectedEmployee }: any) {

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [exitFilter, setExitFilter] = useState("");

  const [employees, setEmployees] = useState<ExEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/exemployees`);
      if (!Array.isArray(response.data)) {
        console.error("Expected array but got:", response.data);
        return;
      }
      const mapped = response.data.map((emp: any) => ({
        ...emp,
        id: emp.employeeId, // Use employeeId as ID
        exitDate: emp.exitDate ? emp.exitDate.split('T')[0] : "N/A"
      }));
      setEmployees(mapped);
    } catch (error) {
      console.error("Error fetching ex-employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExEmployees();
  }, []);

  const handleReactivate = async (id: string) => {
    if (window.confirm("Are you sure you want to reactivate this employee?")) {
      try {
        await axios.put(`${API_BASE}/employees/${id}/reactivate`);
        fetchExEmployees();
      } catch (error) {
        console.error("Failed to reactivate employee:", error);
        alert("Failed to reactivate employee.");
      }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    (
      (emp.firstName && emp.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(search.toLowerCase())) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase())
    ) &&
    (exitFilter === "" || emp.reason === exitFilter)
  );

  return (
    <div className="ex-container animate-fade-in">
      <div className="page-header">
        <PageTitle 
          title="Ex-Employees" 
          subtitle="Manage former employees and reactivation records" 
        />
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => { setSearch(""); setExitFilter(""); }}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid animate-children">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <History size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Ex-Employees</div>
            <div className="stat-value">{employees.length}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <RotateCcw size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Eligible for Rehire</div>
            <div className="stat-value">{employees.filter(e => e.eligibleForRehire).length}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card mb-6">
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-group-label">Search Name / ID</label>
            <input
              className="form-group-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-group-label">Exit Type</label>
            <select 
              className="form-group-select"
              value={exitFilter} 
              onChange={(e) => setExitFilter(e.target.value)}
            >
              <option value="">All Reasons</option>
              <option>Resigned</option>
              <option>Terminated</option>
              <option>Retired</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-group-label">Filter Month/Year</label>
            <div className="flex gap-2">
              <select className="form-group-select" value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">Month</option>
                <option>January</option><option>February</option><option>March</option>
              </select>
              <select className="form-group-select" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Year</option>
                <option>2024</option><option>2025</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper glass-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }} className="flex-col flex-center">
            <div className="spinner mb-4"></div>
            <p className="text-muted">Loading archive records...</p>
          </div>
        ) : (
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Exit Date</th>
                <th>Reason</th>
                <th>Eligible</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.employeeId}>
                  <td className="font-bold">{emp.employeeId}</td>
                  <td>
                    <div className="font-semibold">{emp.firstName} {emp.lastName}</div>
                  </td>
                  <td>{emp.designation}</td>
                  <td>{emp.department}</td>
                  <td>{emp.exitDate}</td>
                  <td>
                    <span className={`status-badge ${emp.reason?.toLowerCase() || 'pending'}`}>
                      {emp.reason || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${emp.eligibleForRehire ? "completed" : "failed"}`}>
                      {emp.eligibleForRehire ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="act-btn view"
                        title="View Profile"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setActivePage("viewEmployee");
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="act-btn edit"
                        title="Edit Details"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setActivePage("addEmployee");
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="act-btn view"
                        title="Reactivate Employee"
                        onClick={() => handleReactivate(emp.employeeId)}
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="flex-col flex-center text-muted">
                      <History size={48} className="mb-4 opacity-20" />
                      <p>No archived employees found matching filters.</p>
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

export default ExEmployees;