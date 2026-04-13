import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, ChevronUp, ChevronDown, LayoutDashboard, Settings, Users, Calculator, Activity, ClipboardList, BarChart2, Grid, Loader2, MapPin, FileText, ListOrdered, Map, Briefcase, TrendingUp, Car, Lightbulb, ShieldAlert, Calendar, Smartphone, MessageSquare, Store, ShieldCheck, LogIn, Flag, AlertCircle, Landmark, Gift, Camera, Monitor, Search } from 'lucide-react';
import './admin-menu-reordering.css';

interface MenuItem {
    id: string;
    name: string;
    iconName: string;
    order: number;
}

const getDefaultMenuItems = (): MenuItem[] => {
    return [
        { id: '1', name: 'Dashboard', iconName: 'LayoutDashboard', order: 1 },
        { id: '2', name: 'Company Settings', iconName: 'Settings', order: 2 },
        { id: '3', name: 'Attendance', iconName: 'ClipboardList', order: 3 },
        { id: '4', name: 'Finance Dashboard', iconName: 'Settings', order: 4 },
        { id: '5', name: 'Employees', iconName: 'Users', order: 5 },
        { id: '6', name: 'Employee Nominee', iconName: 'Users', order: 6 },
        { id: '7', name: 'Shift Management', iconName: 'Clock', order: 7 },
        { id: '8', name: 'Holiday & Optional', iconName: 'CalendarDays', order: 8 },
        { id: '9', name: 'Leave Management', iconName: 'CalendarDays', order: 9 },
        { id: '10', name: 'Template Module', iconName: 'ClipboardList', order: 10 },
        { id: '11', name: 'Order Product', iconName: 'ShoppingCart', order: 11 },
        { id: '12', name: 'Expense Management', iconName: 'Calculator', order: 12 },
        { id: '13', name: 'Advance Payments', iconName: 'Banknote', order: 13 },
        { id: '14', name: 'Task Sheet', iconName: 'ClipboardList', order: 14 },
        { id: '15', name: 'Quotation', iconName: 'FileText', order: 15 },
        { id: '16', name: 'LMS', iconName: 'BookOpen', order: 16 },
        { id: '17', name: 'Logs', iconName: 'Shield', order: 17 },
        { id: '18', name: 'Balance Sheet', iconName: 'Landmark', order: 18 },
        { id: '19', name: 'Employee Engagement', iconName: 'Gift', order: 19 },
        { id: '20', name: 'Face X App', iconName: 'ScanFace', order: 20 },
        { id: '21', name: 'Events Management', iconName: 'CalendarDays', order: 21 },
        { id: '22', name: 'Penalty Management', iconName: 'AlertCircle', order: 22 },
        { id: '23', name: 'Company Gallery', iconName: 'Camera', order: 23 },
        { id: '24', name: 'Assets Setup', iconName: 'Monitor', order: 24 },
        { id: '25', name: 'Settings Module', iconName: 'Settings', order: 25 },
        { id: '26', name: 'App Banner', iconName: 'Image', order: 26 },
        { id: '27', name: 'Survey', iconName: 'Search', order: 27 },
        { id: '28', name: 'Poll', iconName: 'MessageSquare', order: 28 },
        { id: '29', name: 'Lost And Found', iconName: 'ShieldCheck', order: 29 },
        { id: '30', name: 'Visitors', iconName: 'LogIn', order: 30 },
        { id: '31', name: 'Complaints', iconName: 'Flag', order: 31 },
        { id: '32', name: 'Discussion', iconName: 'MessageSquare', order: 32 },
        { id: '33', name: 'Escalation', iconName: 'AlertCircle', order: 33 },
        { id: '34', name: 'Meeting', iconName: 'Calendar', order: 34 },
        { id: '35', name: 'Timeline', iconName: 'Activity', order: 35 },
    ];
};

