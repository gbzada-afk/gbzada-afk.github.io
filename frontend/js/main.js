/**
 * Main — Inicialização Global
 * Roda em todas as páginas
 */

const CTUOS = {

    // ============================================================
    // INIT
    // ============================================================
    init: function () {
        this.setupSidebar();
        this.setupHeader();
        this.setupAuthModal();
        this.setupUserMenu();
        this.setupUserDropdown();
        this.setupYear();
    },

    // ============================================================
    // SIDEBAR (mobile)
    // ============================================================
    setupSidebar: function () {
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const closeBtn = document.getElementById('sidebarClose');

        if (!hamburger || !sidebar || !overlay) return;

        const open = () => {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            hamburger.classList.add('active');
            document.body.classList.add('no-scroll');
        };

        const close = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            hamburger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };

        hamburger.addEventListener('click', open);
        closeBtn?.addEventListener('click', close);
        overlay.addEventListener('click', close);

        document.querySelectorAll('.sidebar a:not([href="#"])').forEach(link => {
            link.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                close();
            }
        });

        window.closeSidebar = close;
    },

    // ============================================================
    // HEADER (scroll effect)
    // ============================================================
    setupHeader: function () {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

                    if (currentScroll > 120 && currentScroll > lastScroll) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }

                    if (currentScroll > 10) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }

                    lastScroll = currentScroll;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    },

    // ============================================================
    // AUTH MODAL
    // ============================================================
    setupAuthModal: function () {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                if (typeof Auth !== 'undefined' && Auth.closeModal) {
                    Auth.closeModal();
                }
            }
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                if (typeof Auth !== 'undefined' && Auth.closeModal) {
                    Auth.closeModal();
                }
            }
        });
    },

    // ============================================================
    // USER MENU
    // ============================================================
    setupUserMenu: function () {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.addEventListener('click', function () {
                window.location.href = '/conta/perfil.html';
            });
        }
    },

    // ============================================================
    // USER DROPDOWN
    // ============================================================
    setupUserDropdown: function () {
        const wrapper = document.getElementById('userMenuWrapper');
        const btn = document.getElementById('userMenuBtn');
        const dropdown = document.getElementById('userDropdown');

        if (!wrapper || !btn) return;

        // Toggle
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = wrapper.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(isOpen));
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && wrapper.classList.contains('open')) {
                wrapper.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Botão sair
        const logoutBtn = document.getElementById('dropdownLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                if (confirm('Tem certeza que deseja sair?')) {
                    if (typeof Auth !== 'undefined' && Auth.logout) {
                        Auth.logout();
                    } else {
                        localStorage.removeItem('ctuos_token');
                        localStorage.removeItem('ctuos_user');
                        window.location.href = '/';
                    }
                }
            });
        }

        // Marcar item ativo
        this.markActiveDropdownItem();
    },

    markActiveDropdownItem: function () {
        const currentPath = window.location.pathname;
        const cleanPath = currentPath.replace('.html', '').replace(/\/$/, '') || '/';

        document.querySelectorAll('.user-dropdown-item').forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;

            const cleanHref = href.replace('.html', '').replace(/\/$/, '') || '/';

            if (cleanHref === cleanPath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    // ============================================================
    // YEAR
    // ============================================================
    setupYear: function () {
        const year = new Date().getFullYear();
        document.querySelectorAll('#footerYear, #sidebarYear').forEach(el => {
            if (el) el.textContent = year;
        });
    }
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    CTUOS.init();
});

window.CTUOS = CTUOS;