/**
 * Perfil — Página do usuário
 */

const Perfil = {

    init: function () {
        if (!Auth.isLoggedIn()) {
            window.location.href = '/conta/login.html';
            return;
        }

        this.loadProfile();
        this.loadReports();
        this.setupTabs();
        this.setupForm();
        this.setupLogout();
        this.setupYear();
    },

    loadProfile: async function () {
        try {
            const result = await API.getProfile();
            if (result.success && result.data) {
                this.renderProfile(result.data.user);
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    },

    renderProfile: function (user) {
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            avatar.innerHTML = `<span>${user.avatar || user.username.charAt(0).toUpperCase()}</span>`;
        }

        document.getElementById('profileName').textContent = user.name || 'Usuário';
        document.getElementById('profileUsername').textContent = user.username || '@usuario';
        document.getElementById('profileEmail').textContent = user.email || '';

        const roleEl = document.getElementById('profileRole');
        if (roleEl) {
            const roleMap = { 'admin': 'Administrador', 'moderator': 'Moderador', 'user': 'Usuário' };
            roleEl.textContent = roleMap[user.role] || 'Usuário';
            if (user.role === 'admin') roleEl.className = 'badge gold';
        }

        const verifiedEl = document.getElementById('profileVerified');
        if (verifiedEl) {
            if (user.verified) {
                verifiedEl.textContent = '✅ Verificado';
                verifiedEl.className = 'badge success';
            } else {
                verifiedEl.textContent = '❌ Não verificado';
                verifiedEl.className = 'badge warning';
            }
        }

        if (document.getElementById('editName')) {
            document.getElementById('editName').value = user.name || '';
            document.getElementById('editUsername').value = user.username || '';
            document.getElementById('editEmail').value = user.email || '';
        }
    },

    loadReports: async function () {
        const list = document.getElementById('myReportsList');
        if (!list) return;

        try {
            const result = await API.getMyReports();
            if (result.success && result.data) {
                const reports = result.data.reports || [];
                if (reports.length === 0) {
                    list.innerHTML = `
                        <p style="color:var(--text-tertiary);text-align:center;padding:1rem;">
                            Você ainda não enviou nenhuma denúncia.
                            <br /><a href="/denunciar/denunciar.html" style="color:var(--accent-gold);">Enviar denúncia</a>
                        </p>
                    `;
                    return;
                }

                const statusMap = {
                    'pending': 'Em análise',
                    'approved': 'Aprovada',
                    'rejected': 'Rejeitada',
                    'published': 'Publicada'
                };

                list.innerHTML = reports.map(r => `
                    <div class="report-item">
                        <div class="report-title">${r.platform} - ${r.state}</div>
                        <div class="report-meta">
                            <span>${new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                            <span class="report-status ${r.status}">${statusMap[r.status] || r.status}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    },

    setupTabs: function () {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const content = document.getElementById(`tab-${this.dataset.tab}`);
                if (content) content.classList.add('active');
            });
        });
    },

    setupForm: function () {
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const data = {};
            const name = document.getElementById('editName').value.trim();
            const username = document.getElementById('editUsername').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const password = document.getElementById('editPassword').value;

            if (name) data.name = name;
            if (username) data.username = username;
            if (email) data.email = email;
            if (password && password.length >= 6) data.password = password;

            if (Object.keys(data).length === 0) {
                alert('Nenhuma alteração.');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const original = btn.textContent;
            btn.textContent = 'Salvando...';
            btn.disabled = true;

            try {
                const result = await API.updateProfile(data);
                if (result.success) {
                    alert('✅ Perfil atualizado!');
                    await Auth.refreshProfile();
                    Perfil.loadProfile();
                } else {
                    alert('❌ ' + (result.message || 'Erro'));
                }
            } catch (error) {
                alert('❌ Erro ao atualizar.');
            } finally {
                btn.textContent = original;
                btn.disabled = false;
            }
        });
    },

    setupLogout: function () {
        document.getElementById('logoutBtn')?.addEventListener('click', function () {
            if (confirm('Tem certeza que deseja sair?')) {
                Auth.logout();
            }
        });
    },

    setupYear: function () {
        const year = new Date().getFullYear();
        document.querySelectorAll('#footerYear, #sidebarYear').forEach(el => {
            if (el) el.textContent = year;
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.profile-section')) {
        Perfil.init();
    }
});

window.Perfil = Perfil;
