import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, MapPin,
  Users, Info, CheckSquare
} from "lucide-react";
import { eventAPI, branchAPI, departmentAPI, employeeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./AddEvent.css";

interface AddEventProps {
  setActivePage: (page: string) => void;
  selectedEvent?: any;
}

const AddEvent: React.FC<AddEventProps> = ({ setActivePage, selectedEvent }) => {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    eventName: selectedEvent?.eventName || "",
    eventType: selectedEvent?.eventType || "Meeting",
    startDate: selectedEvent?.startDate ? new Date(selectedEvent.startDate).toISOString().split('T')[0] : "",
    endDate: selectedEvent?.endDate ? new Date(selectedEvent.endDate).toISOString().split('T')[0] : "",
    startTime: selectedEvent?.startTime || "",
    endTime: selectedEvent?.endTime || "",
    locationType: selectedEvent?.locationType || "Office",
    location: selectedEvent?.location || "",
    description: selectedEvent?.description || "",
    branchIds: selectedEvent?.branches?.map((b: any) => b.id) || [],
    departmentIds: selectedEvent?.departments?.map((d: any) => d.id) || [],
    employeeIds: selectedEvent?.employees?.map((e: any) => e.id) || [],
    sendNotification: selectedEvent?.sendNotification ? "Yes" : "No",
    allowRSVP: selectedEvent?.allowRSVP ? "Yes" : "No"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [br, dep] = await Promise.all([
          branchAPI.getAll(),
          departmentAPI.getAll()
        ]);
        setBranches(br.data);
        setDepartments(dep.data);
      } catch (err) {
        toast.error("Failed to load reference data");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: string, id: number) => {
    setFormData(prev => {
      const currentIds = (prev as any)[name] as number[];
      if (currentIds.includes(id)) {
        return { ...prev, [name]: currentIds.filter(i => i !== id) };
      } else {
        return { ...prev, [name]: [...currentIds, id] };
      }
    });
  };

  const handleSubmit = async (addMore = false) => {
    if (!formData.eventName || !formData.eventType || !formData.startDate || !formData.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      if (selectedEvent) {
        await eventAPI.update(selectedEvent.id, formData);
        toast.success("Event updated successfully");
      } else {
        await eventAPI.create(formData);
        toast.success("Event created successfully");
      }

      if (addMore) {
        setFormData({
          eventName: "",
          eventType: "Meeting",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          locationType: "Office",
          location: "",
          description: "",
          branchIds: [],
          departmentIds: [],
          employeeIds: [],
          sendNotification: "No",
          allowRSVP: "No"
        });
      } else {
        setActivePage("viewEvents");
      }
    } catch (err) {
      toast.error("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in add-event-page">
      <div className="page-header add-event-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <PageTitle title={selectedEvent ? "Edit Event" : "Create New Event"} subtitle="Schedule and organize company activities" />
        </div>
      </div>

      <div className="glass-card animate-slide-up" style={{ marginTop: "24px", padding: "30px" }}>
        <div className="add-event-layout">
          
          {/* Left Column: Basic & Schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0", color: "var(--primary)" }}>
                <Info size={18} /> Basic Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                <div>
                  <label className="input-label">Event Name*</label>
                  <input 
                    type="text" name="eventName" className="input-modern" 
                    placeholder="e.g. Annual Strategy Meet" 
                    value={formData.eventName} onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="input-label">Event Type*</label>
                  <select name="eventType" className="select-modern" value={formData.eventType} onChange={handleInputChange}>
                    <option value="Meeting">Meeting</option>
                    <option value="Training">Training</option>
                    <option value="Celebration">Celebration</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0", color: "var(--primary)" }}>
                <CalendarIcon size={18} /> Schedule Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="input-label">Start Date*</label>
                  <input type="date" name="startDate" className="input-modern" value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="input-label">End Date*</label>
                  <input type="date" name="endDate" className="input-modern" value={formData.endDate} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="input-label">Start Time</label>
                  <input type="time" name="startTime" className="input-modern" value={formData.startTime} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="input-label">End Time</label>
                  <input type="time" name="endTime" className="input-modern" value={formData.endTime} onChange={handleInputChange} />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0", color: "var(--primary)" }}>
                <MapPin size={18} /> Location Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                <div>
                  <label className="input-label">Location Type</label>
                  <select name="locationType" className="select-modern" value={formData.locationType} onChange={handleInputChange}>
                    <option value="Office">Office</option>
                    <option value="Online">Online</option>
                    <option value="Venue">Physical Venue</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">{formData.locationType === "Online" ? "Meeting Link" : "Venue Address / Room"}</label>
                  <input 
                    type="text" name="location" className="input-modern" 
                    placeholder={formData.locationType === "Online" ? "Zoom/Teams Link" : "Conference Room A"} 
                    value={formData.location} onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Participants & Settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0", color: "var(--primary)" }}>
                <Users size={18} /> Participants
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="input-label">Select Branches</label>
                  <div className="glass-card" style={{ padding: "12px", maxHeight: "120px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {branches.map(b => (
                      <div 
                        key={b.id} 
                        className={`badge ${formData.branchIds.includes(b.id) ? "badge-primary" : "badge-outline"}`}
                        onClick={() => handleMultiSelect("branchIds", b.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {b.branchName}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="input-label">Select Departments</label>
                  <div className="glass-card" style={{ padding: "12px", maxHeight: "120px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {departments.map(d => (
                      <div 
                        key={d.id} 
                        className={`badge ${formData.departmentIds.includes(d.id) ? "badge-primary" : "badge-outline"}`}
                        onClick={() => handleMultiSelect("departmentIds", d.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {d.departmentName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0", color: "var(--primary)" }}>
                <CheckSquare size={18} /> Additional Settings
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="input-label">Send Notification</label>
                  <select name="sendNotification" className="select-modern" value={formData.sendNotification} onChange={handleInputChange}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Allow RSVP</label>
                  <select name="allowRSVP" className="select-modern" value={formData.allowRSVP} onChange={handleInputChange}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="input-label">Description</label>
                  <textarea 
                    name="description" className="input-modern" rows={3} 
                    placeholder="Brief about the event..."
                    value={formData.description} onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            <div style={{ marginTop: "auto", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              {!selectedEvent && (
                <button 
                  className="btn-secondary" 
                  style={{ padding: "12px 24px" }}
                  disabled={loading}
                  onClick={() => handleSubmit(true)}
                >
                  Save & Add More
                </button>
              )}
              <button 
                className="btn-primary" 
                style={{ padding: "12px 32px" }}
                disabled={loading}
                onClick={() => handleSubmit(false)}
              >
                {loading ? "Saving..." : selectedEvent ? "Update Event" : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
