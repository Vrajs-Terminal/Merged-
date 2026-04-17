import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Play,
  Search,
  Settings,
  Clock,
  GraduationCap,
  Layers,
  RefreshCw,
  X,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { lmsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./LMS.css";

interface CourseItem {
  id: number | string;
  name: string;
  category: string;
  durationMinutes: number;
  assigned: number;
  status: "Published" | "Draft";
  description: string;
}

const getDurationLabel = (minutes: number) => {
  if (!minutes || minutes <= 0) return "0h";
  const hours = minutes / 60;
  return `${Math.round(hours * 10) / 10}h`;
};

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showGlobalConfig, setShowGlobalConfig] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [courseDraft, setCourseDraft] = useState({
    name: "",
    category: "Sales",
    durationMinutes: "60",
    description: "",
    status: "Draft" as "Published" | "Draft",
  });
  const [globalConfig, setGlobalConfig] = useState({
    defaultDurationMinutes: "60",
    passingScorePercent: "70",
    autoPublishNewCourses: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("lmsGlobalConfig");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      setGlobalConfig((prev) => ({
        ...prev,
        defaultDurationMinutes: String(parsed.defaultDurationMinutes ?? prev.defaultDurationMinutes),
        passingScorePercent: String(parsed.passingScorePercent ?? prev.passingScorePercent),
        autoPublishNewCourses: Boolean(parsed.autoPublishNewCourses ?? prev.autoPublishNewCourses),
      }));
    } catch {
      // Ignore malformed local settings.
    }
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const res = await lmsAPI.getCourses();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setCourses(
          rows.map((course: any) => ({
            id: course.id,
            name: course.name || "Untitled Course",
            category: course.category || "General",
            durationMinutes: Number(course.durationMinutes || 0),
            assigned: Number(course.assignedCount || 0),
            status: course.status === "Published" ? "Published" : "Draft",
            description: course.description || "No description available",
          })),
        );
      } catch {
        toast.error("Failed to load LMS courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const categories = useMemo(
    () => ["All Categories", ...Array.from(new Set(courses.map((course) => course.category).filter(Boolean)))],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const searchMatch =
        !search.trim() ||
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.category.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = categoryFilter === "All Categories" || course.category === categoryFilter;
      const statusMatch = statusFilter === "All Statuses" || course.status === statusFilter;
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [courses, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const published = filteredCourses.filter((course) => course.status === "Published").length;
    const draft = filteredCourses.length - published;
    const totalAssigned = filteredCourses.reduce((sum, course) => sum + course.assigned, 0);
    const avgDuration =
      filteredCourses.length === 0
        ? 0
        : Math.round(
            filteredCourses.reduce((sum, course) => sum + course.durationMinutes, 0) /
              Math.max(1, filteredCourses.length),
          );
    return { published, draft, totalAssigned, avgDuration };
  }, [filteredCourses]);

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Statuses");
    toast.info("Course filters reset");
  };

  const handleDeleteCourse = (id: number | string) => {
    const confirmed = window.confirm("Delete this course? This action cannot be undone.");
    if (!confirmed) return;

    setCourses((prev) => prev.filter((course) => course.id !== id));
    toast.success("Course deleted");
  };

  const handleTogglePublish = (id: number | string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id
          ? { ...course, status: course.status === "Published" ? "Draft" : "Published" }
          : course,
      ),
    );
    toast.success("Course status updated");
  };

  const handleCreateCourse = () => {
    if (!courseDraft.name.trim()) {
      toast.error("Course name is required");
      return;
    }

    const minutes = Number(courseDraft.durationMinutes || 0);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.error("Enter valid duration in minutes");
      return;
    }

    const newItem: CourseItem = {
      id: `local-${Date.now()}`,
      name: courseDraft.name.trim(),
      category: courseDraft.category,
      durationMinutes: minutes,
      assigned: 0,
      status: globalConfig.autoPublishNewCourses ? "Published" : courseDraft.status,
      description: courseDraft.description.trim() || "No description available",
    };

    setCourses((prev) => [newItem, ...prev]);
    setShowCreate(false);
    setCourseDraft({ name: "", category: "Sales", durationMinutes: "60", description: "", status: "Draft" });
    toast.success("Course created locally");
  };

  const handleSaveGlobalConfig = () => {
    const defaultDuration = Number(globalConfig.defaultDurationMinutes);
    const passingScore = Number(globalConfig.passingScorePercent);
    if (!Number.isFinite(defaultDuration) || defaultDuration <= 0) {
      toast.error("Default duration must be a valid positive number");
      return;
    }
    if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
      toast.error("Passing score must be between 0 and 100");
      return;
    }

    localStorage.setItem("lmsGlobalConfig", JSON.stringify(globalConfig));
    setCourseDraft((prev) => ({
      ...prev,
      durationMinutes: String(defaultDuration),
      status: globalConfig.autoPublishNewCourses ? "Published" : prev.status,
    }));
    setShowGlobalConfig(false);
    toast.success("Global LMS configuration saved");
  };

  return (
    <div className="main-content animate-fade-in lms-page">
      <div className="page-header lms-page-header">
        <PageTitle
          title="Training Courses"
          subtitle="Develop and manage educational content for organizational growth"
          icon={<GraduationCap size={22} />}
        />
        <div className="lms-page-header-actions">
          <button className="btn btn-secondary" onClick={() => setShowGlobalConfig(true)}>
            <Settings size={16} /> Global Config
          </button>
          <button className="btn btn-primary shadow-glow" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Add New Course
          </button>
        </div>
      </div>

      <div className="glass-card lms-filter-card">
        <div className="lms-filter-grid lms-filter-grid-4">
          <div className="lms-search-wrap">
            <Search size={18} className="lms-search-icon" />
            <input
              type="text"
              className="input-modern"
              placeholder="Search courses by name, category or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <div>
            <select className="select-modern" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select className="select-modern" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>All Statuses</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
          <div className="lms-filter-actions">
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="lms-kpi-grid">
        <div className="glass-card lms-kpi-card lms-kpi-card-courses">
          <div className="lms-kpi-icon primary"><BookOpen size={20} color="var(--color-primary-600)" /></div>
          <div>
            <p>Total Courses</p>
            <h3>{filteredCourses.length}</h3>
          </div>
        </div>
        <div className="glass-card lms-kpi-card lms-kpi-card-published">
          <div className="lms-kpi-icon success"><CheckCircle2 size={20} color="#059669" /></div>
          <div>
            <p>Published</p>
            <h3>{stats.published}</h3>
          </div>
        </div>
        <div className="glass-card lms-kpi-card lms-kpi-card-assigned">
          <div className="lms-kpi-icon info"><Layers size={20} color="#0284c7" /></div>
          <div>
            <p>Total Assigned Users</p>
            <h3>{stats.totalAssigned}</h3>
          </div>
        </div>
        <div className="glass-card lms-kpi-card lms-kpi-card-duration">
          <div className="lms-kpi-icon warning"><Clock size={20} color="#d97706" /></div>
          <div>
            <p>Avg Duration</p>
            <h3>{getDurationLabel(stats.avgDuration)}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card lms-table-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Course Name</th>
                <th>Category</th>
                <th>Estimated Duration</th>
                <th>Personnel Assigned</th>
                <th>Publication Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredCourses.map((course, idx) => (
                <tr key={course.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="lms-user-cell">
                       <div className="lms-icon-chip">
                        <GraduationCap size={18} color="var(--primary)" />
                       </div>
                       <div>
                         <strong>{course.name}</strong>
                         <p className="lms-muted-small">{course.description}</p>
                       </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{course.category}</span></td>
                  <td>
                    <div className="lms-inline-meta">
                       <Clock size={14} />
                       {getDurationLabel(course.durationMinutes)}
                    </div>
                  </td>
                  <td style={{ fontWeight: "600", color: "var(--primary)" }}>{course.assigned} Users</td>
                  <td>
                    <span className={`badge ${course.status === "Published" ? "badge-success" : "badge-gray"}`}>
                      {course.status === "Published" ? <CheckCircle2 size={12} /> : <Edit2 size={12} />}
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <div className="lms-row-actions">
                       <button className="btn btn-secondary" style={{ padding: "6px" }} title="Edit" onClick={() => toast.info(`Edit ${course.name}`)}><Edit2 size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} title="Preview Content" onClick={() => toast.info(`Preview ${course.name}`)}><Play size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} title="Toggle Publish" onClick={() => handleTogglePublish(course.id)}><Layers size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }} title="Delete Course Profile" onClick={() => handleDeleteCourse(course.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={7} className="lms-empty-row">No courses found for selected filters.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="lms-empty-row">Loading courses...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="lms-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="lms-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="lms-modal-header">
              <h3>Create New Course</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowCreate(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="lms-form-grid">
              <div>
                <label className="input-label">Course Name*</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g., Advanced Communication"
                  value={courseDraft.name}
                  onChange={(event) => setCourseDraft((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Category*</label>
                <select
                  className="select-modern"
                  value={courseDraft.category}
                  onChange={(event) => setCourseDraft((prev) => ({ ...prev, category: event.target.value }))}
                >
                  <option>Sales</option>
                  <option>Compliance</option>
                  <option>Leadership</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label className="input-label">Duration (Minutes)*</label>
                <input
                  type="number"
                  className="input-modern"
                  min={1}
                  value={courseDraft.durationMinutes}
                  onChange={(event) => setCourseDraft((prev) => ({ ...prev, durationMinutes: event.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Status</label>
                <select
                  className="select-modern"
                  value={courseDraft.status}
                  onChange={(event) => setCourseDraft((prev) => ({ ...prev, status: event.target.value as "Published" | "Draft" }))}
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </div>
              <div className="lms-form-full">
                <label className="input-label">Description</label>
                <textarea
                  className="input-modern"
                  rows={3}
                  placeholder="Describe learning outcomes"
                  value={courseDraft.description}
                  onChange={(event) => setCourseDraft((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
            </div>
            <div className="lms-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateCourse}>Create Course</button>
            </div>
          </div>
        </div>
      )}

      {showGlobalConfig && (
        <div className="lms-modal-overlay" onClick={() => setShowGlobalConfig(false)}>
          <div className="lms-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="lms-modal-header">
              <h3>Global LMS Configuration</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowGlobalConfig(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="lms-form-grid">
              <div>
                <label className="input-label">Default Course Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  className="input-modern"
                  value={globalConfig.defaultDurationMinutes}
                  onChange={(event) =>
                    setGlobalConfig((prev) => ({ ...prev, defaultDurationMinutes: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="input-label">Default Passing Score (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-modern"
                  value={globalConfig.passingScorePercent}
                  onChange={(event) =>
                    setGlobalConfig((prev) => ({ ...prev, passingScorePercent: event.target.value }))
                  }
                />
              </div>
              <div className="lms-form-full">
                <label className="lms-checkbox-row">
                  <input
                    type="checkbox"
                    checked={globalConfig.autoPublishNewCourses}
                    onChange={(event) =>
                      setGlobalConfig((prev) => ({ ...prev, autoPublishNewCourses: event.target.checked }))
                    }
                  />
                  Auto-publish newly created courses
                </label>
              </div>
            </div>

            <div className="lms-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowGlobalConfig(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveGlobalConfig}>Save Config</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;

