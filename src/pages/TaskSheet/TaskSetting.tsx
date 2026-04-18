import React from "react";
import { Settings, Save, Shield, Clock, Eye, AlertCircle, CheckCircle2, Bell, Link2, Globe, CheckSquare } from "lucide-react";
import "./TaskSheet.css";

const TaskSetting: React.FC = () => {
  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> Task Setting</h1>
          <p className="page-subtitle">Configure global task behaviors and permission controls</p>
        </div>
      </div>

      <div className="tasksheet-settings-grid">
        {/* Core Settings */}
        <div className="glass-card tasksheet-main-card">
          <div className="tasksheet-card-heading">
            <div className="tasksheet-card-heading-icon">
              <Settings size={18} />
            </div>
            <h3>Workflow Settings</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="tasksheet-setting-row">
              <div className="tasksheet-setting-copy">
                <h4>Task Timeline Modification *</h4>
                <p>Controls if task dates can be changed post-creation</p>
              </div>
              <select className="select-modern" style={{ width: "200px" }}>
                <option>No Modification</option>
                <option>Allow Modification</option>
                <option selected>Restricted Modification</option>
              </select>
            </div>

            <div className="tasksheet-setting-row">
              <div className="tasksheet-setting-copy">
                <h4>Task Priority *</h4>
                <p>Enable priority selection (Low/Med/High)</p>
              </div>
              <div className="tasksheet-radio-group">
                <label className="tasksheet-radio">
                  <input type="radio" name="priority" checked /> Yes
                </label>
                <label className="tasksheet-radio">
                  <input type="radio" name="priority" /> No
                </label>
              </div>
            </div>

            <div className="tasksheet-setting-row">
              <div className="tasksheet-setting-copy">
                <h4>Completed Task Editable *</h4>
                <p>Unlock tasks after they are marked as finished</p>
              </div>
              <div className="tasksheet-radio-group">
                <label className="tasksheet-radio">
                  <input type="radio" name="editable" /> Yes
                </label>
                <label className="tasksheet-radio">
                  <input type="radio" name="editable" checked /> No
                </label>
              </div>
            </div>

            <div className="tasksheet-setting-row">
              <div className="tasksheet-setting-copy">
                <h4>Hide Future Task *</h4>
                <p>Visibility of upcoming scheduled tasks</p>
              </div>
              <div className="tasksheet-radio-group">
                <label className="tasksheet-radio">
                  <input type="radio" name="hideFuture" /> Yes
                </label>
                <label className="tasksheet-radio">
                  <input type="radio" name="hideFuture" checked /> No
                </label>
              </div>
            </div>

            <div className="tasksheet-setting-row">
              <div className="tasksheet-setting-copy">
                <h4>Due Date Revision Access *</h4>
                <p>Who can update the final deadline</p>
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
          <div className="glass-card tasksheet-main-card" style={{ border: "1px solid rgba(79, 70, 229, 0.2)" }}>
            <div className="tasksheet-card-heading">
              <div className="tasksheet-card-heading-icon">
                <Shield size={18} />
              </div>
              <h3>Advanced Controls (Pro)</h3>
              <span className="badge badge-primary" style={{ marginLeft: "auto", fontSize: "10px" }}>ENHANCED</span>
            </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
             <div className="tasksheet-setting-row">
              <div className="tasksheet-name-cell">
                <CheckCircle2 size={16} color="var(--success)" />
               <strong>Task Approval Required</strong>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                 <label className="switch" style={{ width: "40px", height: "20px", background: "var(--primary)", borderRadius: "10px", position: "relative" }}>
                    <div style={{ width: "16px", height: "16px", background: "white", borderRadius: "50%", position: "absolute", right: "2px", top: "2px" }}></div>
                 </label>
              </div>
            </div>

             <div className="tasksheet-setting-row">
              <div className="tasksheet-name-cell">
                <Bell size={16} color="var(--warning)" />
                <strong>Task Auto Reminder</strong>
              </div>
              <select className="select-modern" style={{ width: "180px" }}>
                <option>1 Day Before</option>
                <option>3 Days Before</option>
                <option selected>On Due Date</option>
              </select>
            </div>

             <div className="tasksheet-setting-row">
              <div className="tasksheet-name-cell">
                <Link2 size={16} color="#6366f1" />
                <strong>Task Dependency</strong>
              </div>
               <div style={{ display: "flex", gap: "12px" }}>
                 <label className="tasksheet-radio">
                  <input type="checkbox" checked /> Enforce
                </label>
              </div>
            </div>

            <div className="tasksheet-setting-row">
              <div className="tasksheet-name-cell">
                <Globe size={16} color="#06b6d4" />
                <strong>Task Visibility Control</strong>
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

      <div className="tasksheet-footer-actions" style={{ marginTop: "32px" }}>
        <button className="btn btn-secondary">Reset to Default</button>
        <button className="btn btn-primary" style={{ padding: "12px 32px" }}>
          <Save size={18} /> Update Settings
        </button>
      </div>
    </div>
  );
};

export default TaskSetting;
