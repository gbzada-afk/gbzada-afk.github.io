/**
 * Home — Lógica da página inicial
 */

// ============================================================
// HELPER: parseTags
// Aceita array, JSON string ou "a, b, c"
// ============================================================
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

// Exportar globalmente
window.parseTags = parseTags;

const Home = {

    currentFilter: 'all',
    bulletins: [],

    // ============================================================
    // INIT
    // ============================================================
    init: function () {
        this.loadBulletins();
        this.loadStats();
        this.loadStatusBar();
        this.setupFilters();
        this.setupGuides();
        this.setupYear();
    },

    // ============================================================
    // BOLETINS
    // ============================================================
    loadBulletins: async function () {
        const grid = document.getElementById('alertsGrid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading-spinner">Carregando boletins...</div>';

        try {
            const result = await API.getLatestBulletins(6);

            if (result.success && result.data && result.data.bulletins) {
                this.bulletins = result.data.bulletins;
                this.renderBulletins(result.data.bulletins);
            } else {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-tertiary);">
                        <div style="font-size:2rem;margin-bottom:0.5rem;">📭</div>
                        <p>Nenhum boletim publicado ainda.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar boletins:', error);
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-tertiary);">
                    <p>Erro ao carregar boletins. Tente novamente.</p>
                </div>
            `;
        }
    },

    renderBulletins: function (bulletins) {
        const grid = document.getElementById('alertsGrid');
        if (!grid) return;

        if (bulletins.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-tertiary);">
                    <p>Nenhum boletim encontrado.</p>
                </div>
            `;
            return;
        }

        const severityMap = {
            critical: 'Crítico',
            high: 'Alto',
            medium: 'Médio',
            low: 'Baixo'
        };

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
                            <button class="like-btn" data-id="${b.id}" onclick="event.stopPropagation(); Home.handleLike(${b.id})">
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

    // ============================================================
    // LIKE
    // ============================================================
    handleLike: async function (id) {
        if (!Auth.isLoggedIn()) {
            Auth.openModal('login');
            return;
        }

        try {
            const result = await API.toggleLike(id);
            if (result.success) {
                this.loadBulletins();
            }
        } catch (error) {
            console.error('Erro ao curtir:', error);
        }
    },

    // ============================================================
    // FILTROS
    // ============================================================
    setupFilters: function () {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                Home.currentFilter = this.dataset.filter;
                Home.loadBulletins();
            });
        });
    },

    // ============================================================
    // ESTATÍSTICAS
    // ============================================================
    loadStats: async function () {
        try {
            const result = await API.getPublicStats();
            if (result.success && result.data) {
                const data = result.data;

                const setText = (id, value) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value || '--';
                };

                setText('statToday', data.today);
                setText('statWeek', data.week);
                setText('statTopScam', data.top_scam);
                setText('statTopState', data.top_state);

                if (data.trends && data.trends.length >= 4) {
                    for (let i = 0; i < 4; i++) {
                        const trend = data.trends[i];
                        setText(`trend${i + 1}`, trend.name);
                        setText(`trend${i + 1}Value`, trend.value);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    },

    // ============================================================
    // STATUS BAR
    // ============================================================
    loadStatusBar: async function () {
        try {
            const result = await API.getStatusBarData();
            if (result.success && result.data) {
                const data = result.data;

                const values = [
                    data.indicators || '--',
                    data.reports_7d || '--',
                    data.investigations || '--',
                    data.last_alert || '--'
                ];

                ['statusIndicators', 'statusReports', 'statusInvestigations', 'statusLastAlert']
                    .forEach((id, i) => {
                        const el = document.getElementById(id);
                        if (el) el.textContent = values[i];
                    });

                ['statusIndicators2', 'statusReports2', 'statusInvestigations2', 'statusLastAlert2']
                    .forEach((id, i) => {
                        const el = document.getElementById(id);
                        if (el) el.textContent = values[i];
                    });
            }
        } catch (error) {
            console.error('Erro ao carregar status bar:', error);
        }
    },

    // ============================================================
    // GUIAS
    // ============================================================
    setupGuides: function () {
        document.querySelectorAll('.guide-card').forEach(card => {
            card.addEventListener('click', function () {
                const title = this.querySelector('h4')?.textContent || 'Guia';
                alert(`📖 Guia: "${title}"\n\nConteúdo completo em breve.`);
            });
        });
    },

    // ============================================================
    // YEAR
    // ============================================================
    setupYear: function () {
        const year = new Date().getFullYear();
        const footerYear = document.getElementById('footerYear');
        const sidebarYear = document.getElementById('sidebarYear');
        if (footerYear) footerYear.textContent = year;
        if (sidebarYear) sidebarYear.textContent = year;
    },

    // ============================================================
    // UTILS
    // ============================================================
    formatDate: function (dateStr) {
        if (!dateStr) return '--';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return '--';
        }
    },

    escapeHtml: function (text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('alertsGrid')) {
        Home.init();
    }
});

window.Home = Home;