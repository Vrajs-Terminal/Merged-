import React, { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Briefcase,
  Building2,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Gift,
  Heart,
  LayoutGrid,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Table as TableIcon,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { branchAPI, departmentAPI, engagementAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./EngagementEvents.css";

type ViewMode = "Card" | "Table" | "Calendar";

interface EngagementEvent {
  id?: number | string;
  employeeId?: number;
  name: string;
  eventType: string;
  date: string;
  daysLeft?: number;
  branch?: string;
  department?: string;
  mobile?: string;
}

interface OptionItem {
  id: number | string;
  branchName?: string;
  departmentName?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const INITIAL_FILTERS = {
  branch: "All",
  department: "All",
  employee: "",
  eventType: "All",
  days: "30",
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const getInitials = (name: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NA";

const safeList = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown[] }).data)) {
    return ((value as { data: T[] }).data) ?? [];
  }
  return [];
};

const EngagementEvents: React.FC = () => {
  const [view, setView] = useState<ViewMode>("Card");
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<OptionItem[]>([]);
  const [departments, setDepartments] = useState<OptionItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EngagementEvent | null>(null);
  const [showChannelModal, setShowChannelModal] = useState<boolean>(false);
  const [dailyReportEnabled, setDailyReportEnabled] = useState<boolean>(true);
  const [channelConfig, setChannelConfig] = useState({
    email: true,
    whatsapp: true,
    app: true,
  });

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchFilters = async () => {
    try {
      const [branchRes, departmentRes] = await Promise.all([branchAPI.getAll(), departmentAPI.getAll()]);
      setBranches(safeList<OptionItem>(branchRes.data));
      setDepartments(safeList<OptionItem>(departmentRes.data));
    } catch (error) {
      console.error("Failed to load filter options", error);
      toast.error("Could not load branch and department filters");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await engagementAPI.getUpcomingEvents(filters);
      setEvents(safeList<EngagementEvent>(response.data));
    } catch (error) {
      console.error("Failed to fetch engagement events", error);
      toast.error("Failed to load upcoming celebrations");
      setEvents([]);
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

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.employee.trim() && !event.name?.toLowerCase().includes(filters.employee.toLowerCase())) {
        return false;
      }
      if (filters.eventType !== "All" && event.eventType !== filters.eventType) {
        return false;
      }
      return true;
    });
  }, [events, filters.employee, filters.eventType]);

  const stats = useMemo(
    () => ({
      birthdays: filteredEvents.filter((event) => event.eventType === "Birthday").length,
      workAnniversaries: filteredEvents.filter((event) => event.eventType === "Work Anniversary").length,
      weddingAnniversaries: filteredEvents.filter((event) => event.eventType === "Wedding Anniversary").length,
      todayEvents: filteredEvents.filter((event) => Number(event.daysLeft ?? 0) === 0).length,
      total: filteredEvents.length,
    }),
    [filteredEvents],
  );

  const handleWish = (event: EngagementEvent) => {
    toast.success(`Wish sent to ${event.name}`);
  };

  const handleWishToday = () => {
    if (stats.todayEvents === 0) {
      toast.info("No celebrations scheduled for today");
      return;
    }
    toast.success(`Wishes sent to ${stats.todayEvents} employees with events today`);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    toast.info("Filters reset to default");
  };

  const getEventColorClass = (eventType: string) => {
    if (eventType === "Birthday") return "is-birthday";
    if (eventType === "Work Anniversary") return "is-work";
    if (eventType === "Wedding Anniversary") return "is-wedding";
    return "is-default";
  };

  const getDayEvents = (day: number, month: number, year: number) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const renderCardView = () => {
    if (!filteredEvents.length) {
      return (
        <div className="eev-empty-state card">
          <Gift size={42} />
          <p>No celebrations found for selected filters.</p>
        </div>
      );
    }

    return (
      <div className="eev-card-grid">
        {filteredEvents.map((event, index) => (
          <article
            className={`eev-event-card ${getEventColorClass(event.eventType)} ${Number(event.daysLeft ?? 0) === 0 ? "is-today" : ""}`}
            key={event.id ?? `${event.name}-${event.date}-${index}`}
          >
            <div className="eev-event-head">
              <div className="eev-avatar">{getInitials(event.name)}</div>
              <div>
                <h3>{event.name}</h3>
                <p>{event.eventType}</p>
              </div>
              {Number(event.daysLeft ?? 0) === 0 && <span className="badge badge-danger">Today</span>}
            </div>

            <div className="eev-meta-grid">
              <span>
                <CalendarIcon size={14} /> {new Date(event.date).toLocaleDateString()}
              </span>
              <span>
                <Clock3 size={14} /> {Number(event.daysLeft ?? 0) === 0 ? "Today" : `${event.daysLeft ?? "-"} days`}
              </span>
              <span>
                <MapPin size={14} /> {event.branch || "N/A"}
              </span>
              <span>
                <Briefcase size={14} /> {event.department || "N/A"}
              </span>
            </div>

            <div className="eev-card-actions">
              <button className="btn-secondary" onClick={() => setSelectedEvent(event)}>
                <Eye size={14} /> View
              </button>
              <button className="btn-primary" onClick={() => handleWish(event)}>
                <Send size={14} /> Send Wish
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderTableView = () => (
    <div className="eev-table-wrap card">
      <table className="table-modern">
        <thead>
          <tr>
            <th>#</th>
            <th>Employee</th>
            <th>Event Type</th>
            <th>Date</th>
            <th>Days Left</th>
            <th>Branch</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event, index) => (
            <tr key={event.id ?? `${event.name}-${event.date}-${index}`}>
              <td>{index + 1}</td>
              <td>
                <div className="eev-employee-cell">
                  <div className="eev-avatar small">{getInitials(event.name)}</div>
                  <span>{event.name}</span>
                </div>
              </td>
              <td>
                <span className={`eev-pill ${getEventColorClass(event.eventType)}`}>{event.eventType}</span>
              </td>
              <td>{new Date(event.date).toLocaleDateString()}</td>
              <td>{Number(event.daysLeft ?? 0) === 0 ? "Today" : `${event.daysLeft ?? "-"} days`}</td>
              <td>{event.branch || "N/A"}</td>
              <td>{event.department || "N/A"}</td>
              <td>
                <div className="eev-inline-actions">
                  <button className="btn-secondary" onClick={() => setSelectedEvent(event)}>
                    <Eye size={14} />
                  </button>
                  <button className="btn-primary" onClick={() => handleWish(event)}>
                    <Send size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!filteredEvents.length && (
            <tr>
              <td colSpan={8} className="eev-table-empty">
                No upcoming events in selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCalendarView = () => {
    const activeMonth = currentDate.getMonth();
    const activeYear = currentDate.getFullYear();
    const today = new Date();
    const firstDay = new Date(activeYear, activeMonth, 1).getDay();
    const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();

    const cells: Array<number | null> = [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return (
      <section className="eev-calendar card">
        <header className="eev-calendar-head">
          <div className="eev-calendar-nav">
            <button className="btn-secondary" onClick={() => setCurrentDate((prev) => addMonths(prev, -1))}>
              <ChevronLeft size={16} /> Previous
            </button>
            <strong>
              {MONTHS[activeMonth]} {activeYear}
            </strong>
            <button className="btn-secondary" onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}>
              Next <ChevronRight size={16} />
            </button>
          </div>
          <button className="btn-secondary" onClick={() => setCurrentDate(new Date())}>
            Current Month
          </button>
        </header>

        <div className="eev-calendar-grid">
          {DAYS.map((day) => (
            <div className="eev-day-label" key={day}>
              {day}
            </div>
          ))}

          {cells.map((day, index) => {
            if (!day) {
              return <div className="eev-day-cell is-empty" key={`empty-${index}`} />;
            }

            const dayEvents = getDayEvents(day, activeMonth, activeYear);
            const isToday =
              day === today.getDate() && activeMonth === today.getMonth() && activeYear === today.getFullYear();

            return (
              <div className="eev-day-cell" key={`${activeMonth}-${day}`}>
                <div className={`eev-day-number ${isToday ? "is-today" : ""}`}>{day}</div>
                <div className="eev-day-events">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <button
                      className={`eev-calendar-chip ${getEventColorClass(event.eventType)}`}
                      key={`${event.name}-${eventIndex}`}
                      onClick={() => setSelectedEvent(event)}
                      title={`${event.name} - ${event.eventType}`}
                    >
                      {event.name.split(" ")[0]}
                    </button>
                  ))}
                  {dayEvents.length > 3 && <span className="eev-day-more">+{dayEvents.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="main-content eev-page">
      <header className="eev-top">
        <PageTitle
          title="Upcoming Events"
          subtitle="Plan and manage upcoming employee milestones from one organized workspace"
          icon={<Heart size={24} />}
        />

        <div className="eev-top-actions">
          <button className="btn-secondary" onClick={fetchEvents}>
            <RefreshCw size={16} /> Refresh
          </button>

          <div className="eev-view-switch">
            <button className={view === "Card" ? "is-active" : ""} onClick={() => setView("Card")}>
              <LayoutGrid size={15} /> Card
            </button>
            <button className={view === "Table" ? "is-active" : ""} onClick={() => setView("Table")}>
              <TableIcon size={15} /> Table
            </button>
            <button className={view === "Calendar" ? "is-active" : ""} onClick={() => setView("Calendar")}>
              <CalendarIcon size={15} /> Calendar
            </button>
          </div>
        </div>
      </header>

      <section className="eev-stats">
        <article className="card eev-stat is-birthday">
          <div>
            <p>Upcoming Birthdays</p>
            <h2>{stats.birthdays}</h2>
          </div>
          <Gift size={20} />
        </article>

        <article className="card eev-stat is-work">
          <div>
            <p>Work Anniversaries</p>
            <h2>{stats.workAnniversaries}</h2>
          </div>
          <TrendingUp size={20} />
        </article>

        <article className="card eev-stat is-wedding">
          <div>
            <p>Wedding Anniversaries</p>
            <h2>{stats.weddingAnniversaries}</h2>
          </div>
          <Heart size={20} />
        </article>

        <article className="card eev-stat is-default">
          <div>
            <p>Total Events ({filters.days} days)</p>
            <h2>{stats.total}</h2>
          </div>
          <Users size={20} />
        </article>
      </section>

      <section className="card eev-filters">
        <div className="eev-section-title">
          <Filter size={18} />
          <h3>Advanced Filters</h3>
        </div>

        <div className="eev-filter-grid">
          <div>
            <label>Branch</label>
            <select
              className="select-modern"
              value={filters.branch}
              onChange={(event) => setFilters((prev) => ({ ...prev, branch: event.target.value }))}
            >
              <option value="All">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.branchName}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Department</label>
            <select
              className="select-modern"
              value={filters.department}
              onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.departmentName}>
                  {department.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Event Type</label>
            <select
              className="select-modern"
              value={filters.eventType}
              onChange={(event) => setFilters((prev) => ({ ...prev, eventType: event.target.value }))}
            >
              <option value="All">All Events</option>
              <option value="Birthday">Birthday</option>
              <option value="Work Anniversary">Work Anniversary</option>
              <option value="Wedding Anniversary">Wedding Anniversary</option>
            </select>
          </div>

          <div>
            <label>Display Period</label>
            <select
              className="select-modern"
              value={filters.days}
              onChange={(event) => setFilters((prev) => ({ ...prev, days: event.target.value }))}
            >
              <option value="7">Next 7 Days</option>
              <option value="15">Next 15 Days</option>
              <option value="30">Next 30 Days</option>
              <option value="60">Next 60 Days</option>
              <option value="90">Next 90 Days</option>
            </select>
          </div>

          <div className="eev-search-col">
            <label>Search Employee</label>
            <div className="eev-search-wrap">
              <Search size={16} className="eev-search-icon" />
              <input
                className="input-modern eev-search-input"
                placeholder="Employee name"
                type="search"
                value={filters.employee}
                onChange={(event) => setFilters((prev) => ({ ...prev, employee: event.target.value }))}
              />
              {filters.employee && (
                <button
                  className="eev-clear-search"
                  onClick={() => setFilters((prev) => ({ ...prev, employee: "" }))}
                  type="button"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="eev-filter-footer">
          <span>
            Showing <strong>{filteredEvents.length}</strong> records
          </span>
          <div>
            <button className="btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
            <button className="btn-primary" onClick={handleWishToday}>
              <Send size={14} /> Send Today Wishes
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="eev-loader-wrap">
          <Loader2 className="animate-spin" size={40} />
        </div>
      )}

      {!loading && view === "Card" && renderCardView()}
      {!loading && view === "Table" && renderTableView()}
      {!loading && view === "Calendar" && renderCalendarView()}

      <section className="card eev-notify">
        <div className="eev-notify-left">
          <div className="eev-notify-icon">
            <BellRing size={18} />
          </div>
          <div>
            <h3>Automated Notifications</h3>
            <p>Enable daily engagement updates and choose delivery channels for alerts.</p>
          </div>
        </div>
        <div className="eev-notify-right">
          <button
            className={`eev-toggle ${dailyReportEnabled ? "is-on" : ""}`}
            onClick={() => {
              const next = !dailyReportEnabled;
              setDailyReportEnabled(next);
              toast.success(`Daily report ${next ? "enabled" : "disabled"}`);
            }}
            type="button"
          >
            {dailyReportEnabled ? "ON" : "OFF"}
          </button>
          <button className="btn-secondary" onClick={() => setShowChannelModal(true)}>
            <Settings2 size={14} /> Configure Channels
          </button>
        </div>
      </section>

      {selectedEvent && (
        <div className="eev-modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="eev-modal card" onClick={(event) => event.stopPropagation()}>
            <div className="eev-modal-head">
              <h3>Employee Event Details</h3>
              <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="eev-profile-row">
              <div className="eev-avatar large">{getInitials(selectedEvent.name)}</div>
              <div>
                <h4>{selectedEvent.name}</h4>
                <p>{selectedEvent.eventType}</p>
              </div>
            </div>
            <div className="eev-detail-grid">
              <span>
                <CalendarIcon size={14} /> {new Date(selectedEvent.date).toLocaleDateString()}
              </span>
              <span>
                <Clock3 size={14} />
                {Number(selectedEvent.daysLeft ?? 0) === 0 ? "Today" : `${selectedEvent.daysLeft ?? "-"} days left`}
              </span>
              <span>
                <Building2 size={14} /> {selectedEvent.branch || "N/A"}
              </span>
              <span>
                <Briefcase size={14} /> {selectedEvent.department || "N/A"}
              </span>
              <span>
                <Phone size={14} /> {selectedEvent.mobile || "N/A"}
              </span>
            </div>

            <div className="eev-modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  handleWish(selectedEvent);
                  setSelectedEvent(null);
                }}
              >
                <Send size={14} /> Send Wish
              </button>
            </div>
          </div>
        </div>
      )}

      {showChannelModal && (
        <div className="eev-modal-backdrop" onClick={() => setShowChannelModal(false)}>
          <div className="eev-modal card" onClick={(event) => event.stopPropagation()}>
            <div className="eev-modal-head">
              <h3>Notification Channels</h3>
              <button className="btn-secondary" onClick={() => setShowChannelModal(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="eev-channel-list">
              <label>
                <input
                  checked={channelConfig.email}
                  onChange={(event) =>
                    setChannelConfig((prev) => ({
                      ...prev,
                      email: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>Email Alerts</span>
              </label>

              <label>
                <input
                  checked={channelConfig.whatsapp}
                  onChange={(event) =>
                    setChannelConfig((prev) => ({
                      ...prev,
                      whatsapp: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>WhatsApp Alerts</span>
              </label>

              <label>
                <input
                  checked={channelConfig.app}
                  onChange={(event) =>
                    setChannelConfig((prev) => ({
                      ...prev,
                      app: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                <span>In-App Alerts</span>
              </label>
            </div>

            <div className="eev-modal-actions">
              <button className="btn-secondary" onClick={() => setShowChannelModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowChannelModal(false);
                  toast.success("Channel settings updated");
                }}
              >
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementEvents;

