import api from '../lib/axios';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

const buildListParams = (...args: unknown[]): QueryParams | undefined => {
    if (args.length === 0) {
        return undefined;
    }

    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
        return args[0] as QueryParams;
    }

    const [page, limit, third, fourth, fifth, sixth] = args;
    const params: QueryParams = {};

    if (typeof page === 'number' || typeof page === 'string') {
        params.page = page;
    }

    if (typeof limit === 'number' || typeof limit === 'string') {
        params.limit = limit;
    }

    if (typeof third === 'string') {
        params.status = third;
    }

    if (typeof fourth === 'string') {
        params.state = fourth;
    }

    if (typeof fifth === 'string') {
        params.city = fifth;
    }

    if (typeof sixth === 'string') {
        params.search = sixth;
    }

    return Object.keys(params).length > 0 ? params : undefined;
};

const createCrudApi = (basePath: string) => ({
    getAll: (...args: unknown[]) => api.get(basePath, { params: buildListParams(...args) }),
    getById: (id: string | number) => api.get(`${basePath}/${id}`),
    create: (data: unknown) => api.post(basePath, data),
    update: (id: string | number, data: unknown) => api.put(`${basePath}/${id}`, data),
    delete: (id: string | number) => api.delete(`${basePath}/${id}`),
    toggleStatus: (id: string | number) => api.patch(`${basePath}/${id}/toggle-status`),
    toggle: (id: string | number) => api.patch(`${basePath}/${id}/toggle`),
});

const createConfigApi = (basePath: string) => ({
    getAll: (...args: unknown[]) => api.get(basePath, { params: buildListParams(...args) }),
    getConfigs: (...args: unknown[]) => api.get(basePath, { params: buildListParams(...args) }),
    create: (data: unknown) => api.post(basePath, data),
    update: (id: string | number, data: unknown) => api.put(`${basePath}/${id}`, data),
    delete: (id: string | number) => api.delete(`${basePath}/${id}`),
    updateConfigs: (data: unknown) => api.post(`${basePath}/update`, data),
});

const routeBase = {
    dashboard: '/dashboard',
    tasks: '/tasks',
    polls: '/polls',
    events: '/events',
    nominees: '/nominees',
    lms: '/lms',
    faceX: '/face-x',
    engagement: '/engagement',
    celebrationTemplates: '/celebration-templates',
    surveys: '/surveys',
    lostAndFound: '/lost-and-found',
    penalties: '/penalties',
    shifts: '/shifts',
    superDistributors: '/super-distributors',
    jobLocations: '/job-locations',
    customerCategories: '/customer-categories',
    customerSubCategories: '/customer-sub-categories',
    productCategories: '/product-categories',
    productSubCategories: '/product-sub-categories',
    productVariants: '/product-variants',
    unitMeasures: '/unit-measures',
    orders: '/orders',
    quotationConfig: '/quotation-config',
    appBanners: '/app-banners',
    galleries: '/galleries',
} as const;

export const branchAPI = createCrudApi('/branches-extended');
export const departmentAPI = createCrudApi('/departments-extended');
export const employeeAPI = {
    ...createCrudApi('/employees'),
    disable: (id: string | number) => api.put(`/employees/${id}/disable`),
    reactivate: (id: string | number) => api.put(`/employees/${id}/reactivate`),
    getUpcomingRetirements: () => api.get('/employees/retirements/upcoming'),
};

export const dashboardAPI = {
    getStats: () => api.get(`${routeBase.dashboard}/stats`),
};

export const taskAPI = {
    ...createCrudApi(routeBase.tasks),
    getCategories: () => api.get(`${routeBase.tasks}/categories`),
    getPriorities: () => api.get(`${routeBase.tasks}/priorities`),
};

export const pollAPI = createCrudApi(routeBase.polls);

export const eventAPI = {
    ...createCrudApi(routeBase.events),
    getReport: (params?: QueryParams) => api.get(`${routeBase.events}/report`, { params }),
};

