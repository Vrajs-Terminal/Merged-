import { create } from 'zustand';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions?: any;
}

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: localStorage.getItem('auth-token') !== null,
    token: localStorage.getItem('auth-token'),
    user: JSON.parse(localStorage.getItem('auth-user') || 'null'),
    login: (token, user) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));
        set({ isAuthenticated: true, token, user });
    },
    logout: () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        set({ isAuthenticated: false, token: null, user: null });
    },
}));
