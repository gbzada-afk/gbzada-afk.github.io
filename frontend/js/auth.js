/**
 * Auth — Gerenciamento de Autenticação
 * Adaptado para:
 *  - Login via modal (páginas que têm modal)
 *  - Login via link (páginas sem modal → vai para /conta/login.html)
 */

const Auth = {

    user: null,
    token: null,

    // ============================================================
    // INIT
    // ============================================================
    init: function () {
        this.token = localStorage.getItem('ctuos_token');
        const userStr = localStorage.getItem('ctuos_user');

        if (userStr) {
            try {
                this.user = JSON.parse(userStr);
            } catch (e) {
                this.user = null;
            }
        }

        this.updateUI();

        window.addEventListener('storage', (e) => {
            if (e.key === 'ctuos_token' || e.key === 'ctuos_user') {
                this.token = localStorage.getItem('ctuos_token');
                const u = localStorage.getItem('ctuos_user');
                this.user = u ? JSON.parse(u) : null;
                this.updateUI();
            }
        });

        return this.isLoggedIn();
    },

    // ============================================================
    // CHECKS
    // ============================================================
    isLoggedIn: function () {
        return !!this.token && !!this.user;
    },

    isAdmin: function () {
        return this.isLoggedIn() && this.user && this.user.role === 'admin';
    },

    getUser: function () {
        return this.user;
    },

    getToken: function () {
        return this.token;
    },

    // ============================================================
    // LOGIN
    // ============================================================
    login: async function (identifier, password) {
        const result = await API.login(identifier, password);

        if (result.success) {
            this.token = result.data.token;
            this.user = result.data.user;
            this.updateUI();
        }

        return result;
    },

    // ============================================================
    // REGISTER
    // ============================================================
    register: async function (data) {
        return await API.register(data);
    },

    // ============================================================
    // LOGOUT
    // ============================================================
    logout: function () {
        this.token = null;
        this.user = null;
        localStorage.removeItem('ctuos_token');
        localStorage.removeItem('ctuos_user');

        this.updateUI();

        // Redirecionar para home
        window.location.href = '/';
    },

    // ============================================================
    // PROFILE
    // ============================================================
    refreshProfile: async function () {
        const result = await API.getProfile();
        if (result.success) {
            this.user = result.data.user;
            localStorage.setItem('ctuos_user', JSON.stringify(this.user));
            this.updateUI();
        }
        return result;
    },

    updateProfile: async function (data) {
        const result = await API.updateProfile(data);
        if (result.success) {
            this.user = result.data.user;
            localStorage.setItem('ctuos_user', JSON.stringify(this.user));
            this.updateUI();
        }
        return result;
    },

    forgotPassword: async function (email) {
        return await API.forgotPassword(email);
    },

    // ============================================================
    // UI — atualiza todos os elementos visuais
    // ============================================================
    updateUI: function () {
        const isLoggedIn = this.isLoggedIn();
        const user = this.user;

        // Guest vs User Menu
        const guest = document.getElementById('headerGuest');
        const wrapper = document.getElementById('userMenuWrapper');

        if (guest) guest.style.display = isLoggedIn ? 'none' : 'flex';
        if (wrapper) wrapper.style.display = isLoggedIn ? 'block' : 'none';

        // Preencher avatar/nome
        if (isLoggedIn && user) {
            const initial = this.getUserInitial(user);

            // Header
            const headerAvatar = document.getElementById('headerAvatar');
            const headerUserName = document.getElementById('headerUserName');
            if (headerAvatar) headerAvatar.textContent = initial;
            if (headerUserName) headerUserName.textContent = user.username || user.name;

            // Dropdown
            const dropdownAvatar = document.getElementById('dropdownAvatar');
            const dropdownName = document.getElementById('dropdownName');
            const dropdownEmail = document.getElementById('dropdownEmail');
            if (dropdownAvatar) dropdownAvatar.textContent = initial;
            if (dropdownName) dropdownName.textContent = user.name || user.username;
            if (dropdownEmail) dropdownEmail.textContent = user.email || '';

            // Admin links
            const adminLinks = document.getElementById('dropdownAdminLinks');
            if (adminLinks) {
                adminLinks.style.display = this.isAdmin() ? 'block' : 'none';
            }
        }

        // Sidebar user (index mobile)
        this.updateSidebar(isLoggedIn, user);

        // Botões antigos (login/register)
        const loginBtn = document.getElementById('headerLoginBtn');
        const registerBtn = document.getElementById('headerRegisterBtn');
        if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
        if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : 'inline-block';

        // Sidebar botões
        const sidebarLogin = document.getElementById('sidebarLoginBtn');
        const sidebarRegister = document.getElementById('sidebarRegisterBtn');
        const sidebarLogout = document.getElementById('sidebarLogout');
        if (sidebarLogin) sidebarLogin.style.display = isLoggedIn ? 'none' : 'flex';
        if (sidebarRegister) sidebarRegister.style.display = isLoggedIn ? 'none' : 'flex';
        if (sidebarLogout) sidebarLogout.style.display = isLoggedIn ? 'flex' : 'none';

        // Sidebar admin
        const sidebarAdmin = document.getElementById('sidebarAdminLinks');
        if (sidebarAdmin) {
            sidebarAdmin.style.display = this.isAdmin() ? 'block' : 'none';
        }

        // Form de denúncia
        const loginToReport = document.getElementById('loginToReport');
        if (loginToReport) {
            loginToReport.style.display = isLoggedIn ? 'none' : 'block';
        }

        const submitBtn = document.getElementById('reportSubmitBtn');
        if (submitBtn) submitBtn.disabled = !isLoggedIn;

        // Evento customizado
        window.dispatchEvent(new CustomEvent('ctuos:auth-changed', {
            detail: { isLoggedIn, user }
        }));
    },

    // ============================================================
    // SIDEBAR
    // ============================================================
    updateSidebar: function (isLoggedIn, user) {
        const sidebarUser = document.getElementById('sidebarUser');
        if (!sidebarUser) return;

        const avatarEl = sidebarUser.querySelector('.user-avatar');
        const nameEl = sidebarUser.querySelector('.user-name');
        const emailEl = sidebarUser.querySelector('.user-email');
        const statusEl = sidebarUser.querySelector('.user-status');

        if (isLoggedIn && user) {
            if (avatarEl) avatarEl.innerHTML = this.getUserInitial(user);
            if (nameEl) nameEl.textContent = user.name || user.username;
            if (emailEl) emailEl.textContent = user.email || '';
            if (statusEl) statusEl.innerHTML = '<span class="dot"></span> online';
        } else {
            if (avatarEl) avatarEl.innerHTML = '<i class="fa-regular fa-user"></i>';
            if (nameEl) nameEl.textContent = 'Visitante';
            if (emailEl) emailEl.textContent = 'faça login para acessar';
            if (statusEl) statusEl.innerHTML = '<span class="dot"></span> off';
        }
    },

    // ============================================================
    // HELPERS
    // ============================================================
    getUserInitial: function (user) {
        if (!user) return 'U';
        if (user.avatar) return user.avatar;
        if (user.username) return user.username.charAt(0).toUpperCase();
        if (user.name) return user.name.charAt(0).toUpperCase();
        return 'U';
    },

    // ============================================================
    // MODAL
    // ============================================================
    openModal: function (tab = 'login') {
        const modal = document.getElementById('authModal');
        if (!modal) {
            // Sem modal nesta página → redirecionar
            window.location.href = tab === 'register' ? '/conta/cadastro.html' : '/conta/login.html';
            return;
        }

        modal.classList.add('open');
        document.body.classList.add('no-scroll');

        this.showTab(tab);

        document.querySelectorAll('.auth-modal .error-message, .auth-modal .success-message')
            .forEach(el => el.classList.remove('visible'));
    },

    closeModal: function () {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');

        document.getElementById('loginForm')?.reset();
        document.getElementById('registerForm')?.reset();
        document.getElementById('forgotPasswordForm')?.reset();
    },

    showTab: function (tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const loginTab = document.querySelector('[data-tab="login"]');
        const registerTab = document.querySelector('[data-tab="register"]');

        if (tab === 'login') {
            if (loginForm) loginForm.style.display = 'flex';
            if (registerForm) registerForm.style.display = 'none';
            if (forgotForm) forgotForm.style.display = 'none';
            if (loginTab) loginTab.classList.add('active');
            if (registerTab) registerTab.classList.remove('active');
        } else if (tab === 'register') {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'flex';
            if (forgotForm) forgotForm.style.display = 'none';
            if (registerTab) registerTab.classList.add('active');
            if (loginTab) loginTab.classList.remove('active');
        } else if (tab === 'forgot') {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (forgotForm) forgotForm.style.display = 'flex';
        }
    }
};

