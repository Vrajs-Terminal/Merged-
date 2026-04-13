import React from "react";
import { Settings, Save, Shield, Clock, Eye, AlertCircle, CheckCircle2, Bell, Link2, Globe, CheckSquare } from "lucide-react";

const TaskSetting: React.FC = () => {
  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><CheckSquare size={22} /> Task Setting</h1>
        <p className="page-subtitle">Configure global task behaviors and permission controls</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
        {/* Core Settings */}
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", color: "var(--primary)" }}>
            <Settings size={20} />
            <h3 style={{ fontSize: "18px" }}>Workflow Settings</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Task Timeline Modification *</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Controls if task dates can be changed post-creation</p>
              </div>
              <select className="select-modern" style={{ width: "200px" }}>
                <option>No Modification</option>
                <option>Allow Modification</option>
                <option selected>Restricted Modification</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Task Priority *</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Enable priority selection (Low/Med/High)</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" name="priority" checked /> Yes
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" name="priority" /> No
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Completed Task Editable *</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Unlock tasks after they are marked as finished</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" name="editable" /> Yes
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" name="editable" checked /> No
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Hide Future Task *</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Visibility of upcoming scheduled tasks</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" name="hideFuture" /> Yes
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" name="hideFuture" checked /> No
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Due Date Revision Access *</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Who can update the final deadline</p>
              </div>
              <select className="select-modern" style={{ width: "220px" }}>
                <option>Only Admin</option>
                <option>Owner Only</option>
                <option selected>Owner & Assignee</option>
                <option>All Users</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pro Settings (Suggested Features) */}
        <div className="glass-card" style={{ border: "1px solid rgba(79, 70, 229, 0.2)" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <Shield size={20} color="var(--primary)" />
            <h3 style={{ fontSize: "18px" }}>Advanced Controls (Pro)</h3>
             <span className="badge badge-primary" style={{ marginLeft: "auto", fontSize: "10px" }}>ENHANCED</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Task Approval Required</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                 <label className="switch" style={{ width: "40px", height: "20px", background: "var(--primary)", borderRadius: "10px", position: "relative" }}>
                    <div style={{ width: "16px", height: "16px", background: "white", borderRadius: "50%", position: "absolute", right: "2px", top: "2px" }}></div>
                 </label>
              </div>
            </div>

             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Bell size={16} color="var(--warning)" />
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Task Auto Reminder</p>
              </div>
              <select className="select-modern" style={{ width: "180px" }}>
                <option>1 Day Before</option>
                <option>3 Days Before</option>
                <option selected>On Due Date</option>
              </select>
            </div>

             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link2 size={16} color="#6366f1" />
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Task Dependency</p>
              </div>
               <div style={{ display: "flex", gap: "12px" }}>
                 <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="checkbox" checked /> Enforce
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={16} color="#06b6d4" />
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Task Visibility Control</p>
              </div>
              <select className="select-modern" style={{ width: "150px" }}>
                <option selected>Team Only</option>
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px", gap: "16px" }}>
        <button className="btn btn-secondary">Reset to Default</button>
        <button className="btn btn-primary" style={{ padding: "12px 32px" }}>
          <Save size={18} /> Update Settings
        </button>
      </div>
    </div>
  );
};

export default TaskSetting;
