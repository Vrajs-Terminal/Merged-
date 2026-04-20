import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, Plus, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './holidays.css';

interface HolidayItem {
  id: number;
  name: string;
  date: string;
  description: string | null;
}

const ManageOptionalHolidays = () => {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOptionalHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      setHolidays((res.data.holidays || []).filter((item: any) => item.type === 'Optional'));
    } catch (error: any) {
      toast.error('Failed to load optional holidays.');
    } finally {
      setLoading(false);
    }
  };

  const addOptionalHoliday = async () => {
    if (!name.trim() || !date) {
      toast.error('Name and date are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/holidays', { name, date, type: 'Optional', year: new Date(date).getFullYear(), description });
      toast.success('Optional holiday added.');
      setName('');
      setDate('');
      setDescription('');
      setShowForm(false);
      fetchOptionalHolidays();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to add optional holiday.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchOptionalHolidays();
  }, []);

  return (
    <div className="hd-page hd-fade-in">
      <div className="hd-header">
        <div className="hd-header-icon-premium">
          <Sparkles size={28} />
        </div>
        <div className="hd-header-info">
          <h1>Manage Optional Holidays</h1>
          <span className="hd-header-subtitle">Review and create optional holidays that employees can request.</span>
        </div>
      </div>

      <div className="hd-card" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <span>{holidays.length} optional holidays</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="hd-btn hd-btn-secondary" onClick={fetchOptionalHolidays}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="hd-btn hd-btn-teal" onClick={() => setShowForm(prev => !prev)}>
            <Plus size={16} /> {showForm ? 'Hide Form' : 'New Optional Holiday'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="hd-card hd-form-grid">
          <div className="hd-field">
            <label>Holiday Name</label>
            <input className="hd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter optional holiday name" />
          </div>
          <div className="hd-field">
            <label>Date</label>
            <input className="hd-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="hd-field hd-field--full">
            <label>Description</label>
            <textarea className="hd-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
          </div>
          <div className="hd-field hd-field--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="hd-btn hd-btn-secondary" type="button" onClick={() => setShowForm(false)}>Close</button>
            <button className="hd-btn hd-btn-teal" type="button" onClick={addOptionalHoliday} disabled={saving}>
              {saving ? 'Saving...' : 'Save Optional Holiday'}
            </button>
          </div>
        </div>
      )}

      <div className="hd-table-wrapper">
        <table className="hd-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center' }}>Loading optional holidays...</td></tr>
            ) : holidays.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center' }}>No optional holidays found.</td></tr>
            ) : (
              holidays.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.description || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOptionalHolidays;

