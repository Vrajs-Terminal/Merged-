import { useState, useEffect } from 'react';
import api from '../../lib/axios';

/** Shared hook for attendance pages: fetches employees, branches, departments */
export function useAttendanceData() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [empRes, branchRes, deptRes] = await Promise.all([
                    api.get('/attendance/employees'),
                    api.get('/branches'),
                    api.get('/departments')
                ]);
                setEmployees(empRes.data);
                setBranches(branchRes.data);
                setDepartments(deptRes.data);
            } catch (err) {
                console.error('Failed to fetch reference data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return { employees, branches, departments, loading };
}

/** Shared hook for attendance records with filters */
export function useAttendanceRecords(initialFilters?: any) {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = async (filters?: any) => {
        setLoading(true);
        try {
            let url = '/attendance?';
            const f = filters || initialFilters || {};
            if (f.date) url += `date=${f.date}&`;
            if (f.start_date && f.end_date) url += `start_date=${f.start_date}&end_date=${f.end_date}&`;
            if (f.status) url += `status=${f.status}&`;
            if (f.user_id) url += `user_id=${f.user_id}&`;
            const res = await api.get(url);
            setRecords(res.data);
        } catch (err) {
            console.error('Failed to fetch records', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, []);

    return { records, loading, fetchRecords };
}

/** Shared hook for attendance requests */
export function useAttendanceRequests(requestType?: string) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async (filters?: any) => {
        setLoading(true);
        try {
            let url = '/attendance-requests?';
            if (requestType) url += `type=${requestType}&`;
            if (filters?.status) url += `status=${filters.status}&`;
            const res = await api.get(url);
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async (data: any) => {
        const res = await api.post('/attendance-requests', data);
        await fetchRequests();
        return res.data;
    };

    const reviewRequest = async (id: number, status: string, remarks?: string) => {
        const res = await api.put(`/attendance-requests/${id}/review`, { status, approver_remarks: remarks });
        await fetchRequests();
        return res.data;
    };

    const cancelRequest = async (id: number) => {
        await api.delete(`/attendance-requests/${id}`);
        await fetchRequests();
    };

    useEffect(() => { fetchRequests(); }, []);

    return { requests, loading, fetchRequests, submitRequest, reviewRequest, cancelRequest };
}

/** Shared hook for Breaks */
export function useBreaks() {
    const [activeBreak, setActiveBreak] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchActiveBreak = async () => {
        setLoading(true);
        try {
            const res = await api.get('/breaks/active');
            setActiveBreak(res.data);
        } catch (err) {
            console.error('Failed to fetch active break', err);
        } finally {
            setLoading(false);
        }
    };

    const startBreak = async (type: string = 'Standard') => {
        const res = await api.post('/breaks/start', { break_type: type });
        await fetchActiveBreak();
        return res.data;
    };

    const endBreak = async () => {
        const res = await api.post('/breaks/end');
        await fetchActiveBreak();
        return res.data;
    };

    useEffect(() => { fetchActiveBreak(); }, []);

    return { activeBreak, loading, startBreak, endBreak, fetchActiveBreak };
}

/** Shared hook for Document Requests (Expenses, Bank, Device, etc.) */
export function useDocumentRequests(type?: string) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/document-requests');
            const data = type ? res.data.filter((r: any) => r.request_type === type) : res.data;
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async (data: any) => {
        const res = await api.post('/document-requests', data);
        await fetchRequests();
        return res.data;
    };

    const updateStatus = async (id: number, status: string) => {
        const res = await api.put(`/document-requests/${id}/status`, { status });
        await fetchRequests();
        return res.data;
    };

    useEffect(() => { fetchRequests(); }, []);

    return { requests, loading, fetchRequests, submitRequest, updateStatus };
}

/** Helper: format datetime to time string */
export function formatTime(dt: string | null) {
    if (!dt) return '--';
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/** Helper: format datetime to date string */
export function formatDate(dt: string | null) {
    if (!dt) return '--';
    return new Date(dt).toISOString().split('T')[0];
}

/** Helper: get initials from name */
export function getInitials(name: string) {
    return name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??';
}

/** Helper: get avatar color by id */
export function getAvatarColor(id: number) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[id % colors.length];
}

/** Helper: get badge CSS class */
export function getStatusBadge(status: string) {
    switch (status) {
        case 'Present': return 'badge-present';
        case 'Absent': return 'badge-absent';
        case 'Late': return 'badge-late';
        case 'Half Day': return 'badge-halfday';
        case 'Leave': return 'badge-leave';
        case 'Pending': return 'badge-late';
        case 'Approved': return 'badge-present';
        case 'Rejected': return 'badge-absent';
        default: return 'badge-present';
    }
}

/** Helper: relative time */
export function timeAgo(dt: string) {
    const mins = Math.floor((Date.now() - new Date(dt).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
