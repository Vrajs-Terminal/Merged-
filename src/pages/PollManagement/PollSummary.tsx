import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  PieChart, 
  BarChart, 
  CalendarDays, 
  MoreVertical,
  Clock,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Loader2,
  MessageCircle
} from "lucide-react";
import { pollAPI } from "../../services/apiService";
import "./PollSummary.css";

const PollSummary = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  const [activeTab, setActiveTab] = useState<"Current" | "Past" | "Upcoming">("Current");
  const [searchQuery, setSearchQuery] = useState("");
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await pollAPI.getAll();
      setPolls(res.data);
    } catch (err) {
      console.error("Failed to fetch polls", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      await pollAPI.delete(id);
      fetchPolls();
    } catch (err) {
      alert("Failed to delete poll");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <span className="status-pill active"><div className="pulse"></div> {status}</span>;
      case "Closed": return <span className="status-pill closed"><CheckCircle2 size={12} /> {status}</span>;
      case "Upcoming": return <span className="status-pill upcoming"><Clock size={12} /> {status}</span>;
      default: return null;
    }
  };

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "Current") return matchesSearch && poll.status === "Active";
    if (activeTab === "Past") return matchesSearch && poll.status === "Closed";
    if (activeTab === "Upcoming") return matchesSearch && poll.status === "Upcoming";
    return matchesSearch;
  });

  const totalVotes = polls.reduce((sum, poll) => sum + (poll.options?.reduce((optSum: number, opt: any) => optSum + opt.votes, 0) || 0), 0);

  return (
    <div className="poll-page-container">
      <div className="poll-header">
        <div className="header-text">
          <h1 className="page-title"><MessageCircle size={22} /> Poll Summary</h1>
          <p>Analyze real-time sentiment and decision-making results across the company</p>
        </div>
        <button className="add-btn" onClick={() => setActivePage("addPoll")}>
          <Plus size={18} />
          <span>Create New Poll</span>
        </button>
      </div>

      <div className="poll-analytics-bar mt-4">
        <div className="poll-analytics-card active-polls">
          <div className="poll-a-icon"><MessageSquare size={20} /></div>
          <div className="poll-a-info">
            <span className="poll-a-label">Active Polls</span>
            <span className="poll-a-value">{polls.filter(p => p.status === 'Active').length.toString().padStart(2, '0')}</span>
          </div>
        </div>
        <div className="poll-analytics-card total-votes">
          <div className="poll-a-icon votes"><TrendingUp size={20} /></div>
          <div className="poll-a-info">
            <span className="poll-a-label">Total Votes Cast</span>
            <span className="poll-a-value">{totalVotes.toLocaleString()}</span>
          </div>
        </div>
        <div className="poll-analytics-card completion-rate">
          <div className="poll-a-icon completion"><CheckCircle2 size={20} /></div>
          <div className="poll-a-info">
            <span className="poll-a-label">Avg. Response Rate</span>
            <span className="poll-a-value">82%</span>
          </div>
        </div>
      </div>

      <div className="poll-main-card mt-4">
        <div className="card-toolbar">
          <div className="tab-pill-premium">
            {["Current", "Past", "Upcoming"].map((tab: any) => (
              <button 
                key={tab}
                className={activeTab === tab ? "tab-pill active" : "tab-pill"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-box-elegant">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search polls by question..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper-smooth">
          {loading ? (
             <div className="loading-state p-10 text-center">
                <Loader2 className="animate-spin mx-auto mb-4" size={40} color="var(--primary)" />
                <p>Synchronizing Poll Records...</p>
             </div>
          ) : (
            <table className="poll-table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Poll Question</th>
                  <th>Duration (Start - End)</th>
                  <th>Target For</th>
                  <th>Total Votes</th>
                  <th>Status</th>
                  <th>Reports</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolls.map((record, index) => {
                  const votes = record.options?.reduce((sum: number, opt: any) => sum + opt.votes, 0) || 0;
                  return (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="poll-q-cell">
                          <span className="q-text">{record.question}</span>
                          <div className="p-type-badge">
                            {record.isAnonymous ? "Anonymous Poll" : "Public Poll"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="duration-cell">
                          <CalendarDays size={14} />
                          <span>{new Date(record.startDate).toLocaleDateString()} - {record.endDate ? new Date(record.endDate).toLocaleDateString() : 'Ongoing'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="target-cell">
                          <Clock size={14} />
                          <span>{record.targetAudience}</span>
                        </div>
                      </td>
                      <td>
                        <div className="vote-count-chip">
                          {votes} Votes
                        </div>
                      </td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>
                        <div className="report-btns">
                          <button className="rep-btn pie" title="Pie Chart"><PieChart size={16} /></button>
                          <button className="rep-btn bar" title="Bar Graph"><BarChart size={16} /></button>
                        </div>
                      </td>
                      <td>
                        <div className="action-set">
                          <button className="act-btn delete" onClick={() => handleDelete(record.id)}><Trash2 size={16} /></button>
                          <button className="act-btn more"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPolls.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>No polls found for the selected state.</td>
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

export default PollSummary;