const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case 'LayoutDashboard': return LayoutDashboard;
        case 'Settings': return Settings;
        case 'Users': return Users;
        case 'Calculator': return Calculator;
        case 'Activity': return Activity;
        case 'ClipboardList': return ClipboardList;
        case 'BarChart2': return BarChart2;
        case 'Grid': return Grid;
        case 'MapPin': return MapPin;
        case 'FileText': return FileText;
        case 'Map': return Map;
        case 'Briefcase': return Briefcase;
        case 'TrendingUp': return TrendingUp;
        case 'Car': return Car;
        case 'Lightbulb': return Lightbulb;
        case 'ShieldAlert': return ShieldAlert;
        case 'Calendar': return Calendar;
        case 'CalendarDays': return Calendar;
        case 'ShoppingCart': return Store;
        case 'Banknote': return Calculator;
        case 'BookOpen': return FileText;
        case 'Shield': return ShieldCheck;
        case 'Landmark': return Landmark;
        case 'Gift': return Gift;
        case 'ScanFace': return Users;
        case 'Camera': return Camera;
        case 'Monitor': return Monitor;
        case 'Image': return LayoutDashboard;
        case 'Search': return Search;
        case 'ShieldCheck': return ShieldCheck;
        case 'Smartphone': return Smartphone;
        case 'MessageSquare': return MessageSquare;
        case 'Store': return Store;
        case 'LogIn': return LogIn;
        case 'Flag': return Flag;
        case 'AlertCircle': return AlertCircle;
        default: return Grid;
    }
};

interface SortableItemProps {
    item: MenuItem;
    index: number;
    totalCount: number;
    moveItem: (index: number, direction: 'up' | 'down') => void;
}

