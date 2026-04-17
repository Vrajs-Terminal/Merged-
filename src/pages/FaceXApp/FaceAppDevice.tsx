import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Tablet, 
  ShieldCheck, 
  ShieldX, 
  Search, 
  Eye, 
  Tag, 
  Loader2,
  AlertCircle,
  Activity,
    Scan,
    Globe,
    Shield,
    X,
    CalendarClock,
    RefreshCw
} from "lucide-react";
import { faceXAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./FaceAppDevice.css";

interface FaceAppDeviceProps {
    setActivePage?: (page: string) => void;
}

const FaceAppDevice: React.FC<FaceAppDeviceProps> = ({ setActivePage }) => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [totalEntries, setTotalEntries] = useState(0);
    const [page] = useState(1);
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

    const fetchDevices = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const res = await faceXAPI.getDevices({ search: searchQuery, page, limit: 25 });
            setDevices(res.data?.devices || []);
            setTotalEntries(res.data?.total || 0);
        } catch (error) {
            toast.error("Failed to load devices");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [page, searchQuery]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setSearchQuery(searchInput.trim());
        }, 320);

        return () => window.clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        void setActivePage;
    }, [setActivePage]);

    const handleUpdateStatus = async (id: number, status: string) => {
        const confirmMsg = status === "Blocked" ? "Block this device? This will stop all facial authentication from this hardware." : "Allow this device?";
        if (!window.confirm(confirmMsg)) return;

        try {
            await faceXAPI.updateDeviceStatus(id, { status });
            toast.success(`Success! Device is now ${status}.`);
            fetchDevices(true);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleEditRemark = async (id: number, oldRemark: string) => {
        const remark = window.prompt("New Device Remark/Label:", oldRemark || "");
        if (remark === null) return;

        try {
            await faceXAPI.updateDeviceStatus(id, { remark });
            toast.success("Remark updated");
            fetchDevices(true);
        } catch (error) {
            toast.error("Failed to save remark");
        }
    };

    const getStatusClass = (status: string) => (status === "Allowed" ? "badge-success" : "badge-danger");

    const getDeviceTypeIcon = (type: string) =>
        type === "Tablet"
            ? <Tablet size={14} color="var(--primary)" />
            : <Smartphone size={14} color="var(--primary)" />;

    const stats = {
        total: totalEntries,
        blocked: devices.filter(d => d.status === "Blocked").length,
        allowed: devices.filter(d => d.status === "Allowed").length,
        synced: devices.filter(d => d.lastSyncDate).length
    };
    const hasSearchQuery = searchInput.trim().length > 0;
    const isSearchSyncing = searchInput.trim() !== searchQuery;

    return (
        <div className="main-content animate-fade-in fx-device-page">
            <div className="fx-page-header">
                <div className="fx-title-block">
                    <div className="fx-title-row">
                        <Scan size={24} className="fx-title-icon" />
                        <h1 className="page-title">FaceX Device Security Console</h1>
                    </div>
                    <p className="page-subtitle">Security control and health monitoring for all hardware devices running FaceX application.</p>
                </div>
                <button className="btn-secondary fx-refresh-btn" onClick={() => fetchDevices(true)} disabled={loading || refreshing}>
                    <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh Fleet"}
                </button>
            </div>

            <div className="fx-stats-grid">
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Inventory</span>
                        <span className="fx-stat-icon blue"><Smartphone size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.total}</strong>
                    <span className="fx-stat-note">Total Fleet</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Authorized</span>
                        <span className="fx-stat-icon green"><Activity size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.allowed}</strong>
                    <span className="fx-stat-note">Active Hardware</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Blocked</span>
                        <span className="fx-stat-icon red"><ShieldX size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.blocked}</strong>
                    <span className="fx-stat-note">Safety Lockdown</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Verified</span>
                        <span className="fx-stat-icon purple"><Globe size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.synced}</strong>
                    <span className="fx-stat-note">Cloud Synced</span>
                </div>
            </div>

            <div className="glass-card fx-table-card">
                <div className="fx-table-header">
                    <div className="fx-table-title-wrap">
                        <h3>Registered Hardware Inventory</h3>
                        <span className="fx-chip">Total Devices: {totalEntries}</span>
                    </div>
                    <div className="fx-search-wrap">
                        <Search size={18} className="fx-search-icon" />
                        <input 
                            type="text" 
                            className="form-control fx-search-input"
                            placeholder="MAC Address, Device ID or Model..." 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {hasSearchQuery && (
                            <button
                                type="button"
                                className="fx-search-clear"
                                onClick={() => setSearchInput("")}
                                aria-label="Clear device search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="fx-search-meta">
                    {isSearchSyncing
                        ? "Searching devices..."
                        : hasSearchQuery
                            ? `Showing ${devices.length} result${devices.length === 1 ? "" : "s"} for "${searchQuery}"`
                            : `Showing all ${devices.length} devices`}
                </div>

                <div className="table-responsive">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Action</th>
                                <th>Device Info</th>
                                <th>MAC / Hardware ID</th>
                                <th>Type</th>
                                <th>App Version</th>
                                <th>Branch</th>
                                <th>Last Sync</th>
                                <th>Camera Secs</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="fx-empty-row">
                                        <Loader2 className="spin" size={22} />
                                        <span>Loading device inventory...</span>
                                    </td>
                                </tr>
                            ) : devices.length > 0 ? (
                                devices.map((d, index) => (
                                    <tr key={d.id} className={d.status === "Blocked" ? "row-muted" : ""}>
                                        <td>{(page - 1) * 25 + index + 1}</td>
                                        <td>
                                            <div className="fx-actions">
                                                <button className="btn-icon" title="View Logs" onClick={() => toast.info(`Activity logs for ${d.deviceId}`)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="btn-icon" title="View Details" onClick={() => setSelectedDevice(d)}>
                                                    <Shield size={16} />
                                                </button>
                                                <button className="btn-icon color-primary" title="Edit Remark" onClick={() => handleEditRemark(d.id, d.remark)}>
                                                    <Tag size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fx-device-cell">
                                                <strong>{d.deviceModel || "Unknown Product"}</strong>
                                                <span>{d.remark || "No label set"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <code className="fx-code-pill">{d.deviceMac || d.deviceId}</code>
                                        </td>
                                        <td>
                                            <div className="fx-type-pill">
                                                {getDeviceTypeIcon(d.type)}
                                                {d.type}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fx-version-pill">
                                                v{d.appVersion || "1.0"}
                                            </span>
                                        </td>
                                        <td>{d.branch?.branchName || "All Centers"}</td>
                                        <td>
                                           <span className="fx-sync-text">{d.lastSyncDate ? new Date(d.lastSyncDate).toLocaleString() : "Never Synced"}</span>
                                        </td>
                                        <td><strong>{d.cameraSteadySeconds}s</strong></td>
                                        <td>
                                            <div className="fx-status-wrap">
                                                {d.status === "Allowed" ? (
                                                    <button className="badge badge-success fx-status-btn" onClick={() => handleUpdateStatus(d.id, "Blocked")}>
                                                        <ShieldCheck size={12} /> Allowed
                                                    </button>
                                                ) : (
                                                    <button className="badge badge-danger fx-status-btn" onClick={() => handleUpdateStatus(d.id, "Allowed")}>
                                                        <ShieldX size={12} /> Blocked
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="fx-empty-row">
                                        <AlertCircle size={22} />
                                        <span>No devices found in the fleet.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="fx-table-footer">
                   <div>Showing 25 entries per page</div>
                </div>
            </div>

            {selectedDevice && (
                <div className="fx-modal-overlay" onClick={() => setSelectedDevice(null)}>
                    <div className="fx-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fx-modal-head">
                            <div className="fx-modal-title-row">
                                <Shield size={18} />
                                <h4>Device Detail</h4>
                            </div>
                            <button className="btn-icon" onClick={() => setSelectedDevice(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="fx-modal-grid">
                            <div>
                                <label>Model</label>
                                <p>{selectedDevice.deviceModel || "Unknown Product"}</p>
                            </div>
                            <div>
                                <label>Type</label>
                                <p>{selectedDevice.type || "Unknown"}</p>
                            </div>
                            <div>
                                <label>MAC / Device ID</label>
                                <p>{selectedDevice.deviceMac || selectedDevice.deviceId}</p>
                            </div>
                            <div>
                                <label>Status</label>
                                <p>
                                    <span className={`badge ${getStatusClass(selectedDevice.status)}`}>{selectedDevice.status || "Unknown"}</span>
                                </p>
                            </div>
                            <div>
                                <label>Branch</label>
                                <p>{selectedDevice.branch?.branchName || "All Centers"}</p>
                            </div>
                            <div>
                                <label>Last Sync</label>
                                <p><CalendarClock size={14} /> {selectedDevice.lastSyncDate ? new Date(selectedDevice.lastSyncDate).toLocaleString() : "Never Synced"}</p>
                            </div>
                            <div>
                                <label>Camera Steady Seconds</label>
                                <p>{selectedDevice.cameraSteadySeconds || 0}s</p>
                            </div>
                            <div>
                                <label>Remark</label>
                                <p>{selectedDevice.remark || "No label set"}</p>
                            </div>
                        </div>
                        <div className="fx-modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedDevice(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceAppDevice;
