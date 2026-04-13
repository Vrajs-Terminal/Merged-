import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import "./levelMaster.css";

interface Level {
    id: number;
    levelName: string;
    levelCode: string;
    description: string;
    parentLevelId: number | null;
    hierarchyOrder: number | null;
    status: string;
    _count?: {
        employees: number;
    };
}

function LevelMaster() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        levelName: "",
        levelCode: "",
        description: "",
        parentLevelId: "",
        hierarchyOrder: "",
        status: "Active"
    });

    const fetchLevels = async () => {
        try {
            const response = await axios.get(`${API_BASE}/levels`);
            setLevels(response.data);
        } catch (error) {
            console.error("Error fetching levels:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        if (!formData.levelName) return alert("Level Name is required");

        try {
            const payload = {
                ...formData,
                parentLevelId: formData.parentLevelId ? parseInt(formData.parentLevelId) : null,
                hierarchyOrder: formData.hierarchyOrder ? parseInt(formData.hierarchyOrder) : null,
            };

            if (editingId) {
                await axios.put(`${API_BASE}/levels/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE}/levels`, payload);
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({
                levelName: "",
                levelCode: "",
                description: "",
                parentLevelId: "",
                hierarchyOrder: "",
                status: "Active"
            });
            fetchLevels();
        } catch (error: any) {
            alert(error.response?.data?.error || "Error saving level");
        }
    };

    const handleEdit = (level: Level) => {
        setFormData({
            levelName: level.levelName,
            levelCode: level.levelCode || "",
            description: level.description || "",
            parentLevelId: level.parentLevelId ? String(level.parentLevelId) : "",
            hierarchyOrder: level.hierarchyOrder ? String(level.hierarchyOrder) : "",
            status: level.status
        });
        setEditingId(level.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this level?")) return;
        try {
            await axios.delete(`${API_BASE}/levels/${id}`);
            fetchLevels();
        } catch (error: any) {
            alert(error.response?.data?.error || "Error deleting level");
        }
    };

    return (
        <div className="level-master-container">
            <div>
                <h2 className="page-title" style={{ marginBottom: '8px' }}>
                    <Layers size={22} /> Level Master
                </h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Define and manage the corporate hierarchy levels and structured designations.</p>
            </div>

            <div className="top-controls">
                <button onClick={() => {
                    setEditingId(null);
                    setFormData({ levelName: "", levelCode: "", description: "", parentLevelId: "", hierarchyOrder: "", status: "Active" });
                    setShowForm(!showForm);
                }}>
                    {showForm ? "Cancel Add Level" : <><Plus size={18} /> Add New Level</>}
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <h3>{editingId ? "Edit Level" : "Add Level"}</h3>
                    <div className="grid">
                        <input name="levelName" placeholder="Level Name (e.g. L1, Manager)" value={formData.levelName} onChange={handleChange} />
                        <input name="levelCode" placeholder="Level Code (Optional)" value={formData.levelCode} onChange={handleChange} />

                        <select name="parentLevelId" value={formData.parentLevelId} onChange={handleChange}>
                            <option value="">No Parent (Top Level)</option>
                            {levels.filter(l => l.id !== editingId).map(l => (
                                <option key={l.id} value={l.id}>{l.levelName}</option>
                            ))}
                        </select>

                        <input type="number" name="hierarchyOrder" placeholder="Sort Order (e.g. 1)" value={formData.hierarchyOrder} onChange={handleChange} />

                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{ gridColumn: "span 2" }} />
                    </div>
                    <button className="save-btn" onClick={handleSubmit}>
                        {editingId ? "Update Level" : "Save Level"}
                    </button>
                </div>
            )}

            <div className="table-wrapper">
                {loading ? (
                    <p style={{ textAlign: "center", padding: "20px" }}>Loading Levels...</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Level Name</th>
                                <th>Code</th>
                                <th>Parent Level</th>
                                <th>Order</th>
                                <th>Employees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map(level => {
                                const parent = levels.find(l => l.id === level.parentLevelId);
                                return (
                                    <tr key={level.id}>
                                        <td style={{ fontWeight: '500' }}>{level.levelName}</td>
                                        <td>{level.levelCode || "-"}</td>
                                        <td>{parent ? parent.levelName : "-"}</td>
                                        <td>{level.hierarchyOrder || "-"}</td>
                                        <td style={{ fontWeight: 'bold' }}>{level._count?.employees || 0}</td>
                                        <td>
                                            <span className={`badge ${level.status.toLowerCase()}`}>
                                                {level.status}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button className="edit-btn" onClick={() => handleEdit(level)}>
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(level.id)}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {levels.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No Levels Found. Creates some.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default LevelMaster;
