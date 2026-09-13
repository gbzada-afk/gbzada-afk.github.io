/**
 * Statistics CMS - Estatísticas Internas
 */

const CMSStatistics = {
  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;
    this.loadStatistics();
    this.setupYear();
    this.setupRefresh();
  },

  // ===== LOAD =====
  loadStatistics: async function () {
    try {
      const [dashboard, platforms, states, timeline] = await Promise.all([
        CMS_API.getDashboard(),
        API.getPlatformStats(),
        API.getStateStats(),
        API.getTimeline(30),
      ]);

      this.renderStatistics({
        dashboard: dashboard,
        platforms: platforms,
        states: states,
        timeline: timeline,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      this.showError("Erro ao carregar estatísticas. Tente novamente.");
    }
  },

  // ===== RENDER =====
  renderStatistics: function (data) {
    // Dashboard stats
    if (data.dashboard.success && data.dashboard.data) {
      const stats = data.dashboard.data.stats || {};

      // Reports
      const reports = stats.reports || {};
      document.getElementById("statTotalReports").textContent =
        reports.total || 0;
      document.getElementById("statPendingReports").textContent =
        reports.pending || 0;
      document.getElementById("statApprovedReports").textContent =
        reports.approved || 0;
      document.getElementById("statPublishedReports").textContent =
        reports.published || 0;
      document.getElementById("statRejectedReports").textContent =
        reports.rejected || 0;

      // Bulletins
      const bulletins = stats.bulletins || {};
      document.getElementById("statTotalBulletins").textContent =
        bulletins.total || 0;
      document.getElementById("statTotalViews").textContent =
        bulletins.total_views || 0;
      document.getElementById("statTotalShares").textContent =
        bulletins.total_shares || 0;
      document.getElementById("statAvgReadingTime").textContent = Math.round(
        bulletins.avg_reading_time || 0,
      );

      // Users
      document.getElementById("statTotalUsers").textContent = stats.users || 0;
    }

    // Platform chart
    this.renderPlatformChart(data.platforms);

    // State chart
    this.renderStateChart(data.states);

    // Timeline chart
    this.renderTimelineChart(data.timeline);
  },

  // ===== CHARTS =====
  renderPlatformChart: function (data) {
    const container = document.getElementById("platformChart");
    if (!container) return;

    if (
      !data.success ||
      !data.data ||
      !data.data.platforms ||
      data.data.platforms.length === 0
    ) {
      container.innerHTML = `
                <div style="text-align:center;color:var(--text-tertiary);padding:1rem;">
                    Nenhum dado disponível.
                </div>
            `;
      return;
    }

    const platforms = data.data.platforms;
    const max = Math.max(...platforms.map((p) => p.count), 1);

    container.innerHTML = platforms
      .map(
        (p) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                <div style="width:100%;background:var(--accent-gold);border-radius:2px 2px 0 0;height:${(p.count / max) * 100}%;min-height:4px;transition:height 0.5s;"></div>
                <span style="font-size:0.55rem;color:var(--text-tertiary);margin-top:0.2rem;text-align:center;word-break:break-all;">${this.escapeHtml(p.platform)}</span>
                <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${p.count}</span>
            </div>
        `,
      )
      .join("");
  },

  renderStateChart: function (data) {
    const container = document.getElementById("stateChart");
    if (!container) return;

    if (
      !data.success ||
      !data.data ||
      !data.data.states ||
      data.data.states.length === 0
    ) {
      container.innerHTML = `
                <div style="text-align:center;color:var(--text-tertiary);padding:1rem;">
                    Nenhum dado disponível.
                </div>
            `;
      return;
    }

    const states = data.data.states.slice(0, 15);
    const max = Math.max(...states.map((s) => s.count), 1);

    container.innerHTML = states
      .map(
        (s) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                <div style="width:100%;background:var(--status-active);border-radius:2px 2px 0 0;height:${(s.count / max) * 100}%;min-height:4px;transition:height 0.5s;"></div>
                <span style="font-size:0.55rem;color:var(--text-tertiary);margin-top:0.2rem;text-align:center;">${this.escapeHtml(s.state)}</span>
                <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${s.count}</span>
            </div>
        `,
      )
      .join("");
  },

  renderTimelineChart: function (data) {
    const container = document.getElementById("timelineChart");
    if (!container) return;

    if (
      !data.success ||
      !data.data ||
      !data.data.timeline ||
      data.data.timeline.length === 0
    ) {
      container.innerHTML = `
                <div style="text-align:center;color:var(--text-tertiary);padding:1rem;">
                    Nenhum dado disponível.
                </div>
            `;
      return;
    }

    const timeline = data.data.timeline;
    const max = Math.max(...timeline.map((t) => t.count), 1);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    container.innerHTML = timeline
      .map((t) => {
        const date = new Date(t.date);
        const dayName = days[date.getDay()];
        const height = (t.count / max) * 100;
        return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                    <div style="width:100%;background:var(--status-low);border-radius:2px 2px 0 0;height:${height}%;min-height:4px;transition:height 0.5s;"></div>
                    <span style="font-size:0.5rem;color:var(--text-tertiary);margin-top:0.2rem;">${dayName}</span>
                    <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${t.count}</span>
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
        this.loadStatistics();
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Atualizar';
        }, 1000);
      });
    }
  },

  // ===== ERROR =====
  showError: function (message) {
    const container = document.querySelector(".stats-content");
    if (container) {
      container.innerHTML = `
                <div style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);">
                    <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
                    <h2 style="font-size:1.2rem;color:var(--text-primary);">${this.escapeHtml(message)}</h2>
                    <p style="margin-top:0.5rem;">Tente novamente mais tarde.</p>
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

  // ===== UTILS =====
  escapeHtml: function (text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".cms-statistics")) {
    CMSStatistics.init();
  }
});
