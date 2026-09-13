/**
 * Header Search — Busca global no header
 * Aparece em todas as páginas
 */

const HeaderSearch = {

    // Cache dos boletins carregados
    bulletins: [],
    loaded: false,

    init: function () {
        const input = document.getElementById('headerSearchInput');
        const dropdown = document.getElementById('headerSearchDropdown');

        if (!input || !dropdown) return;

        // Carregar boletins ao focar
        input.addEventListener('focus', () => {
            if (!this.loaded) {
                this.loadBulletins();
            }
        });

        // Buscar ao digitar
        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();

            if (query.length === 0) {
                dropdown.classList.remove('open');
                return;
            }

            this.performSearch(query, dropdown);
        });

        // Enter = redirecionar para boletins com filtro
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();
                if (query.length > 0) {
                    window.location.href = `/boletim/boletins.html?q=${encodeURIComponent(query)}`;
                }
            }
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                input.blur();
            }
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            const wrapper = document.querySelector('.header-search-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    },

    loadBulletins: async function () {
        try {
            const result = await API.getBulletins({ limit: 100 });
            if (result.success && result.data && result.data.bulletins) {
                this.bulletins = result.data.bulletins;
                this.loaded = true;
            }
        } catch (error) {
            console.error('Erro ao carregar boletins:', error);
        }
    },

    performSearch: async function (query, dropdown) {
        // Se ainda não carregou, carrega agora
        if (!this.loaded) {
            await this.loadBulletins();
        }

        // Filtra
        const results = this.bulletins.filter(b => {
            const title = (b.title || '').toLowerCase();
            const excerpt = (b.excerpt || '').toLowerCase();
            const category = (b.category || '').toLowerCase();
            const tags = this.parseTags(b.tags).join(' ').toLowerCase();

            return title.includes(query)
                || excerpt.includes(query)
                || category.includes(query)
                || tags.includes(query);
        });

        // Renderiza
        if (results.length === 0) {
            dropdown.innerHTML = `
                <div class="result-empty">
                    <i class="fa-regular fa-face-frown"></i>
                    Nenhum resultado para "${this.escapeHtml(query)}"
                </div>
            `;
        } else {
            let html = `
                <div class="result-header">
                    ${results.length} resultado${results.length > 1 ? 's' : ''}
                </div>
            `;

            results.slice(0, 6).forEach(b => {
                html += `
                    <a href="/boletim/boletim.html?id=${b.id}" class="result-item">
                        <div class="result-icon">
                            <i class="fa-regular fa-newspaper"></i>
                        </div>
                        <div class="result-info">
                            <div class="result-title">${this.escapeHtml(b.title)}</div>
                            <div class="result-desc">${this.escapeHtml((b.excerpt || '').substring(0, 60))}...</div>
                        </div>
                    </a>
                `;
            });

            if (results.length > 6) {
                html += `
                    <a href="/boletim/boletins.html?q=${encodeURIComponent(query)}" class="result-item" style="justify-content:center;">
                        <span style="font-size:0.8rem;color:var(--accent-gold);font-weight:600;">
                            Ver todos os ${results.length} resultados →
                        </span>
                    </a>
                `;
            }

            dropdown.innerHTML = html;
        }

        dropdown.classList.add('open');
    },

    parseTags: function (tags) {
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
    },

    escapeHtml: function (text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    HeaderSearch.init();
});

window.HeaderSearch = HeaderSearch;