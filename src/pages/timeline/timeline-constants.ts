/**
 * Timeline Module Constants
 */

export enum PostStatus {
    Draft = 'Draft',
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Archived = 'Archived',
}

export enum PostType {
    General = 'General',
    Announcement = 'Announcement',
    Achievement = 'Achievement',
    Celebration = 'Celebration',
    Milestone = 'Milestone',
    Event = 'Event',
    Feedback = 'Feedback',
    Update = 'Update',
}

export enum AudienceType {
    All = 'All',
    Branch = 'Branch',
    Department = 'Department',
    Team = 'Team',
    Private = 'Private',
}

export enum SentimentType {
    Positive = 'Positive',
    Neutral = 'Neutral',
    Negative = 'Negative',
}

export const ANIMATION_DELAYS = {
    stagger: 50,
    skeleton: 300,
    transition: 300,
    micro: 150,
    entrance: 600,
};

export const BREAKPOINTS = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
};

export const PAGINATION = {
    defaultPageSize: 10,
    maxPageSize: 50,
    pageSizeOptions: [10, 20, 30, 50],
};

export const API_ENDPOINTS = {
    posts: '/api/timeline/posts',
    engagement: '/api/timeline/engagement',
    settings: '/api/timeline/settings',
    templates: '/api/timeline/templates',
    reports: '/api/timeline/reports',
    celebrations: '/api/timeline/celebrations',
};

export const TIMEOUTS = {
    apiRequest: 10000,
    debounce: 300,
    retryDelay: 1000,
};

export const COLOR_TOKENS = {
    indigo: { hex: '#6366f1', rgb: '99, 102, 241' },
    emerald: { hex: '#10b981', rgb: '16,185, 129' },
    rose: { hex: '#f43f5e', rgb: '244, 63, 94' },
    amber: { hex: '#f59e0b', rgb: '245, 158, 11' },
    blue: { hex: '#3b82f6', rgb: '59, 130, 246' },
    red: { hex: '#ef4444', rgb: '239, 68, 68' },
    yellow: { hex: '#eab308', rgb: '234, 179, 8' },
};

export const STATUS_CONFIG = {
    [PostStatus.Approved]: { label: 'Approved', className: 'status-approved', icon: '✓', color: 'emerald' },
    [PostStatus.Pending]: { label: 'Pending', className: 'status-pending', icon: '⏱', color: 'amber' },
    [PostStatus.Rejected]: { label: 'Rejected', className: 'status-rejected', icon: '✕', color: 'red' },
    [PostStatus.Draft]: { label: 'Draft', className: 'badge-blue', icon: '✎', color: 'blue' },
};

export const EMPTY_STATES = {
    noPostsFound: {
        title: 'No Posts Found',
        description: 'There are no posts matching your criteria.',
        action: 'Clear Filters',
    },
    noData: {
        title: 'No Data Available',
        description: 'Data will appear here once you have activity.',
        action: 'Get Started',
    },
    error: {
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Please try again.',
        action: 'Retry',
    },
};

export const ERROR_MESSAGES = {
    invalidEmail: 'Please enter a valid email address.',
    requiredField: 'This field is required.',
    fetchFailed: 'Failed to fetch data. Please try again.',
    saveFailed: 'Failed to save changes. Please try again.',
    deleteFailed: 'Failed to delete. Please try again.',
    networkError: 'Network error. Please check your connection.',
    unauthorized: 'You do not have permission to perform this action.',
};

export const SUCCESS_MESSAGES = {
    postCreated: 'Post created successfully!',
    postUpdated: 'Post updated successfully!',
    postDeleted: 'Post deleted successfully!',
    commentAdded: 'Comment added successfully!',
    reactionAdded: 'Your reaction was recorded!',
    settingsSaved: 'Settings saved successfully!',
};

export const STORAGE_KEYS = {
    userPreferences: 'timeline_user_preferences',
    draft: 'timeline_draft',
    filters: 'timeline_filters',
    sort: 'timeline_sort',
};
