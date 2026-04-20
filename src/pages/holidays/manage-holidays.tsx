import React, { useEffect, useState } from 'react';
import { CalendarDays, Trash2, PlusSquare, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './holidays.css';

interface HolidayItem {
  id: number;
  name: string;
  date: string;
  type: string;
  year: number;
  description: string | null;
  assignments: any[];
}

const ManageHolidays = () => {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data.holidays || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  const removeHoliday = async (id: number) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday deleted.');
      setHolidays(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete holiday.');
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div className="hd-page hd-fade-in">
      <div className="hd-header">
        <div className="hd-header-icon-premium">
          <CalendarDays size={28} />
        </div>
        <div className="hd-header-info">
          <h1>Manage Holidays</h1>
          <span className="hd-header-subtitle">View, refresh, and remove existing holidays from the system.</span>
        </div>
      </div>

      <div className="hd-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#475569' }}>{holidays.length} holidays available</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="hd-btn hd-btn-secondary" onClick={fetchHolidays}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="hd-btn hd-btn-teal" onClick={() => window.location.assign('/#/holiday/add')}>
            <PlusSquare size={16} /> Add Holiday
          </button>
        </div>
      </div>

      <div className="hd-table-wrapper">
        <table className="hd-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Year</th>
              <th>Description</th>
              <th>Assignments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>Loading holidays...</td></tr>
            ) : holidays.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>No holidays found.</td></tr>
            ) : (
              holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td>{holiday.name}</td>
                  <td>{new Date(holiday.date).toLocaleDateString()}</td>
                  <td>{holiday.type}</td>
                  <td>{holiday.year}</td>
                  <td>{holiday.description || '—'}</td>
                  <td>{holiday.assignments?.length ?? 0}</td>
                  <td>
                    <button className="hd-btn hd-btn-secondary" style={{ padding: '10px 12px' }} onClick={() => removeHoliday(holiday.id)}>
                      <Trash2 size={16} />
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

export default ManageHolidays;

