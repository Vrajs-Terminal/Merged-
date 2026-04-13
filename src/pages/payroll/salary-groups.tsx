import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, Copy, Loader2, Search,
    ToggleLeft, ToggleRight, Users, Layers, Filter
} from 'lucide-react';
import './salary-groups.css';
import '../company_settings/assign-employee-grade.css';

interface SalaryGroupItem {
    id: number;
    name: string;
    payroll_frequency: string;
    working_days_type: string;
    salary_calc_type: string;
    employee_count: number;
    status: string;
    createdAt: string;
    earningHeads: string[];
    deductionHeads: string[];
    componentCount: number;
}

export default function SalaryGroups() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<SalaryGroupItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'Earning' | 'Deduction'>('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/salary-groups');
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (error) {
            console.error("Failed to load salary groups", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this salary group?")) return;
        try {
            const res = await fetch(`/api/salary-groups/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete.");
            }
        } catch (error) {
            console.error("Error deleting salary group", error);
        }
    };

    const handleCopy = async (id: number) => {
        try {
            const res = await fetch(`/api/salary-groups/${id}/copy`, { method: 'POST' });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to copy.");
            }
        } catch (error) {
            console.error("Error copying salary group", error);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const res = await fetch(`/api/salary-groups/${id}/toggle`, { method: 'PATCH' });
            if (res.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error toggling status", error);
        }
    };

    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (typeFilter === 'All') return matchesSearch;
        if (typeFilter === 'Earning') return matchesSearch && g.earningHeads.length > 0;
        if (typeFilter === 'Deduction') return matchesSearch && g.deductionHeads.length > 0;
        return matchesSearch;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="salary-groups-layout">
            {/* Header */}
            <div className="sg-header-bar">
                <div className="sg-header-left">
                    <Layers size={24} color="#3b82f6" />
                    <h1>Salary Groups</h1>
                </div>
                <button className="btn-add" onClick={() => navigate('/salary-group-form')}>
                    <Plus size={16} /> Add New Group
                </button>
            </div>

            {/* Filter Bar */}
            <div className="sg-filter-bar">
                <div className="sg-filter-group" style={{ flex: 1 }}>
                    <label>Search</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search salary groups..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                </div>
                <div className="sg-filter-group">
                    <label>Type</label>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as 'All' | 'Earning' | 'Deduction')}
                    >
                        <option value="All">All</option>
                        <option value="Earning">With Earnings</option>
                        <option value="Deduction">With Deductions</option>
                    </select>
                </div>
                <button className="btn-get-data" onClick={fetchData}>
                    <Filter size={14} /> Get Data
                </button>
            </div>

            {/* Table */}
            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Sr. No</th>
                            <th style={{ width: '90px' }}>Group ID</th>
                            <th>Salary Group Name</th>
                            <th style={{ width: '110px' }}>Employees</th>
                            <th>Flexible Salary Earning Heads</th>
                            <th style={{ width: '120px' }}>Created Date</th>
                            <th style={{ width: '160px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} style={{ margin: '0 auto', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading salary groups...</div>
                                </td>
                            </tr>
                        ) : filteredGroups.length > 0 ? (
                            filteredGroups.map((group, index) => (
                                <tr key={group.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="group-id-badge">SG-{group.id}</span>
                                    </td>
                                    <td>
                                        <strong>{group.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                            {group.payroll_frequency} · {group.salary_calc_type}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="employee-count">
                                            <Users size={14} color="#64748b" />
                                            {group.employee_count}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="earning-heads-list">
                                            {group.earningHeads.slice(0, 3).map((head, i) => (
                                                <span key={i} className="earning-head-tag">{head}</span>
                                            ))}
                                            {group.earningHeads.length > 3 && (
                                                <span className="earning-head-more">+{group.earningHeads.length - 3} more</span>
                                            )}
                                            {group.earningHeads.length === 0 && (
                                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>No earning heads</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                                        {formatDate(group.createdAt)}
                                    </td>
                                    <td>
                                        <div className="sg-actions">
                                            <button
                                                className="sg-action-btn"
                                                title="Edit / Manage"
                                                onClick={() => navigate(`/salary-group-form/${group.id}`)}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="sg-action-btn"
                                                title={group.status === 'Active' ? 'Hide' : 'Show'}
                                                onClick={() => handleToggle(group.id)}
                                            >
                                                {group.status === 'Active' ? (
                                                    <ToggleRight size={18} color="#22c55e" />
                                                ) : (
                                                    <ToggleLeft size={18} color="#94a3b8" />
                                                )}
                                            </button>
                                            <button
                                                className="sg-action-btn copy"
                                                title="Copy Group"
                                                onClick={() => handleCopy(group.id)}
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button
                                                className="sg-action-btn delete"
                                                title="Delete"
                                                onClick={() => handleDelete(group.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No salary groups found. Click "Add New Group" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
