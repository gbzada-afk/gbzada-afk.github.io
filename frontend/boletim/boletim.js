/**
 * Boletim — Página individual
 */

function parseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        const trimmed = tags.trim();
        if (trimmed === '' || trimmed === 'null') return [];
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [];
            } catch { /* fallthrough */ }
        }
        return trimmed.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
}

const Boletim = {
    id: null,

    init: function () {
        const params = new URLSearchParams(window.location.search);
        this.id = params.get('id');

        if (!this.id) {
            this.showError('ID do boletim não informado.');
            return;
        }

        this.loadBoletim();
        this.setupActions();
        this.setupYear();
    },

    loadBoletim: async function () {
        const wrapper = document.querySelector('.boletim-wrapper');
        const loading = document.querySelector('.boletim-loading');

        if (loading) loading.style.display = 'block';
        if (wrapper) wrapper.style.display = 'none';

        try {
            const result = await API.getBulletinById(this.id);

            if (result.success && result.data && result.data.bulletin) {
                this.renderBoletim(result.data.bulletin);
                if (loading) loading.style.display = 'none';
                if (wrapper) wrapper.style.display = 'block';
            } else {
                this.showError(result.message || 'Boletim não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao carregar boletim:', error);
            this.showError('Erro ao carregar o boletim.');
        }
    },

    renderBoletim: function (bulletin) {
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        const setHtml = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = val;
        };

        const banner = document.getElementById('boletimBanner');
        if (banner) {
            if (bulletin.banner) {
                banner.innerHTML = `<img src="${bulletin.banner}" alt="${this.escapeHtml(bulletin.title)}" />`;
            } else {
                banner.innerHTML = `<div class="no-banner">📰 ${this.escapeHtml(bulletin.title)}</div>`;
            }
        }

        const severity = document.getElementById('boletimSeverity');
        if (severity) {
            const map = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' };
            severity.textContent = map[bulletin.severity] || 'Baixo';
            severity.className = `boletim-severity ${bulletin.severity || 'low'}`;
        }

        setText('boletimDate', this.formatDate(bulletin.published_at));
        setText('boletimReadingTime', `⏱️ ${bulletin.reading_time || 5} min de leitura`);
        setText('boletimTitle', bulletin.title);
        setText('boletimSubtitle', bulletin.subtitle || '');
        setText('boletimAuthor', bulletin.author_name || 'Equipe CTUOS');
        setHtml('boletimBody', bulletin.content || 'Conteúdo não disponível.');

        const tags = document.getElementById('boletimTags');
        if (tags) {
            const tagList = parseTags(bulletin.tags);
            tags.innerHTML = tagList.map(t => `<span class="tag">#${this.escapeHtml(t)}</span>`).join('');
        }

        setText('likeCount', bulletin.likes_count || 0);

        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            if (bulletin.user_liked) {
                likeBtn.classList.add('liked');
                const icon = likeBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-heart';
            }
        }

        document.title = `${bulletin.title} - CTUOS`;
    },

    setupActions: function () {
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async function () {
                if (!Auth.isLoggedIn()) {
                    Auth.openModal('login');
                    return;
                }
                try {
                    const result = await API.toggleLike(Boletim.id);
                    if (result.success) {
                        const count = document.getElementById('likeCount');
                        if (count) count.textContent = result.data.likes || 0;
                        const icon = this.querySelector('i');
                        if (result.data.liked) {
                            this.classList.add('liked');
                            if (icon) icon.className = 'fa-solid fa-heart';
                        } else {
                            this.classList.remove('liked');
                            if (icon) icon.className = 'fa-regular fa-heart';
                        }
                    }
                } catch (error) {
                    console.error('Erro ao curtir:', error);
                }
            });
        }

        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                const url = window.location.href;
                if (navigator.share) {
                    navigator.share({ title: document.title, url }).catch(() => {});
                } else {
                    navigator.clipboard.writeText(url).then(() => {
                        const original = this.innerHTML;
                        this.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
                        setTimeout(() => { this.innerHTML = original; }, 2000);
                    }).catch(() => prompt('Copie o link:', url));
                }
                API.shareBulletin(Boletim.id).catch(() => {});
            });
        }
    },

    showError: function (message) {
        const wrapper = document.querySelector('.boletim-wrapper');
        const loading = document.querySelector('.boletim-loading');
        if (loading) loading.style.display = 'none';
        if (wrapper) {
            wrapper.style.display = 'block';
            wrapper.innerHTML = `
                <div style="text-align:center;padding:3rem 1rem;color:var(--text-tertiary);">
                    <div style="font-size:3rem;margin-bottom:1rem;">📭</div>
                    <h2 style="font-size:1.2rem;color:var(--text-primary);">${this.escapeHtml(message)}</h2>
                    <a href="/boletim/boletins.html" style="display:inline-block;margin-top:1rem;color:var(--accent-gold);">
                        ← Voltar para boletins
                    </a>
                </div>
            `;
        }
    },

    setupYear: function () {
        const year = new Date().getFullYear();
        const footerYear = document.getElementById('footerYear');
        const sidebarYear = document.getElementById('sidebarYear');
        if (footerYear) footerYear.textContent = year;
        if (sidebarYear) sidebarYear.textContent = year;
    },

    formatDate: function (dateStr) {
        if (!dateStr) return '--';
        try {
            return new Date(dateStr).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
        } catch { return '--'; }
    },

    escapeHtml: function (text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.boletim-article')) {
        Boletim.init();
    }
});

window.Boletim = Boletim;
