/**
 * API — Comunicação com o Backend
 * Centraliza todas as requisições HTTP
 */

const API = {
    // Caminho absoluto para a API
    baseURL: '/api',

    // ============================================================
    // HEADERS
    // ============================================================
    getHeaders: function () {
        const token = localStorage.getItem('ctuos_token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    getFormHeaders: function () {
        const token = localStorage.getItem('ctuos_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // ============================================================
    // MÉTODOS HTTP
    // ============================================================
    get: async function (endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('❌ API GET erro:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    post: async function (endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('❌ API POST erro:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    put: async function (endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('❌ API PUT erro:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    patch: async function (endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('❌ API PATCH erro:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    delete: async function (endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('❌ API DELETE erro:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    upload: async function (endpoint, formData) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getFormHeaders(),
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('❌ API UPLOAD erro:', error);
            return { success: false, message: 'Erro de conexão' };
        }
    },

    // ============================================================
    // AUTH
    // ============================================================
    login: async function (identifier, password) {
        const result = await this.post('/auth/login', { identifier, password });
        if (result.success && result.data) {
            localStorage.setItem('ctuos_token', result.data.token);
            localStorage.setItem('ctuos_user', JSON.stringify(result.data.user));
        }
        return result;
    },

    register: async function (data) {
        return await this.post('/auth/register', data);
    },

    logout: function () {
        localStorage.removeItem('ctuos_token');
        localStorage.removeItem('ctuos_user');
        window.location.href = '/';
    },

    getProfile: async function () {
        return await this.get('/auth/profile');
    },

    updateProfile: async function (data) {
        return await this.put('/auth/profile', data);
    },

    forgotPassword: async function (email) {
        return await this.post('/auth/forgot-password', { email });
    },

    // ============================================================
    // BULLETINS
    // ============================================================
    getBulletins: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.get(`/bulletins${query ? '?' + query : ''}`);
    },

    getLatestBulletins: async function (limit = 6) {
        return await this.get(`/bulletins/latest?limit=${limit}`);
    },

    getPopularBulletins: async function (limit = 5) {
        return await this.get(`/bulletins/popular?limit=${limit}`);
    },

    getBulletinById: async function (id) {
        return await this.get(`/bulletins/${id}`);
    },

    toggleLike: async function (id) {
        return await this.post(`/bulletins/${id}/like`);
    },

    shareBulletin: async function (id) {
        return await this.post(`/bulletins/${id}/share`);
    },

    // ============================================================
    // REPORTS
    // ============================================================
    createReport: async function (formData) {
        return await this.upload('/reports', formData);
    },

    getReports: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        return await this.get(`/reports${query ? '?' + query : ''}`);
    },

    getReportById: async function (id) {
        return await this.get(`/reports/${id}`);
    },

    getMyReports: async function () {
        return await this.get('/reports/me/all');
    },

    updateReport: async function (id, data) {
        return await this.put(`/reports/${id}`, data);
    },

    deleteReport: async function (id) {
        return await this.delete(`/reports/${id}`);
    },

    // ============================================================
    // STATS
    // ============================================================
    getPublicStats: async function () {
        return await this.get('/stats/public');
    },

    getStatusBarData: async function () {
        return await this.get('/stats/status-bar');
    },

    getPlatformStats: async function () {
        return await this.get('/stats/platforms');
    },

    getStateStats: async function () {
        return await this.get('/stats/states');
    },

    getTimeline: async function (days = 7) {
        return await this.get(`/stats/timeline?days=${days}`);
    },

    // ============================================================
    // CMS / ADMIN
    // ============================================================
    getDashboard: async function () {
        return await this.get('/admin/dashboard');
    },

    getPendingReports: async function () {
        return await this.get('/admin/reports/pending');
    },

    approveReport: async function (id, notes = null) {
        return await this.patch(`/admin/reports/${id}/approve`, { notes });
    },

    rejectReport: async function (id, notes = null) {
        return await this.patch(`/admin/reports/${id}/reject`, { notes });
    },

    publishReport: async function (id) {
        return await this.patch(`/admin/reports/${id}/publish`);
    },

    createBulletin: async function (formData) {
        return await this.upload('/admin/bulletins', formData);
    },

    updateBulletin: async function (id, data) {
        return await this.put(`/admin/bulletins/${id}`, data);
    },

    deleteBulletin: async function (id) {
        return await this.delete(`/admin/bulletins/${id}`);
    }
};

// Exportar globalmente
window.API = API;