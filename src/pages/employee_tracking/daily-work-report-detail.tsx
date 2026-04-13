import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    MapPin,
    Navigation,
    AlertTriangle,
    Calendar,
    User,
    Briefcase,
    ExternalLink,
    Check,
    X,
    MessageCircle,
    Info
, Search} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import './employee-tracking.css';

const DailyWorkReportDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<any>(null);
    const [remark, setRemark] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return { bg: '#ecfdf5', color: '#059669' };
            case 'Rejected': return { bg: '#fef2f2', color: '#dc2626' };
            case 'Correction Requested': return { bg: '#fffbeb', color: '#d97706' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const fetchReportDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/daily-work-reports/${id}`);
            setReport(res.data);
            setRemark(res.data.summary.adminRemark || '');
        } catch (error) {
            console.error('Failed to fetch report detail', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportDetail();
    }, [id]);

    const handleAction = async (status: string) => {
        setActionLoading(true);
        try {
            await api.patch(`/daily-work-reports/${id}/status`, { status, remark });
            fetchReportDetail();
            alert(`Report ${status} successfully`);
        } catch (error) {
            console.error('Action failed', error);
            alert('Failed to update report status');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
            <div className="et-loader"></div>
            <p>Loading detailed report...</p>
        </div>
    );

    if (!report) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
            <h3><Search className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Report Not Found</h3>
            <button className="et-btn et-btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    const { summary, activities } = report;

    return (
        <div className="et-container">
            <div className="et-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button className="btn-secondary" onClick={() => navigate(-1)} title="Back to Reports" style={{ padding: '8px', minWidth: '40px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="et-title">Activity Details</h1>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                            <span className="et-subtitle-detail"><User size={14} /> {summary.employeeName}</span>
                            <span className="et-subtitle-detail"><Calendar size={14} /> {summary.date}</span>
                            <span className="et-subtitle-detail"><Briefcase size={14} /> {summary.designation}</span>
                            <span className="et-subtitle-detail"><Navigation size={14} /> {summary.workType}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span
                        className="status-badge-premium"
                        style={{
                            backgroundColor: getStatusStyle(summary.status).bg,
                            color: getStatusStyle(summary.status).color,
                            padding: '10px 20px',
                            fontSize: '14px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusStyle(summary.status).color }}></span>
                        {summary.status}
                    </span>
                </div>
            </div>

            <div className="et-detail-grid">
                {/* Left Side: Summary & Timeline */}
                <div className="et-column-left">
                    {/* Summary Cards Row */}
                    <div className="et-summary-cards">
                        <div className="et-summary-mini-card">
                            <span className="mini-label">Work Duration</span>
                            <span className="mini-value">{summary.totalWorkTime}</span>
                        </div>
                        <div className="et-summary-mini-card">
                            <span className="mini-label">Distance Cover</span>
                            <span className="mini-value">{summary.distanceCovered}</span>
                        </div>
                        <div className="et-summary-mini-card">
                            <span className="mini-label">Sites Visited</span>
                            <span className="mini-value">{summary.locationsVisited}</span>
                        </div>
                        <div className="et-summary-mini-card">
                            <span className="mini-label">Total Break</span>
                            <span className="mini-value">{summary.breakTime}</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="et-card-premium" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Info size={20} style={{ color: '#3b82f6' }} />
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Daily Activity Timeline</h3>
                        </div>

                        <div className="et-timeline-premium">
                            {activities.map((act: any, idx: number) => (
                                <div key={act.id} className="timeline-item">
                                    <div className="timeline-marker">
                                        <div className={`timeline-dot ${idx === 0 ? 'start' : idx === activities.length - 1 ? 'end' : ''}`}></div>
                                        {idx < activities.length - 1 && <div className="timeline-line"></div>}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-time">{act.time}</div>
                                        <div className="timeline-body">
                                            <div className="timeline-activity-top">
                                                <span className="activity-type">{act.activity}</span>
                                                <span className="activity-location">
                                                    <MapPin size={12} />
                                                    {act.location}
                                                </span>
                                            </div>
                                            {act.notes && (
                                                <p className="activity-notes">
                                                    {act.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Map & Actions */}
                <div className="et-column-right">
                    {/* Track Map */}
                    <div className="et-card-premium" style={{ marginBottom: '24px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Movement Map</h3>
                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                <ExternalLink size={14} />
                                View Full Map
                            </button>
                        </div>

                        <div className="et-map-placeholder" style={{ borderRadius: '12px', height: '280px', background: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <Navigation size={48} style={{ opacity: 0.1, marginBottom: '12px' }} />
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>Live Route Visualization</span>
                                <span style={{ fontSize: '11px', marginTop: '4px' }}>Encrypted Location Data</span>
                            </div>
                            {/* Visual path line */}
                            <div style={{ position: 'absolute', top: '50%', left: '20%', right: '20%', height: '2px', background: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 5px, transparent 5px, transparent 10px)', opacity: 0.3 }}></div>
                            <MapPin size={24} style={{ position: 'absolute', top: '45%', left: '18%', color: '#10b981' }} />
                            <MapPin size={24} style={{ position: 'absolute', top: '48%', right: '18%', color: '#ef4444' }} />
                        </div>
                    </div>

                    {/* Admin Control Panel */}
                    <div className="et-card-premium" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Admin Control Center</h3>

                        <div className="premium-input-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>REMARKS / FEEDBACK</label>
                            <textarea
                                className="et-textarea"
                                placeholder="Provide feedback or reasons for rejection..."
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="et-action-buttons" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button
                                className="btn-primary"
                                style={{ backgroundColor: '#10b981', width: '100%', justifyContent: 'center' }}
                                disabled={actionLoading}
                                onClick={() => handleAction('Approved')}
                            >
                                <Check size={18} /> Approve This Activity
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="et-btn-danger"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    disabled={actionLoading}
                                    onClick={() => handleAction('Rejected')}
                                >
                                    <X size={18} /> Reject
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    disabled={actionLoading}
                                    onClick={() => handleAction('Correction Requested')}
                                >
                                    <MessageCircle size={18} /> Request Fix
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sync Info */}
                    <div className="et-info-box">
                        <Info size={18} />
                        <p>Once approved, this report will be locked and synced with the payroll and performance tracking engine.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyWorkReportDetail;
