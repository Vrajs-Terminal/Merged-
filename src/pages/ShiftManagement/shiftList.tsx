import { useState, useEffect } from "react";
import axios from "axios";
import "./shiftList.css";
import { List, Search, Trash2, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/shifts`;

function ShiftList({ setSelectedShift, setActivePage }: { setSelectedShift: any, setActivePage: any }) {
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API);
            setShifts(res.data.shifts);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API}/${id}`);
            setShifts(prev => prev.filter(s => s.id !== id));
            setDeleteConfirm(null);
        } catch {
            alert("Failed to delete shift. It may have active assignments.");
        }
    };

    const filtered = shifts.filter(s =>
        s.shiftName.toLowerCase().includes(search.toLowerCase()) ||
        (s.shiftCode || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.department || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><List size={22} /> Shift List</h2>
                    <p className="sm-page-subtitle">All configured working shifts in your organization</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                        <input
                            className="sm-input"
                            style={{ paddingLeft: "2rem", width: 220 }}
                            placeholder="Search shifts..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="sm-loading">Loading shifts...</div>
            ) : filtered.length === 0 ? (
                <div className="sm-empty">
                    <Clock size={40} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                    <div>No shifts found. Create your first shift from the "Create Shift" page.</div>
                </div>
            ) : (
                <div className="sm-table-wrap">
                    <table className="sm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Shift Name</th>
                                <th>Code</th>
                                <th>Department</th>
                                <th>Timing</th>
                                <th>Break</th>
                                <th>OT</th>
                                <th>Assigned</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, idx) => (
                                <>
                                    <tr key={s.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <strong>{s.shiftName}</strong>
                                            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{s.description}</div>
                                        </td>
                                        <td><span className="sm-badge sm-badge-purple">{s.shiftCode || "—"}</span></td>
                                        <td>{s.department || <span style={{ color: "#9ca3af" }}>All</span>}</td>
                                        <td>
                                            <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                                                {s.startTime} – {s.endTime}
                                            </span>
                                        </td>
                                        <td>{s.breakTime}h ({s.breakType})</td>
                                        <td>
                                            {s.overtimeAllowed
                                                ? <span className="sm-badge sm-badge-orange">OT {s.overtimeRateType}</span>
                                                : <span style={{ color: "#9ca3af" }}>—</span>
                                            }
                                        </td>
                                        <td>
                                            <span className="sm-badge sm-badge-blue">
                                                <Users size={11} style={{ marginRight: 3 }} />
                                                {s._count?.assignments ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`sm-badge ${s.status === "Active" ? "sm-badge-active" : "sm-badge-inactive"}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                                                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                                                    title="View Details"
                                                >
                                                    {expandedId === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", background: "#6366f1" }}
                                                    onClick={() => { setSelectedShift(s); setActivePage("shiftManagement"); }}
                                                    title="Edit Shift"
                                                >
                                                    Edit
                                                </button>
                                                {deleteConfirm === s.id ? (
                                                    <>
                                                        <button className="btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }} onClick={() => handleDelete(s.id)}>Confirm</button>
                                                        <button className="btn-secondary" style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <button className="btn-danger" style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }} onClick={() => setDeleteConfirm(s.id)}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === s.id && (
                                        <tr key={`exp-${s.id}`}>
                                            <td colSpan={10} style={{ background: "#f8fafc", padding: "1rem" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", fontSize: "0.8rem" }}>
                                                    <div><strong>Grace Period:</strong> {s.gracePeriod} min</div>
                                                    <div><strong>Late After:</strong> {s.lateAfterMin} min from start</div>
                                                    <div><strong>Half Day if &lt;</strong> {s.halfDayHours} hrs</div>
                                                    <div><strong>Absent if no punch after:</strong> {s.absentIfNoPunchAfterMin} min</div>
                                                    <div><strong>Early Leave:</strong> {s.earlyLeaveAllowed ? `Allowed (before ${s.earlyLeaveBeforeMin} min of end)` : "Not Allowed"}</div>
                                                    <div><strong>Weekly Off:</strong> {s.weeklyOffDays || "—"}</div>
                                                    <div><strong>Half Off Day:</strong> {s.halfDayOffDays || "—"}</div>
                                                    <div><strong>Geo-Fence:</strong> {s.geoFenceEnabled ? `${s.allowedRadiusM}m radius` : "Disabled"}</div>
                                                    {s.overtimeAllowed && (
                                                        <>
                                                            <div><strong>Min OT:</strong> {s.minOvertimeMin} min</div>
                                                            <div><strong>Max OT:</strong> {s.maxOvertimeHours} hrs</div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ShiftList;
