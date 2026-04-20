import React, { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './holidays.css';

interface RequestItem {
  id: number;
  status: string;
  remarks: string | null;
  user: { name: string };
  holiday: { name: string; date: string };
}

const OptionalRequests = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filter ? `/holiday-requests?status=${filter}` : '/holiday-requests';
      const res = await api.get(url);
      setRequests(res.data || []);
    } catch (error: any) {
      toast.error('Failed to load holiday requests.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/holiday-requests/${id}/status`, { status });
      toast.success(`Request ${status.toLowerCase()}.`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update request status.');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  return (
    <div className="hd-page hd-fade-in">
      <div className="hd-header">
        <div className="hd-header-icon-premium">
          <ClipboardList size={28} />
        </div>
        <div className="hd-header-info">
          <h1>Optional Holiday Requests</h1>
          <span className="hd-header-subtitle">Approve or reject employee optional holiday submissions.</span>
        </div>
      </div>

      <div className="hd-card" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{requests.length} requests</span>
          <select className="hd-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button className="hd-btn hd-btn-secondary" onClick={fetchRequests}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="hd-table-wrapper">
        <table className="hd-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Holiday</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>No requests found.</td></tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.user.name}</td>
                  <td>{request.holiday.name} ({new Date(request.holiday.date).toLocaleDateString()})</td>
                  <td>{request.status}</td>
                  <td>{request.remarks || '—'}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="hd-btn hd-btn-teal" style={{ padding: '10px 12px' }} onClick={() => updateStatus(request.id, 'Approved')}>
                      <CheckCircle2 size={16} />
                    </button>
                    <button className="hd-btn hd-btn-secondary" style={{ padding: '10px 12px' }} onClick={() => updateStatus(request.id, 'Rejected')}>
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionalRequests;

