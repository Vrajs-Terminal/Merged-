import React from "react";
import { Settings, Save, Shield, CheckCircle2, Bell, Link2, Globe, CheckSquare } from "lucide-react";
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

      <div className="tasksheet-settings-intro glass-card">
        <div className="tasksheet-settings-intro-copy">
          <span className="tasksheet-settings-kicker">Task Control Center</span>
          <h2>Shape how tasks behave across your workspace</h2>
          <p>
            Use these settings to control scheduling rules, task visibility, reminders, and approval
            policies with a cleaner, easier-to-scan interface.
          </p>
        </div>
        <div className="tasksheet-settings-intro-stats">
          <div className="tasksheet-settings-stat">
            <span>Core Rules</span>
            <strong>5</strong>
          </div>
          <div className="tasksheet-settings-stat">
            <span>Pro Controls</span>
            <strong>4</strong>
          </div>
          <div className="tasksheet-settings-stat">
            <span>Status</span>
            <strong>Ready</strong>
          </div>
        </div>
      </div>

      <div className="tasksheet-settings-grid">
        {/* Core Settings */}
        <div className="glass-card tasksheet-main-card tasksheet-settings-panel">
          <div className="tasksheet-settings-panel-head">
            <div className="tasksheet-card-heading-icon">
              <Settings size={18} />
            </div>
            <div className="tasksheet-settings-panel-copy">
              <span className="tasksheet-settings-panel-kicker">Core Rules</span>
              <h3>Workflow Settings</h3>
              <p>Configure the default behavior for task dates, permissions, and completion rules.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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
        <div className="glass-card tasksheet-main-card tasksheet-settings-panel tasksheet-settings-panel-pro">
          <div className="tasksheet-settings-panel-head">
            <div className="tasksheet-card-heading-icon tasksheet-card-heading-icon-pro">
              <Shield size={18} />
            </div>
            <div className="tasksheet-settings-panel-copy">
              <span className="tasksheet-settings-panel-kicker">Pro Controls</span>
              <h3>Advanced Controls (Pro)</h3>
              <p>Optional controls for approval flow, reminders, dependency handling, and visibility.</p>
            </div>
            <span className="badge badge-primary tasksheet-settings-badge">ENHANCED</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="tasksheet-setting-row tasksheet-setting-row-card">
              <div className="tasksheet-name-cell">
                <CheckCircle2 size={16} color="var(--success)" />
                <strong>Task Approval Required</strong>
              </div>
              <div className="tasksheet-toggle is-on">
                <span className="tasksheet-toggle-track">
                  <span className="tasksheet-toggle-thumb" />
                </span>
                <span className="tasksheet-toggle-label">On</span>
              </div>
            </div>

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
              <div className="tasksheet-name-cell">
                <Link2 size={16} color="#6366f1" />
                <strong>Task Dependency</strong>
              </div>
              <div className="tasksheet-toggle is-enabled">
                <span className="tasksheet-toggle-pill">Enforce</span>
              </div>
            </div>

            <div className="tasksheet-setting-row tasksheet-setting-row-card">
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
