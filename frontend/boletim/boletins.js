/**
 * Boletins — Lista
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

const Boletins = {
    currentFilter: 'all',
    currentSort: 'recent',
    currentPage: 1,
    pageSize: 12,
    totalItems: 0,
    bulletins: [],

    init: function () {
        this.loadBulletins();
        this.setupFilters();
        this.setupSort();
        this.setupPagination();
        this.setupYear();
    },

    loadBulletins: async function () {
        const grid = document.getElementById('alertsGrid');
        if (!grid) return;
        grid.innerHTML = '<div class="loading-spinner">Carregando boletins...</div>';

        try {
            const params = {
                limit: this.pageSize,
                offset: (this.currentPage - 1) * this.pageSize,
                sort: this.currentSort
            };
            if (this.currentFilter !== 'all') params.filter = this.currentFilter;

            const result = await API.getBulletins(params);

            if (result.success && result.data) {
                this.bulletins = result.data.bulletins || [];
                this.totalItems = result.data.total || 0;
                this.renderBulletins(this.bulletins);
                this.updatePagination();
            } else {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-tertiary);">Nenhum boletim encontrado.</div>';
            }
        } catch (error) {
            console.error('Erro ao carregar boletins:', error);
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-tertiary);">Erro ao carregar boletins.</div>';
        }
    },

    renderBulletins: function (bulletins) {
        const grid = document.getElementById('alertsGrid');
        if (!grid) return;

        if (bulletins.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-tertiary);">Nenhum boletim encontrado.</div>';
            return;
        }

        const severityMap = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' };
        let html = '';
        bulletins.forEach(b => {
            const severityLabel = severityMap[b.severity] || 'Baixo';
            const tags = parseTags(b.tags);
            const likes = b.likes_count || 0;
            const views = b.views || 0;
            const author = b.author_name || 'Equipe CTUOS';
            html += `
                <div class="alert-card" onclick="window.location.href='/boletim/boletim.html?id=${b.id}'">
                    <div class="card-top">
                        <span class="card-severity ${b.severity || 'low'}">${severityLabel}</span>
                        <span class="card-time">${this.formatDate(b.published_at)}</span>
                    </div>
                    <div class="card-title">${this.escapeHtml(b.title)}</div>
                    <div class="card-excerpt">${this.escapeHtml(b.excerpt || '')}</div>
                    <div class="card-tags">
                        ${tags.slice(0, 3).map(t => `<span class="tag">#${this.escapeHtml(t)}</span>`).join('')}
                    </div>
                    <div class="card-author">Por <span>${this.escapeHtml(author)}</span></div>
                    <div class="card-footer">
                        <div class="card-actions">
                            <button class="like-btn" data-id="${b.id}" onclick="event.stopPropagation(); Boletins.handleLike(${b.id})">
                                <i class="fa-regular fa-heart"></i>
                                <span class="count">${likes}</span>
                            </button>
                            <span style="font-size:0.55rem;color:var(--text-tertiary);">👁️ ${views}</span>
                        </div>
                        <span class="card-link" onclick="event.stopPropagation(); window.location.href='/boletim/boletim.html?id=${b.id}'">Leia mais →</span>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    },

    handleLike: async function (id) {
        if (!Auth.isLoggedIn()) {
            Auth.openModal('login');
            return;
        }
        try {
            const result = await API.toggleLike(id);
            if (result.success) this.loadBulletins();
        } catch (error) {
            console.error('Erro ao curtir:', error);
        }
    },

    setupFilters: function () {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                Boletins.currentFilter = this.dataset.filter;
                Boletins.currentPage = 1;
                Boletins.loadBulletins();
            });
        });
    },

    setupSort: function () {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                Boletins.currentSort = this.value;
                Boletins.currentPage = 1;
                Boletins.loadBulletins();
            });
        }
    },

    setupPagination: function () {
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (Boletins.currentPage > 1) {
                Boletins.currentPage--;
                Boletins.loadBulletins();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(Boletins.totalItems / Boletins.pageSize);
            if (Boletins.currentPage < totalPages) {
                Boletins.currentPage++;
                Boletins.loadBulletins();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    },

    updatePagination: function () {
        const totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        const prev = document.getElementById('prevPage');
        const next = document.getElementById('nextPage');
        const info = document.getElementById('pageInfo');
        if (prev) prev.disabled = this.currentPage <= 1;
        if (next) next.disabled = this.currentPage >= totalPages;
        if (info) info.textContent = `Página ${this.currentPage} de ${totalPages}`;
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
            return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    if (document.getElementById('alertsGrid')) {
        Boletins.init();
    }
});

window.Boletins = Boletins;
