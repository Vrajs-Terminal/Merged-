'use client';

import React, { useState } from 'react';
import {
    Paintbrush, Zap, Layout, Palette, ImageIcon, ChevronRight,
    Search, Filter, PlusCircle, Trash2, Edit3, Target,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import './timeline-design-system.css';

const TemplateManagement: React.FC = () => {
    const [templates] = useState([
        { id: 1, name: 'Corporate Birthday (Blue)', category: 'Birthday', status: 'Active', usage: 1240 },
        { id: 2, name: 'Modern Anniversary (Pink)', category: 'Anniversary', status: 'Active', usage: 840 },
        { id: 3, name: 'Achievement Kudos (Green)', category: 'Achievement', status: 'Draft', usage: 0 }
    ]);

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <Paintbrush className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#8b5cf6' }} />
                        Branding Studio
                    </h2>
                    <p className="attendance-subtitle">Design high-impact visual assets for automated organizational celebrations.</p>
                </div>
                <div className="attendance-actions">
                    <button className="btn-primary" onClick={() => toast.success('Initializing design canvas...')}>
                        <PlusCircle size={14} /> New Asset
                    </button>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="attendance-filters-bar">
                <div className="filter-group" style={{ flex: 2 }}>
                    <label><Search size={12} style={{ marginRight: 4 }} /> Search</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" placeholder="Template name, category, or tag..." className="tm-input" style={{ paddingLeft: 36 }} />
                    </div>
                </div>
                <div className="filter-group" style={{ maxWidth: 220 }}>
                    <label><Filter size={12} style={{ marginRight: 4 }} /> Category</label>
                    <select className="tm-select">
                        <option>All Categories</option>
                        <option>Birthdays</option>
                        <option>Anniversaries</option>
                    </select>
                </div>
                <div className="filter-buttons">
                    <button className="btn-secondary"><Zap size={14} /> Filter</button>
                </div>
            </div>

            {/* --- KPI Grid --- */}
            <div className="attendance-kpi-grid">
                {[
                    { title: 'Ready Assets', value: '12', icon: Layout, colorClass: 'color-indigo' },
                    { title: 'Global Reach', value: '4.2k+', icon: Target, colorClass: 'color-rose' },
                    { title: 'Visual Velocity', value: '92%', icon: Zap, colorClass: 'color-amber' },
                    { title: 'Custom Sets', value: '4', icon: Palette, colorClass: 'color-green' }
                ].map((k, i) => (
                    <div key={i} className={`kpi-card ${k.colorClass}`}>
                        <div className="kpi-icon-wrapper"><k.icon size={18} /></div>
                        <div className="kpi-content">
                            <p className="kpi-value">{k.value}</p>
                            <p className="kpi-title">{k.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Templates Table --- */}
            <div className="tm-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="tm-table">
                        <thead>
                            <tr>
                                <th>Asset Identity</th>
                                <th>Category</th>
                                <th>Engagement</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((t, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', border: '1px solid #e2e8f0' }}>
                                                <ImageIcon size={16} />
                                            </div>
                                            <div>
                                                <div className="text-body" style={{ fontWeight: 700 }}>{t.name}</div>
                                                <div className="text-label">Master Template Set</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${t.category === 'Birthday' ? 'badge-rose' : t.category === 'Anniversary' ? 'badge-indigo' : 'badge-emerald'}`}>{t.category}</span>
                                    </td>
                                    <td>
                                        <div className="text-body" style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#6366f1' }}>
                                            <Activity size={12} /> {t.usage} Interactions
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div className="status-dot" style={{ background: t.status === 'Active' ? '#10b981' : '#f59e0b' }} />
                                            <span className="text-label" style={{ color: t.status === 'Active' ? '#10b981' : '#f59e0b' }}>{t.status}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                            <button className="btn-secondary" style={{ padding: 6, border: 'none' }} title="Edit"><Edit3 size={14} /></button>
                                            <button className="btn-secondary" style={{ padding: 6, border: 'none' }} title="Delete"><Trash2 size={14} style={{ color: '#ef4444' }} /></button>
                                            <button className="btn-secondary" style={{ padding: 6, border: 'none' }}><ChevronRight size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TemplateManagement;
