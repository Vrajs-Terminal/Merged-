import "./sidebar.css";
import meshBg from "../assets/image-mesh-gradient.png";
import logo from "../assets/logo2.png";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    Users,
    Calculator,
    Activity,
    ClipboardList,
    FileText,
    Building2,
    ChevronRight,
    ChevronDown,
    MapPin,
    Map,
    Briefcase,
    TrendingUp,
    Car,
    Lightbulb,
    ShieldAlert,
    Calendar,
    Smartphone,
    MessageSquare,
    Store,
    ShieldCheck,
    LogIn,
    Flag,
    AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { moduleSidebarModules } from "../config/moduleSidebarModules";

interface SubItem {
    name: string;
    path: string;
    subItems?: SubItem[];
}

interface MenuItem {
    name: string;
    icon: any;
    path?: string;
    subItems?: SubItem[];
}

interface SidebarProps {
    isOpen: boolean;
}

interface Branding {
    logo?: string;
    thumbnail?: string;
    companyName?: string;
}

function Sidebar({ isOpen }: SidebarProps) {
    const { user } = useAuthStore();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const [branding, setBranding] = useState<Branding>({});

    const fetchBranding = async () => {
        try {
            const res = await fetch('/api/settings/COMPANY_BRANDING');
            if (res.ok) {
                const data = await res.json();
                setBranding(data || {});
            }
        } catch (err) {
            console.error('Failed to fetch branding', err);
        }
    };

    const toggleMenu = (menuName: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const menuItems: MenuItem[] = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { 
            name: "Timeline", 
            icon: Activity,
            subItems: [
                { name: "Social Feed", path: "/timeline" },
                { name: "Create Post", path: "/timeline/create" },
                { name: "Auto Celebration", path: "/timeline/auto-celebration" },
                { name: "Template Management", path: "/timeline/template-management" },
                { name: "Social Interactions", path: "/timeline/social-interactions" },
                { name: "Tagging & Mentions", path: "/timeline/tagging-mentions" },
                { name: "Manage Timeline", path: "/timeline/manage-timeline" },
                { name: "Reports & Analytics", path: "/timeline/reports" },
                { name: "Settings", path: "/timeline/settings" },
            ]
        },
        {
            name: "Company Settings",
            icon: Settings,
            subItems: [
                { name: "Company Setup", path: "/company-setup" },
                { name: "Sister Companies", path: "/sister-companies" },
                { name: "Roles & Privileges", path: "/admin-rights" },
                { name: "Admin Menu Reordering", path: "/admin-menu-reordering" },
                { name: "Zones", path: "/zones" },
                { name: "Branches", path: "/branches" },
                { name: "Departments", path: "/departments" },
                { name: "Sub-Departments", path: "/sub-departments" },
                { name: "Designations", path: "/designations" },
                { name: "Employee Levels", path: "/employee-levels" },
                { name: "Employee Grades", path: "/employee-grades" },
                { name: "Assign Employee Grade", path: "/assign-employee-grade" },
                { name: "ID Card Templates", path: "/id-card-templates" },
                { name: "Employee Parking Area", path: "/employee-parking" },
                { name: "Emergency Numbers", path: "/emergency-numbers" },
                { name: "Manage WhatsApp Alerts", path: "/whatsapp-alerts" },
                { name: "Daily Attendance Email", path: "/daily-attendance-email" },
            ]
        },
        {
            name: "Attendance",
            icon: ClipboardList,
            subItems: [
                { name: "Attendance Dashboard", path: "/attendance-dashboard" },
                { name: "View Attendance", path: "/view-attendance" },
                { name: "Add Attendance", path: "/add-attendance" },
                { name: "Month Wise Attendances", path: "/month-wise-attendance" },
                { name: "Weekly Attendance", path: "/weekly-attendance" },
                { name: "Pending Attendance", path: "/pending-attendance" },
                { name: "Punch Out Missing Request", path: "/punch-out-missing-request" },
                { name: "Punch Out Missing Approval", path: "/punch-out-missing-approval" },
                { name: "Previous Date Attendance Request", path: "/previous-date-attendance" },
                { name: "Update Attendance", path: "/update-attendance" },
                { name: "Update Break", path: "/update-break" },
                { name: "Week Off Exchange Request", path: "/week-off-exchange" },
                { name: "Week Off Approval", path: "/week-off-approval" },
                { name: "Absent Employees", path: "/absent-employees" },
                { name: "Add Bulk Attendance", path: "/add-bulk-attendance" },
                { name: "Pending Break", path: "/pending-break" },
                { name: "Break Approval Request", path: "/break-approval" },
                { name: "Overtime Request", path: "/overtime-request" },
                { name: "Overtime Approval", path: "/overtime-approval" },
                { name: "Delete Attendance", path: "/delete-attendance" },
                { name: "Attendance Modification Request", path: "/attendance-modification" },
                { name: "Recalculate Attendance", path: "/recalculate-attendance" },
                { name: "Pending Flags", path: "/pending-flags" },
            ]
        },
        {
            name: "Employee Tracking",
            icon: MapPin,
            subItems: [
                { name: "Tracking Dashboard", path: "/tracking-dashboard" },
                { name: "Employee Live Tracking", path: "/employee-live-tracking" },
                { name: "Tracking History", path: "/tracking-history" },
                { name: "Geo-Fence Settings", path: "/geofence-settings" },
                { name: "Exception Management", path: "/exception-management" },
                { name: "Tracking Reports", path: "/tracking-reports" },
                { name: "Tracking Employee Wise", path: "/tracking-employee-wise" },
            ]
        },
        {
            name: "Visit Management",
            icon: Map,
            subItems: [
                { name: "Visit Dashboard", path: "/visit-dashboard" },
                { name: "Visit Planning", path: "/visit-planning" },
                { name: "Visit Status", path: "/visit-status" },
                { name: "Check-In / Out", path: "/visit-check-in-out" },
                { name: "Visit Approvals", path: "/visit-approvals" },
                { name: "Manager Approval Visit", path: "/manager-approval-visit" },
                { name: "Reports & Analytics", path: "/visit-reports" },
                { name: "Visit Settings", path: "/visit-settings" },
            ]
        },
        {
            name: "Payroll",
            icon: Calculator,
            subItems: [
                { name: "Payroll & Tax Setting", path: "/payroll-tax-settings" },
                { name: "Earning / Deduction Type", path: "/earning-deduction-types" },
                { name: "Salary Group", path: "/salary-groups" },
                { name: "Incentive Type", path: "/incentive-types" },
                { name: "Gratuity Setting", path: "/gratuity-settings" },
                { name: "Employee CTC", path: "/employee-ctc" },
                {
                    name: "Salary Creation",
                    path: "#salary-creation",
                    subItems: [
                        { name: "Create Salary", path: "/create-salary" },
                        { name: "Bulk Create Salary", path: "/bulk-create-salary" },
                        { name: "Generated Salary", path: "/generated-salary" },
                        { name: "Publish Salary", path: "/published-salary" },
                    ]
                },
                { name: "Other Earnings / Deductions", path: "/other-earnings" },
                { name: "Employee Incentives", path: "/employee-incentives" },
                { name: "F&F Settlement", path: "/ff-settlement" },
                { name: "Employee Bank Details", path: "/employee-bank-details" },
                { name: "Change Salary Group", path: "/change-salary-group" },
                { name: "Salary Hold Requests", path: "/salary-hold-requests" },
                { name: "Payroll Reports", path: "/payroll-reports" },
            ]
        },
        {
            name: "Tax Exemption",
            icon: FileText,
            subItems: [
                { name: "Tax Regime Setting", path: "/tax-exemption/tax-regime-setting" },
                { name: "TDS Deduction Rules Setting", path: "/tax-exemption/tds-rules-setting" },
                { name: "Tax Benefit Category", path: "/tax-exemption/tax-benefit-category" },
                { name: "Tax Benefit Sub Category", path: "/tax-exemption/tax-benefit-sub-category" },
                { name: "Income Tax Slabs", path: "/tax-exemption/tax-slabs" },
                { name: "Generate Form 16", path: "/tax-exemption/generate-form16" },
                { name: "Manage Tax Benefit Document", path: "/tax-exemption/manage-tax-documents" },
                { name: "Pending Tax Benefit Document", path: "/tax-exemption/pending-tax-documents" },
                { name: "Other Income / Losses", path: "/tax-exemption/other-income-loss" },
                { name: "Generate Challan", path: "/tax-exemption/generate-challan" },
                { name: "Rejected Tax Benefit Document", path: "/tax-exemption/rejected-tax-documents" },
                { name: "TDS Paid Summary", path: "/tax-exemption/tds-paid-summary" },
                { name: "Previous Employer Details", path: "/tax-exemption/previous-employer" },
                { name: "Report Section (4 Key Reports)", path: "/tax-exemption/report-section" },
            ]
        },
        {
            name: "Work Allocation System",
            icon: ClipboardList,
            subItems: [
                { name: "Work Category", path: "/work-allocation/categories" },
                { name: "Work Allocation Assign", path: "/work-allocation/access" },
                { name: "View Work Allocation", path: "/work-allocation/view" },
                { name: "Work Allocation Report", path: "/work-allocation/report" },
            ]
        },
        {
            name: "Site Management",
            icon: Briefcase,
            subItems: [
                { name: "Manage Site", path: "/site_management/manage-site" },
                { name: "Site Employees", path: "/site_management/site-employees" },
                { name: "Site Wise Attendance", path: "/site_management/site-wise-attendance" },
                { name: "View Site Attendance", path: "/site_management/view-site-attendance" },
                { name: "Site Wise Report", path: "/site_management/site-wise-report" },
                { name: "Site Attendance Summary", path: "/site_management/site-attendance-summary" },
                { name: "Site Attendance Counts", path: "/site_management/site-attendance-counts" },
                { name: "Manage Site Purchase", path: "/site_management/manage-site-purchase" },
                { name: "Site Attendance Report", path: "/site_management/site-attendance-report" },
            ]
        },
        {
            name: "PMS – Performance Matrix",
            icon: TrendingUp,
            subItems: [
                { name: "Manage PMS Assign", path: "/pms/manage-assign" },
                { name: "Dimension Name", path: "/pms/dimension-name" },
                { name: "Dimension Sub-Group", path: "/pms/dimension-sub-group" },
                { name: "Score Band Master", path: "/pms/score-band-master" },
                { name: "PMS Performance Report", path: "/pms/performance-report" },
                { name: "Performance Summary", path: "/pms/performance-summary" },
            ]
        },
        {
            name: "Employee Vehicles",
            icon: Car,
            subItems: [
                { name: "Manage Vehicle Category", path: "/vehicles/category" },
                { name: "Add Vehicle", path: "/vehicles/add" },
                { name: "Vehicles Report", path: "/vehicles/report" },
                { name: "QR for Vehicle", path: "/vehicles/qr" },
            ]
        },
        {
            name: "Idea Box",
            icon: Lightbulb,
            subItems: [
                { name: "Idea Category", path: "/idea-box/category" },
                { name: "Manage Ideas", path: "/idea-box/manage" },
                { name: "Approve Ideas", path: "/idea-box/approve" },
                { name: "Leaderboard", path: "/idea-box/leaderboard" },
            ]
        },
        {
            name: "SOS Management",
            icon: ShieldAlert,
            subItems: [
                { name: "Manage SOS", path: "/sos/manage" },
                { name: "Add SOS", path: "/sos/add" },
                { name: "SOS Reports", path: "/sos/reports" },
            ]
        },
        {
            name: "Holiday",
            icon: Calendar,
            subItems: [
                { name: "Add Holiday", path: "/holiday/add" },
                { name: "Manage Holiday", path: "/holiday/manage" },
                { name: "Holiday Group", path: "/holiday/group" },
                { name: "Assign Group", path: "/holiday/assign" },
                { name: "Manage Optional Holiday", path: "/holiday/optional-manage" },
                { name: "Optional Holiday Request", path: "/holiday/optional-request" },
            ]
        },
        {
            name: "Mobile Device Bind",
            icon: Smartphone,
            subItems: [
                { name: "Device Settings", path: "/mobile-device/settings" },
                { name: "Change Requests", path: "/mobile-device/requests" },
            ]
        },
        {
            name: "Manage Chat Group",
            icon: MessageSquare,
            subItems: [
                { name: "Manage Groups", path: "/chat_group" },
                { name: "Chat Group Members", path: "/chat_group/members" },
            ]
        },
        {
            name: "Daily Work Report",
            path: "/daily-work-report",
            icon: FileText
        },
        {
            name: "Vendor",
            icon: Store,
            subItems: [
                { name: "Vendor Category", path: "/vendor/category" },
                { name: "Vendor Sub Category", path: "/vendor/sub-category" },
                { name: "Add Vendor", path: "/vendor/add" },
                { name: "Manage Vendors", path: "/vendor/manage" },
                { name: "Vendor Report", path: "/vendor/reports" },
            ]
        },
        {
            name: "Background Verification (BGV)",
            icon: ShieldCheck,
            subItems: [
                { name: "Manage BGV", path: "/bgv/manage" },
                { name: "Verification Type", path: "/bgv/types" },
                { name: "Verification Report", path: "/bgv/reports" },
            ]
        },
        {
            name: "Visitors",
            icon: Users,
            subItems: [
                { name: "Visitor In/Out", path: "/visitors/manage" },
                { name: "Visitor Sub Type", path: "/visitors/sub-types" },
                { name: "Visitor Settings", path: "/visitors/settings" },
                { name: "Visitor Reports", path: "/visitors/reports" },
            ]
        },
        {
            name: "Complaints",
            icon: ShieldAlert,
            subItems: [
                { name: "Manage Complaints", path: "/complaints/manage" },
                { name: "Complaint Category", path: "/complaints/categories" },
                { name: "Complaint Email Config", path: "/complaints/email-config" },
            ]
        },
        {
            name: "Discussion",
            icon: MessageSquare,
            subItems: [
                { name: "Manage Discussion", path: "/discussions/manage" },
                { name: "Create Discussion", path: "/discussions/manage?action=add" },
            ]
        },
        {
            name: "Escalation",
            icon: AlertCircle,
            subItems: [
                { name: "Manage Escalation", path: "/escalations/manage" },
                { name: "Raise Escalation", path: "/escalations/manage?action=add" },
            ]
        },
        {
            name: "Meeting",
            icon: Calendar,
            subItems: [
                { name: "Schedule Meeting", path: "/meetings/schedule" },
                { name: "Manage Meetings", path: "/meetings/manage" },
                { name: "Meeting Participants", path: "/meetings/participants" },
                { name: "Meeting Attendance", path: "/meetings/attendance" },
                { name: "Meeting Minutes (MOM)", path: "/meetings/mom" },
                { name: "Action Items Tracker", path: "/meetings/action-items" },
                { name: "Meeting Notifications", path: "/meetings/notifications" },
                { name: "Meeting Reports", path: "/meetings/reports" },
                { name: "Meeting Settings", path: "/meetings/settings" },
                { name: "Meeting Recordings", path: "/meetings/recordings" },
            ]
        },
        ...moduleSidebarModules,
    ];

    const [dynamicMenuItems, setDynamicMenuItems] = useState(menuItems);

    useEffect(() => {
        const fetchMenuOrder = async () => {
            try {
                const res = await fetch('/api/settings/ADMIN_MENU_ORDER');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data)) {
                        const orderData: { id: string; name: string; iconName: string; order: number }[] = data;
                        
                        // 1. Normalize backend names to match local menuItems
                        const normalizedOrder = orderData.map(item => {
                            let name = item.name;
                            if (name === 'Visitors Module') name = 'Visitors';
                            if (name === 'Complaints Module') name = 'Complaints';
                            if (name === 'Discussion Module' || name === 'Add Discussion' || name === 'Manage Discussion') name = 'Discussion';
                            if (name === 'Escalation Module' || name === 'Manage Escalation') name = 'Escalation';
                            if (name === 'Meeting Module' || name === 'Meetings') name = 'Meeting';
                            return { ...item, name };
                        });

                        const sorted = [...normalizedOrder].sort((a, b) => a.order - b.order);
                        
                        // 2. Map to local items, deduplicating by name
                        const newOrderedList: any[] = [];
                        const seenNames = new Set<string>();

                        sorted.forEach(savedItem => {
                            const localMatch = menuItems.find(m => m.name === savedItem.name);
                            if (localMatch && !seenNames.has(localMatch.name)) {
                                newOrderedList.push(localMatch);
                                seenNames.add(localMatch.name);
                            }
                        });

                        // 3. Add any missing local items
                        menuItems.forEach(localItem => {
                            if (!seenNames.has(localItem.name)) {
                                newOrderedList.push(localItem);
                                seenNames.add(localItem.name);
                            }
                        });

                        setDynamicMenuItems(newOrderedList);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch menu order', err);
            }
        };

        fetchMenuOrder();
        fetchBranding();
        window.addEventListener('menuOrderChanged', fetchMenuOrder);
        window.addEventListener('brandingChanged', fetchBranding);
        return () => {
            window.removeEventListener('menuOrderChanged', fetchMenuOrder);
            window.removeEventListener('brandingChanged', fetchBranding);
        };
    }, []);

    const isActive = (path?: string) => {
        if (!path || path === "#") return false;
        if (path === "/") return location.pathname === "/";

        const currentPath = location.pathname.replace(/\/+$/, "");
        const targetPath = path.replace(/\/+$/, "");

        return currentPath === targetPath;
    };

    const isSubActive = (subItems?: SubItem[]): boolean => {
        if (!subItems) return false;
        return subItems.some(sub => isActive(sub.path) || isSubActive(sub.subItems));
    };

    // Automatically open menus based on current route
    useEffect(() => {
        const menusToOpen: { [key: string]: boolean } = {};

        dynamicMenuItems.forEach(item => {
            if (item.subItems && item.subItems.length > 0) {
                const hasActiveSubItem = item.subItems.some(subItem => 
                    isActive(subItem.path) || (subItem.subItems && isSubActive(subItem.subItems))
                );
                if (hasActiveSubItem) {
                    menusToOpen[item.name] = true;
                }
            }
        });

        setOpenMenus(menusToOpen);
    }, [location.pathname, dynamicMenuItems]);

    const filteredMenuItems = dynamicMenuItems.filter(item => {
        if (!user?.permissions) return true;
        const rawPerms = typeof user.permissions === 'string'
            ? JSON.parse(user.permissions)
            : user.permissions;

        const perms = {
            ...rawPerms,
            Discussion: rawPerms.Discussion ?? rawPerms['Discussion Module'] ?? rawPerms['Manage Discussion'],
            Escalation: rawPerms.Escalation ?? rawPerms['Escalation Module'] ?? rawPerms['Manage Escalation'],
        };

        if (Object.keys(perms).length === 0) return true;
        return perms[item.name] !== false;
    });

    const renderSubItems = (items: SubItem[], level: number = 0) => {
        return (
            <ul className={`sub-menu level-${level}`}>
                {items.map((subItem, index) => {
                    const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
                    const isOpen = openMenus[subItem.name];
                    const active = isActive(subItem.path) || isSubActive(subItem.subItems);

                    return (
                        <li key={index} className="sub-menu-group">
                            {hasNestedSubItems ? (
                                <>
                                    <div 
                                        className={`sub-menu-item nested ${active ? "active" : ""}`}
                                        onClick={() => toggleMenu(subItem.name)}
                                    >
                                        <div className="sub-menu-content">
                                            <div className="sub-menu-dot"></div>
                                            <span>{subItem.name}</span>
                                        </div>
                                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </div>
                                    {isOpen && renderSubItems(subItem.subItems!, level + 1)}
                                </>
                            ) : (
                                <Link
                                    to={subItem.path || "#"}
                                    className={`sub-menu-item ${isActive(subItem.path) ? "active" : ""}`}
                                >
                                    <div className="sub-menu-dot"></div>
                                    <span style={{ whiteSpace: 'normal', paddingRight: '12px' }}>
                                        {subItem.name}
                                    </span>
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <aside className={`sidebar ${!isOpen ? 'sidebar-collapsed' : ''}`} style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.666), rgba(15, 23, 42, 0.6)), url(${meshBg})` }}>
            <div className="sidebar-content-wrapper">
                <div className="sidebar-header">
                    <div className="brand-container">
                        <img 
                            src={isOpen ? (branding.logo || logo) : "/Fevicone.png"} 
                            alt="Company Logo" 
                            className="brand-icon" 
                        />
                    </div>
                    <div className="user-profile">
                        <div className="user-detail">
                            <Building2 size={20} className="profile-icon" />
                            <span className="company-text">{branding.companyName || "MineHR-Solutions Pvt. Ltd."}</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    <ul>
                        {filteredMenuItems.map((item, index) => {
                            const hasSubItems = item.subItems && item.subItems.length > 0;
                            const isMenuOpen = openMenus[item.name];
                            const active = item.path ? isActive(item.path) : isSubActive(item.subItems);

                            return (
                                <li key={index} className={`menu-group ${hasSubItems ? 'has-subitems' : ''}`}>
                                    {hasSubItems ? (
                                        <div
                                            className={`menu-item ${active ? "active" : ""}`}
                                            onClick={() => toggleMenu(item.name)}
                                        >
                                            <div className="menu-item-content">
                                                <item.icon size={18} className="menu-icon" />
                                                <span>{item.name}</span>
                                            </div>
                                            {isMenuOpen ?
                                                <ChevronDown size={16} className="arrow-icon" /> :
                                                <ChevronRight size={16} className="arrow-icon" />
                                            }
                                        </div>
                                    ) : (
                                        <Link to={item.path || "#"} className={`menu-item ${active ? "active" : ""}`}>
                                            <div className="menu-item-content">
                                                <item.icon size={18} className="menu-icon" />
                                                <span>{item.name}</span>
                                            </div>
                                        </Link>
                                    )}

                                    {hasSubItems && isMenuOpen && renderSubItems(item.subItems!)}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;
