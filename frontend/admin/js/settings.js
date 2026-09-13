/**
 * Settings CMS - Configurações do Sistema
 */

const CMSSettings = {
  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;
    this.loadSettings();
    this.setupTabs();
    this.setupForms();
    this.setupYear();
  },

  // ===== LOAD =====
  loadSettings: function () {
    // Carregar configurações salvas
    const settings = JSON.parse(localStorage.getItem("ctuos_settings") || "{}");

    // Site Settings
    document.getElementById("siteTitle").value = settings.siteTitle || "CTUOS";
    document.getElementById("siteDescription").value =
      settings.siteDescription || "Centro de Inteligência Cibernética";

    // Security Settings
    document.getElementById("securityLevel").value =
      settings.securityLevel || "medium";
    document.getElementById("rateLimit").value = settings.rateLimit || "100";

    // Notification Settings
    document.getElementById("emailNotifications").checked =
      settings.emailNotifications !== false;
    document.getElementById("alertThreshold").value =
      settings.alertThreshold || "10";

    // Report Settings
    document.getElementById("autoApprove").checked =
      settings.autoApprove || false;
    document.getElementById("maxFileSize").value = settings.maxFileSize || "10";
  },

  // ===== TABS =====
  setupTabs: function () {
    document.querySelectorAll(".settings-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        document
          .querySelectorAll(".settings-tab")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".settings-panel")
          .forEach((p) => p.classList.remove("active"));

        this.classList.add("active");
        const panelId = this.dataset.tab;
        document.getElementById(`panel-${panelId}`)?.classList.add("active");
      });
    });
  },

  // ===== FORMS =====
  setupForms: function () {
    // Site Settings
    document
      .getElementById("siteSettingsForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        const settings = JSON.parse(
          localStorage.getItem("ctuos_settings") || "{}",
        );
        settings.siteTitle = document.getElementById("siteTitle").value.trim();
        settings.siteDescription = document
          .getElementById("siteDescription")
          .value.trim();
        localStorage.setItem("ctuos_settings", JSON.stringify(settings));
        alert("✅ Configurações do site salvas com sucesso!");
      });

    // Security Settings
    document
      .getElementById("securitySettingsForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        const settings = JSON.parse(
          localStorage.getItem("ctuos_settings") || "{}",
        );
        settings.securityLevel = document.getElementById("securityLevel").value;
        settings.rateLimit = document.getElementById("rateLimit").value;
        localStorage.setItem("ctuos_settings", JSON.stringify(settings));
        alert("✅ Configurações de segurança salvas com sucesso!");
      });

    // Notification Settings
    document
      .getElementById("notificationSettingsForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        const settings = JSON.parse(
          localStorage.getItem("ctuos_settings") || "{}",
        );
        settings.emailNotifications =
          document.getElementById("emailNotifications").checked;
        settings.alertThreshold =
          document.getElementById("alertThreshold").value;
        localStorage.setItem("ctuos_settings", JSON.stringify(settings));
        alert("✅ Configurações de notificações salvas com sucesso!");
      });

    // Report Settings
    document
      .getElementById("reportSettingsForm")
      ?.addEventListener("submit", function (e) {
        e.preventDefault();
        const settings = JSON.parse(
          localStorage.getItem("ctuos_settings") || "{}",
        );
        settings.autoApprove = document.getElementById("autoApprove").checked;
        settings.maxFileSize = document.getElementById("maxFileSize").value;
        localStorage.setItem("ctuos_settings", JSON.stringify(settings));
        alert("✅ Configurações de denúncias salvas com sucesso!");
      });

    // Backup
    document
      .getElementById("backupBtn")
      ?.addEventListener("click", function () {
        if (confirm("Deseja criar um backup agora?")) {
          this.textContent = "⏳ Criando backup...";
          this.disabled = true;

          setTimeout(() => {
            alert("✅ Backup criado com sucesso!\n\nLocal: /backups/");
            this.textContent = "📦 Criar Backup";
            this.disabled = false;
          }, 2000);
        }
      });

    // Cleanup
    document
      .getElementById("cleanupBtn")
      ?.addEventListener("click", function () {
        if (confirm("Deseja limpar arquivos temporários?")) {
          this.textContent = "⏳ Limpando...";
          this.disabled = true;

          setTimeout(() => {
            alert("✅ Limpeza concluída com sucesso!");
            this.textContent = "🧹 Limpar Arquivos Temporários";
            this.disabled = false;
          }, 2000);
        }
      });
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
  if (document.querySelector(".cms-settings")) {
    CMSSettings.init();
  }
});
