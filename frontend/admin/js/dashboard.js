/**
 * Dashboard - Painel Administrativo
 */

const CMSDashboard = {
  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;
    this.loadDashboard();
    this.setupYear();
    this.setupRefresh();
  },

  // ===== LOAD =====
  loadDashboard: async function () {
    try {
      const result = await CMS_API.getDashboard();

      if (result.success && result.data) {
        this.renderDashboard(result.data);
      } else {
        this.showError(result.message || "Erro ao carregar dashboard.");
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      this.showError("Erro ao carregar dashboard. Tente novamente.");
    }
  },

  // ===== RENDER =====
  renderDashboard: function (data) {
    const stats = data.stats || {};

    // Resumo de denúncias
    const reports = stats.reports || {};
    document.getElementById("totalReports").textContent = reports.total || 0;
    document.getElementById("pendingReports").textContent =
      reports.pending || 0;
    document.getElementById("approvedReports").textContent =
      reports.approved || 0;
    document.getElementById("publishedReports").textContent =
      reports.published || 0;

    // Resumo de boletins
    const bulletins = stats.bulletins || {};
    document.getElementById("totalBulletins").textContent =
      bulletins.total || 0;
    document.getElementById("totalViews").textContent =
      bulletins.total_views || 0;
    document.getElementById("totalShares").textContent =
      bulletins.total_shares || 0;

    // Usuários
    document.getElementById("totalUsers").textContent = stats.users || 0;

    // Denúncias recentes (gráfico simplificado)
    const recentReports = stats.recent_reports || [];
    this.renderTimeline(recentReports);
  },

  // ===== TIMELINE =====
  renderTimeline: function (data) {
    const container = document.getElementById("timelineChart");
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = `
                <div style="text-align:center;color:var(--text-tertiary);padding:1rem;">
                    Nenhuma denúncia nos últimos 7 dias.
                </div>
            `;
      return;
    }

    const max = Math.max(...data.map((d) => d.count), 1);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    container.innerHTML = data
      .map((d) => {
        const date = new Date(d.date);
        const dayName = days[date.getDay()];
        const height = (d.count / max) * 100;
        return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                    <div style="width:100%;background:var(--accent-gold);border-radius:2px 2px 0 0;height:${height}%;min-height:4px;transition:height 0.5s;"></div>
                    <span style="font-size:0.5rem;color:var(--text-tertiary);margin-top:0.2rem;">${dayName}</span>
                    <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${d.count}</span>
                </div>
            `;
      })
      .join("");
  },

  // ===== REFRESH =====
  setupRefresh: function () {
    const btn = document.getElementById("refreshBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        this.loadDashboard();
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Atualizar';
        }, 1000);
      });
    }
  },

  // ===== ERROR =====
  showError: function (message) {
    const container = document.querySelector(".dashboard-content");
    if (container) {
      container.innerHTML = `
                <div style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);">
                    <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
                    <h2 style="font-size:1.2rem;color:var(--text-primary);">${message}</h2>
                    <p style="margin-top:0.5rem;">Verifique suas permissões ou tente novamente.</p>
                </div>
            `;
    }
  },

  // ===== YEAR =====
  setupYear: function () {
    const year = new Date().getFullYear();

    const footerYear = document.getElementById("footerYear");
    const sidebarYear = document.getElementById("sidebarYear");

    if (footerYear) footerYear.textContent = year;
    if (sidebarYear) sidebarYear.textContent = year;
  },
}; // <-- Faltava fechar o objeto CMSSettings

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".cms-settings")) {
    CMSSettings.init();
  }
});

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".cms-dashboard")) {
    CMSDashboard.init();
  }
});
