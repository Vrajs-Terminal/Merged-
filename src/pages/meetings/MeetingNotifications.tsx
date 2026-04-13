import React, { useState, useEffect } from 'react';
import { 
    Bell, Search, Mail, MessageSquare,
    CheckCircle2, Loader2, Activity
} from 'lucide-react';
import './meetings.css';

const MeetingNotifications: React.FC = () => {
    const [loading, setLoading] = useState(true);

    const refreshPreview = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 600);
    };

    useEffect(() => {
        // Simulating loading state for now
        setTimeout(() => setLoading(false), 800);
    }, []);

    const notificationTypes = [
        { name: "Invitation Sent", icon: Mail, color: "#3b82f6" },
        { name: "Reminder Alert", icon: Bell, color: "#d97706" },
        { name: "WhatsApp Sync", icon: MessageSquare, color: "#16a34a" },
        { name: "MOM Dispatched", icon: CheckCircle2, color: "#2563eb" },
    ];

    return (
        <div className="meeting-layout">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <h2><Bell size={30} strokeWidth={2.5} color="var(--meeting-primary)" /> Meeting Notifications Log</h2>
                        <p>Track all automated communication sent to participants via Email and WhatsApp.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-secondary" onClick={refreshPreview}>
                            <Activity size={16} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="meeting-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
                    {notificationTypes.map((type, idx) => (
                        <div key={idx} className="silo-card glass-effect" style={{ cursor: 'default' }}>
                            <div className="silo-icon" style={{ background: `${type.color}15`, color: type.color }}><type.icon size={22} /></div>
                            <div>
                                <h3 style={{ fontSize: '18px' }}>{type.name}</h3>
                                <p>Logs delivery status</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="table-container glass-effect">
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                        <div className="search-input-wrapper" style={{ maxWidth: '420px', flex: 1 }}>
                            <Search size={18} />
                            <input type="text" placeholder="Search by recipient or meeting..." className="search-input" />
                        </div>
                        <select className="form-control" style={{ width: '200px' }}>
                            <option value="">All Delivery Modes</option>
                            <option value="Email">Email Only</option>
                            <option value="WhatsApp">WhatsApp Only</option>
                            <option value="Push">Push Notification</option>
                        </select>
                    </div>

                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Recipient</th>
                                <th>Meeting Context</th>
                                <th>Notification Type</th>
                                <th>Delivery Status</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}>
                                        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <Bell size={32} opacity={0.3} />
                                            <span>No notification logs available for recent meetings.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MeetingNotifications;
