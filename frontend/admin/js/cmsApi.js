/**
 * CMS API - Comunicação do Painel Administrativo
 * Centraliza todas as requisições do CMS
 */

const CMS_API = {
  baseURL: window.location.origin + "/api/admin",

  // ===== HEADERS =====
  getHeaders: function () {
    const token = localStorage.getItem("ctuos_token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  getFormHeaders: function () {
    const token = localStorage.getItem("ctuos_token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  // ===== MÉTODOS HTTP =====
  get: async function (endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return await response.json();
  },

  post: async function (endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  put: async function (endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  patch: async function (endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  delete: async function (endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return await response.json();
  },

  upload: async function (endpoint, formData) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getFormHeaders(),
      body: formData,
    });
    return await response.json();
  },

  // ===== DASHBOARD =====
  getDashboard: async function () {
    return await this.get("/dashboard");
  },

  // ===== REPORTS =====
  // ===== REPORTS =====
  getReports: async function (params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.get(`/reports${query ? "?" + query : ""}`);
  },

  getPendingReports: async function () {
    return await this.get("/reports/pending");
  },
  // ... resto igual

  approveReport: async function (id, notes = null) {
    return await this.patch(`/reports/${id}/approve`, { notes });
  },

  rejectReport: async function (id, notes = null) {
    return await this.patch(`/reports/${id}/reject`, { notes });
  },

  publishReport: async function (id) {
    return await this.patch(`/reports/${id}/publish`);
  },

  // ===== BULLETINS =====
  createBulletin: async function (formData) {
    return await this.upload("/bulletins", formData);
  },

  updateBulletin: async function (id, data) {
    return await this.put(`/bulletins/${id}`, data);
  },

  deleteBulletin: async function (id) {
    return await this.delete(`/bulletins/${id}`);
  },

  // ===== UTILS =====
  isAdmin: function () {
    const userStr = localStorage.getItem("ctuos_user");
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      return user.role === "admin";
    } catch {
      return false;
    }
  },

  checkAuth: function () {
    if (!this.isAdmin()) {
      window.location.href = "/";
      return false;
    }
    return true;
  },
};

// Exportar
if (typeof module !== "undefined" && module.exports) {
  module.exports = CMS_API;
}
