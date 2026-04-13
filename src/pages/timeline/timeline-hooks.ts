'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';

/**
 * Hook for fetching Timeline data with built-in loading and error states
 */
export function useTimelineData<T>(
    endpoint: string,
    fallbackData?: T,
    autoFetch: boolean = true
) {
    const [data, setData] = useState<T | undefined>(fallbackData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<T>(endpoint, { timeout: 10000 });
            setData(response.data);
        } catch (err) {
            const axiosError = err as AxiosError;
            const errorMessage = axiosError.response?.statusText || axiosError.message || 'Failed to fetch data';
            setError(errorMessage);
            if (fallbackData) setData(fallbackData);
        } finally {
            setLoading(false);
        }
    }, [endpoint, fallbackData]);

    useEffect(() => {
        if (autoFetch) fetchData();
    }, [endpoint, autoFetch, fetchData]);

    const retry = useCallback(() => fetchData(), [fetchData]);
    return { data, loading, error, retry, refetch: fetchData };
}

/**
 * Hook for managing responsive breakpoints
 */
export function useResponsive() {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);

    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        setIsMobile(width < 640);
        setIsTablet(width >= 640 && width < 1024);
        setIsDesktop(width >= 1024);
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    return { isMobile, isTablet, isDesktop, width: window.innerWidth };
}

/**
 * Hook for managing status tooltips
 */
export interface StatusConfig {
    label: string;
    color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'red' | 'yellow';
    icon: string;
    description: string;
}

export function useStatusConfig(status: string): StatusConfig {
    const statusMap: Record<string, StatusConfig> = {
        approved: { label: 'Approved', color: 'emerald', icon: '✓', description: 'Approved and visible' },
        pending: { label: 'Pending', color: 'amber', icon: '⏱', description: 'Awaiting approval' },
        rejected: { label: 'Rejected', color: 'red', icon: '✕', description: 'Not visible' },
        draft: { label: 'Draft', color: 'blue', icon: '✎', description: 'Saved as draft' },
        online: { label: 'Online', color: 'emerald', icon: '●', description: 'Currently online' },
        offline: { label: 'Offline', color: 'rose', icon: '○', description: 'Currently offline' },
        positive: { label: 'Positive', color: 'emerald', icon: '↗', description: 'Positive sentiment' },
        neutral: { label: 'Neutral', color: 'amber', icon: '→', description: 'Neutral sentiment' },
        negative: { label: 'Negative', color: 'red', icon: '↘', description: 'Negative sentiment' },
    };
    return statusMap[status.toLowerCase()] || {
        label: status,
        color: 'blue',
        icon: '◆',
        description: 'Unknown status',
    };
}

/**
 * Hook for managing selection state
 */
export function useSelection<T extends string | number>(initialSelected: T[] = []) {
    const [selected, setSelected] = useState<T[]>(initialSelected);

    const toggle = useCallback((item: T) => {
        setSelected(prev =>
            prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
        );
    }, []);

    const toggleAll = useCallback((items: T[]) => {
        setSelected(prev => (prev.length === items.length ? [] : items));
    }, []);

    const clear = useCallback(() => setSelected([]), []);
    const isSelected = useCallback((item: T) => selected.includes(item), [selected]);

    return { selected, toggle, toggleAll, clear, isSelected, hasSelection: selected.length > 0, selectionCount: selected.length };
}

/**
 * Hook for managing pagination
 */
export function usePagination(currentPage: number, itemsPerPage: number, totalItems: number) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        startIndex,
        endIndex,
        totalPages,
        canGoPrevious: currentPage > 1,
        canGoNext: currentPage < totalPages,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === totalPages,
    };
}

/**
 * Hook for managing form state
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
    const [values, setValues] = useState(initialState);
    const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    }, []);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const reset = useCallback(() => {
        setValues(initialState);
        setTouched({} as Record<keyof T, boolean>);
    }, [initialState]);

    return { values, touched, handleChange, handleBlur, reset, setValue: setValues };
}
