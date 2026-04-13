import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  BarChart3, 
  Calendar, 
  Users, 
  MoreVertical,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  ClipboardList
} from "lucide-react";
import { surveyAPI } from "../../services/apiService";
import "./ManageSurvey.css";

const ManageSurvey = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  const [activeTab, setActiveTab] = useState<"Current" | "Past" | "Draft">("Current");
  const [searchQuery, setSearchQuery] = useState("");
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, [activeTab]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend tab to backend status if needed, or filter frontend
      let statusFilter = "";
      if (activeTab === "Current") statusFilter = "Active";
      else if (activeTab === "Past") statusFilter = "Completed";
      else if (activeTab === "Draft") statusFilter = "Draft";

      const res = await surveyAPI.getAll({ status: statusFilter });
      setSurveys(res.data);
    } catch (err: any) {
      setError("Failed to load surveys. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      try {
        await surveyAPI.delete(id);
        setSurveys(surveys.filter(s => s.id !== id));
      } catch (err) {
        alert("Failed to delete survey");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <span className="status-badge active"><CheckCircle2 size={12} /> {status}</span>;
      case "Completed": return <span className="status-badge completed"><Calendar size={12} /> {status}</span>;
      case "Inactive": return <span className="status-badge inactive"><Clock size={12} /> {status}</span>;
      case "Draft": return <span className="status-badge draft"><Edit3 size={12} /> {status}</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.targetAudience.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="survey-page-container">
      <div className="survey-header">
        <div className="header-text">
          <h1 className="page-title"><ClipboardList size={22} /> Manage Surveys</h1>
          <p>Track participation, monitor response rates, and analyze survey results</p>
        </div>
        <button className="add-btn" onClick={() => setActivePage("addSurvey")}>
          <Plus size={18} />
          <span>Create New Survey</span>
        </button>
      </div>

      <div className="survey-stats-grid mt-4">
        <div className="stat-card stats-active">
          <div className="stat-bg"><CheckCircle2 size={100} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Surveys</span>
            <span className="stat-value">{surveys.filter(s => s.status === 'Active').length.toString().padStart(2, '0')}</span>
          </div>
        </div>
        <div className="stat-card stats-participation">
          <div className="stat-bg"><Users size={100} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Responses</span>
            <span className="stat-value">
              {surveys.reduce((acc, curr) => acc + (curr._count?.responses || 0), 0)}
            </span>
          </div>
        </div>
        <div className="stat-card stats-feedback">
          <div className="stat-bg"><MessageSquare size={100} /></div>
          <div className="stat-content">
            <span className="stat-label">Survey Questions</span>
            <span className="stat-value">
              {surveys.reduce((acc, curr) => acc + (curr._count?.questions || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="survey-main-card mt-4">
        <div className="card-toolbar">
          <div className="tab-pill-group">
            {["Current", "Past", "Draft"].map((tab: any) => (
              <button 
                key={tab}
                className={activeTab === tab ? "tab-pill active" : "tab-pill"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-box-premium">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search surveys by title or audience..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader2 className="animate-spin" size={40} />
              <p>Loading surveys...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <AlertCircle size={40} />
              <p>{error}</p>
              <button onClick={fetchSurveys} className="retry-btn">Retry</button>
            </div>
          ) : (
            <table className="survey-table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Survey Information</th>
                  <th>Start Date</th>
                  <th>Target Audience</th>
                  <th>Questions</th>
                  <th>Responses</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.length > 0 ? (
                  filteredSurveys.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="survey-title-box">
                          <span className="survey-title-text">{record.title}</span>
                          <div className="privacy-badge">
                            {record.isAnonymous ? "Anonymous Feedback" : "Identified Feedback"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={14} />
                          <span>{new Date(record.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>
                        <div className="for-cell">
                          <Users size={14} />
                          <span>{record.targetAudience}</span>
                        </div>
                      </td>
                      <td>
                        <span className="count-badge">{record._count?.questions || 0}</span>
                      </td>
                      <td>
                         <span className="count-badge responses">{record._count?.responses || 0}</span>
                      </td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        <div className="action-row">
                          <button className="act-btn edit" title="Edit Survey"><Edit3 size={16} /></button>
                          <button className="act-btn view" title="View Results"><BarChart3 size={16} /></button>
                          <button className="act-btn delete" title="Delete Survey" onClick={() => handleDelete(record.id)}><Trash2 size={16} /></button>
                          <button className="act-btn more"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No surveys found for "{activeTab}" status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSurvey;
