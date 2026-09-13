/**
 * Report CMS - Análise de Denúncia Individual
 */

const CMSReport = {
  id: null,

  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;

    const params = new URLSearchParams(window.location.search);
    this.id = params.get("id");

    if (!this.id) {
      this.showError("ID da denúncia não informado.");
      return;
    }

    this.loadReport();
    this.setupActions();
    this.setupYear();
  },

  // ===== LOAD =====
  loadReport: async function () {
    const container = document.getElementById("reportContent");
    if (!container) return;

    container.innerHTML =
      '<div class="loading-spinner">Carregando denúncia...</div>';

    try {
      const result = await API.getReportById(this.id);

      if (result.success && result.data) {
        this.renderReport(result.data.report);
      } else {
        this.showError(result.message || "Denúncia não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao carregar denúncia:", error);
      this.showError("Erro ao carregar denúncia. Tente novamente.");
    }
  },

  // ===== RENDER =====
  renderReport: function (report) {
    const container = document.getElementById("reportContent");
    if (!container) return;

    const statusMap = {
      pending: { label: "Em análise", class: "pending" },
      approved: { label: "Aprovada", class: "approved" },
      rejected: { label: "Rejeitada", class: "rejected" },
      published: { label: "Publicada", class: "published" },
    };

    const status = statusMap[report.status] || {
      label: report.status,
      class: "",
    };

    container.innerHTML = `
            <div class="report-detail">
                <div class="detail-header">
                    <h2>Denúncia #${report.id}</h2>
                    <span class="report-status ${status.class}">${status.label}</span>
                </div>

                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Plataforma</label>
                        <span>${this.escapeHtml(report.platform)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Estado</label>
                        <span>${this.escapeHtml(report.state)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Cidade</label>
                        <span>${this.escapeHtml(report.city || "Não informado")}</span>
                    </div>
                    <div class="detail-item">
                        <label>Data do ocorrido</label>
                        <span>${report.date ? this.formatDate(report.date) : "Não informada"}</span>
                    </div>
                    <div class="detail-item">
                        <label>Contato do golpista</label>
                        <span>${this.escapeHtml(report.contact || "Não informado")}</span>
                    </div>
                    <div class="detail-item">
                        <label>Valor envolvido</label>
                        <span>${this.escapeHtml(report.value || "Não informado")}</span>
                    </div>
                    <div class="detail-item">
                        <label>Usuário</label>
                        <span>${this.escapeHtml(report.user_name || "Anônimo")} (${this.escapeHtml(report.user_username || "")})</span>
                    </div>
                    <div class="detail-item">
                        <label>Data da denúncia</label>
                        <span>${this.formatDate(report.created_at)}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Descrição</h3>
                    <p>${this.escapeHtml(report.description || "")}</p>
                </div>

                ${
                  report.evidence
                    ? `
                    <div class="detail-section">
                        <h3>Evidência</h3>
                        <p><a href="${report.evidence}" target="_blank">${this.escapeHtml(report.evidence)}</a></p>
                    </div>
                `
                    : ""
                }

                ${
                  report.media
                    ? `
                    <div class="detail-section">
                        <h3>Mídia</h3>
                        <div style="max-width:300px;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--border-subtle);">
                            <img src="${report.media}" alt="Mídia da denúncia" style="width:100%;display:block;" />
                        </div>
                    </div>
                `
                    : ""
                }

                ${
                  report.tags
                    ? `
                    <div class="detail-section">
                        <h3>Tags</h3>
                        <div class="detail-tags">
                            ${report.tags
                              .split(",")
                              .map(
                                (t) =>
                                  `<span class="tag">#${this.escapeHtml(t.trim())}</span>`,
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }

                ${
                  report.admin_notes
                    ? `
                    <div class="detail-section">
                        <h3>Observações do Administrador</h3>
                        <p style="color:var(--text-secondary);background:var(--bg-input);padding:0.8rem;border-radius:var(--radius-sm);">${this.escapeHtml(report.admin_notes)}</p>
                    </div>
                `
                    : ""
                }

                <div class="detail-actions">
                    ${
                      report.status === "pending"
                        ? `
                        <button class="btn-approve" data-id="${report.id}">✅ Aprovar Denúncia</button>
                        <button class="btn-reject" data-id="${report.id}">❌ Rejeitar Denúncia</button>
                    `
                        : ""
                    }
                    ${
                      report.status === "approved"
                        ? `
                        <button class="btn-publish" data-id="${report.id}">📰 Publicar Denúncia</button>
                    `
                        : ""
                    }
                    <button class="btn-back" onclick="history.back()">← Voltar</button>
                </div>
            </div>
        `;

    // Eventos dos botões
    document
      .querySelector(".btn-approve")
      ?.addEventListener("click", () => this.handleApprove(report.id));
    document
      .querySelector(".btn-reject")
      ?.addEventListener("click", () => this.handleReject(report.id));
    document
      .querySelector(".btn-publish")
      ?.addEventListener("click", () => this.handlePublish(report.id));
  },

  // ===== ACTIONS =====
  handleApprove: async function (id) {
    if (!confirm("Aprovar esta denúncia?")) return;

    try {
      const notes = prompt("Observações (opcional):");
      const result = await CMS_API.approveReport(id, notes);
      if (result.success) {
        alert("✅ Denúncia aprovada com sucesso!");
        this.loadReport();
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
        this.loadReport();
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
        this.loadReport();
      } else {
        alert("❌ " + (result.message || "Erro ao publicar denúncia."));
      }
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("❌ Erro ao publicar denúncia. Tente novamente.");
    }
  },

  // ===== ACTIONS BUTTONS =====
  setupActions: function () {
    // Os botões são criados no render
  },

  // ===== ERROR =====
  showError: function (message) {
    const container = document.getElementById("reportContent");
    if (container) {
      container.innerHTML = `
                <div style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);">
                    <div style="font-size:3rem;margin-bottom:1rem;">📭</div>
                    <h2 style="font-size:1.2rem;color:var(--text-primary);">${this.escapeHtml(message)}</h2>
                    <p style="margin-top:0.5rem;">Tente novamente mais tarde.</p>
                    <a href="/admin/reports.html" style="display:inline-block;margin-top:1rem;color:var(--accent-gold);">
                        ← Voltar para denúncias
                    </a>
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
  if (document.querySelector(".cms-report")) {
    CMSReport.init();
  }
});
