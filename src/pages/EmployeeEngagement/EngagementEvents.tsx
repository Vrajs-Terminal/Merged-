import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Table as TableIcon, 
  User, 
  MapPin, 
  Briefcase, 
  Clock, 
  Search, 
  Gift, 
  Send, 
  Filter, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Smartphone,
  LayoutGrid,
  Bell,
  Heart
} from "lucide-react";
import { engagementAPI, branchAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const EngagementEvents: React.FC = () => {
  const [view, setView] = useState<"Table" | "Card" | "Calendar">("Card");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    branch: "All",
    department: "All",
    employee: "",
    eventType: "All",
    days: "30"
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchFilters = async () => {
    try {
      const [br, de] = await Promise.all([branchAPI.getAll(), departmentAPI.getAll()]);
      setBranches(br.data);
      setDepartments(de.data);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await engagementAPI.getUpcomingEvents(filters);
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleWish = (event: any) => {
    toast.success(`Wish sent to ${event.name}! ðŸŽ‰`);
    // Implementation would trigger WhatsApp/Email API call
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "Birthday": return "ðŸŽ‚";
      case "Work Anniversary": return "ðŸŽŠ";
      case "Wedding Anniversary": return "â¤ï¸";
      default: return "ðŸŽ‰";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "Birthday": return "#ef4444";
      case "Work Anniversary": return "#6366f1";
      case "Wedding Anniversary": return "#ec4899";
      default: return "var(--primary)";
    }
  };

  const renderTableView = () => (
    <div className="glass-card" style={{ marginTop: "20px" }}>
      <table className="table-modern">
        <thead>
          <tr>
            <th>#</th>
            <th>Employee Name</th>
            <th>Event Type</th>
            <th>Date</th>
            <th>Days Left</th>
            <th>Branch</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, idx) => (
            <tr key={idx} style={ev.daysLeft === 0 ? { background: "rgba(239, 68, 68, 0.05)" } : {}}>
              <td>{idx + 1}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px" }}>
                    {ev.name.split(' ').map((n:any)=>n[0]).join('')}
                  </div>
                  <span>{ev.name}</span>
                  {ev.daysLeft === 0 && <span className="badge badge-danger" style={{ fontSize: "10px", padding: "2px 6px" }}>Today</span>}
                </div>
              </td>
              <td>
                <span className="badge badge-primary-light" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {getEventIcon(ev.eventType)} {ev.eventType}
                </span>
              </td>
              <td style={{ fontSize: "14px", fontWeight: "500" }}>{new Date(ev.date).toLocaleDateString()}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: ev.daysLeft === 0 ? "#ef4444" : "var(--text-muted)", fontWeight: "600" }}>
                  <Clock size={14} /> {ev.daysLeft === 0 ? "Today" : `${ev.daysLeft} days`}
                </div>
              </td>
              <td style={{ fontSize: "13px" }}>{ev.branch || "â€”"}</td>
              <td style={{ fontSize: "13px" }}>{ev.department || "â€”"}</td>
              <td>
                <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px", gap: "4px" }} onClick={() => handleWish(ev)}>
                  <Send size={12} /> Wish
                </button>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No upcoming events in the selected filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "24px" }}>
      {events.map((ev, idx) => (
        <div key={idx} className="glass-card animate-scale-up" style={{ padding: "20px", position: "relative", overflow: "hidden", border: ev.daysLeft === 0 ? `2px solid ${getEventColor(ev.eventType)}` : undefined }}>
          {ev.daysLeft === 0 && (
            <div style={{ position: "absolute", top: "10px", right: "-30px", background: "#ef4444", color: "white", padding: "4px 30px", fontSize: "10px", fontWeight: "700", transform: "rotate(45deg)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              TODAY'S EVENT
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "28px", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {ev.name.split(' ').map((n:any)=>n[0]).join('')}
              </div>
              <div style={{ position: "absolute", bottom: "0", right: "0", background: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", fontSize: "18px" }}>
                {getEventIcon(ev.eventType)}
              </div>
            </div>
            <div>
              <h3 style={{ margin: "0", fontSize: "18px" }}>{ev.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 8px 0" }}>{ev.eventType}</p>
              <div className="badge badge-primary-light" style={{ fontSize: "14px", fontWeight: "600" }}>{new Date(ev.date).toLocaleDateString()}</div>
            </div>
            <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "8px" }}>
              <button className="btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "13px" }} title="Quick Profile View">
                <User size={14} /> Profile
              </button>
              <button className="btn-primary" style={{ flex: 1.5, padding: "8px", fontSize: "13px", background: getEventColor(ev.eventType) }} onClick={() => handleWish(ev)}>
                <Gift size={14} /> Wish Now ðŸŽ‰
              </button>
            </div>
            <div style={{ marginTop: "12px", width: "100%", textAlign: "left", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={10} /> {ev.branch || "â€”"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Briefcase size={10} /> {ev.department || "â€”"}
              </div>
              <div style={{ fontSize: "11px", gridColumn: "span 2", display: "flex", alignItems: "center", gap: "4px" }}>
                <Smartphone size={10} /> {ev.mobile || "â€”"}
              </div>
            </div>
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <Gift size={64} opacity={0.1} style={{ marginBottom: "16px" }} />
          <p>No celebrations found for this period.</p>
        </div>
      )}
    </div>
  );

  const renderCalendarView = () => {
    const today = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const getDayEvents = (day: number) => {
        if (!day) return [];
        return events.filter(ev => {
            const evDate = new Date(ev.date);
            return evDate.getDate() === day && evDate.getMonth() === month - 1 && evDate.getFullYear() === year;
        });
    };

    return (
        <div className="glass-card" style={{ marginTop: "24px", padding: "24px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button className="action-btn" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={16} /></button>
                    <h3 style={{ margin: 0, minWidth: "150px", textAlign: "center" }}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button className="action-btn" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={16} /></button>
                 </div>
                 <button className="btn-secondary" onClick={() => setCurrentDate(new Date())}>Today</button>
             </div>
             
             <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#e2e8f0", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                 {DAYS.map(d => <div key={d} style={{ background: "#f8fafc", padding: "12px", textAlign: "center", fontWeight: "700", fontSize: "12px", color: "#64748b" }}>{d}</div>)}
                 {cells.map((day, i) => {
                     if (!day) return <div key={i} style={{ background: "#f8fafc", minHeight: "100px" }} />;
                     const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                     const evs = getDayEvents(day);
                     return (
                         <div key={i} style={{ background: "white", minHeight: "100px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <span style={{ 
                                    width: "24px", height: "24px", borderRadius: "50%", 
                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                    fontSize: "12px", fontWeight: "700",
                                    background: isToday ? "var(--primary)" : "transparent",
                                    color: isToday ? "white" : "inherit"
                                }}>{day}</span>
                             </div>
                             {evs.map((ev, eIdx) => (
                                 <div key={eIdx} style={{ 
                                     background: getEventColor(ev.eventType) + "15", 
                                     color: getEventColor(ev.eventType), 
                                     fontSize: "10px", 
                                     padding: "4px 6px", 
                                     borderRadius: "4px",
                                     fontWeight: "600",
                                     display: "flex",
                                     alignItems: "center",
                                     gap: "2px",
                                     whiteSpace: "nowrap",
                                     overflow: "hidden",
                                     textOverflow: "ellipsis",
                                     borderLeft: `2px solid ${getEventColor(ev.eventType)}`
                                 }} title={`${getEventIcon(ev.eventType)} ${ev.name} - ${ev.eventType}`}>
                                     {getEventIcon(ev.eventType)} {ev.name.split(' ')[0]}
                                 </div>
                             ))}
                         </div>
                     );
                 })}
             </div>
        </div>
    );
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <PageTitle title="Employee Engagement" subtitle="Track and celebrate employee life events and milestones" />
        </div>
        <div className="glass-card" style={{ padding: "4px", borderRadius: "10px", display: "flex", gap: "4px" }}>
          <button className={`action-btn ${view === "Card" ? "active" : ""}`} onClick={() => setView("Card")} style={{ padding: "8px 16px", borderRadius: "8px", background: view === "Card" ? "var(--primary)" : "transparent", color: view === "Card" ? "white" : "inherit" }}>
            <LayoutGrid size={16} /> Card
          </button>
          <button className={`action-btn ${view === "Table" ? "active" : ""}`} onClick={() => setView("Table")} style={{ padding: "8px 16px", borderRadius: "8px", background: view === "Table" ? "var(--primary)" : "transparent", color: view === "Table" ? "white" : "inherit" }}>
            <TableIcon size={16} /> Table
          </button>
          <button className={`action-btn ${view === "Calendar" ? "active" : ""}`} onClick={() => setView("Calendar")} style={{ padding: "8px 16px", borderRadius: "8px", background: view === "Calendar" ? "var(--primary)" : "transparent", color: view === "Calendar" ? "white" : "inherit" }}>
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginTop: "24px" }}>
          <div className="glass-card" style={{ padding: "20px", borderLeft: "4px solid #ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500", margin: 0 }}>Upcoming Birthdays</p>
                      <h2 style={{ fontSize: "28px", margin: "4px 0" }}>{events.filter(e => e.eventType === "Birthday").length}</h2>
                  </div>
                  <div style={{ background: "#fef2f2", color: "#ef4444", padding: "10px", borderRadius: "12px" }}>
                      <Gift size={24} />
                  </div>
              </div>
          </div>
          <div className="glass-card" style={{ padding: "20px", borderLeft: "4px solid #6366f1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500", margin: 0 }}>Work Anniversaries</p>
                      <h2 style={{ fontSize: "28px", margin: "4px 0" }}>{events.filter(e => e.eventType === "Work Anniversary").length}</h2>
                  </div>
                  <div style={{ background: "#eef2ff", color: "#6366f1", padding: "10px", borderRadius: "12px" }}>
                      <TrendingUp size={24} />
                  </div>
              </div>
          </div>
          <div className="glass-card" style={{ padding: "20px", borderLeft: "4px solid #ec4899" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500", margin: 0 }}>Wedding Anniversaries</p>
                      <h2 style={{ fontSize: "28px", margin: "4px 0" }}>{events.filter(e => e.eventType === "Wedding Anniversary").length}</h2>
                  </div>
                  <div style={{ background: "#fdf2f8", color: "#ec4899", padding: "10px", borderRadius: "12px" }}>
                      <Loader2 size={24} />
                  </div>
              </div>
          </div>
          <div className="glass-card" style={{ padding: "20px", borderLeft: "4px solid #10b981" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500", margin: 0 }}>Total Events (30 Days)</p>
                      <h2 style={{ fontSize: "28px", margin: "4px 0" }}>{events.length}</h2>
                  </div>
                  <div style={{ background: "#ecfdf5", color: "#10b981", padding: "10px", borderRadius: "12px" }}>
                      <CalendarIcon size={24} />
                  </div>
              </div>
          </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ marginTop: "24px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Filter size={20} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Advanced Filters</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div>
                  <label className="input-label">Branch</label>
                  <select className="select-modern" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
                      <option value="All">All Branches</option>
                      {branches.map(b => <option key={b.id} value={b.branchName}>{b.branchName}</option>)}
                  </select>
              </div>
              <div>
                  <label className="input-label">Department</label>
                  <select className="select-modern" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                      <option value="All">All Departments</option>
                      {departments.map(d => <option key={d.id} value={d.departmentName}>{d.departmentName}</option>)}
                  </select>
              </div>
              <div>
                  <label className="input-label">Event Type</label>
                  <select className="select-modern" value={filters.eventType} onChange={e => setFilters({...filters, eventType: e.target.value})}>
                      <option value="All">All Events</option>
                      <option value="Birthday">ðŸŽ‚ Birthday</option>
                      <option value="Work Anniversary">ðŸŽŠ Work Anniversary</option>
                      <option value="Wedding Anniversary">â¤ï¸ Wedding Anniversary</option>
                  </select>
              </div>
              <div>
                <label className="input-label">Display Period</label>
                <select className="select-modern" value={filters.days} onChange={e => setFilters({...filters, days: e.target.value})}>
                    <option value="7">Next 7 Days</option>
                    <option value="15">Next 15 Days</option>
                    <option value="30">Next 30 Days</option>
                    <option value="60">Next 60 Days</option>
                    <option value="90">Next 90 Days</option>
                </select>
              </div>
              <div>
                  <label className="input-label">Search Employee</label>
                  <div style={{ position: "relative" }}>
                      <input type="text" className="input-modern" placeholder="Employee name..." value={filters.employee} onChange={e => setFilters({...filters, employee: e.target.value})} style={{ paddingLeft: "36px" }} />
                      <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
      ) : (
        <>
            {view === "Table" && renderTableView()}
            {view === "Card" && renderCardView()}
            {view === "Calendar" && renderCalendarView()}
        </>
      )}

      {/* Quick Settings Section */}
      <div className="glass-card" style={{ marginTop: "40px", padding: "24px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                    <Bell size={24} color="var(--primary)" />
                  </div>
                  <div>
                      <h3 style={{ margin: 0 }}>Automated Notifications</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0 0" }}>Receive daily updates on upcoming employee milestones</p>
                  </div>
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>DAILY REPORT</span>
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", padding: "4px", borderRadius: "8px" }}>
                          <button style={{ padding: "4px 12px", borderRadius: "6px", border: "none", background: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>ON</button>
                          <button style={{ padding: "4px 12px", borderRadius: "6px", border: "none", background: "transparent", fontSize: "12px", fontWeight: "600", cursor: "pointer", color: "var(--text-muted)" }}>OFF</button>
                      </div>
                  </div>
                  <button className="btn-secondary" style={{ padding: "8px 16px" }}>Configure Channels</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default EngagementEvents;

