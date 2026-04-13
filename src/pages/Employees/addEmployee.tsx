import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { UserPlus, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react";
import "./addEmployee.css";
import PageTitle from "../../components/PageTitle";

function AddEmployee({ setActivePage, selectedEmployee, setSelectedEmployee }: any) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [managers, setManagers] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    active: true,
    // Step 1: Basic
    employeeId: "", firstName: "", middleName: "", lastName: "", countryCode: "+91", mobile: "",
    dob: "", bloodGroup: "", gender: "", cvUrl: "", idProofUrl: "", welcomeSent: false,

    // Step 2: Job
    designation: "", branch: "", department: "", subDepartment: "", grade: "", employeeType: "",
    zone: "", level: "", shift: "", email: "", doj: "", probationDays: "", trainingCompletionDate: "",
    permanentDate: "", sisterCompany: "", location: "", managerId: "", insuranceNo: "",
    insuranceCompany: "", insuranceExpiry: "", retirementAge: "", jobDescription: "",

    // Step 3: Contact
    whatsapp: "", altPhone: "", emergencyNumber: "", companyMobile: "", currentAddress: "",
    permanentAddress: "", personalEmail: "", facebook: "", linkedin: "", twitter: "", instagram: "",

    // Step 4: Other
    skills: "", hobbies: "", languages: "", specialSkills: "", maritalStatus: "", familyMembers: "", nationality: "",

    // Step 5: Bank
    bankHolder: "", bankName: "", bankBranch: "", accountType: "", accountNo: "", ifscCode: "", crnNo: "",
    esicNo: "", panNo: "", pfNo: "", uanNo: "", micrNo: "",

    // Step 6: Leave / Expense
    leaveGroup: "", multiLevelLeave: "", expenseApproval: ""
  });

  useEffect(() => {
    // Fetch managers for the reporting manager dropdown
    axios.get(`${API_BASE}/managers`).then(res => setManagers(res.data)).catch(console.error);

    if (selectedEmployee) {
      setFormData({
        ...formData,
        ...selectedEmployee,
        employeeId: selectedEmployee.employeeId || selectedEmployee.id || "",
        // parse social links if they were JSON
      });
    }
  }, [selectedEmployee]);

  const handleChange = (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    try {
      // Serialize social links
      const mergedData = {
        ...formData,
        socialLinks: JSON.stringify({
          facebook: formData.facebook,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram
        }),
        probationDays: formData.probationDays ? parseInt(formData.probationDays) : null,
        familyMembers: formData.familyMembers ? parseInt(formData.familyMembers) : null,
        retirementAge: formData.retirementAge ? parseInt(formData.retirementAge) : null,
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
      };

      if (selectedEmployee) {
        const idToUpdate = selectedEmployee.employeeId || selectedEmployee.id;
        await axios.put(`${API_BASE}/employees/${idToUpdate}`, mergedData);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setSelectedEmployee(null); setActivePage("employees"); }, 1500);
      } else {
        await axios.post(`${API_BASE}/employees`, mergedData);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setActivePage("employees"); }, 2000);
      }
    } catch (err: any) {
      const apiData = err.response?.data;
      const apiMessage = apiData?.error || apiData?.message || (typeof apiData === 'string' ? apiData : JSON.stringify(apiData));
      setError(apiMessage || "Failed to save employee.");
    }
  };

  const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setActivePage("employees");
      setSelectedEmployee(null);
    }
  };

  const stepTitles = [
    "Basic Information",
    "Job Information",
    "Contact Details",
    "Skills & Other",
    "Bank Details",
    "Allocations"
  ];

  return (
    <div className="add-page animate-fade-in">
      <div className="page-header">
        <PageTitle 
          title={selectedEmployee ? "Edit Employee Profile" : "Add New Employee"} 
          subtitle="Complete the multi-step onboarding process to register an employee"
        />
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={prevStep}>
            <ChevronLeft size={18} /> Exit
          </button>
        </div>
      </div>

      {/* Modern Wizard Header */}
      <div className="glass-card mb-6 p-4">
        <div className="wizard-nav">
          {stepTitles.map((title, i) => {
            const index = i + 1;
            const isCompleted = step > index;
            const isActive = step === index;
            return (
              <div key={index} className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="wizard-step-circle">
                  {isCompleted ? <Check size={14} /> : index}
                </div>
                <span className="wizard-step-label">{title}</span>
                {index < totalSteps && <div className="wizard-step-line" />}
              </div>
            );
          })}
        </div>
      </div>

      <form className="glass-card main-form-card" onSubmit={(e) => { e.preventDefault(); if (step === totalSteps) handleSubmit(); else nextStep(); }}>
        
        <div className="step-content-scroll">
          {step === 1 && (
            <div className="step-section animate-slide-up">
              <div className="card-header-simple">
                <h3><UserPlus size={18} /> Basic Information</h3>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-group-label">Employee ID</label>
                  <input className="form-group-input" name="employeeId" value={formData.employeeId} onChange={handleChange} required disabled={!!selectedEmployee} placeholder="e.g. EMP101" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">First Name</label>
                  <input className="form-group-input" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Legal first name" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Middle Name</label>
                  <input className="form-group-input" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Last Name</label>
                  <input className="form-group-input" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Surname" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Mobile Number</label>
                  <div className="flex gap-2">
                    <input className="form-group-input" style={{ width: '80px' }} name="countryCode" value={formData.countryCode} onChange={handleChange} />
                    <input className="form-group-input" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="Phone number" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group-label">Date of Birth</label>
                  <input className="form-group-input" type="date" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Gender</label>
                  <select className="form-group-select" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group-label">Blood Group</label>
                  <input className="form-group-input" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">CV / Resume</label>
                  <input className="form-group-input" type="file" />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <label className="checkbox-label-modern">
                  <input type="checkbox" name="welcomeSent" checked={formData.welcomeSent} onChange={handleChange} />
                  <span>Send a welcome message to the employee via WhatsApp/Email.</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-section animate-slide-up">
              <div className="card-header-simple">
                <h3>Job Placement Information</h3>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-group-label">Designation</label>
                  <input className="form-group-input" name="designation" value={formData.designation} onChange={handleChange} placeholder="Job Title" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Branch</label>
                  <input className="form-group-input" name="branch" value={formData.branch} onChange={handleChange} placeholder="Office Location" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Department</label>
                  <input className="form-group-input" name="department" value={formData.department} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Reporting Manager</label>
                  <select className="form-group-select" name="managerId" value={formData.managerId} onChange={handleChange}>
                    <option value="">Select Manager</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group-label">Joining Date</label>
                  <input className="form-group-input" type="date" name="doj" value={formData.doj} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Employee Type</label>
                  <select className="form-group-select" name="employeeType" value={formData.employeeType} onChange={handleChange}>
                    <option value="">Select Type</option>
                    <option>Full Time</option><option>Contract</option><option>Part Time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group-label">Company Email ID</label>
                  <input className="form-group-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="work@company.com" />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Retirement Age</label>
                  <input className="form-group-input" type="number" name="retirementAge" value={formData.retirementAge} onChange={handleChange} />
                </div>
                <div className="form-group-full mt-4">
                  <label className="form-group-label">Job Description</label>
                  <textarea className="form-group-textarea" name="jobDescription" placeholder="Outline primary responsibilities..." value={formData.jobDescription} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-section animate-slide-up">
              <div className="card-header-simple">
                <h3>Contact & Social Details</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-group-label">Current Address</label>
                  <textarea className="form-group-textarea" name="currentAddress" value={formData.currentAddress} onChange={handleChange} style={{ minHeight: '80px' }}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-group-label">Permanent Address</label>
                  <textarea className="form-group-textarea" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} style={{ minHeight: '80px' }}></textarea>
                </div>
              </div>
              <div className="form-grid-3 mt-6">
                <div className="form-group">
                  <label className="form-group-label">WhatsApp Number</label>
                  <input className="form-group-input" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Personal Email</label>
                  <input className="form-group-input" type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">LinkedIn Link</label>
                  <input className="form-group-input" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="URL" />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-section animate-slide-up">
              <div className="card-header-simple">
                <h3>Bank & Statutory Details</h3>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-group-label">Account Name</label>
                  <input className="form-group-input" name="bankHolder" value={formData.bankHolder} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Bank Name</label>
                  <input className="form-group-input" name="bankName" value={formData.bankName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">Account No.</label>
                  <input className="form-group-input" name="accountNo" value={formData.accountNo} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">IFSC Code</label>
                  <input className="form-group-input" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">PAN Number</label>
                  <input className="form-group-input" name="panNo" value={formData.panNo} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-group-label">UAN Number</label>
                  <input className="form-group-input" name="uanNo" value={formData.uanNo} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other steps to keep code concise but functional */}
          {(step === 4 || step === 6) && (
            <div className="step-section animate-slide-up">
              <div className="card-header-simple">
                <h3>{stepTitles[step-1]}</h3>
              </div>
              <div className="form-grid-3">
                {step === 4 ? (
                  <>
                    <div className="form-group">
                      <label className="form-group-label">Skills</label>
                      <input className="form-group-input" name="skills" value={formData.skills} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-group-label">Hobbies</label>
                      <input className="form-group-input" name="hobbies" value={formData.hobbies} onChange={handleChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-group-label">Leave Group</label>
                      <select className="form-group-select" name="leaveGroup" value={formData.leaveGroup} onChange={handleChange}>
                        <option>Standard</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="form-actions mt-8 pt-6 border-t">
          <button 
            type="button" 
            onClick={prevStep} 
            className="btn btn-secondary"
          >
            {step === 1 ? "Discard" : "Back Step"}
          </button>
          
          <div className="flex gap-3">
            {step < totalSteps ? (
              <button type="button" onClick={nextStep} className="btn btn-primary btn-lg">
                Continue to Next <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => handleSubmit()} 
                className="btn btn-success btn-lg"
              >
                {selectedEmployee ? "Update Portfolio" : "Complete Registration"} <Check size={18} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-alert mt-4">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-alert mt-4">
            <Check size={18} />
            <span>{selectedEmployee ? "Profile Synced Successfully" : "Registration Completed"}</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddEmployee;