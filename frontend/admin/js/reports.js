/**
 * Reports CMS - Gerenciamento de Denúncias
 */

const CMSReports = {
  currentFilter: "all",
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  reports: [],

  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;
    this.loadReports();
    this.setupFilters();
    this.setupPagination();
    this.setupYear();
  },

  // ===== LOAD =====
  loadReports: async function () {
    const list = document.getElementById("reportsList");
    if (!list) return;

    list.innerHTML = '<div class="loading-admin">Carregando denúncias...</div>';

    try {
      // 🎯 Se filtro = all, não passa status (traz todas)
      // Se filtro = pending, passa status=pending
      const params = {};
      if (this.currentFilter && this.currentFilter !== "all") {
        params.status = this.currentFilter;
      }

      const result = await CMS_API.getReports(params);

      if (result.success && result.data) {
        this.reports = result.data.reports || [];
        this.totalItems = result.data.total || 0;

        // Atualizar badges dos filtros (se existirem)
        if (result.data.stats) {
          this.updateFilterBadges(result.data.stats);
        }

        this.renderReports(this.reports);
        this.updatePagination();
      } else {
        list.innerHTML = `
                <div class="empty-admin">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>Nenhuma denúncia encontrada.</p>
                </div>
            `;
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      list.innerHTML = `
            <div class="empty-admin">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Erro ao carregar denúncias.</p>
            </div>
        `;
    }
  },

  // Atualizar badges dos filtros com contadores
  updateFilterBadges: function (stats) {
    const badgeMap = {
      all: stats.total || 0,
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      published: stats.published || 0,
      rejected: stats.rejected || 0,
    };

    Object.entries(badgeMap).forEach(([filter, count]) => {
      const btn = document.querySelector(
        `.filter-admin-btn[data-filter="${filter}"]`,
      );
      if (btn) {
        // Adicionar contador se não existir
        let badge = btn.querySelector(".filter-count");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "filter-count";
          badge.style.cssText =
            "margin-left:0.4rem;opacity:0.7;font-size:0.7rem;";
          btn.appendChild(badge);
        }
        badge.textContent = `(${count})`;
      }
    });
  },

  // ===== RENDER =====
  renderReports: function (reports) {
    const list = document.getElementById("reportsList");
    if (!list) return;

    if (reports.length === 0) {
      list.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-tertiary);">
                    <p>Nenhuma denúncia encontrada.</p>
                </div>
            `;
      return;
    }

    const statusMap = {
      pending: { label: "Em análise", class: "pending" },
      approved: { label: "Aprovada", class: "approved" },
      rejected: { label: "Rejeitada", class: "rejected" },
      published: { label: "Publicada", class: "published" },
    };

    list.innerHTML = reports
      .map((r) => {
        const status = statusMap[r.status] || { label: r.status, class: "" };
        return `
                <div class="report-item">
                    <div class="report-header">
                        <div class="report-title">
                            <strong>${this.escapeHtml(r.platform)}</strong> - ${this.escapeHtml(r.state)}
                            ${r.city ? `, ${this.escapeHtml(r.city)}` : ""}
                        </div>
                        <span class="report-status ${status.class}">${status.label}</span>
                    </div>
                    <div class="report-body">
                        <p>${this.escapeHtml(r.description || "").substring(0, 200)}...</p>
                    </div>
                    <div class="report-meta">
                        <span>👤 ${this.escapeHtml(r.user_name || "Anônimo")}</span>
                        <span>📅 ${this.formatDate(r.created_at)}</span>
                        ${r.contact ? `<span>📱 ${this.escapeHtml(r.contact)}</span>` : ""}
                    </div>
                    <div class="report-actions">
                        ${
                          r.status === "pending"
                            ? `
                            <button class="btn-approve" data-id="${r.id}">✅ Aprovar</button>
                            <button class="btn-reject" data-id="${r.id}">❌ Rejeitar</button>
                        `
                            : ""
                        }
                        ${
                          r.status === "approved"
                            ? `
                            <button class="btn-publish" data-id="${r.id}">📰 Publicar</button>
                        `
                            : ""
                        }
                        <button class="btn-view" data-id="${r.id}">👁️ Ver detalhes</button>
                    </div>
                </div>
            `;
      })
      .join("");

    // Eventos dos botões
    document.querySelectorAll(".btn-approve").forEach((btn) => {
      btn.addEventListener("click", () => this.handleApprove(btn.dataset.id));
    });
    document.querySelectorAll(".btn-reject").forEach((btn) => {
      btn.addEventListener("click", () => this.handleReject(btn.dataset.id));
    });
    document.querySelectorAll(".btn-publish").forEach((btn) => {
      btn.addEventListener("click", () => this.handlePublish(btn.dataset.id));
    });
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = `/admin/report.html?id=${btn.dataset.id}`;
      });
    });
  },

  // ===== ACTIONS =====
  handleApprove: async function (id) {
    if (!confirm("Aprovar esta denúncia?")) return;

    try {
      const notes = prompt("Observações (opcional):");
      const result = await CMS_API.approveReport(id, notes);
      if (result.success) {
        alert("✅ Denúncia aprovada com sucesso!");
        this.loadReports();
      } else {
        alert("❌ " + (result.message || "Erro ao aprovar denúncia."));
      }
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      alert("❌ Erro ao aprovar denúncia. Tente novamente.");
    }
  },

  handleReject: async function (id) {
    if (!confirm("Rejeitar esta denúncia?")) return;

    try {
      const notes = prompt("Motivo da rejeição:");
      const result = await CMS_API.rejectReport(id, notes);
      if (result.success) {
        alert("✅ Denúncia rejeitada.");
        this.loadReports();
      } else {
        alert("❌ " + (result.message || "Erro ao rejeitar denúncia."));
      }
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      alert("❌ Erro ao rejeitar denúncia. Tente novamente.");
    }
  },

  handlePublish: async function (id) {
    if (!confirm("Publicar esta denúncia no site?")) return;

    try {
      const result = await CMS_API.publishReport(id);
      if (result.success) {
        alert("✅ Denúncia publicada com sucesso!");
        this.loadReports();
      } else {
        alert("❌ " + (result.message || "Erro ao publicar denúncia."));
      }
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("❌ Erro ao publicar denúncia. Tente novamente.");
    }
  },

  // ===== FILTERS =====
  setupFilters: function () {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        CMSReports.currentFilter = this.dataset.filter;
        CMSReports.currentPage = 1;
        CMSReports.loadReports();
      });
    });
  },

  // ===== PAGINATION =====
  setupPagination: function () {
    document.getElementById("prevPage")?.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadReports();
      }
    });

    document.getElementById("nextPage")?.addEventListener("click", () => {
      const totalPages = Math.ceil(this.totalItems / this.pageSize);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.loadReports();
      }
    });
  },

  updatePagination: function () {
    const totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    document.getElementById("prevPage").disabled = this.currentPage <= 1;
    document.getElementById("nextPage").disabled =
      this.currentPage >= totalPages;
    document.getElementById("pageInfo").textContent =
      `Página ${this.currentPage} de ${totalPages}`;
  },

  // ===== YEAR =====
  setupYear: function () {
    const year = new Date().getFullYear();
    const footerYear = document.getElementById("footerYear");
    const sidebarYear = document.getElementById("sidebarYear");
    if (footerYear) footerYear.textContent = year;
    if (sidebarYear) sidebarYear.textContent = year;
  },

  // ===== UTILS =====
  formatDate: function (dateStr) {
    if (!dateStr) return "--";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  },

  escapeHtml: function (text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".cms-reports")) {
    CMSReports.init();
  }
});
