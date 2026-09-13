/**
 * Settings — Preferências do usuário
 * Salvas em localStorage.ctuos_settings
 */

const Settings = {

    STORAGE_KEY: 'ctuos_settings',

    DEFAULTS: {
        theme: 'default',
        themeMode: 'manual',
        compactMode: false,
        animations: true,

        notifyNewBulletins: true,
        notifyReportStatus: true,
        notifyCriticalAlerts: true,
        notifyMarketing: false,

        privacyPublicProfile: true,
        privacyShowReports: false,
        privacyAnalytics: true,
        privacyTracking: false,

        displayName: '',
        language: 'pt-BR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'America/Sao_Paulo',

        devMode: false,
        beta: false
    },

    current: {},

    // ============================================================
    // INIT
    // ============================================================
    init: function () {
        this.load();
        this.applyAll();

        // Só configurar UI se a página de settings existir
        if (document.querySelector('.settings-section')) {
            this.setupMenu();
            this.setupThemeCards();
            this.setupThemeModeRadios();
            this.setupToggles();
            this.setupInputs();
            this.setupActions();
            this.updateInfoBox();
        }
    },

    // ============================================================
    // LOAD / SAVE
    // ============================================================
    load: function () {
        try {
            const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            this.current = { ...this.DEFAULTS, ...saved };
        } catch (e) {
            this.current = { ...this.DEFAULTS };
        }
    },

    save: function () {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.current));
        } catch (e) {
            console.error('❌ Erro ao salvar settings:', e);
        }
    },

    // ============================================================
    // APLICAR
    // ============================================================
    applyAll: function () {
    // 🔑 Respeitar o tema salvo pelo Theme, não o DEFAULTS
    if (typeof Theme !== 'undefined') {
        const savedTheme = localStorage.getItem('ctuos_theme') || 'default';
        this.current.theme = savedTheme;  // sincroniza
        Theme.apply(savedTheme);
    }

    document.documentElement.classList.toggle('compact-mode', this.current.compactMode);
    document.documentElement.classList.toggle('no-animations', !this.current.animations);
},

    // ============================================================
    // MENU (página de configurações)
    // ============================================================
    setupMenu: function () {
        document.querySelectorAll('.settings-menu-item').forEach(btn => {
            btn.addEventListener('click', function () {
                const tab = this.dataset.tab;

                document.querySelectorAll('.settings-menu-item').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(`panel-${tab}`);
                if (panel) panel.classList.add('active');
            });
        });
    },

    setupThemeCards: function () {
        const currentTheme = this.current.theme;

        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === currentTheme);

            card.addEventListener('click', function () {
                const theme = this.dataset.theme;

                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                Settings.current.theme = theme;
                Settings.save();

                if (typeof Theme !== 'undefined') {
                    Theme.apply(theme);
                }

                Settings.updateInfoBox();
                Settings.toast(`Tema "${theme}" aplicado!`);
            });
        });
    },

    setupThemeModeRadios: function () {
        document.querySelectorAll('input[name="theme-mode"]').forEach(radio => {
            radio.checked = radio.value === this.current.themeMode;

            radio.addEventListener('change', function () {
                if (this.checked) {
                    Settings.current.themeMode = this.value;
                    Settings.save();
                }
            });
        });
    },

    setupToggles: function () {
        const toggleMap = {
            'settingCompactMode': 'compactMode',
            'settingAnimations': 'animations',
            'notifyNewBulletins': 'notifyNewBulletins',
            'notifyReportStatus': 'notifyReportStatus',
            'notifyCriticalAlerts': 'notifyCriticalAlerts',
            'notifyMarketing': 'notifyMarketing',
            'privacyPublicProfile': 'privacyPublicProfile',
            'privacyShowReports': 'privacyShowReports',
            'privacyAnalytics': 'privacyAnalytics',
            'privacyTracking': 'privacyTracking',
            'advancedDevMode': 'devMode',
            'advancedBeta': 'beta'
        };

        Object.entries(toggleMap).forEach(([id, key]) => {
            const input = document.getElementById(id);
            if (!input) return;

            input.checked = !!this.current[key];

            input.addEventListener('change', function () {
                Settings.current[key] = this.checked;
                Settings.save();
                Settings.applyAll();
            });
        });
    },

    setupInputs: function () {
        const inputMap = {
            'accountDisplayName': 'displayName',
            'accountLanguage': 'language',
            'accountDateFormat': 'dateFormat',
            'accountTimezone': 'timezone'
        };

        Object.entries(inputMap).forEach(([id, key]) => {
            const input = document.getElementById(id);
            if (!input) return;

            if (input.type === 'checkbox') {
                input.checked = !!this.current[key];
            } else {
                input.value = this.current[key] || '';
            }

            const event = input.tagName === 'SELECT' ? 'change' : 'blur';
            input.addEventListener(event, function () {
                Settings.current[key] = this.value;
                Settings.save();
            });
        });
    },

    setupActions: function () {
        document.getElementById('exportSettings')?.addEventListener('click', () => {
            const data = JSON.stringify(this.current, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `ctuos-settings-${Date.now()}.json`;
            a.click();

            URL.revokeObjectURL(url);
            this.toast('Configurações exportadas!');
        });

        document.getElementById('importSettings')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        this.current = { ...this.DEFAULTS, ...imported };
                        this.save();
                        this.applyAll();
                        location.reload();
                    } catch (err) {
                        alert('Arquivo inválido.');
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        });

        document.getElementById('resetSettings')?.addEventListener('click', () => {
            if (confirm('Restaurar todas as configurações padrão?')) {
                this.current = { ...this.DEFAULTS };
                this.save();
                this.applyAll();
                location.reload();
            }
        });

        document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
            if (confirm('⚠️ EXCLUIR CONTA\n\nTodos os dados serão removidos. Continuar?')) {
                const confirmText = prompt('Digite "EXCLUIR" para confirmar:');
                if (confirmText === 'EXCLUIR') {
                    alert('❌ Função será implementada no backend.');
                }
            }
        });

        document.getElementById('linkPrivacy')?.addEventListener('click', (e) => {
            e.preventDefault();
            alert('📄 Política de Privacidade será publicada em breve.');
        });

        document.getElementById('linkTerms')?.addEventListener('click', (e) => {
            e.preventDefault();
            alert('📄 Termos de Uso serão publicados em breve.');
        });
    },

    updateInfoBox: function () {
        const themeNames = {
            default: 'Dourado',
            blue: 'Azul Editorial',
            green: 'Verde',
            purple: 'Roxo',
            red: 'Vermelho'
        };

        const currentThemeEl = document.getElementById('infoCurrentTheme');
        if (currentThemeEl) {
            currentThemeEl.textContent = themeNames[this.current.theme] || this.current.theme;
        }

        let totalSize = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += (localStorage[key].length + key.length) * 2;
            }
        }

        const sizeKB = (totalSize / 1024).toFixed(2);
        const storageEl = document.getElementById('infoStorageUsed');
        if (storageEl) {
            storageEl.textContent = `${sizeKB} KB`;
        }
    },

    toast: function (message) {
        const existing = document.querySelector('.settings-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'settings-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-gold);
            color: var(--bg-primary);
            padding: 0.7rem 1.5rem;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 9999;
            font-family: var(--font-title);
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.transition = 'all 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    Settings.init();
});

window.Settings = Settings;