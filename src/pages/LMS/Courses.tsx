import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Play, FileText, Globe, CheckCircle2, XCircle, Search, Settings, Clock, UploadCloud, GraduationCap } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { lmsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await lmsAPI.getCourses();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setCourses(rows.map((course: any) => ({
          id: course.id,
          name: course.name,
          category: course.category,
          duration: `${Math.round(Number(course.durationMinutes || 0) / 60 * 10) / 10} Hours`,
          assigned: Number(course.assignedCount || 0),
          status: course.status || "Draft",
        })));
      } catch {
        toast.error("Failed to load LMS courses");
        setCourses([]);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <PageTitle title="Training Courses" subtitle="Develop and manage educational content for organizational growth" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-primary shadow-glow">
            <Plus size={18} /> Add New Course
          </button>
        </div>
      </div>

       <div className="glass-card" style={{ marginBottom: "24px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ position: "relative", width: "400px" }}>
              <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="text" className="input-modern" placeholder="Search courses by name or category..." style={{ paddingLeft: "40px" }} />
           </div>
           <div style={{ display: "flex", gap: "12px" }}>
              <select className="select-modern" style={{ width: "150px" }}>
                 <option>All Categories</option>
                 <option>Sales</option>
                 <option>Compliance</option>
              </select>
              <button className="btn btn-secondary"><Settings size={18} /> Global Config</button>
           </div>
         </div>
       </div>

      <div className="glass-card">
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
              {courses.map((course, idx) => (
                <tr key={course.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                       <div style={{ background: "var(--primary-light)", padding: "10px", borderRadius: "10px" }}>
                        <GraduationCap size={18} color="var(--primary)" />
                       </div>
                       <span style={{ fontWeight: "700" }}>{course.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{course.category}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
                       <Clock size={14} />
                       {course.duration}
                    </div>
                  </td>
                  <td style={{ fontWeight: "600", color: "var(--primary)" }}>{course.assigned} Users</td>
                  <td>
                    <span className={`badge ${course.status === "Published" ? "badge-success" : "badge-gray"}`} style={{ gap: "6px" }}>
                      {course.status === "Published" ? <CheckCircle2 size={12} /> : <Edit2 size={12} />}
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} title="Edit"><Edit2 size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} title="Preview Content"><Play size={14} /></button>
                       <button className="btn btn-danger" style={{ padding: "6px" }} title="Delete Course Profile"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add Course Form Section */}
       <div className="glass-card" style={{ marginTop: "32px", border: "1px solid var(--primary-light)" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ background: "var(--primary)", padding: "8px", borderRadius: "8px" }}>
              <Plus size={20} color="white" />
            </div>
            <h3 style={{ fontSize: "18px" }}>LMS Content Creator</h3>
         </div>
         <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label className="input-label">Course Name*</label>
                    <input type="text" className="input-modern" placeholder="e.g., Emotional Intelligence in Workplace" />
                  </div>
                  <div>
                    <label className="input-label">Category*</label>
                    <select className="select-modern">
                       <option>-- Select Domain --</option>
                       <option>Sales</option>
                       <option>HR</option>
                       <option>Compliance</option>
                    </select>
                  </div>
               </div>
               <div>
                  <label className="input-label">Internal Description</label>
                  <textarea className="input-modern" rows={3} placeholder="Briefly describe what the learners will achieve..."></textarea>
               </div>
               <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                     <label className="input-label">Initial Duration (Mins)</label>
                     <input type="number" className="input-modern" defaultValue={30} />
                  </div>
                  <div style={{ flex: 1 }}>
                     <label className="input-label">Min. Passing Grade (%)</label>
                     <input type="number" className="input-modern" defaultValue={70} />
                  </div>
               </div>
            </div>
            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
               <h4 style={{ fontSize: "14px", marginBottom: "16px", fontWeight: "700" }}>Content Upload Gateway</h4>
               <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "32px", textAlign: "center", cursor: "pointer", transition: "all 0.3s" }}>
                  <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: "12px" }} />
                  <p style={{ fontSize: "13px", fontWeight: "600" }}>Drop PDF, Video or Doc here</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Max File Size: 100MB</p>
               </div>
               <div style={{ marginTop: "20px" }}>
                  <label className="input-label">Or External URL (YouTube / Drive)</label>
                  <input type="text" className="input-modern" placeholder="https://youtube.com/..." />
               </div>
               <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button className="btn btn-secondary">Draft Local</button>
                  <button className="btn btn-primary shadow-glow">Final & Publish</button>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
};

export default Courses;