export const ledgerAPI = {
    getAll: (...args: unknown[]) => api.get('/ledgers', { params: buildListParams(...args) }),
    getTransactions: (...args: unknown[]) => api.get('/ledgers', { params: buildListParams(...args) }),
    createTransaction: (data: unknown) => api.post('/ledgers', data),
    deleteTransaction: (id: string | number) => api.delete(`/ledgers/${id}`),
};

export const nomineeAPI = {
    ...createCrudApi(routeBase.nominees),
    getTypes: () => api.get(`${routeBase.nominees}/types`),
    createType: (data: unknown) => api.post(`${routeBase.nominees}/types`, data),
    updateType: (id: string | number, data: unknown) => api.put(`${routeBase.nominees}/types/${id}`, data),
    deleteType: (id: string | number) => api.delete(`${routeBase.nominees}/types/${id}`),
    bulkUpload: (data: unknown) => api.post(`${routeBase.nominees}/bulk`, data),
};

export const lmsAPI = {
    getAll: () => api.get(`${routeBase.lms}/courses`),
    getCourses: () => api.get(`${routeBase.lms}/courses`),
    createCourse: (data: unknown) => api.post(`${routeBase.lms}/courses`, data),
    updateCourse: (id: string | number, data: unknown) => api.put(`${routeBase.lms}/courses/${id}`, data),
    deleteCourse: (id: string | number) => api.delete(`${routeBase.lms}/courses/${id}`),
    getReport: () => api.get(`${routeBase.lms}/report`),
    createProgress: (data: unknown) => api.post(`${routeBase.lms}/progress`, data),
};

export const managerAPI = createCrudApi('/managers');

export const faceXAPI = {
    getAll: (...args: unknown[]) => api.get(`${routeBase.faceX}/user-face-data`, { params: buildListParams(...args) }),
    getUserFaceData: (...args: unknown[]) => api.get(`${routeBase.faceX}/user-face-data`, { params: buildListParams(...args) }),
    deleteUserFaceData: (id: string | number) => api.delete(`${routeBase.faceX}/user-face-data/${id}`),
    getAdmins: () => api.get(`${routeBase.faceX}/admins`),
    generateAdmin: (data: unknown) => api.post(`${routeBase.faceX}/admins/generate`, data),
    deleteAdmin: (id: string | number) => api.delete(`${routeBase.faceX}/admins/${id}`),
    toggleAdminStatus: (id: string | number) => api.patch(`${routeBase.faceX}/admins/${id}/toggle`),
    getDevices: (...args: unknown[]) => api.get(`${routeBase.faceX}/devices`, { params: buildListParams(...args) }),
    updateDeviceStatus: (id: string | number, data: unknown) => api.patch(`${routeBase.faceX}/devices/${id}/status`, data),
    getChangeRequests: (...args: unknown[]) => api.get(`${routeBase.faceX}/change-requests`, { params: buildListParams(...args) }),
    handleChangeRequest: (id: string | number, data: unknown) => api.patch(`${routeBase.faceX}/change-requests/${id}/handle`, data),
    getSettings: () => api.get(`${routeBase.faceX}/settings`),
    updateSettings: (data: unknown) => api.patch(`${routeBase.faceX}/settings`, data),
};

export const engagementAPI = {
    getUpcomingEvents: (params?: QueryParams) => api.get(`${routeBase.engagement}/upcoming`, { params }),
};

export const celebrationTemplateAPI = createCrudApi(routeBase.celebrationTemplates);

export const surveyAPI = {
    ...createCrudApi(routeBase.surveys),
    submit: (data: unknown) => api.post(`${routeBase.surveys}/submit`, data),
};

export const lostAndFoundAPI = {
    ...createCrudApi(routeBase.lostAndFound),
    getItems: (...args: unknown[]) => api.get(routeBase.lostAndFound, { params: buildListParams(...args) }),
    getClaims: (...args: unknown[]) => api.get(`${routeBase.lostAndFound}/claims`, { params: buildListParams(...args) }),
    reportItem: (data: unknown) => api.post(routeBase.lostAndFound, data),
    claimItem: (data: unknown) => api.post(`${routeBase.lostAndFound}/claims`, data),
    verifyClaim: (id: string | number, data: unknown) => api.put(`${routeBase.lostAndFound}/claims/${id}/verify`, data),
    updateItemStatus: (id: string | number, status: unknown) => api.put(`${routeBase.lostAndFound}/${id}/status`, { status }),
    deleteItem: (id: string | number) => api.delete(`${routeBase.lostAndFound}/${id}`),
};

