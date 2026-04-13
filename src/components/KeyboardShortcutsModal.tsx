import { X, Command, Search, LayoutDashboard, Settings, User, Bell } from 'lucide-react';
import './keyboard-shortcuts.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Ctrl + K', desc: 'Focus Search Bar', icon: <Search size={14} /> },
        { key: 'Alt + D', desc: 'Go to Dashboard', icon: <LayoutDashboard size={14} /> },
        { key: 'Alt + S', desc: 'Go to Company Settings', icon: <Settings size={14} /> },
        { key: 'Alt + P', desc: 'Go to My Profile', icon: <User size={14} /> },
        { key: 'Alt + N', desc: 'Toggle Notifications', icon: <Bell size={14} /> },
        { key: 'Esc', desc: 'Close Modal / Dropdown', icon: <X size={14} /> },
    ];

    return (
        <div className="ks-overlay" onClick={onClose}>
            <div className="ks-modal" onClick={e => e.stopPropagation()}>
                <div className="ks-header">
                    <div className="ks-title">
                        <Command size={20} />
                        <h2>Keyboard Shortcuts</h2>
                    </div>
                    <button className="ks-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="ks-body">
                    <p className="ks-subtitle">Boost your productivity with these global hotkeys</p>
                    <div className="ks-grid">
                        {shortcuts.map((s, i) => (
                            <div className="ks-item" key={i}>
                                <div className="ks-desc">
                                    {s.icon}
                                    <span>{s.desc}</span>
                                </div>
                                <div className="ks-keys">
                                    {s.key.split(' + ').map((k, j) => (
                                        <kbd key={j}>{k}</kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ks-footer">
                    <label className="ks-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="ks-slider"></span>
                        <span className="ks-toggle-label">Enable Global Hotkeys</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
