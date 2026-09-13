/**
 * Bulletins CMS - Gerenciamento de Boletins
 */

const CMSBulletins = {
  currentFilter: "all",
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  bulletins: [],

  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;
    this.loadBulletins();
    this.setupFilters();
    this.setupPagination();
    this.setupYear();
  },

  // ===== LOAD =====
  loadBulletins: async function () {
    const list = document.getElementById("bulletinsList");
    if (!list) return;

    list.innerHTML =
      '<div class="loading-spinner">Carregando boletins...</div>';

    try {
      const params = {
        limit: this.pageSize,
        offset: (this.currentPage - 1) * this.pageSize,
      };

      if (this.currentFilter !== "all") {
        params.filter = this.currentFilter;
      }

      const result = await API.getBulletins(params);

      if (result.success && result.data) {
        this.bulletins = result.data.bulletins || [];
        this.totalItems = result.data.total || 0;
        this.renderBulletins(this.bulletins);
        this.updatePagination();
      } else {
        list.innerHTML = `
                    <div style="text-align:center;padding:2rem;color:var(--text-tertiary);">
                        <p>Nenhum boletim encontrado.</p>
                    </div>
                `;
      }
    } catch (error) {
      console.error("Erro ao carregar boletins:", error);
      list.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-tertiary);">
                    <p>Erro ao carregar boletins. Tente novamente.</p>
                </div>
            `;
    }
  },

  // ===== RENDER =====
  renderBulletins: function (bulletins) {
    const list = document.getElementById("bulletinsList");
    if (!list) return;

    if (bulletins.length === 0) {
      list.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-tertiary);">
                    <p>Nenhum boletim encontrado.</p>
                    <a href="/admin/bulletin-editor.html" style="color:var(--accent-gold);">Criar novo boletim</a>
                </div>
            `;
      return;
    }

    const severityMap = {
      critical: { label: "Crítico", class: "critical" },
      high: { label: "Alto", class: "high" },
      medium: { label: "Médio", class: "medium" },
      low: { label: "Baixo", class: "low" },
    };

    list.innerHTML = bulletins
      .map((b) => {
        const severity = severityMap[b.severity] || {
          label: "Baixo",
          class: "low",
        };
        return `
                <div class="bulletin-item">
                    <div class="bulletin-header">
                        <div class="bulletin-title">
                            <strong>${this.escapeHtml(b.title)}</strong>
                            ${b.subtitle ? `<span style="color:var(--text-tertiary);font-size:0.8rem;">- ${this.escapeHtml(b.subtitle)}</span>` : ""}
                        </div>
                        <span class="bulletin-severity ${severity.class}">${severity.label}</span>
                    </div>
                    <div class="bulletin-meta">
                        <span>📁 ${this.escapeHtml(b.filter || "outros")}</span>
                        <span>👁️ ${b.views || 0}</span>
                        <span>❤️ ${b.likes || 0}</span>
                        <span>📤 ${b.shares || 0}</span>
                        <span>📅 ${this.formatDate(b.published_at)}</span>
                        <span>👤 ${this.escapeHtml(b.author_name || "Equipe")}</span>
                    </div>
                    <div class="bulletin-actions">
                        <button class="btn-edit" data-id="${b.id}">✏️ Editar</button>
                        <button class="btn-delete" data-id="${b.id}">🗑️ Excluir</button>
                        <button class="btn-view" data-id="${b.id}">👁️ Ver no site</button>
                    </div>
                </div>
            `;
      })
      .join("");

    // Eventos
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = `/admin/bulletin-editor.html?id=${btn.dataset.id}`;
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => this.handleDelete(btn.dataset.id));
    });

    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = `/boletim.html?id=${btn.dataset.id}`;
      });
    });
  },

  // ===== DELETE =====
  handleDelete: async function (id) {
    if (!confirm("Tem certeza que deseja excluir este boletim?")) return;

    try {
      const result = await CMS_API.deleteBulletin(id);
      if (result.success) {
        alert("✅ Boletim excluído com sucesso!");
        this.loadBulletins();
      } else {
        alert("❌ " + (result.message || "Erro ao excluir boletim."));
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("❌ Erro ao excluir boletim. Tente novamente.");
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
        CMSBulletins.currentFilter = this.dataset.filter;
        CMSBulletins.currentPage = 1;
        CMSBulletins.loadBulletins();
      });
    });
  },

  // ===== PAGINATION =====
  setupPagination: function () {
    document.getElementById("prevPage")?.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadBulletins();
      }
    });

    document.getElementById("nextPage")?.addEventListener("click", () => {
      const totalPages = Math.ceil(this.totalItems / this.pageSize);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.loadBulletins();
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
  if (document.querySelector(".cms-bulletins")) {
    CMSBulletins.init();
  }
});