export const penaltyAPI = {
    getAll: (...args: unknown[]) => api.get(`${routeBase.penalties}/records`, { params: buildListParams(...args) }),
    getRecords: (...args: unknown[]) => api.get(`${routeBase.penalties}/records`, { params: buildListParams(...args) }),
    approve: (id: string | number, data: unknown) => api.put(`${routeBase.penalties}/records/${id}/approve`, data),
    reject: (id: string | number, data: unknown) => api.put(`${routeBase.penalties}/records/${id}/reject`, data),
    deleteRecord: (id: string | number) => api.delete(`${routeBase.penalties}/records/${id}`),
    getRules: () => api.get(`${routeBase.penalties}/rules`),
    createRule: (data: unknown) => api.post(`${routeBase.penalties}/rules`, data),
    updateRule: (id: string | number, data: unknown) => api.put(`${routeBase.penalties}/rules/${id}`, data),
    deleteRule: (id: string | number) => api.delete(`${routeBase.penalties}/rules/${id}`),
    getConversions: () => api.get(`${routeBase.penalties}/conversions`),
    createConversion: (data: unknown) => api.post(`${routeBase.penalties}/conversions`, data),
    getReport: (params?: QueryParams) => api.get(`${routeBase.penalties}/report`, { params }),
};

export const shiftAPI = createCrudApi(routeBase.shifts);

export const leaveTypeAPI = {
    ...createCrudApi('/leaves/types'),
};

export const productAPI = createCrudApi('/products');
export const retailerAPI = createCrudApi('/retailers');
export const distributorAPI = createCrudApi('/distributors');
export const superDistributorAPI = createCrudApi(routeBase.superDistributors);
export const beatPlanAPI = createCrudApi('/beat-plans');
export const jobLocationAPI = createCrudApi(routeBase.jobLocations);
export const dailySalesReportAPI = {
    ...createCrudApi('/daily-sales-reports'),
    getAll: (...args: unknown[]) => api.get('/daily-sales-reports', { params: buildListParams(...args) }),
    getSummaryByEmployee: () => api.get('/daily-sales-reports/summary/employee'),
};

export const customerCategoryAPI = createCrudApi(routeBase.customerCategories);
export const customerSubCategoryAPI = createCrudApi(routeBase.customerSubCategories);
export const productCategoryAPI = createCrudApi(routeBase.productCategories);
export const productSubCategoryAPI = createCrudApi(routeBase.productSubCategories);
export const productVariantAPI = createCrudApi(routeBase.productVariants);
export const unitMeasureAPI = createCrudApi(routeBase.unitMeasures);

export const orderAPI = createCrudApi(routeBase.orders);

export const quotationConfigAPI = createConfigApi(routeBase.quotationConfig);

export const adminSettingsAPI = {
    getAll: () => api.get('/admin-settings'),
    getAccessRules: () => api.get('/admin-settings/access-rules'),
    createAccessRule: (data: unknown) => api.post('/admin-settings/access-rules', data),
    deleteAccessRule: (id: string | number) => api.delete(`/admin-settings/access-rules/${id}`),
    getPermissionConfig: () => api.get('/admin-settings/permission-config'),
    savePermissionConfig: (data: unknown) => api.put('/admin-settings/permission-config', data),
    getAppConfig: () => api.get('/admin-settings/app-config'),
    saveAppConfig: (data: unknown) => api.put('/admin-settings/app-config', data),
    getOrderConfig: () => api.get('/admin-settings/order-config'),
    saveOrderConfig: (data: unknown) => api.put('/admin-settings/order-config', data),
};

export const appBannerAPI = {
    ...createCrudApi(routeBase.appBanners),
    toggle: (id: string | number) => api.patch(`${routeBase.appBanners}/${id}/toggle`),
};

export const activityLogAPI = createCrudApi('/activity-logs');

