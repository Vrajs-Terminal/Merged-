import React, { useEffect, useState } from 'react';
import { Users, Layers, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './holidays.css';

interface HolidayGroup {
  id: number;
  name: string;
  description: string | null;
  _count: { holidays: number };
}

interface HolidayItem {
  id: number;
  name: string;
  date: string;
}

const HolidayGroups = () => {
  const [groups, setGroups] = useState<HolidayGroup[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedHolidayIds, setSelectedHolidayIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const [groupsRes, holidaysRes] = await Promise.all([
        api.get('/holiday-groups'),
        api.get('/holidays')
      ]);
      setGroups(groupsRes.data || []);
      setHolidays(holidaysRes.data.holidays || []);
    } catch (error: any) {
      toast.error('Failed to load holiday groups.');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!name.trim()) {
      toast.error('Group name is required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/holiday-groups', { name, description, holidayIds: selectedHolidayIds });
      toast.success('Holiday group created.');
      setName('');
      setDescription('');
      setSelectedHolidayIds([]);
      fetchGroups();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to create group.');
    } finally {
      setSaving(false);
    }
  };

  const removeGroup = async (id: number) => {
    if (!window.confirm('Remove this holiday group?')) return;
    try {
      await api.delete(`/holiday-groups/${id}`);
      toast.success('Holiday group removed.');
      setGroups(prev => prev.filter(group => group.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete group.');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="hd-page hd-fade-in">
      <div className="hd-header">
        <div className="hd-header-icon-premium">
          <Layers size={28} />
        </div>
        <div className="hd-header-info">
          <h1>Holiday Groups</h1>
          <span className="hd-header-subtitle">Organize holidays into groups and manage them centrally.</span>
        </div>
      </div>

      <div className="hd-card hd-form-grid">
        <div className="hd-field">
          <label>Group Name</label>
          <input className="hd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Holiday group title" />
        </div>
        <div className="hd-field">
          <label>Description</label>
          <input className="hd-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional group details" />
        </div>
        <div className="hd-field hd-field--full">
          <label>Holidays in Group</label>
          <div style={{ display: 'grid', gap: 8, maxHeight: 240, overflowY: 'auto', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            {holidays.map(holiday => (
              <label key={holiday.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e293b' }}>
                <input
                  type="checkbox"
                  checked={selectedHolidayIds.includes(holiday.id)}
                  onChange={(e) => {
                    setSelectedHolidayIds(prev => e.target.checked ? [...prev, holiday.id] : prev.filter(id => id !== holiday.id));
                  }}
                />
                <span>{holiday.name} ({new Date(holiday.date).toLocaleDateString()})</span>
              </label>
            ))}
            {holidays.length === 0 && <div style={{ color: '#64748b' }}>No holidays available yet.</div>}
          </div>
        </div>
        <div className="hd-field hd-field--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="hd-btn hd-btn-secondary" onClick={() => { setName(''); setDescription(''); setSelectedHolidayIds([]); }}>
            Clear
          </button>
          <button type="button" className="hd-btn hd-btn-teal" onClick={createGroup} disabled={saving}>
            <Plus size={16} /> {saving ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>

      <div className="hd-table-wrapper">
        <table className="hd-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Description</th>
              <th>Holiday Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center' }}>Loading groups...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center' }}>No holiday groups created yet.</td></tr>
            ) : (
              groups.map(group => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.description || '—'}</td>
                  <td>{group._count.holidays}</td>
                  <td>
                    <button className="hd-btn hd-btn-secondary" style={{ padding: '10px 12px' }} onClick={() => removeGroup(group.id)}>
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

export default HolidayGroups;

