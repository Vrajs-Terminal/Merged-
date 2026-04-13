import React, { useState, useEffect } from 'react';
import { Smartphone, Search, Filter, ShieldCheck, ShieldAlert, Power, Trash2, Link } from 'lucide-react';
import api from '../../lib/axios';
import './mobile-device.css';

interface Employee {
    id: number;
    name: string;
    department?: { id: number; name: string };
    mobileDevice?: {
        macAddress?: string;
        deviceId?: string;
        deviceName?: string;
        lastLoginAt?: string;
        status: string;
        isActive: boolean;
    };
}

const DeviceSettings: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);

            const res = await api.get(`/mobile-device?${params.toString()}`);
            setEmployees(res.data);
        } catch (error) {
            console.error('Failed to fetch devices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDevices();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter]);

    const handleUnbind = async (userId: number) => {
        if (!window.confirm('Are you sure you want to unbind this device? The user will need to re-verify their next login.')) return;
        try {
            await api.post('/mobile-device/unbind', { user_id: userId });
            fetchDevices();
        } catch (error) {
            alert('Failed to unbind device');
        }
    };

    const handleToggle = async (userId: number, currentActive: boolean) => {
        try {
            await api.patch('/mobile-device/toggle-status', { user_id: userId, isActive: !currentActive });
            fetchDevices();
        } catch (error) {
            alert('Failed to toggle status');
        }
    };

    const handleReset = async (userId: number) => {
        if (!window.confirm('Reset will permanently delete this device record. Continue?')) return;
        try {
            await api.post('/mobile-device/reset', { user_id: userId });
            fetchDevices();
        } catch (error) {
            alert('Failed to reset device');
        }
    };

    return (
        <div className="md-layout md-fade-in">
            <div className="md-header">
                <div className="md-header-left">
                    <div className="md-header-icon-premium">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h2>Mobile Device Binding</h2>
                        <p className="md-header-subtitle">Control and manage authorized mobile devices for employee logins</p>
                    </div>
                </div>
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
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select 
                        className="md-filter-select" 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Bound">Bound Devices</option>
                        <option value="Unbound">Unbound / None</option>
                    </select>
                </div>
            </div>

            <div className="md-table-container">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                ) : (
                    <table className="md-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Device Info</th>
                                <th>Last Login</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No matching records found.
                                    </td>
                                </tr>
                            ) : employees.map(emp => {
                                const isBound = emp.mobileDevice?.status === 'Bound';
                                const isActive = emp.mobileDevice?.isActive ?? true;

                                return (
                                    <tr key={emp.id} style={{ opacity: isActive ? 1 : 0.6 }}>
                                        <td style={{ fontWeight: 600 }}>{emp.name}</td>
                                        <td>{emp.department?.name || 'N/A'}</td>
                                        <td>
                                            {isBound ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontWeight: 500 }}>{emp.mobileDevice?.deviceName || 'Unknown Phone'}</span>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{emp.mobileDevice?.deviceId || emp.mobileDevice?.macAddress || 'No ID'}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            {emp.mobileDevice?.lastLoginAt 
                                                ? new Date(emp.mobileDevice.lastLoginAt).toLocaleString() 
                                                : '-'}
                                        </td>
                                        <td>
                                            <span className={`md-status-badge md-status-${isBound ? 'bound' : 'unbound'}`}>
                                                {isBound ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                                {isBound ? 'Bound' : 'unbound'}
                                            </span>
                                            {!isActive && isBound && (
                                                <span style={{ display: 'block', fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Access Revoked</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="md-action-group">
                                                {isBound ? (
                                                    <>
                                                        <button 
                                                            className="md-btn" 
                                                            style={{ padding: '6px 12px', background: '#f1f5f9', color: '#64748b' }}
                                                            onClick={() => handleUnbind(emp.id)}
                                                            title="Unbind Device"
                                                        >
                                                            <Link size={16} /> Unbind
                                                        </button>
                                                        <button 
                                                            className={`md-btn ${isActive ? 'md-btn-danger' : 'md-btn-success'}`}
                                                            style={{ padding: '6px 12px' }}
                                                            onClick={() => handleToggle(emp.id, isActive)}
                                                            title={isActive ? "Revoke app access" : "Restore app access"}
                                                        >
                                                            <Power size={16} /> {isActive ? 'Disable' : 'Enable'}
                                                        </button>
                                                        <button
                                                            className="md-btn"
                                                            style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444' }}
                                                            onClick={() => handleReset(emp.id)}
                                                            title="Reset Device Record"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>No active binding</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DeviceSettings;
