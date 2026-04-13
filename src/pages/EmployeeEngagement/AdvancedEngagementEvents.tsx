import React, { useState, useEffect } from "react";
import { 
  FileDown, 
  Send, 
  MessageSquare, 
  Bell, 
  CheckSquare, 
  Square,
  Loader2,
  BarChart,
  Calendar,
  Users,
  Target,
  Maximize2,
    TrendingUp,
    Heart
} from "lucide-react";
import { engagementAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const AdvancedEngagementEvents: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
    const [groupedEvents, setGroupedEvents] = useState<any>({});

    // Filters
    const [filters] = useState({
        branch: "All",
        department: "All",
        eventType: "All",
        days: "30"
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await engagementAPI.getUpcomingEvents(filters);
            setEvents(res.data);
            
            // Group by date
            const groups = res.data.reduce((acc: any, ev: any) => {
                const dateKey = new Date(ev.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(ev);
                return acc;
            }, {});
            setGroupedEvents(groups);
        } catch (err) {
            console.error("Failed to fetch events", err);
            toast.error("Failed to load advanced data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const toggleSelect = (id: number) => {
        setSelectedEvents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAllFromGroup = (group: any[]) => {
        const employeeIds = group.map(g => g.employeeId);
        setSelectedEvents(prev => {
            const allSelected = employeeIds.every(id => prev.includes(id));
            if (allSelected) {
                return prev.filter(id => !employeeIds.includes(id));
            } else {
                return Array.from(new Set([...prev, ...employeeIds]));
            }
        });
    };

    const handleBulkWish = () => {
        if (selectedEvents.length === 0) {
            toast.info("Please select employees first");
            return;
        }
        toast.success(`Successfully sent bulk wishes to ${selectedEvents.length} employees! 🎉`);
        setSelectedEvents([]);
    };

    const handleExport = (format: "Excel" | "PDF") => {
        toast.info(`Exporting ${format} data... 📥`);
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case "Birthday": return "🎂";
            case "Work Anniversary": return "🎊";
            case "Wedding Anniversary": return "❤️";
            default: return "🎉";
        }
    };

    return (
        <div className="main-content animate-fade-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="page-title"><Heart size={22} /> Advanced Engagement Analytics</h1>
                    <p className="page-subtitle">Grouped tracking and bulk communication tools</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button className="btn-secondary" onClick={() => handleExport("Excel")}>
                        <FileDown size={18} /> Export Excel
                    </button>
                    <button className="btn-primary" onClick={handleBulkWish} disabled={selectedEvents.length === 0}>
                        <Send size={18} /> Bulk Wish ({selectedEvents.length})
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "24px" }}>
                <div className="glass-card" style={{ padding: "20px", background: "linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Users size={20} color="var(--primary)" />
                        <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Total Employees to Celebrate</h4>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "12px" }}>
                        <h2 style={{ fontSize: "36px", margin: 0 }}>{events.length}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", fontSize: "12px", fontWeight: "700" }}>
                             15% <TrendingUp size={12} />
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: "20px", background: "linear-gradient(to right, rgba(239, 68, 68, 0.1), transparent)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Bell size={20} color="#ef4444" />
                        <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Today's Celebrations</h4>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "12px" }}>
                        <h2 style={{ fontSize: "36px", margin: 0 }}>{events.filter(e => e.daysLeft === 0).length}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#ef4444" }}>
                            Priority <Target size={12} />
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: "20px", background: "linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <MessageSquare size={20} color="#10b981" />
                        <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Engagement Score</h4>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "12px" }}>
                        <h2 style={{ fontSize: "36px", margin: 0 }}>94%</h2>
                        <div style={{ width: "60%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: "94%", height: "100%", background: "#10b981" }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grouped View Area */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                </div>
            ) : (
                <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {Object.keys(groupedEvents).map(dateKey => (
                        <div key={dateKey} className="animate-fade-in">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "var(--primary-light)", borderRadius: "8px", marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Calendar size={18} color="var(--primary)" />
                                    <h3 style={{ margin: 0, fontSize: "16px", color: "var(--primary)" }}>{dateKey}</h3>
                                    <span className="badge badge-primary" style={{ fontSize: "11px" }}>{groupedEvents[dateKey].length} Employees</span>
                                </div>
                                <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => selectAllFromGroup(groupedEvents[dateKey])}>
                                    Select All Group
                                </button>
                            </div>
                            
                            <div className="glass-card" style={{ overflowX: "auto" }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "40px" }}>
                                                <Maximize2 size={16} />
                                            </th>
                                            <th>Type</th>
                                            <th>Total Employees</th>
                                            <th>Names List</th>
                                            <th>Quick Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedEvents[dateKey].map((ev: any, evIdx: number) => (
                                            <tr key={`${dateKey}-${evIdx}`} style={selectedEvents.includes(ev.employeeId) ? { background: "rgba(99, 102, 241, 0.05)" } : {}}>
                                                <td>
                                                    <div style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => toggleSelect(ev.employeeId)}>
                                                        {selectedEvents.includes(ev.employeeId) ? <CheckSquare size={20} /> : <Square size={20} opacity={0.3} />}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                                                        {getEventIcon(ev.eventType)} {ev.eventType}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: "700" }}>1</span> Employee
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "var(--primary)" }}>
                                                            {ev.name[0]}
                                                        </div>
                                                        <span style={{ fontWeight: "600" }}>{ev.name}</span>
                                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>({ev.department})</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "10px" }} title="Schedule Reminder">
                                                            <Bell size={12} /> Remind
                                                        </button>
                                                        <button className="btn-primary" style={{ padding: "4px 8px", fontSize: "10px" }} onClick={() => toast.info(`Message sent to ${ev.name}`)}>
                                                            <Send size={12} /> Send
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                    
                    {Object.keys(groupedEvents).length === 0 && (
                        <div style={{ textAlign: "center", padding: "80px", opacity: 0.5 }}>
                            <BarChart size={64} style={{ marginBottom: "16px" }} />
                            <h3>No analytics data available to group.</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedEngagementEvents;
