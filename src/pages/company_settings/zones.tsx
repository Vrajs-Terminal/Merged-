import { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Edit2, Check, X, Building , Map} from 'lucide-react';
import axios from '../../lib/axios';
import './zones.css';

interface Zone {
    id: number;
    name: string;
    order: number;
}

export default function Zones() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await axios.get('/zones');
            setZones(response.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
            alert('Failed to load zones from server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Multi-Add Form State
    const [numToCreate, setNumToCreate] = useState<number | ''>('');
    const [newZoneNames, setNewZoneNames] = useState<string[]>([]);

    // Edit & Reorder State
    const [isReordering, setIsReordering] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    // --- Multi-Add Logic ---
    const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) {
            setNumToCreate('');
            setNewZoneNames([]);
            return;
        }
        setNumToCreate(val);
        // Create an array of empty strings matching the number requested
        setNewZoneNames(Array(val).fill(''));
    };

    const handleNameChange = (index: number, value: string) => {
        const updated = [...newZoneNames];
        updated[index] = value;
        setNewZoneNames(updated);
    };

    const handleAddZones = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: No empty strings
        const validNames = newZoneNames.map(n => n.trim()).filter(n => n !== '');
        if (validNames.length !== numToCreate) {
            alert("All zone names must be filled out.");
            return;
        }

        try {
            // Send bulk creation request to backend
            const response = await axios.post('/zones/bulk', { names: validNames });

            // Backend returns fresh sorted list
            setZones(response.data);

            // Reset form
            setNumToCreate('');
            setNewZoneNames([]);
            alert(`${validNames.length} Zone(s) added successfully!`);
        } catch (error: any) {
            console.error('Error adding zones:', error);
            alert(error.response?.data?.error || 'Failed to add zones.');
        }
    };

    // --- Item Actions ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this Zone? This might affect Branches inside it later.")) return;

        try {
            await axios.delete(`/zones/${id}`);
            setZones(zones.filter(z => z.id !== id));
        } catch (error: any) {
            console.error('Error deleting zone:', error);
            alert(error.response?.data?.error || 'Failed to delete zone.');
        }
    };

    const startEditing = (zone: Zone) => {
        setEditingId(zone.id);
        setEditName(zone.name);
    };

    const saveEdit = async () => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await axios.put(`/zones/${editingId}`, { name: editName.trim() });
            setZones(zones.map(z => z.id === editingId ? { ...z, name: editName.trim() } : z));
            setEditingId(null);
            setEditName('');
        } catch (error: any) {
            console.error('Error updating zone:', error);
            alert(error.response?.data?.error || 'Failed to update zone.');
        }
    };

    const moveZone = async (index: number, direction: 'up' | 'down') => {
        const newOrder = [...zones];
        if (direction === 'up' && index > 0) {
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        } else if (direction === 'down' && index < zones.length - 1) {
            [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        } else {
            return; // No change
        }

        // Optimistic UI update
        setZones(newOrder);

        // Send new order array to backend
        try {
            const orderedIds = newOrder.map(z => z.id);
            const response = await axios.put('/zones/action/reorder', { orderedIds });
            // Sync with backend truth just in case
            setZones(response.data);
        } catch (error: any) {
            console.error('Error reordering zones:', error);
            alert('Failed to save new order. Reverting.');
            fetchZones(); // Revert to server state
        }
    };

    return (
        <div className="setup-container">
            <div className="setup-header">
                <div>
                    <h1><Map className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Zones</h1>
                    <p>Manage top-level organizational zones (e.g. North, South, Global)</p>
                </div>
                <div className="actions-row">
                    <button className={`btn-secondary ${isReordering ? 'active-reorder' : ''}`} onClick={() => { setIsReordering(!isReordering); setEditingId(null); }}>
                        <GripVertical size={16} />
                        {isReordering ? 'Done Reordering' : 'Change Order'}
                    </button>
                </div>
            </div>

            <div className="zones-layout">
                {/* Zones List Box */}
                <div className="list-card">
                    {isLoading ? (
                        <div className="empty-state">Loading Zones...</div>
                    ) : zones.length === 0 ? (
                        <div className="empty-state">No Zones created yet. Add one to the right.</div>
                    ) : (
                        <div className="item-list">
                            {zones.map((zone, index) => (
                                <div className="list-item" key={zone.id}>
                                    <div className="item-left">
                                        <div className="item-icon">
                                            <Building size={20} />
                                        </div>

                                        {editingId === zone.id ? (
                                            <div className="item-edit-mode">
                                                <input
                                                    autoFocus
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                                />
                                                <button onClick={saveEdit} className="btn-icon text-green"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="btn-icon text-gray"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="item-details">
                                                <h4>{zone.name}</h4>
                                            </div>
                                        )}
                                    </div>

                                    {!isReordering && editingId !== zone.id && (
                                        <div className="item-actions">
                                            <button onClick={() => startEditing(zone)} className="btn-icon text-blue" title="Edit Zone">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(zone.id)} className="btn-icon text-red" title="Delete Zone">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {isReordering && (
                                        <div className="reorder-actions">
                                            <button onClick={() => moveZone(index, 'up')} disabled={index === 0}>▲</button>
                                            <button onClick={() => moveZone(index, 'down')} disabled={index === zones.length - 1}>▼</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Multi-Add Form Box */}
                <div className="add-form-card">
                    <h3>Add New Zones</h3>

                    <div className="form-group">
                        <label>How many Zones do you want to create?</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={numToCreate}
                            onChange={handleNumChange}
                            placeholder="e.g. 3"
                            className="num-input"
                        />
                    </div>

                    {typeof numToCreate === 'number' && numToCreate > 0 && (
                        <form onSubmit={handleAddZones} className="multi-inputs-container">
                            <div className="inputs-grid">
                                {newZoneNames.map((name, index) => (
                                    <div className="form-group" key={index}>
                                        <label>Zone {index + 1} Name *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => handleNameChange(index, e.target.value)}
                                            required
                                            placeholder={`e.g. Zone ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="btn-save" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                <Plus size={18} />
                                Save {numToCreate} Zone(s)
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
