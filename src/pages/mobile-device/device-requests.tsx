import React, { useState, useEffect } from 'react';
import { SmartphoneNfc, Search, Clock, CheckCircle2, XCircle, Info, Paperclip, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import './mobile-device.css';

interface DeviceRequest {
    id: number;
    user: { id: number; name: string };
    oldDeviceId?: string;
    oldDeviceName?: string;
    newDeviceId: string;
    newDeviceName?: string;
    reason: string;
    attachmentUrl?: string;
    status: string;
    adminRemarks?: string;
    requestDate: string;
    resolvedAt?: string;
    approvedBy?: { id: number; name: string };
}

const DeviceRequests: React.FC = () => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<DeviceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');
    const [selectedRequest, setSelectedRequest] = useState<DeviceRequest | null>(null);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [modalAction, setModalAction] = useState<'Approve' | 'Reject' | 'View' | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('status', activeTab);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/mobile-device-requests?${params.toString()}`);
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchRequests();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeTab]);

    const handleActionSubmit = async () => {
        if (!selectedRequest) return;
        try {
            const endpoint = modalAction === 'Approve' ? 'approve' : 'reject';
            await api.patch(`/mobile-device-requests/${selectedRequest.id}/${endpoint}`, {
                admin_id: user?.id,
                remarks: adminRemarks
            });
            alert(`Request ${modalAction === 'Approve' ? 'Approved' : 'Rejected'} successfully!`);
            closeModal();
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || `Failed to process request`);
        }
    };

    const openModal = (req: DeviceRequest, action: 'Approve' | 'Reject' | 'View') => {
        setSelectedRequest(req);
        setModalAction(action);
        setAdminRemarks(req.adminRemarks || '');
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setModalAction(null);
        setAdminRemarks('');
    };

    return (
        <div className="md-layout md-fade-in">
            <div className="md-header">
                <div className="md-header-left">
                    <div className="md-header-icon-premium" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
                        <SmartphoneNfc size={24} color="white" />
                    </div>
                    <div>
                        <h2>Device Change Requests</h2>
                        <p className="md-header-subtitle">Manage employee requests to bind a new mobile device</p>
                    </div>
                </div>
            </div>

            <div className="md-tabs">
                {['Pending', 'Approved', 'Rejected'].map(tab => (
                    <button 
                        key={tab} 
                        className={`md-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab} Requests
                    </button>
                ))}
            </div>

            <div className="md-controls">
                <div className="md-search-wrapper">
                    <Search className="md-search-icon" size={18} />
                    <input 
                        className="md-search-input"
                        placeholder="Search employee name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="md-table-container">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                ) : (
                    <table className="md-table">
                        <thead>
                            <tr>
                                <th>Requested On</th>
                                <th>Employee</th>
                                <th>Old Device</th>
                                <th>New Device</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No {activeTab.toLowerCase()} requests found.
                                    </td>
                                </tr>
                            ) : requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ color: '#475569' }}>
                                        {new Date(req.requestDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{req.user?.name || 'Unknown'}</td>
                                    <td>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{req.oldDeviceName || '-'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{req.newDeviceName || 'New Phone'}</div>
                                    </td>
                                    <td>
                                        <span className={`md-status-badge md-status-${req.status.toLowerCase()}`}>
                                            {req.status === 'Pending' ? <Clock size={14} /> : 
                                             req.status === 'Approved' ? <CheckCircle2 size={14} /> : 
                                             <XCircle size={14} />}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="md-action-group">
                                            {req.status === 'Pending' ? (
                                                <>
                                                    <button 
                                                        className="md-btn md-btn-success" 
                                                        style={{ padding: '6px 12px' }}
                                                        onClick={() => openModal(req, 'Approve')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        className="md-btn md-btn-danger" 
                                                        style={{ padding: '6px 12px' }}
                                                        onClick={() => openModal(req, 'Reject')}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="md-btn" 
                                                    style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569' }}
                                                    onClick={() => openModal(req, 'View')}
                                                >
                                                    <Info size={16} /> Details
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Details / Actions */}
            {selectedRequest && modalAction && (
                <div className="md-modal-overlay">
                    <div className="md-modal">
                        <div className="md-modal-header">
                            <h3>
                                {modalAction === 'View' ? 'Request Details' : `${modalAction} Device Change`}
                            </h3>
                            <button className="md-close-btn" onClick={closeModal}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="md-modal-body">
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Employee</div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>{selectedRequest.user?.name}</div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ flex: 1, padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Current Device</div>
                                    <div style={{ fontWeight: 500 }}>{selectedRequest.oldDeviceName || 'None'}</div>
                                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{selectedRequest.oldDeviceId || '-'}</div>
                                </div>
                                <ChevronRight size={20} color="#94a3b8" style={{ margin: '0 10px' }} />
                                <div style={{ flex: 1, padding: '16px', border: '1px solid #c7d2fe', borderRadius: '8px', background: '#eef2ff' }}>
                                    <div style={{ fontSize: '12px', color: '#6366f1' }}>Requested Device</div>
                                    <div style={{ fontWeight: 500 }}>{selectedRequest.newDeviceName || 'Unknown Phone'}</div>
                                    <div style={{ fontSize: '11px', color: '#a5b4fc' }}>{selectedRequest.newDeviceId}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Reason for Change</label>
                                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155' }}>
                                    {selectedRequest.reason || 'No reason provided.'}
                                </div>
                            </div>

                            {selectedRequest.attachmentUrl && (
                                <div style={{ marginBottom: '16px' }}>
                                     <a href={selectedRequest.attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4f46e5', textDecoration: 'none' }}>
                                         <Paperclip size={16} /> View Attached Document
                                     </a>
                                </div>
                            )}

                            {(modalAction === 'Approve' || modalAction === 'Reject') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admin Remarks (Optional)</label>
                                    <textarea 
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '80px', fontFamily: 'inherit' }}
                                        placeholder="Add notes before processing..."
                                        value={adminRemarks}
                                        onChange={e => setAdminRemarks(e.target.value)}
                                    />
                                </div>
                            )}

                            {modalAction === 'View' && selectedRequest.adminRemarks && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Admin Remarks</label>
                                    <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', color: '#334155' }}>
                                        {selectedRequest.adminRemarks}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        Processed by: {selectedRequest.approvedBy?.name || 'Unknown'} on {selectedRequest.resolvedAt ? new Date(selectedRequest.resolvedAt).toLocaleDateString() : ''}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="md-modal-footer">
                            <button className="md-btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={closeModal}>
                                {modalAction === 'View' ? 'Close' : 'Cancel'}
                            </button>
                            {modalAction === 'Approve' && (
                                <button className="md-btn md-btn-success" onClick={handleActionSubmit}>
                                    Confirm Approval
                                </button>
                            )}
                            {modalAction === 'Reject' && (
                                <button className="md-btn md-btn-danger" onClick={handleActionSubmit}>
                                    Confirm Rejection
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceRequests;
