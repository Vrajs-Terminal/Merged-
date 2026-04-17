import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Table as TableIcon, LayoutGrid, 
  Search, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, MapPin, Clock, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eventAPI, branchAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./ViewEvents.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface ViewEventsProps {
  setActivePage?: (page: string) => void;
  setSelectedEvent?: (event: any) => void;
}

const ViewEvents: React.FC<ViewEventsProps> = ({ setActivePage, setSelectedEvent }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<"Table" | "Card" | "Calendar">("Card");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

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

  const openEventEditor = (event: any | null) => {
    setSelectedEvent?.(event);
    setActivePage?.("addEvent");
    navigate("/modules/addEvent");
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

  const filteredEvents = events.filter((event) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [
      event.eventName,
      event.eventType,
      event.location,
      event.status,
      event.description,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const openCreateEvent = () => openEventEditor(null);

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
          {filteredEvents.map((ev, i) => (
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
                  <button className="action-btn" title="View Details" onClick={() => openEventEditor(ev)}><Eye size={14} /></button>
                  <button className="action-btn" title="Edit" onClick={() => openEventEditor(ev)}><Edit size={14} /></button>
                  <button className="action-btn" title="Delete" onClick={() => handleDelete(ev.id)}><Trash2 size={14} color="#ef4444" /></button>
                </div>
              </td>
            </tr>
          ))}
          {filteredEvents.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>No events found</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginTop: "24px" }}>
      {filteredEvents.map(ev => (
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
              <button className="btn-primary" style={{ flex: 1, padding: "8px" }} onClick={() => openEventEditor(ev)}>View Details</button>
              <button className="btn-secondary" style={{ padding: "8px" }} onClick={() => openEventEditor(ev)}><Edit size={16} /></button>
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
        return filteredEvents.filter(ev => {
            const d = new Date(ev.startDate);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const totalMonthEvents = filteredEvents.filter((event) => {
      const date = new Date(event.startDate);
      return date.getMonth() === month && date.getFullYear() === year;
    }).length;

    const upcomingMonthEvents = filteredEvents.filter((event) => {
      const date = new Date(event.startDate);
      return date >= today && date.getMonth() === month && date.getFullYear() === year;
    }).length;

    const handleMonthShift = (offset: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
      <div className="glass-card animate-slide-up events-calendar-card" style={{ marginTop: "24px", padding: "24px" }}>
        <div className="events-calendar-header">
          <div className="events-calendar-title">
            <div className="events-calendar-nav-group">
              <button className="events-month-nav-btn" onClick={() => handleMonthShift(-1)} aria-label="Previous month">
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <div>
                <h3 className="events-calendar-month">{MONTHS[month]} {year}</h3>
                <p className="events-calendar-subtitle">{totalMonthEvents} events this month, {upcomingMonthEvents} upcoming</p>
              </div>
              <button className="events-month-nav-btn" onClick={() => handleMonthShift(1)} aria-label="Next month">
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <button className="btn-secondary events-calendar-today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
        </div>

        <div className="events-calendar-grid">
          {DAYS.map(d => <div key={d} className="events-calendar-weekday">{d}</div>)}
          {cells.map((day, i) => {
            const dayEvents = day ? getDayEvents(day) : [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={i} className={`events-calendar-day${isToday ? " is-today" : ""}${day ? " has-day" : " is-empty"}`}>
                {day && (
                  <>
                    <div className="events-calendar-day-top">
                       <span className="events-calendar-day-number">{day}</span>
                       {dayEvents.length > 0 && <span className="events-calendar-day-count">{dayEvents.length}</span>}
                    </div>
                    {dayEvents.map(ev => (
                      <div key={ev.id} className="calendar-event-item events-calendar-event" style={{ borderLeftColor: getStatusColor(ev.status), color: getStatusColor(ev.status) }} onClick={() => openEventEditor(ev)}>
                        <span className="events-calendar-event-dot" style={{ background: getStatusColor(ev.status) }} />
                        <span className="events-calendar-event-label">{ev.eventName}</span>
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
    <div className="main-content animate-fade-in events-page-container">
      <div className="events-header">
        <div className="events-title-block">
          <div className="events-title-row">
            <CalendarIcon size={24} className="events-title-icon" />
            <h1 className="page-title">Events</h1>
          </div>
          <p className="page-subtitle">Manage company meetings, trainings, and celebrations</p>
        </div>
        <button className="btn-primary" onClick={openCreateEvent}>
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div className="events-toolbar-card">
        <div className="events-view-switcher">
          <button className={view === "Card" ? "active" : ""} onClick={() => setView("Card")}><LayoutGrid size={16} /> Card</button>
          <button className={view === "Table" ? "active" : ""} onClick={() => setView("Table")}><TableIcon size={16} /> Table</button>
          <button className={view === "Calendar" ? "active" : ""} onClick={() => setView("Calendar")}><CalendarIcon size={16} /> Calendar</button>
        </div>
        <div className="events-filters-row">
           <select className="select-modern" style={{ width: "160px" }} value={filters.eventType} onChange={e => setFilters({...filters, eventType: e.target.value})}>
              <option value="All">All Types</option>
              <option value="Meeting">Meeting</option>
              <option value="Training">Training</option>
              <option value="Celebration">Celebration</option>
              <option value="Webinar">Webinar</option>
           </select>
           <div className="events-search-wrap">
              <Search size={16} className="events-search-icon" />
              <input type="text" className="input-modern events-search-input" style={{ paddingLeft: "36px" }} placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

