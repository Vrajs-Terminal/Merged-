import { useState } from "react";
import { 
  FileText, 
  Calendar, 
  Users, 
  Eye, 
  EyeOff, 
  Layout,
  HelpCircle,
  Loader2,
  ChevronRight,
  Bell,
  Clock,
  ClipboardList
} from "lucide-react";
import { surveyAPI } from "../../services/apiService";
import "./AddSurvey.css";
import PageTitle from "../../components/PageTitle";

const AddSurvey = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [surveyData, setSurveyData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    targetAudience: "All Employees",
    isAnonymous: false,
    sendReminder: true,
    autoClose: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await surveyAPI.create({
        ...surveyData,
        questions: [] // Initial empty questions, normally you'd go to question builder
      });
      console.log("Survey Created:", res.data);
      alert("Survey created successfully!");
      setActivePage("manageSurvey");
    } catch (err: any) {
      alert("Failed to create survey: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-page-container add-survey-page">
      <div className="survey-header">
        <div className="header-text">
          <PageTitle title="Add New Survey" subtitle="Create targeted feedback forms and engagement surveys for your organization" />
        </div>
        <button className="back-btn" onClick={() => setActivePage("manageSurvey")}>
          <Layout size={18} />
          <span>Survey List</span>
        </button>
      </div>

      <form className="survey-form-main add-survey-form mt-4" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="survey-form-card">
          <div className="card-section-title">
             <FileText size={20} />
             <h3>Basic Information</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Survey Title*</label>
              <input 
                type="text" 
                placeholder="e.g. Employee Engagement Feedback 2024" 
                required 
                value={surveyData.title}
                onChange={(e) => setSurveyData({...surveyData, title: e.target.value})}
              />
            </div>
            <div className="form-group full-width">
              <label>Description / Purpose</label>
              <textarea 
                placeholder="Enter a brief description for participants..." 
                rows={3}
                value={surveyData.description}
                onChange={(e) => setSurveyData({...surveyData, description: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="form-row-2" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="survey-form-card">
            <div className="card-section-title">
               <Calendar size={20} />
               <h3>Duration & Schedule</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Start Date*</label>
                <div className="input-with-icon">
                  <Calendar size={16} />
                  <input 
                    type="date" 
                    required 
                    value={surveyData.startDate}
                    onChange={(e) => setSurveyData({...surveyData, startDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>End Date (Optional)</label>
                <div className="input-with-icon">
                  <Clock size={16} />
                  <input 
                    type="date" 
                    value={surveyData.endDate}
                    onChange={(e) => setSurveyData({...surveyData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label className="checkbox-modern-wrapper">
                  <input 
                    type="checkbox" 
                    checked={surveyData.autoClose}
                    onChange={(e) => setSurveyData({...surveyData, autoClose: e.target.checked})}
                  />
                  <span>Auto-close survey after deadline</span>
                </label>
              </div>
            </div>
          </div>

          <div className="survey-form-card">
            <div className="card-section-title">
               <Users size={20} />
               <h3>Audience & Privacy</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Survey For*</label>
                <select 
                  value={surveyData.targetAudience}
                  onChange={(e) => setSurveyData({...surveyData, targetAudience: e.target.value})}
                >
                  <option>All Employees</option>
                  <option>Branch-wise</option>
                  <option>Department-wise</option>
                  <option>Individual Employees</option>
                </select>
              </div>
              <div className="form-group">
                <label>Survey Anonymity*</label>
                <div className="toggle-group-premium">
                  <button 
                    type="button" 
                    className={!surveyData.isAnonymous ? "active" : ""}
                    onClick={() => setSurveyData({...surveyData, isAnonymous: false})}
                  >
                    <Eye size={16} /> Show Names
                  </button>
                  <button 
                    type="button" 
                    className={surveyData.isAnonymous ? "active anonymous" : ""}
                    onClick={() => setSurveyData({...surveyData, isAnonymous: true})}
                  >
                    <EyeOff size={16} /> Anonymous
                  </button>
                </div>
              </div>
              <div className="form-group full-width">
                <label className="checkbox-modern-wrapper">
                  <input 
                    type="checkbox" 
                    checked={surveyData.sendReminder}
                    onChange={(e) => setSurveyData({...surveyData, sendReminder: e.target.checked})}
                  />
                  <span>
                     <Bell size={14} style={{ marginRight: '6px' }} />
                     Send reminder notifications to targeted audience
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
           <div className="info-badge">
             <HelpCircle size={16} />
             <span>Next Step: You will be redirected to the Question Builder to add survey questions.</span>
           </div>
           <div className="btn-group">
             <button type="button" className="btn-secondary" onClick={() => setActivePage("manageSurvey")} disabled={loading}>Cancel</button>
             <button type="submit" className="btn-primary" disabled={loading}>
               {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Save & Add Questions</span>}
               {!loading && <ChevronRight size={18} />}
             </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AddSurvey;

