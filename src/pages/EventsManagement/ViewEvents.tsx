import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Table as TableIcon, LayoutGrid, 
  Search, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, MapPin, Clock, Zap
} from "lucide-react";
import { eventAPI, branchAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface ViewEventsProps {
  setActivePage: (page: string) => void;
  setSelectedEvent: (event: any) => void;
}

const ViewEvents: React.FC<ViewEventsProps> = ({ setActivePage, setSelectedEvent }) => {
  const [view, setView] = useState<"Table" | "Card" | "Calendar">("Card");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    eventType: "All",
    branchId: "All",
    departmentId: "All"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evRes, brRes, depRes] = await Promise.all([
        eventAPI.getAll(filters),
        branchAPI.getAll(),
        departmentAPI.getAll()
      ]);
      setEvents(evRes.data);
      setBranches(brRes.data);
      setDepartments(depRes.data);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventAPI.delete(id);
        toast.success("Event deleted");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete event");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "#6366f1";
      case "Ongoing": return "#10b981";
      case "Completed": return "#64748b";
      case "Cancelled": return "#ef4444";
      default: return "var(--primary)";
    }
  };

  const renderTableView = () => (
    <div className="glass-card animate-slide-up" style={{ marginTop: "24px" }}>
      <table className="table-modern">
        <thead>
          <tr>
            <th>#</th>
            <th>Event Name</th>
            <th>Type</th>
            <th>Date & Time</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, i) => (
            <tr key={ev.id}>
              <td>{i + 1}</td>
              <td style={{ fontWeight: "600" }}>{ev.eventName}</td>
              <td><span className="badge badge-primary-light">{ev.eventType}</span></td>
              <td>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{new Date(ev.startDate).toLocaleDateString()}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ev.startTime} - {ev.endTime}</span>
                </div>
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                   {ev.locationType === "Online" ? <Clock size={12} /> : <MapPin size={12} />}
                   {ev.location}
                </div>
              </td>
              <td><span className="badge" style={{ background: getStatusColor(ev.status) + "20", color: getStatusColor(ev.status) }}>{ev.status}</span></td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="action-btn" title="View Details" onClick={() => { setSelectedEvent(ev); setActivePage("addEvent"); }}><Eye size={14} /></button>
                  <button className="action-btn" title="Edit" onClick={() => { setSelectedEvent(ev); setActivePage("addEvent"); }}><Edit size={14} /></button>
                  <button className="action-btn" title="Delete" onClick={() => handleDelete(ev.id)}><Trash2 size={14} color="#ef4444" /></button>
                </div>
              </td>
            </tr>
          ))}
          {events.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>No events found</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginTop: "24px" }}>
      {events.map(ev => (
        <div key={ev.id} className="glass-card animate-scale-up" style={{ padding: "0", overflow: "hidden", position: "relative", border: `1px solid ${getStatusColor(ev.status)}20` }}>
          <div style={{ height: "120px", background: `linear-gradient(135deg, ${getStatusColor(ev.status)}30 0%, ${getStatusColor(ev.status)}05 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <CalendarIcon size={48} color={getStatusColor(ev.status)} />
          </div>
          <div className="badge" style={{ position: "absolute", top: "12px", right: "12px", background: "white", color: getStatusColor(ev.status), fontWeight: "700", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            {ev.status}
          </div>
          <div style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{ev.eventName}</h3>
            <div className="badge badge-primary-light" style={{ marginBottom: "16px" }}>{ev.eventType}</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarIcon size={14} /> {new Date(ev.startDate).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={14} /> {ev.startTime} - {ev.endTime}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={14} /> {ev.location}
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
              <button className="btn-primary" style={{ flex: 1, padding: "8px" }} onClick={() => { setSelectedEvent(ev); setActivePage("addEvent"); }}>View Details</button>
              <button className="btn-secondary" style={{ padding: "8px" }} onClick={() => { setSelectedEvent(ev); setActivePage("addEvent"); }}><Edit size={16} /></button>
              <button className="btn-secondary" style={{ padding: "8px", color: "#ef4444" }} onClick={() => handleDelete(ev.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = () => {
    const today = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const getDayEvents = (day: number) => {
        return events.filter(ev => {
            const d = new Date(ev.startDate);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    return (
      <div className="glass-card animate-slide-up" style={{ marginTop: "24px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="action-btn" onClick={() => setCurrentDate(new Date(currentDate.setMonth(month - 1)))}><ChevronLeft size={16} /></button>
            <h3 style={{ margin: 0, minWidth: "150px", textAlign: "center" }}>{MONTHS[month]} {year}</h3>
            <button className="action-btn" onClick={() => setCurrentDate(new Date(currentDate.setMonth(month + 1)))}><ChevronRight size={16} /></button>
          </div>
          <button className="btn-secondary" onClick={() => setCurrentDate(new Date())}>Today</button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#e2e8f0", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          {DAYS.map(d => <div key={d} style={{ background: "#f8fafc", padding: "12px", textAlign: "center", fontWeight: "700", fontSize: "12px", color: "#64748b" }}>{d}</div>)}
          {cells.map((day, i) => {
            const dayEvents = day ? getDayEvents(day) : [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={i} style={{ background: day ? "white" : "#f8fafc", minHeight: "120px", padding: "8px" }}>
                {day && (
                  <>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                       <span style={{ 
                         width: "24px", height: "24px", borderRadius: "50%", 
                         display: "flex", alignItems: "center", justifyContent: "center", 
                         fontSize: "12px", fontWeight: "700",
                         background: isToday ? "var(--primary)" : "transparent",
                         color: isToday ? "white" : "inherit"
                       }}>{day}</span>
                    </div>
                    {dayEvents.map(ev => (
                      <div key={ev.id} className="calendar-event-item" style={{ 
                        background: getStatusColor(ev.status) + "15", 
                        color: getStatusColor(ev.status), 
                        fontSize: "10px", padding: "4px 6px", borderRadius: "4px", fontWeight: "600",
                        marginBottom: "4px", borderLeft: `2px solid ${getStatusColor(ev.status)}`,
                        cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }} onClick={() => { setSelectedEvent(ev); setActivePage("addEvent"); }}>
                        {ev.eventName}
                      </div>
                    ))}
                  </>
                )}
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
          <PageTitle title="Events" subtitle="Manage company meetings, trainings, and celebrations" />
        </div>
        <button className="btn-primary" onClick={() => { setSelectedEvent(null); setActivePage("addEvent"); }}>
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <div className="glass-card" style={{ padding: "6px", borderRadius: "12px", display: "flex", gap: "8px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", transition: "all 0.2s", minWidth: "100px", justifyContent: "center", background: view === "Card" ? "white" : "transparent", color: view === "Card" ? "var(--primary)" : "var(--text-muted)", boxShadow: view === "Card" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }} onClick={() => setView("Card")}><LayoutGrid size={16} /> Card</button>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", transition: "all 0.2s", minWidth: "100px", justifyContent: "center", background: view === "Table" ? "white" : "transparent", color: view === "Table" ? "var(--primary)" : "var(--text-muted)", boxShadow: view === "Table" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }} onClick={() => setView("Table")}><TableIcon size={16} /> Table</button>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", transition: "all 0.2s", minWidth: "100px", justifyContent: "center", background: view === "Calendar" ? "white" : "transparent", color: view === "Calendar" ? "var(--primary)" : "var(--text-muted)", boxShadow: view === "Calendar" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }} onClick={() => setView("Calendar")}><CalendarIcon size={16} /> Calendar</button>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
           <select className="select-modern" style={{ width: "160px" }} value={filters.eventType} onChange={e => setFilters({...filters, eventType: e.target.value})}>
              <option value="All">All Types</option>
              <option value="Meeting">Meeting</option>
              <option value="Training">Training</option>
              <option value="Celebration">Celebration</option>
              <option value="Webinar">Webinar</option>
           </select>
           <div style={{ position: "relative" }}>
              <input type="text" className="input-modern" style={{ paddingLeft: "36px" }} placeholder="Search events..." />
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
           </div>
        </div>
      </div>

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><Plus className="animate-spin" /></div> : (
        <>
          {view === "Table" && renderTableView()}
          {view === "Card" && renderCardView()}
          {view === "Calendar" && renderCalendarView()}
        </>
      )}
    </div>
  );
};

export default ViewEvents;

