import React, { useEffect, useState } from 'react';
import { Layers, UserPlus, Trash2, Users } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './holidays.css';

interface Group {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Assignment {
  id: number;
  group: Group;
  user?: { id: number; name: string; branch?: { name: string }; department?: { name: string } };
  department?: { id: number; name: string; branch?: { name: string } };
}

const AssignGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groupId, setGroupId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupRes, deptRes, assignmentRes] = await Promise.all([
        api.get('/holiday-groups'),
        api.get('/departments'),
        api.get('/holiday-groups/assignments')
      ]);
      setGroups(groupRes.data || []);
      setDepartments(deptRes.data || []);
      setAssignments(assignmentRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async () => {
    if (!groupId || !departmentId) {
      toast.error('Select group and department first.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/holiday-groups/assign', { groupId, departmentId });
      toast.success('Group assigned successfully.');
      setGroupId('');
      setDepartmentId('');
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to assign group.');
    } finally {
      setSaving(false);
    }
  };

  const removeAssignment = async (id: number) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await api.delete(`/holiday-groups/assignments/${id}`);
      toast.success('Assignment removed.');
      setAssignments(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to remove assignment.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="hd-page hd-fade-in">
      <div className="hd-header">
        <div className="hd-header-icon-premium">
          <UserPlus size={28} />
        </div>
        <div className="hd-header-info">
          <h1>Assign Holiday Groups</h1>
          <span className="hd-header-subtitle">Assign groups to departments and keep holiday access organized.</span>
        </div>
      </div>

      <div className="hd-card hd-form-grid">
        <div className="hd-field">
          <label>Holiday Group</label>
          <select className="hd-select" value={groupId} onChange={(e) => setGroupId(Number(e.target.value) || '')}>
            <option value="">Select group</option>
            {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </div>
        <div className="hd-field">
          <label>Department</label>
          <select className="hd-select" value={departmentId} onChange={(e) => setDepartmentId(Number(e.target.value) || '')}>
            <option value="">Select department</option>
            {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
          </select>
        </div>
        <div className="hd-field hd-field--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="hd-btn hd-btn-secondary" onClick={() => { setGroupId(''); setDepartmentId(''); }}>
            Clear
          </button>
          <button type="button" className="hd-btn hd-btn-teal" onClick={submitAssignment} disabled={saving}>
            <Layers size={16} /> {saving ? 'Assigning...' : 'Assign Group'}
          </button>
        </div>
      </div>

      <div className="hd-table-wrapper">
        <table className="hd-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Department</th>
              <th>Branch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center' }}>Loading assignments...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center' }}>No assignments found.</td></tr>
            ) : (
              assignments.map(item => (
                <tr key={item.id}>
                  <td>{item.group?.name || '—'}</td>
                  <td>{item.department?.name || item.user?.name || '—'}</td>
                  <td>{item.department?.branch?.name || item.user?.branch?.name || '—'}</td>
                  <td>
                    <button className="hd-btn hd-btn-secondary" style={{ padding: '10px 12px' }} onClick={() => removeAssignment(item.id)}>
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

export default AssignGroups;

