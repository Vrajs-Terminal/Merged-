import "./header.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, User, Users, PanelLeftClose, LogOut, Settings, Keyboard, Plus, Pencil, Trash2, RefreshCw, ChevronDown, Building, LayoutTemplate, Hash, Shield, X as XIcon, DollarSign, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import api from "../lib/axios";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";




interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
    const [placeholderText, setPlaceholderText] = useState("Search services...");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Notification Store
    const {
        notifications,
        hasUnread,
        isLoading: isLoadingNotifs,
        fetchNotifications,
        markAsRead
    } = useNotificationStore();

    // Modal State
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();

    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

    useEffect(() => {
        if (!isAdmin) return;
        fetchNotifications(15); // Increased for bar
        const interval = setInterval(() => fetchNotifications(15), 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications, isAdmin]);

    useEffect(() => {
        const services = [
            "Search Employees...",
            "Search Payroll...",
            "Search Recruitment...",
            "Search Performance..."
        ];

        let index = 0;
        const intervalId = setInterval(() => {
            setPlaceholderText(services[index]);
            index = (index + 1) % services.length;
        }, 2000);

        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
                setIsExpanded(false);
            }
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('header-search-input')?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATED': return <Plus size={14} />;
            case 'UPDATED': return <Pencil size={14} />;
            case 'DELETED': return <Trash2 size={14} />;
            default: return <Bell size={14} />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATED': return 'notif-action-created';
            case 'UPDATED': return 'notif-action-updated';
            case 'DELETED': return 'notif-action-deleted';
            default: return 'notif-action-default';
        }
    };

    const formatEntityType = (type: string) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };


    // Universal Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                setShowSearchResults(true);
                try {
                    const res = await api.get(`/search?q=${searchQuery}`);
                    setSearchResults(res.data.results);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const normalizeRoutePath = (path: string) => {
        const cleanPath = path.startsWith("#") ? path.slice(1) : path;
        const routeAliases: Record<string, string> = {
            "/attendance/dashboard": "/attendance-dashboard",
            "/payroll/employee-ctc": "/employee-ctc",
            "/company-settings/branches": "/branches",
            "/dashboard": "/",
        };
        return routeAliases[cleanPath] || cleanPath;
    };

    const handleSearchResultClick = (path: string) => {
        navigate(normalizeRoutePath(path));
        setShowSearchResults(false);
        setSearchQuery("");
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'Module': return <LayoutTemplate size={16} />;
            case 'Admin': return <Shield size={16} />;
            case 'Employee': return <User size={16} />;
            case 'Branch': return <Building size={16} />;
            case 'Department': return <Users size={16} />;
            default: return <Hash size={16} />;
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (value.length > 1) {
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
        }
    };

    return (
        <header className="header-container">
            <div className="header-main-row">
                <div className="header-left">
                    <button className="menu-toggle-btn" onClick={toggleSidebar} title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
                        <PanelLeftClose size={20} className={`menu-icon-btn ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="search-wrapper" ref={searchWrapperRef}>
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                id="header-search-input"
                                placeholder={placeholderText}
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => setShowSearchResults(true)}
                            />
                            {searchQuery ? (
                                <button 
                                    className="search-clear-btn"
                                    onClick={() => {
                                        setSearchQuery("");
                                    }}
                                >
                                    <XIcon size={14} />
                                </button>
                            ) : (
                                <div className="search-kbd-hint">
                                    <span>{window.navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</span>
                                    <span>K</span>
                                </div>
                            )}
                        </div>

                        {showSearchResults && (
                            <div className="search-results-dropdown">
                                <div className="search-results-scroll">
                                    {searchQuery.length === 0 ? (
                                        <div className="quick-links-section">
                                            <div className="ql-header">Quick Links</div>
                                            <div className="ql-grid">
                                                <div className="ql-item" onClick={() => handleSearchResultClick('/attendance-dashboard')}>
                                                    <div className="ql-icon blue"><LayoutTemplate size={18} /></div>
                                                    <span>Attendance</span>
                                                </div>
                                                <div className="ql-item" onClick={() => handleSearchResultClick('/employee-ctc')}>
                                                    <div className="ql-icon green"><DollarSign size={18} /></div>
                                                    <span>Payroll</span>
                                                </div>
                                                <div className="ql-item" onClick={() => handleSearchResultClick('/')}>
                                                    <div className="ql-icon purple"><Users size={18} /></div>
                                                    <span>Employees</span>
                                                </div>
                                                <div className="ql-item" onClick={() => handleSearchResultClick('/branches')}>
                                                    <div className="ql-icon orange"><Building size={18} /></div>
                                                    <span>Settings</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : isSearching ? (
                                        <div className="search-loading">
                                            <Loader2 className="spin" size={24} />
                                            <p>Searching for "{searchQuery}"...</p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            <div className="results-header">Search Results ({searchResults.length})</div>
                                            {searchResults.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className="search-result-item"
                                                    onClick={() => {
                                                        handleSearchResultClick(result.path);
                                                    }}
                                                >
                                                    <div className={`result-icon-type color-${result.type.toLowerCase()}`}>
                                                        {getResultIcon(result.type)}
                                                    </div>
                                                    <div className="result-info">
                                                        <div className="result-title">{result.title}</div>
                                                        <div className="result-subtitle">
                                                            <span className="result-category">{result.type}</span>
                                                            <span className="result-separator">•</span>
                                                            <span className="result-meta">{result.subtitle}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="search-no-results">
                                            <Search size={32} />
                                            <p>No matches for "{searchQuery}"</p>
                                            <span>Try searching for something else</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="header-right-group">

                    {/* Admin Only Notification Bell */}
                    {isAdmin && (
                        <div className="notifications-wrapper" ref={notifRef}>
                            <div className="notifications" onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications) markAsRead();
                            }}>
                                <Bell size={20} className="bell-icon" />
                                {hasUnread && <span className="notification-dot"></span>}
                            </div>

                            {showNotifications && (
                                <div className={`dropdown-menu notifications-dropdown ${isExpanded ? 'notif-expanded' : ''}`}>
                                    <div className="dropdown-header">
                                        <h4>Activities</h4>
                                        <div className="notif-header-actions">
                                            <button
                                                className={`notif-refresh-btn ${isLoadingNotifs ? 'spin' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); fetchNotifications(isExpanded ? 100 : 5); }}
                                                disabled={isLoadingNotifs}
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                            <span className="badge">{notifications.length} New</span>
                                        </div>
                                    </div>

                                    <div className="notif-scroll-area">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div key={notif.id} className="dropdown-item notif-item">
                                                    <div className={`notif-icon ${getActionColor(notif.action)}`}>
                                                        {getActionIcon(notif.action)}
                                                    </div>
                                                    <div className="notif-text">
                                                        <p>
                                                            <strong>{notif.user?.name || 'System'}</strong> {notif.action.toLowerCase()} {formatEntityType(notif.entity_type)}{' '}
                                                            <span className="notif-entity-name">"{notif.entity_name}"</span>
                                                        </p>
                                                        <span className="notif-meta">{timeAgo(notif.createdAt)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="notif-empty">
                                                <Bell size={24} />
                                                <p>No new notifications</p>
                                                <span>All caught up!</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="notif-footer">
                                        <button onClick={() => setIsExpanded(!isExpanded)} className="notif-collapse-btn">
                                            {isExpanded ? 'Show Less' : 'View All Activities'}
                                            <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Section */}
                    <div className="user-profile-wrapper" ref={profileRef}>
                        <div className="user-profile-header" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="header-user-name">
                                {user?.name || "Guest USER"}
                            </div>
                            <div className={`user-avatar-header ${isAdmin ? 'premium-navy' : ''}`}>
                                {isAdmin ? <Shield size={20} /> : <User size={20} />}
                            </div>
                        </div>

                        {showProfileMenu && (
                            <div className="dropdown-menu profile-dropdown">
                                <div className="dropdown-header profile-header-info">
                                    <p className="ph-name">{user?.name}</p>
                                    <p className="ph-email">{user?.email}</p>
                                </div>
                                <div className="dropdown-content">
                                    <button className="dropdown-item">
                                        <User size={18} /> My Profile
                                    </button>
                                    <button className="dropdown-item">
                                        <Settings size={18} /> Account Settings
                                    </button>
                                    <button className="dropdown-item" onClick={() => setShowShortcuts(true)}>
                                        <Keyboard size={18} /> Keyboard Shortcuts
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-action" onClick={logout}>
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <KeyboardShortcutsModal
                isOpen={showShortcuts}
                onClose={() => setShowShortcuts(false)}
            />

        </header>
    );
}

export default Header;
