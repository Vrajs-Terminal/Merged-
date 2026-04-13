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
  Globe
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
    const [searchQuery, setSearchQuery] = useState("");
    const [totalEntries, setTotalEntries] = useState(0);
    const [page] = useState(1);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const res = await faceXAPI.getDevices({ search: searchQuery, page, limit: 25 });
            setDevices(res.data.devices);
            setTotalEntries(res.data.total);
        } catch (error) {
            toast.error("Failed to load devices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [page, searchQuery]);

    const handleUpdateStatus = async (id: number, status: string) => {
        const confirmMsg = status === "Blocked" ? "Block this device? This will stop all facial authentication from this hardware." : "Allow this device?";
        if (!window.confirm(confirmMsg)) return;

        try {
            await faceXAPI.updateDeviceStatus(id, { status });
            toast.success(`Success! Device is now ${status}.`);
            fetchDevices();
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
            fetchDevices();
        } catch (error) {
            toast.error("Failed to save remark");
        }
    };

    const stats = {
        total: totalEntries,
        blocked: devices.filter(d => d.status === "Blocked").length,
        allowed: devices.filter(d => d.status === "Allowed").length,
        synced: devices.filter(d => d.lastSyncDate).length
    };

    return (
        <div className="main-content animate-fade-in fx-device-page">
            <div className="page-header fx-page-header">
                <div>
                    <h1 className="page-title"><Scan size={22} /> Registered Devices</h1>
                    <p className="page-subtitle">Security control and health monitoring for all hardware devices running FaceX application</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="main-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.1s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-blue"><Smartphone size={16} /></div>
                        <div className="ns-change positive">Inventory</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.total}</div>
                        <div className="ns-title">Total Fleet</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.2s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-green"><Activity size={16} /></div>
                        <div className="ns-change positive">Authorized</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.allowed}</div>
                        <div className="ns-title">Active Hardware</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.3s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-red"><ShieldX size={16} /></div>
                        <div className="ns-change negative">Blocked</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.blocked}</div>
                        <div className="ns-title">Safety Lockdown</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.4s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-purple"><Globe size={16} /></div>
                        <div className="ns-change positive">Verified</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.synced}</div>
                        <div className="ns-title">Cloud Synced</div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", padding: "24px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <div className="badge badge-info" style={{ fontWeight: "600", fontSize: "14px" }}>
                            Total Devices: {totalEntries}
                        </div>
                    </div>
                    <div className="search-box" style={{ width: "350px", position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="MAC Address, Device ID or Model..." 
                            style={{ paddingLeft: "40px" }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
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
                                    <td colSpan={10} style={{ textAlign: "center", padding: "100px" }}>
                                        <Loader2 className="animate-spin" size={40} style={{ margin: "0 auto" }} />
                                    </td>
                                </tr>
                            ) : devices.length > 0 ? (
                                devices.map((d, index) => (
                                    <tr key={d.id} className={d.status === "Blocked" ? "row-muted" : ""}>
                                        <td>{(page - 1) * 25 + index + 1}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button className="btn-icon" title="View Logs" onClick={() => toast.info(`Activity logs for ${d.deviceId}`)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="btn-icon color-primary" title="Edit Remark" onClick={() => handleEditRemark(d.id, d.remark)}>
                                                    <Tag size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: "600" }}>{d.deviceModel || "Unknown Product"}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{d.remark || "No label set"}</div>
                                        </td>
                                        <td>
                                            <code style={{ fontSize: "10px" }}>{d.deviceMac || d.deviceId}</code>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                {d.type === "Tablet" ? <Tablet size={16} color="var(--primary)" /> : <Smartphone size={16} color="var(--primary)" />}
                                                {d.type}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: "12px", border: "1px solid #e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                                                v{d.appVersion || "1.0"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: "12px" }}>{d.branch?.branchName || "All Centers"}</div>
                                        </td>
                                        <td>
                                           <div style={{ fontSize: "11px" }}>{d.lastSyncDate ? new Date(d.lastSyncDate).toLocaleString() : "Never Synced"}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: "700" }}>{d.cameraSteadySeconds}s</div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                {d.status === "Allowed" ? (
                                                    <button className="badge badge-success" style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }} onClick={() => handleUpdateStatus(d.id, "Blocked")}>
                                                        <ShieldCheck size={12} /> Allowed
                                                    </button>
                                                ) : (
                                                    <button className="badge badge-danger" style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }} onClick={() => handleUpdateStatus(d.id, "Allowed")}>
                                                        <ShieldX size={12} /> Blocked
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: "center", padding: "80px", opacity: 0.5 }}>
                                        <AlertCircle size={48} style={{ margin: "0 auto 16px" }} />
                                        <h3>No devices found in the fleet.</h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div style={{ padding: "20px", display: "flex", justifyContent: "flex-end" }}>
                   <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>Showing 25 entries per page</div>
                </div>
            </div>
        </div>
    );
};

export default FaceAppDevice;