// ============================================================
// EVENTOS GLOBAIS
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    Auth.init();

    // Abrir modal
    document.getElementById('headerLoginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('login');
    });

    document.getElementById('headerRegisterBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('register');
    });

    document.getElementById('sidebarLoginBtn')?.addEventListener('click', (e) => {
        if (this.getAttribute('href') && this.getAttribute('href') !== '#') return;
        e.preventDefault();
        Auth.openModal('login');
    });

    document.getElementById('sidebarRegisterBtn')?.addEventListener('click', (e) => {
        if (this.getAttribute('href') && this.getAttribute('href') !== '#') return;
        e.preventDefault();
        Auth.openModal('register');
    });

    document.getElementById('reportLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('login');
    });

    document.getElementById('reportRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('register');
    });

    // Fechar modal
    document.getElementById('authModalClose')?.addEventListener('click', () => Auth.closeModal());

    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) Auth.closeModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal?.classList.contains('open')) {
            Auth.closeModal();
        }
    });

    // Tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', function () {
            Auth.showTab(this.dataset.tab);
        });
    });

    // Switches
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.showTab('register');
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.showTab('login');
    });

    document.getElementById('forgotPasswordBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.showTab('forgot');
    });

    document.getElementById('backToLoginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.showTab('login');
    });

    // Form login
    document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        if (errorEl) errorEl.classList.remove('visible');

        if (!identifier || !password) {
            if (errorEl) {
                errorEl.textContent = 'Preencha todos os campos.';
                errorEl.classList.add('visible');
            }
            return;
        }

        const result = await Auth.login(identifier, password);

        if (result.success) {
            Auth.closeModal();
            window.location.reload();
        } else {
            if (errorEl) {
                errorEl.textContent = result.message || 'Credenciais inválidas.';
                errorEl.classList.add('visible');
            }
        }
    });

    // Form register
    document.getElementById('registerForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirmPassword').value;
        const errorEl = document.getElementById('registerError');
        const successEl = document.getElementById('registerSuccess');

        if (errorEl) errorEl.classList.remove('visible');
        if (successEl) successEl.classList.remove('visible');

        if (!name || !username || !email || !password || !confirm) {
            if (errorEl) {
                errorEl.textContent = 'Preencha todos os campos.';
                errorEl.classList.add('visible');
            }
            return;
        }

        if (password.length < 6) {
            if (errorEl) {
                errorEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
                errorEl.classList.add('visible');
            }
            return;
        }

        if (password !== confirm) {
            if (errorEl) {
                errorEl.textContent = 'As senhas não coincidem.';
                errorEl.classList.add('visible');
            }
            return;
        }

        const result = await Auth.register({ name, username, email, password });

        if (result.success) {
            if (successEl) {
                successEl.textContent = 'Conta criada com sucesso! Faça login para continuar.';
                successEl.classList.add('visible');
            }
            this.reset();

            setTimeout(() => {
                if (successEl) successEl.classList.remove('visible');
                Auth.showTab('login');
                const loginId = document.getElementById('loginIdentifier');
                if (loginId) loginId.value = email;
            }, 2000);
        } else {
            if (errorEl) {
                errorEl.textContent = result.message || 'Erro ao criar conta.';
                errorEl.classList.add('visible');
            }
        }
    });

    // Form forgot
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();
        const errorEl = document.getElementById('forgotError');
        const successEl = document.getElementById('forgotSuccess');

        if (errorEl) errorEl.classList.remove('visible');
        if (successEl) successEl.classList.remove('visible');

        if (!email) {
            if (errorEl) {
                errorEl.textContent = 'Digite seu e-mail.';
                errorEl.classList.add('visible');
            }
            return;
        }

        const result = await Auth.forgotPassword(email);

        if (result.success) {
            if (successEl) {
                successEl.textContent = result.message || 'Link enviado.';
                successEl.classList.add('visible');
            }
            const input = document.getElementById('forgotEmail');
            if (input) input.value = '';
        } else {
            if (errorEl) {
                errorEl.textContent = result.message || 'E-mail não encontrado.';
                errorEl.classList.add('visible');
            }
        }
    });

    // Logout sidebar
    document.getElementById('sidebarLogout')?.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            Auth.logout();
        }
    });
});

// Exportar
window.Auth = Auth;