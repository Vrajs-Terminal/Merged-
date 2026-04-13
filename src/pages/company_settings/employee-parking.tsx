import { useState, useEffect, useRef } from 'react';
import { QrCode, CreditCard, Plus, Upload, Search, Edit2, Trash2, X, Save, Car, Loader2, Download , Truck} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import './employee-parking.css';
import './assign-employee-grade.css'; // Reuse utility classes like table styles

interface ParkingSlot {
    id: string; // the database id
    slotNumber: string;
    employeeName: string;
    employeeId: string;
    user_id: string | null;
    vehicleNumber: string;
    accessType: 'QR' | 'Sticker';
    status: 'Active' | 'Inactive';
}

interface UserData {
    id: number;
    employee_id: string;
    name: string;
}

export default function EmployeeParking() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);

    const [slots, setSlots] = useState<ParkingSlot[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [qrModalSlot, setQrModalSlot] = useState<ParkingSlot | null>(null);
    const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Form State
    const [slotName, setSlotName] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(''); // this will hold user_id string
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [accessType, setAccessType] = useState<'QR' | 'Sticker'>('QR');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // First fetch users
            const usersRes = await fetch('/api/auth/users');
            const usersData = usersRes.ok ? await usersRes.json() : [];
            setUsers(Array.isArray(usersData) ? usersData : []);

            // Then fetch parking slots
            const slotsRes = await fetch('/api/employee-parking');
            if (slotsRes.ok) {
                const slotsData = await slotsRes.json();
                const mappedSlots: ParkingSlot[] = slotsData.map((s: { id: number, slot_number: string, user_id?: number | null, user?: { name: string, employee_id: string }, vehicle_number: string | null, access_type: string, status: string }) => ({
                    id: s.id.toString(),
                    slotNumber: s.slot_number,
                    user_id: s.user_id ? s.user_id.toString() : null,
                    employeeName: s.user?.name || 'Unassigned',
                    employeeId: s.user?.employee_id || '-',
                    vehicleNumber: s.vehicle_number || '',
                    accessType: s.access_type as 'QR' | 'Sticker',
                    status: s.status as 'Active' | 'Inactive'
                }));
                setSlots(mappedSlots);
            }
        } catch (error) {
            console.error("Failed to load parking data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingSlot(null);
        setSlotName('');
        setSelectedEmployee('');
        setVehicleNumber('');
        setAccessType('QR');
        setStatus('Active');
        setIsModalOpen(true);
    };

    const handleEditClick = (slot: ParkingSlot) => {
        setEditingSlot(slot);
        setSlotName(slot.slotNumber);
        setSelectedEmployee(slot.user_id || '');
        setVehicleNumber(slot.vehicleNumber);
        setAccessType(slot.accessType);
        setStatus(slot.status);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this parking slot?")) return;
        try {
            const res = await fetch(`/api/employee-parking/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                alert("Failed to delete slot.");
            }
        } catch (error) {
            console.error("Error deleting slot", error);
        }
    };

    const handleSave = async () => {
        if (!slotName || !accessType) {
            alert('Please fill out Slot Name and Access Type.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                slot_number: slotName,
                user_id: selectedEmployee ? parseInt(selectedEmployee) : null,
                vehicle_number: vehicleNumber || null,
                access_type: accessType,
                status
            };

            let res;
            if (editingSlot) {
                res = await fetch(`/api/employee-parking/${editingSlot.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/employee-parking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save parking slot');
            }
        } catch (error) {
            console.error("Error saving slot", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredData = slots.filter(slot => {
        const matchesSearch = slot.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slot.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slot.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getQRData = (slot: ParkingSlot) => {
        return JSON.stringify({
            slot: slot.slotNumber,
            employee: slot.employeeName,
            empId: slot.employeeId,
            vehicle: slot.vehicleNumber,
            access: slot.accessType
        });
    };

    const handleDownloadQR = () => {
        // Find the canvas rendered by QRCodeCanvas inside the modal
        const canvas = document.getElementById('qr-download-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `parking-qr-${qrModalSlot?.slotNumber}.png`;
        link.href = url;
        link.click();
    };

    return (
        <div className="parking-layout">
            <div className="filters-header" style={{ justifyContent: 'space-between' }}>
                <div className="filter-group" style={{ maxWidth: '400px' }}>
                    <div className="search-input-wrapper" style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Search by Employee, ID, Slot, or Vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header-title">
                    <h2><Truck className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Parking Allocations</h2>
                    <div className="header-actions">
                        <button className="btn-secondary">
                            <Upload size={16} /> Bulk Assign
                        </button>
                        <button className="btn-secondary" onClick={() => {
                            const firstQR = slots.find(s => s.accessType === 'QR');
                            if (firstQR) setQrModalSlot(firstQR);
                            else alert('No QR-type slots found. Add a slot with QR access first.');
                        }}>
                            <QrCode size={16} /> Generate QR Codes
                        </button>
                        <button className="btn-primary" onClick={handleAddClick}>
                            <Plus size={16} /> Add Parking Slot
                        </button>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Slot / Area</th>
                            <th>Assigned Employee</th>
                            <th>Employee ID</th>
                            <th>Vehicle Number</th>
                            <th>Access Type</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading parking slots...</div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map(slot => (
                                <tr key={slot.id}>
                                    <td><strong>{slot.slotNumber}</strong></td>
                                    <td>
                                        {slot.employeeName !== 'Unassigned' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {slot.employeeName.charAt(0)}
                                                </div>
                                                {slot.employeeName}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td>{slot.employeeId}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                                            {slot.vehicleNumber ? <Car size={14} /> : null}
                                            {slot.vehicleNumber || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="access-badge">
                                            {slot.accessType === 'QR' ? <QrCode size={12} className="text-blue" /> : <CreditCard size={12} className="text-green" />}
                                            {slot.accessType}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${slot.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                            {slot.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {slot.accessType === 'QR' && (
                                                <button className="btn-icon-only" title="View QR Code" onClick={() => setQrModalSlot(slot)} style={{ color: '#3b82f6' }}>
                                                    <QrCode size={16} />
                                                </button>
                                            )}
                                            <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(slot)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-only delete" title="Remove" onClick={() => handleDelete(slot.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No parking slots found matching the criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Car size={20} className="text-blue" /> {editingSlot ? 'Edit Parking Slot' : 'Add Parking Slot'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Slot / Area Name / Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. A-01, VIP-1"
                                    value={slotName}
                                    onChange={(e) => setSlotName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Employee (Optional)</label>
                                <select
                                    className="form-select"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">-- No User / Unassigned --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.employee_id || `EMP-${String(u.id).padStart(3, '0')}`})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Vehicle Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. MH-01-AB-1234"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Access Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="access"
                                            value="QR"
                                            checked={accessType === 'QR'}
                                            onChange={() => setAccessType('QR')}
                                        />
                                        QR Code
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="access"
                                            value="Sticker"
                                            checked={accessType === 'Sticker'}
                                            onChange={() => setAccessType('Sticker')}
                                        />
                                        Sticker / ID Tag
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Parking Slot'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* QR Code View Modal */}
            {qrModalSlot && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}
                    onClick={() => setQrModalSlot(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '320px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>QR Code</h3>
                            <button onClick={() => setQrModalSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Visible SVG for display */}
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                            <QRCodeSVG
                                value={getQRData(qrModalSlot)}
                                size={180}
                                bgColor="#ffffff"
                                fgColor="#1e293b"
                                level="H"
                                includeMargin
                            />
                        </div>

                        {/* Hidden Canvas for download */}
                        <div style={{ display: 'none' }}>
                            <QRCodeCanvas
                                id="qr-download-canvas"
                                value={getQRData(qrModalSlot)}
                                size={300}
                                bgColor="#ffffff"
                                fgColor="#1e293b"
                                level="H"
                                includeMargin
                                ref={qrCanvasRef}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>Slot: {qrModalSlot.slotNumber}</p>
                            <p style={{ margin: '0 0 2px', color: '#475569', fontSize: '13px' }}>{qrModalSlot.employeeName}</p>
                            {qrModalSlot.vehicleNumber && <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{qrModalSlot.vehicleNumber}</p>}
                        </div>

                        <button
                            onClick={handleDownloadQR}
                            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#1e293b', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                        >
                            <Download size={16} /> Download QR as PNG
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
