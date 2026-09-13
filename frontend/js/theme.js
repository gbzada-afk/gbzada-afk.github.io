/**
 * Theme — Sistema de temas do CTUOS
 * 5 temas: default, blue, green, purple, red
 */

const Theme = {

    STORAGE_KEY: 'ctuos_theme',
    DEFAULT_THEME: 'default',

    // ============================================================
    // INIT
    // ============================================================
    init: function () {
        this.applySavedTheme();
        this.setupButtons();
    },

    // ============================================================
    // APLICAR TEMA SALVO
    // ============================================================
    applySavedTheme: function () {
        const saved = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_THEME;
        this.apply(saved);
    },

    // ============================================================
    // APLICAR TEMA
    // ============================================================
    apply: function (themeName) {
        const html = document.documentElement;

        // Remover todas as classes de tema
        html.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-red');

        // Aplicar o novo
        if (themeName && themeName !== 'default') {
            html.classList.add('theme-' + themeName);
        }

        // Salvar
        localStorage.setItem(this.STORAGE_KEY, themeName);

        // Marcar botão ativo
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        // Evento customizado
        window.dispatchEvent(new CustomEvent('ctuos:theme-changed', {
            detail: { theme: themeName }
        }));
    },

    // ============================================================
    // SETUP BOTÕES
    // ============================================================
    setupButtons: function () {
        const currentTheme = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_THEME;

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const theme = this.dataset.theme;
                Theme.apply(theme);
            });
        });
    },

    // ============================================================
    // API
    // ============================================================
    get: function () {
        return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_THEME;
    },

    reset: function () {
        this.apply(this.DEFAULT_THEME);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', function () {
    Theme.init();
});

// Aplicar antes do DOM pra evitar flash
(function () {
    const saved = localStorage.getItem(Theme.STORAGE_KEY);
    if (saved && saved !== 'default') {
        document.documentElement.classList.add('theme-' + saved);
    }
})();

window.Theme = Theme;