export const assetsAPI = {
    ...createCrudApi('/assets'),
    getAssets: (...args: unknown[]) => api.get('/assets', { params: buildListParams(...args) }),
    getCategories: () => api.get('/assets/categories'),
    createCategory: (data: unknown) => api.post('/assets/categories', data),
    updateCategory: (id: string | number, data: unknown) => api.put(`/assets/categories/${id}`, data),
    deleteCategory: (id: string | number) => api.delete(`/assets/categories/${id}`),
    getIDSettings: () => api.get('/assets/id-settings'),
    updateIDSettings: (data: unknown) => api.put('/assets/id-settings', data),
    getStats: () => api.get('/assets/stats'),
    bulkUploadAssets: (data: unknown) => api.post('/assets/bulk', data),
    assignAsset: (id: string | number, data: unknown) => api.post(`/assets/${id}/assign`, data),
    getMaintenance: (...args: unknown[]) => api.get('/assets/maintenance', { params: buildListParams(...args) }),
    createMaintenance: (data: unknown) => api.post('/assets/maintenance', data),
    completeMaintenance: (id: string | number, data: unknown) => api.put(`/assets/maintenance/${id}/complete`, data),
    getScrap: (...args: unknown[]) => api.get('/assets/scrap', { params: buildListParams(...args) }),
    scrapAsset: (data: unknown) => api.post('/assets/scrap', data),
    getHistory: (assetId: string | number) => api.get(`/assets/${assetId}/history`),
    getSecuritySettings: () => api.get('/assets/security-settings'),
    updateSecuritySettings: (data: unknown) => api.put('/assets/security-settings', data),
    updateSecuritySetting: (data: unknown) => api.put('/assets/security-settings', data),
    createAsset: (data: unknown) => api.post('/assets', data),
    updateAsset: (id: string | number, data: unknown) => api.put(`/assets/${id}`, data),
    deleteAsset: (id: string | number) => api.delete(`/assets/${id}`),
};

export const galleryAPI = {
    getAlbums: () => api.get(`${routeBase.galleries}/albums`),
    createAlbum: (data: unknown) => api.post(`${routeBase.galleries}/albums`, data),
    updateAlbum: (id: string | number, data: unknown) => api.put(`${routeBase.galleries}/albums/${id}`, data),
    deleteAlbum: (id: string | number) => api.delete(`${routeBase.galleries}/albums/${id}`),
    setAlbumCover: (id: string | number, data: unknown) => api.put(`${routeBase.galleries}/albums/${id}/cover`, data),
    getMediaByAlbum: (albumId: string | number) => api.get(`${routeBase.galleries}/albums/${albumId}/media`),
    addMedia: (data: unknown) => api.post(`${routeBase.galleries}/media`, data),
    addBulkMedia: (data: unknown) => api.post(`${routeBase.galleries}/media/bulk`, data),
    deleteMedia: (id: string | number) => api.delete(`${routeBase.galleries}/media/${id}`),
    likeMedia: (id: string | number) => api.put(`${routeBase.galleries}/media/${id}/like`),
};

export const allApis = {
    activityLogAPI,
    adminSettingsAPI,
    appBannerAPI,
    assetsAPI,
    beatPlanAPI,
    branchAPI,
    celebrationTemplateAPI,
    customerCategoryAPI,
    customerSubCategoryAPI,
    dailySalesReportAPI,
    dashboardAPI,
    departmentAPI,
    distributorAPI,
    engagementAPI,
    eventAPI,
    faceXAPI,
    galleryAPI,
    jobLocationAPI,
    ledgerAPI,
    leaveTypeAPI,
    lostAndFoundAPI,
    lmsAPI,
    managerAPI,
    nomineeAPI,
    orderAPI,
    penaltyAPI,
    pollAPI,
    productAPI,
    productCategoryAPI,
    productSubCategoryAPI,
    productVariantAPI,
    quotationConfigAPI,
    retailerAPI,
    shiftAPI,
    superDistributorAPI,
    surveyAPI,
    taskAPI,
    unitMeasureAPI,
    employeeAPI,
};

export default allApis;