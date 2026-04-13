import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, Clock, Paperclip, MoreVertical, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';
import './view-work-allocation.css';
import { toast } from 'react-hot-toast';

interface User {
    id: number;
    name: string;
}

interface Task {
    id: number;
    task_id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    progress: number;
    start_date: string;
    due_date: string;
    completion_date?: string;
    project_sr_no?: string;
    site?: string;
    location?: string;
    delay_flag: boolean;
    assignedTo: User;
    assignedBy: User;
    category: { name: string, code: string };
}

const ViewWorkAllocationPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Auth info: Pulling real logged-in user dynamically
    const user = useAuthStore(state => state.user);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [assignRules, setAssignRules] = useState<any[]>([]);

    const [newTask, setNewTask] = useState<any>({
        assigned_to_id: '',
        category_id: '',
        title: '',
        description: '',
        priority: 'Medium',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        project_sr_no: '',
        site: '',
        location: '',
        assigned_by_id: user?.id || '' // Dynamically uses the logged-in user ID
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchFormOptions();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/work-allocation/tasks');
            let data = res.data;
            if (search) {
                const ls = search.toLowerCase();
                data = data.filter((t: Task) => 
                    t.title.toLowerCase().includes(ls) || 
                    t.task_id.toLowerCase().includes(ls) ||
                    t.assignedTo.name.toLowerCase().includes(ls)
                );
            }
            setTasks(data);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchFormOptions = async () => {
        try {
            const [rulesRes, empRes] = await Promise.all([
                api.get('/work-allocation/access'),
                api.get('/admin-rights/employees')
            ]);
            setAssignRules(rulesRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.assigned_to_id || !newTask.category_id || !newTask.due_date) {
            return toast.error("Please fill all required fields");
        }

        // Dynamic Rule execution based on logged in user's ID
        const assignerId = user?.id || 1;

        setIsSaving(true);
        try {
            await api.post('/work-allocation/tasks', { ...newTask, assigned_by_id: assignerId });
            toast.success("Task assigned successfully!");
            setDrawerOpen(false);
            fetchTasks();
            setNewTask({ ...newTask, title: '', description: '', category_id: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to assign task");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedEmpRules = assignRules.filter(r => r.assignTo?.id.toString() === newTask.assigned_to_id.toString());
    const availableCategoriesForEmp = selectedEmpRules.flatMap(r => r.categories);

    const getStatusColor = (status: string, delay: boolean) => {
        if (status === 'Completed') return '#10b981'; // Green
        if (delay) return '#ef4444'; // Red if delayed
        if (status === 'In Progress') return '#3b82f6'; // Blue
        return '#f59e0b'; // Yellow for Pending
    };

    return (
        <div className="wa-layout">
            <div className="wa-container">
                <div className="wa-header">
                    <div>
                        <h2>View Work Allocation</h2>
                        <p>Track assignment status, task progress, and upcoming deadlines.</p>
                    </div>
                    <button className="btn-add-primary" onClick={() => setDrawerOpen(true)}>
                        <Plus size={16} /> Assign New Task
                    </button>
                </div>

                <div className="wa-filters-bar">
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            className="wa-input search-input" 
                            placeholder="Search tasks, task ID, or assignee..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchTasks()}
                        />
                    </div>
                    <button className="btn-secondary" style={{ display: 'flex', gap: 8 }}><Filter size={16}/> Filter</button>
                    <button className="btn-secondary" onClick={fetchTasks}>Search</button>
                </div>

                <div className="task-board">
                    {loading ? (
                        <div className="table-loading">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="table-loading">No tasks assigned yet. 📝</div>
                    ) : (
                        <div className="task-grid">
                            {tasks.map(task => (
                                <div key={task.id} className={`task-card ${task.delay_flag && task.status !== 'Completed' ? 'delayed' : ''}`}>
                                    <div className="task-card-header">
                                        <div className="task-id">{task.task_id}</div>
                                        <div className="task-status" style={{ background: getStatusColor(task.status, task.delay_flag) + '1A', color: getStatusColor(task.status, task.delay_flag) }}>
                                            <span className="dot" style={{ background: getStatusColor(task.status, task.delay_flag) }}></span>
                                            {task.status}
                                        </div>
                                    </div>
                                    
                                    <h3 className="task-title">{task.title}</h3>
                                    <div className="task-meta">
                                        <span className="meta-tag">{task.category.code} - {task.category.name}</span>
                                        <span className={`meta-tag p-${task.priority.toLowerCase()}`}>{task.priority} Priority</span>
                                    </div>

                                    <div className="task-progress-box">
                                        <div className="progress-labels">
                                            <span>Progress</span>
                                            <span>{task.progress || 0}%</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${task.progress || 0}%`, background: getStatusColor(task.status, task.delay_flag) }}></div>
                                        </div>
                                    </div>

                                    <div className="task-footer">
                                        <div className="assignee-box">
                                            <div className="avatar-sm">{task.assignedTo.name.charAt(0)}</div>
                                            <span>{task.assignedTo.name}</span>
                                        </div>
                                        <div className="due-box" style={{ color: task.delay_flag && task.status !== 'Completed' ? '#ef4444' : '#64748b' }}>
                                            <Calendar size={13} />
                                            {task.status === 'Completed' ? 'Done' : new Date(task.due_date).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Drawer for Create Task */}
            {drawerOpen && (
                <div className="wa-drawer-overlay" onClick={() => setDrawerOpen(false)}>
                    <div className="wa-drawer wide" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h3>Assign New Task / Work</h3>
                            <button className="btn-close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="drawer-body forms-grid">
                            {/* Left Column */}
                            <div className="form-col">
                                <h4 className="section-title">Assignment Details</h4>
                                <div className="wa-input-wrapper">
                                    <label>Assign To (Employee) <span className="required">*</span></label>
                                    <select 
                                        className="wa-input"
                                        value={newTask.assigned_to_id}
                                        onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value, category_id: ''})}
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    {newTask.assigned_to_id && availableCategoriesForEmp.length === 0 && (
                                        <span className="field-hint error" style={{color: '#ef4444'}}>No work categories permitted for this employee based on access rules.</span>
                                    )}
                                </div>

                                <div className="wa-input-wrapper">
                                    <label>Work Category <span className="required">*</span></label>
                                    <select 
                                        className="wa-input"
                                        value={newTask.category_id}
                                        onChange={e => setNewTask({...newTask, category_id: e.target.value})}
                                        disabled={!newTask.assigned_to_id || availableCategoriesForEmp.length === 0}
                                    >
                                        <option value="">-- Select Category --</option>
                                        {availableCategoriesForEmp.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="wa-input-wrapper">
                                    <label>Task Title <span className="required">*</span></label>
                                    <input 
                                        className="wa-input"
                                        placeholder="Brief title of the work"
                                        value={newTask.title}
                                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>

                                <div className="wa-input-wrapper">
                                    <label>Task Description</label>
                                    <textarea 
                                        className="wa-input"
                                        rows={4}
                                        placeholder="Detailed instructions..."
                                        value={newTask.description}
                                        onChange={e => setNewTask({...newTask, description: e.target.value})}
                                    />
                                </div>

                                <div className="wa-input-wrapper">
                                    <label>Priority</label>
                                    <select 
                                        className="wa-input"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="form-col">
                                <h4 className="section-title">Schedule & Location</h4>

                                <div className="date-row">
                                    <div className="wa-input-wrapper">
                                        <label>Start Date <span className="required">*</span></label>
                                        <input 
                                            type="date"
                                            className="wa-input"
                                            value={newTask.start_date}
                                            onChange={e => setNewTask({...newTask, start_date: e.target.value})}
                                        />
                                    </div>
                                    <div className="wa-input-wrapper">
                                        <label>Due Date/Time <span className="required">*</span></label>
                                        <input 
                                            type="date"
                                            className="wa-input"
                                            value={newTask.due_date}
                                            onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="wa-input-wrapper" style={{ marginTop: 12 }}>
                                    <label>Project / Site Reference (Optional)</label>
                                    <input 
                                        className="wa-input"
                                        placeholder="e.g. Mine Site Alpha"
                                        value={newTask.site}
                                        onChange={e => setNewTask({...newTask, site: e.target.value})}
                                    />
                                </div>

                                <div className="wa-input-wrapper">
                                    <label>Project Sr No. (Optional)</label>
                                    <input 
                                        className="wa-input"
                                        placeholder="e.g. PRJ-202X"
                                        value={newTask.project_sr_no}
                                        onChange={e => setNewTask({...newTask, project_sr_no: e.target.value})}
                                    />
                                </div>

                                <div className="wa-input-wrapper">
                                    <label>Exact Location (Optional)</label>
                                    <input 
                                        className="wa-input"
                                        placeholder="Coordinates or physical location"
                                        value={newTask.location}
                                        onChange={e => setNewTask({...newTask, location: e.target.value})}
                                    />
                                </div>

                                <div className="attachment-box">
                                    <Paperclip size={18} color="#94a3b8" />
                                    <p>Click or drag to attach files (Images, PDFs)</p>
                                    <button className="btn-upload">Browse Files</button>
                                </div>
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <button className="btn-cancel" onClick={() => setDrawerOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleCreateTask} disabled={isSaving}>
                                {isSaving ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewWorkAllocationPage;
