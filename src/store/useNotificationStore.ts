import { create } from 'zustand';
import api from '../lib/axios';

interface Notification {
    id: number;
    action: string;
    entity_type: string;
    entity_name: string;
    details?: string | null;
    createdAt: string;
    user?: { id: number; name: string; email: string } | null;
}

interface NotificationState {
    notifications: Notification[];
    hasUnread: boolean;
    isLoading: boolean;
    lastCheckedNotif: number;
    fetchNotifications: (limit?: number) => Promise<void>;
    markAsRead: () => void;
    refresh: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    hasUnread: false,
    isLoading: false,
    lastCheckedNotif: parseInt(localStorage.getItem('lastCheckedNotif') || '0'),

    fetchNotifications: async (limit = 15) => {
        set({ isLoading: true });
        try {
            const res = await api.get(`/notifications?limit=${limit}`);
            const data = (res.data as any[] || []).map((n: any) => ({
                ...n,
                id: n.id.toString(), // Ensure IDs are strings
            }));

            const lastChecked = parseInt(localStorage.getItem('lastCheckedNotif') || '0');
            let newHasUnread = false;

            if (data.length > 0) {
                const latestTimestamp = new Date(data[0].createdAt).getTime();
                if (latestTimestamp > lastChecked) {
                    newHasUnread = true;
                }
            }

            set({
                notifications: data,
                hasUnread: newHasUnread,
                lastCheckedNotif: lastChecked,
                isLoading: false
            });
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            set({ isLoading: false });
        }
    },

    markAsRead: () => {
        const now = Date.now();
        localStorage.setItem('lastCheckedNotif', now.toString());
        set({ hasUnread: false, lastCheckedNotif: now });
    },

    refresh: async () => {
        // Force a refresh from the server
        const { fetchNotifications } = get();
        await fetchNotifications(15);
    }
}));
