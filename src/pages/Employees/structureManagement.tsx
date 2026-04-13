import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Building2 } from "lucide-react";
import "./structureManagement.css";

function StructureManagement() {
    const [activeTab, setActiveTab] = useState("Branch");
    const [employees, setEmployees] = useState<any[]>([]);

    // Master Lists
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [devices, setDevices] = useState<any[]>([]);

    // Form States
    const [masterForm, setMasterForm] = useState<any>({});

    // Transfer States
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [transferData, setTransferData] = useState<any>({
        effectiveDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const res = await axios.get(`${API_BASE}/employees`);
        setEmployees(res.data.filter((e: any) => e.status === "Active"));
    };

    const fetchData = async () => {
        const [bRes, dRes, desRes, devRes] = await Promise.all([
            axios.get(`${API_BASE}/branches`),
            axios.get(`${API_BASE}/departments`),
            axios.get(`${API_BASE}/designations`),
            axios.get(`${API_BASE}/devices`)
        ]);
        setBranches(bRes.data);
        setDepartments(dRes.data);
        setDesignations(desRes.data);
        setDevices(devRes.data);
    };

    const handleMasterSave = async () => {
        try {
            const url = activeTab === "Branch" ? "branches" : activeTab === "Department" ? "departments" : activeTab === "Designation" ? "designations" : "devices";

            await axios.post(`${API_BASE}/${url}`, masterForm);
            alert(`${activeTab} saved successfully`);
            setMasterForm({});
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || `Failed to save ${activeTab}`);
        }
    };

    const handleTransfer = async () => {
        if (selectedEmployees.length === 0) return alert("Select at least one employee");
        if (!transferData.targetId) return alert(`Select target ${activeTab}`);

        try {
            const urlMapper: any = {
                Branch: "branches", Department: "departments", Designation: "designations"
            };
            const idMapper: any = {
                Branch: "newBranchId", Department: "newDepartmentId", Designation: "newDesignationId"
            };

            const payload: any = {
                employeeIds: selectedEmployees,
                effectiveDate: transferData.effectiveDate,
                remarks: transferData.remarks
            };
            payload[idMapper[activeTab]] = Number(transferData.targetId);

            await axios.post(`${API_BASE}/${urlMapper[activeTab]}/bulk-transfer`, payload);
            alert("Transfer Successful!");
            setSelectedEmployees([]);
            setTransferData({ effectiveDate: new Date().toISOString().split('T')[0] });
            fetchEmployees();
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Transfer failed");
        }
    };

    const toggleEmployee = (id: number) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    // Render Master Form depending on tab
    const renderMasterForm = () => {
        return (
            <div className="card-panel">
                <h3>Create New {activeTab}</h3>

                {activeTab !== "Device" && (
                    <>
                        <div className="form-group">
                            <label>{activeTab} Name</label>
                            <input type="text" value={masterForm[`${activeTab.toLowerCase()}Name`] || ''}
                                onChange={e => setMasterForm({ ...masterForm, [`${activeTab.toLowerCase()}Name`]: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>{activeTab} Code</label>
                            <input type="text" value={masterForm[`${activeTab.toLowerCase()}Code`] || ''}
                                onChange={e => setMasterForm({ ...masterForm, [`${activeTab.toLowerCase()}Code`]: e.target.value })} />
                        </div>
                        {activeTab === "Branch" ? (
                            <>
                                <div className="form-group"><label>City</label>
                                    <input type="text" value={masterForm.city || ''} onChange={e => setMasterForm({ ...masterForm, city: e.target.value })} /></div>
                                <div className="form-group"><label>State</label>
                                    <input type="text" value={masterForm.state || ''} onChange={e => setMasterForm({ ...masterForm, state: e.target.value })} /></div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={masterForm.description || ''} onChange={e => setMasterForm({ ...masterForm, description: e.target.value })} />
                            </div>
                        )}
                    </>
                )}

                {activeTab === "Device" && (
                    <>
                        <div className="form-group"><label>Device Name</label>
                            <input type="text" value={masterForm.deviceName || ''} onChange={e => setMasterForm({ ...masterForm, deviceName: e.target.value })} /></div>
                        <div className="form-group"><label>Device ID / Serial</label>
                            <input type="text" value={masterForm.deviceId || ''} onChange={e => setMasterForm({ ...masterForm, deviceId: e.target.value })} /></div>
                        <div className="form-group"><label>Assign to Branch</label>
                            <select value={masterForm.branchId || ''} onChange={e => setMasterForm({ ...masterForm, branchId: e.target.value })}>
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Location Name (e.g. Main Gate)</label>
                            <input type="text" value={masterForm.locationName || ''} onChange={e => setMasterForm({ ...masterForm, locationName: e.target.value })} /></div>
                        <div className="form-group"><label>IP Address</label>
                            <input type="text" value={masterForm.ipAddress || ''} onChange={e => setMasterForm({ ...masterForm, ipAddress: e.target.value })} /></div>
                    </>
                )}

                <button className="btn-primary" onClick={handleMasterSave}>Save {activeTab}</button>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            {activeTab !== "Device" && <th>Employees</th>}
                            {activeTab === "Device" && <th>Branch</th>}
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === "Branch" && branches.map(b => (
                            <tr key={b.id}>
                                <td>{b.branchName}</td>
                                <td>{b._count?.employees || 0}</td>
                                <td>{b.status}</td>
                            </tr>
                        ))}
                        {activeTab === "Department" && departments.map(d => (
                            <tr key={d.id}>
                                <td>{d.departmentName}</td>
                                <td>{d._count?.employees || 0}</td>
                                <td>{d.status}</td>
                            </tr>
                        ))}
                        {activeTab === "Designation" && designations.map(d => (
                            <tr key={d.id}>
                                <td>{d.designationName}</td>
                                <td>{d._count?.employees || 0}</td>
                                <td>{d.status}</td>
                            </tr>
                        ))}
                        {activeTab === "Device" && devices.map(d => (
                            <tr key={d.id}>
                                <td>{d.deviceName} ({d.deviceId})</td>
                                <td>{d.branch?.branchName}</td>
                                <td>{d.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTransferForm = () => {
        if (activeTab === "Device") {
            return (
                <div className="card-panel">
                    <h3>Device Mapping & Tracking</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                        Devices are primarily mapped directly to Branches. Employees assigned to a branch are automatically eligible to swipe at the branch's devices.
                        To move employees, use the <strong>Branch</strong> tab.
                    </p>
                </div>
            );
        }

        const dataList = activeTab === "Branch" ? branches : activeTab === "Department" ? departments : designations;

        return (
            <div className="card-panel">
                <h3>Bulk Transfer Employees</h3>

                <div className="form-group">
                    <label>Select Target {activeTab}</label>
                    <select value={transferData.targetId || ''} onChange={e => setTransferData({ ...transferData, targetId: e.target.value })}>
                        <option value="">-- Select Destination --</option>
                        {dataList.map(item => (
                            <option key={item.id} value={item.id}>
                                {item[`${activeTab.toLowerCase()}Name`]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Effective Date</label>
                    <input type="date" value={transferData.effectiveDate} onChange={e => setTransferData({ ...transferData, effectiveDate: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Remarks</label>
                    <input type="text" placeholder="e.g. Annual Restructuring" value={transferData.remarks || ''} onChange={e => setTransferData({ ...transferData, remarks: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Select Employees to Transfer ({selectedEmployees.length} selected)</label>
                    <div className="multi-select-container">
                        {employees.map(emp => {
                            // Only show employees who are NOT already in the target group (optimization)
                            const currentTarget = activeTab === "Branch" ? emp.branchId : activeTab === "Department" ? emp.departmentId : emp.designationId;
                            if (transferData.targetId && currentTarget === Number(transferData.targetId)) return null;

                            return (
                                <div key={emp.id} className="employee-checkbox" onClick={() => toggleEmployee(emp.id)}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.includes(emp.id)}
                                        readOnly
                                        aria-label={`Select ${emp.firstName} ${emp.lastName}`}
                                    />
                                    <div className="employee-text-wrap">
                                        <div className="employee-main-text">{emp.employeeId} - {emp.firstName} {emp.lastName}</div>
                                        <div className="employee-sub-text">{emp.designation || 'No Role'}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button className="btn-primary" style={{ background: '#10b981' }} onClick={handleTransfer}>
                    Confirm {activeTab} Transfer
                </button>
            </div>
        );
    };

    return (
        <div className="structure-management-container">
            <h2 className="page-title" style={{ marginBottom: '24px' }}>
                <Building2 size={22} /> Structure Management Panel
            </h2>

            <div className="tabs-header">
                {["Branch", "Department", "Designation", "Device"].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab} Management
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {renderMasterForm()}
                {renderTransferForm()}
            </div>
        </div>
    );
}

export default StructureManagement;