function SortableItem({ item, index, totalCount, moveItem }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const Icon = getIconComponent(item.iconName);

    return (
        <div ref={setNodeRef} style={style} className={`menu-item-row ${isDragging ? 'dragging' : ''}`}>
            <div className="menu-item-left">
                <div className="drag-handle" {...attributes} {...listeners}>
                    <GripVertical size={18} />
                </div>
                <div className="menu-icon-wrapper">
                    <Icon size={18} />
                </div>
                <div className="menu-item-name">
                    {item.name}
                </div>
            </div>
            <div className="menu-item-actions">
                <div className="order-badge">
                    {item.order}
                </div>
                <div className="move-buttons">
                    <button
                        className="move-btn"
                        disabled={index === 0}
                        onClick={() => moveItem(index, 'up')}
                        title="Move Up"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        className="move-btn"
                        disabled={index === totalCount - 1}
                        onClick={() => moveItem(index, 'down')}
                        title="Move Down"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminMenuReordering() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const baseItems = getDefaultMenuItems();
        try {
            const res = await api.get('/settings/ADMIN_MENU_ORDER');
            const data = res.data;
            if (data && Array.isArray(data) && data.length > 5) {
                // 1. Normalize Names Immediately
                let normalized: MenuItem[] = data.map(item => {
                    let name = item.name;
                    if (name === 'Visitors Module') name = 'Visitors';
                    if (name === 'Complaints Module') name = 'Complaints';
                    if (name === 'Discussion Module') name = 'Discussion';
                    if (name === 'Escalation Module') name = 'Escalation';
                    return { ...item, name };
                });

                // 2. Filter Forbidden Names and Deduplicate
                const forbidden = [
                    'Core HRMS', 'Finance & Accounting', 'Productivity & Tracking', 'CRM',
                    'Effective Communication', 'Orders & Visits', 'Analytics & Reports',
                    'Industry Modules', 'Knowledge Center', 'Assets & Resources',
                    'Other Utilities', 'Contact Support Team'
                ];
                
                const uniqueItems: { [key: string]: MenuItem } = {};
                normalized.forEach(item => {
                    const key = item.name.toLowerCase().trim();
                    const isForbidden = forbidden.some(f => f.toLowerCase() === key);
                    if (!isForbidden && !uniqueItems[key]) {
                        uniqueItems[key] = item;
                    }
                });
                let fetchedItems: MenuItem[] = Object.values(uniqueItems);

                // Self-heal: If Attendance was never saved in DB historically, inject it now!
                const hasAttendance = fetchedItems.some(item => item.name === 'Attendance');
                if (!hasAttendance) {
                    const attendanceItem: MenuItem = { id: '3', name: 'Attendance', iconName: 'ClipboardList', order: 3 };
                    fetchedItems.splice(2, 0, attendanceItem);
                }

                // 3. Inject Missing Base Items (Normalize search)
                baseItems.forEach(baseItem => {
                    if (!fetchedItems.some(f => f.name.toLowerCase().trim() === baseItem.name.toLowerCase().trim())) {
                        fetchedItems.push({ ...baseItem, order: fetchedItems.length + 1 });
                    }
                });

                // 4. Force mandatory core positions (Only if they exist)
                const forcePosition = (name: string, targetIdx: number) => {
                    const idx = fetchedItems.findIndex(m => m.name === name);
                    if (idx !== -1 && idx !== targetIdx) {
                        const [item] = fetchedItems.splice(idx, 1);
                        fetchedItems.splice(targetIdx, 0, item);
                    }
                };

                forcePosition("Employee Tracking", 3);
                forcePosition("Daily Work Report", 4);
                forcePosition("Visit Management", 5);
                forcePosition("Payroll", 6);

                // 5. Cleanup outdated legacy logic
                // (Removing the hardcoded injectAfter calls since they refer to names we've purged or normalized)


                // 6. Cleanup & Final Deduplication (Just in case)
                const finalUnique: { [key: string]: MenuItem } = {};
                fetchedItems.forEach(item => {
                    const key = item.name.toLowerCase().trim();
                    if (!finalUnique[key]) {
                        finalUnique[key] = item;
                    }
                });
                fetchedItems = Object.values(finalUnique);

                // 7. Update orders sequentially
                fetchedItems.forEach((item, i) => {
                    item.order = i + 1;
                });

                setMenuItems(fetchedItems);
            } else {
                setMenuItems(baseItems);
            }
        } catch (error) {
            console.error("Error loading menu order", error);
            setMenuItems(baseItems);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setMenuItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);

                const reordered = arrayMove(items, oldIndex, newIndex);

                // Update order numbers sequentially
                return reordered.map((item, i) => ({
                    ...item,
                    order: i + 1
                }));
            });
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === menuItems.length - 1)
        ) {
            return;
        }

        const newItems = [...menuItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap items
        const temp = newItems[index];
        newItems[index] = newItems[targetIndex];
        newItems[targetIndex] = temp;

        // Update order numbers sequentially
        newItems.forEach((item, i) => {
            item.order = i + 1;
        });

        setMenuItems(newItems);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/settings/ADMIN_MENU_ORDER', menuItems);
            alert('Menu order saved successfully!');
            // Dispatch event so Sidebar can auto-refresh
            window.dispatchEvent(new Event('menuOrderChanged'));
        } catch (error) {
            console.error("Error saving menu order", error);
            alert('Failed to save menu order.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="menu-reorder-layout">
            <div className="reorder-container">
                <div className="reorder-header">
                    <div className="reorder-header-info">
                        <h2><ListOrdered className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Admin Menu Reordering</h2>
                        <p>Customize the order of modules in the left sidebar.</p>
                    </div>
                    <button className="btn-primary" onClick={handleSave} disabled={isLoading || isSaving}>
                        {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>

                <div className="menu-list">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                            <div style={{ marginTop: '10px' }}>Loading menu configuration...</div>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={menuItems.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {menuItems.map((item, index) => (
                                    <SortableItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        totalCount={menuItems.length}
                                        moveItem={moveItem}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    );
}
