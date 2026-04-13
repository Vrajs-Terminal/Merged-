'use client';

import React, { useState } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Download, Calendar, TrendingUp, Users,
    Activity, Zap, BarChart2, Shield
} from 'lucide-react';
import './timeline-design-system.css';

const data = [
    { name: 'Mon', engagement: 4000 },
    { name: 'Tue', engagement: 3000 },
    { name: 'Wed', engagement: 2000 },
    { name: 'Thu', engagement: 2780 },
    { name: 'Fri', engagement: 1890 },
    { name: 'Sat', engagement: 2390 },
    { name: 'Sun', engagement: 3490 },
];

const pieData = [
    { name: 'Announcements', value: 400 },
    { name: 'General', value: 300 },
    { name: 'Achievements', value: 300 },
    { name: 'Events', value: 200 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

const TimelineReports: React.FC = () => {
    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <Activity className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#6366f1' }} />
                        Social Intelligence
                    </h2>
                    <p className="attendance-subtitle">Measure organizational momentum and departmental engagement velocity.</p>
                </div>
                <div className="attendance-actions">
                    <button className="btn-secondary"><Download size={14} /> Export</button>
                    <button className="btn-primary"><Zap size={14} /> Live Protocol</button>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="attendance-filters-bar">
                <div className="filter-group" style={{ maxWidth: 220 }}>
                    <label><Calendar size={12} style={{ marginRight: 4 }} /> Time Range</label>
                    <select className="tm-select">
                        <option>Past 30 Days</option>
                        <option>Past 90 Days</option>
                        <option>Full Fiscal Year</option>
                    </select>
                </div>
                <div className="filter-group" style={{ maxWidth: 200 }}>
                    <label><Shield size={12} style={{ marginRight: 4 }} /> Branch</label>
                    <select className="tm-select">
                        <option>All Branches</option>
                        <option>Mumbai Hub</option>
                        <option>Bangalore Lab</option>
                    </select>
                </div>
                <div className="filter-buttons">
                    <button className="btn-primary">Recompute</button>
                </div>
            </div>

            {/* --- KPI Grid --- */}
            <div className="attendance-kpi-grid">
                {[
                    { title: 'Social Velocity', value: '84.2K', icon: TrendingUp, delta: '+12.4%', colorClass: 'color-indigo', pos: true },
                    { title: 'Culture Reach', value: '4.2k', icon: Users, delta: '+8.1%', colorClass: 'color-green', pos: true },
                    { title: 'Sentiment Score', value: '92%', icon: BarChart2, delta: '-0.3%', colorClass: 'color-amber', pos: false },
                    { title: 'Interaction Count', value: '124K', icon: Zap, delta: '+22.4%', colorClass: 'color-rose', pos: true }
                ].map((k, i) => (
                    <div key={i} className={`kpi-card ${k.colorClass}`}>
                        <div className="kpi-icon-wrapper"><k.icon size={18} /></div>
                        <div className="kpi-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <p className="kpi-value">{k.value}</p>
                                <span className={`badge ${k.pos ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: 10 }}>{k.delta}</span>
                            </div>
                            <p className="kpi-title">{k.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Charts Grid --- */}
            <div className="attendance-charts-grid">
                {/* Area Chart */}
                <div className="attendance-chart-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 className="chart-title"><Activity size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#6366f1' }} /> Engagement Trajectory</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
                            <span className="text-label">Active Flux</span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }} />
                                <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEng)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="attendance-chart-card">
                    <h3 className="chart-title">Domain Distribution</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="value">
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                        {pieData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                    <span className="text-body" style={{ fontWeight: 600 }}>{item.name}</span>
                                </div>
                                <span className="text-caption">{item.value} Posts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineReports;
