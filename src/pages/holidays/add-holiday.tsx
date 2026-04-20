import React, { useState } from 'react';
import { CalendarPlus, Sparkles, FileText, Save } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './holidays.css';

const AddHoliday = () => {
  const [holiday, setHoliday] = useState({
    name: '',
    date: '',
    type: 'Public',
    year: new Date().getFullYear().toString(),
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setHoliday(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!holiday.name || !holiday.date) {
      toast.error('Holiday name and date are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/holidays', holiday);
      toast.success('Holiday created successfully.');
      setHoliday({ name: '', date: '', type: 'Public', year: new Date().getFullYear().toString(), description: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to create holiday.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hd-page hd-fade-in">
      <div className="hd-header">
        <div className="hd-header-icon-premium">
          <CalendarPlus size={28} />
        </div>
        <div className="hd-header-info">
          <h1>Add Holiday</h1>
          <span className="hd-header-subtitle">Create a new holiday and publish it for the organization.</span>
        </div>
      </div>

      <div className="hd-card">
        <form className="hd-form-grid" onSubmit={handleSubmit}>
          <div className="hd-field hd-field--full">
            <label>Holiday Name</label>
            <input
              className="hd-input"
              value={holiday.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter holiday title"
            />
          </div>
          <div className="hd-field">
            <label>Holiday Date</label>
            <input
              className="hd-input"
              type="date"
              value={holiday.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>
          <div className="hd-field">
            <label>Holiday Type</label>
            <select
              className="hd-select"
              value={holiday.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="Public">Public</option>
              <option value="Optional">Optional</option>
              <option value="Company">Company</option>
            </select>
          </div>
          <div className="hd-field">
            <label>Financial Year</label>
            <input
              className="hd-input"
              type="number"
              value={holiday.year}
              onChange={(e) => handleChange('year', e.target.value)}
              placeholder="2025"
            />
          </div>
          <div className="hd-field hd-field--full">
            <label>Description</label>
            <textarea
              className="hd-textarea"
              value={holiday.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add any holiday notes or contextual details"
              rows={4}
            />
          </div>
          <div className="hd-field hd-field--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="hd-btn hd-btn-secondary" onClick={() => setHoliday({ name: '', date: '', type: 'Public', year: new Date().getFullYear().toString(), description: '' })}>
              Cancel
            </button>
            <button type="submit" className="hd-btn hd-btn-teal" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoliday;

