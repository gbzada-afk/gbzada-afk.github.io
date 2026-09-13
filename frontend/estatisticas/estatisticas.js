/**
 * Estatísticas — Dashboard
 */

const Estatisticas = {

    init: function () {
        this.loadStats();
        this.loadCharts();
        this.setupYear();
    },

    loadStats: async function () {
        try {
            const [platforms, states] = await Promise.all([
                API.getPlatformStats(),
                API.getStateStats()
            ]);

            let total = 0;
            if (platforms.success && platforms.data && platforms.data.platforms) {
                platforms.data.platforms.forEach(p => total += p.count);
            }

            document.getElementById('statTotal').textContent = total || '--';
            document.getElementById('statPublished').textContent = total || '--';
            document.getElementById('statPending').textContent = '--';
            document.getElementById('statBulletins').textContent = '--';

        } catch (error) {
            console.error('Erro ao carregar stats:', error);
        }
    },

    loadCharts: async function () {
        try {
            const [platforms, states, timeline] = await Promise.all([
                API.getPlatformStats(),
                API.getStateStats(),
                API.getTimeline(7)
            ]);

            const platformContainer = document.getElementById('platformChart');
            if (platformContainer && platforms.success && platforms.data) {
                const data = platforms.data.platforms || [];
                const max = Math.max(...data.map(p => p.count), 1);
                platformContainer.innerHTML = data.map(p => `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                        <div style="width:100%;background:var(--accent-gold);border-radius:2px 2px 0 0;height:${(p.count / max * 100)}%;min-height:4px;"></div>
                        <span style="font-size:0.55rem;color:var(--text-tertiary);margin-top:0.2rem;text-align:center;">${p.platform}</span>
                        <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${p.count}</span>
                    </div>
                `).join('');
            }

            const stateContainer = document.getElementById('stateChart');
            if (stateContainer && states.success && states.data) {
                const data = states.data.states || [];
                const max = Math.max(...data.map(s => s.count), 1);
                stateContainer.innerHTML = data.slice(0, 10).map(s => `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                        <div style="width:100%;background:var(--status-info);border-radius:2px 2px 0 0;height:${(s.count / max * 100)}%;min-height:4px;"></div>
                        <span style="font-size:0.55rem;color:var(--text-tertiary);margin-top:0.2rem;">${s.state}</span>
                        <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${s.count}</span>
                    </div>
                `).join('');
            }

            const timelineContainer = document.getElementById('timelineChart');
            if (timelineContainer && timeline.success && timeline.data) {
                const data = timeline.data.timeline || [];
                const max = Math.max(...data.map(t => t.count), 1);
                const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                timelineContainer.innerHTML = data.map(t => {
                    const date = new Date(t.date);
                    const dayName = days[date.getDay()];
                    return `
                        <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">
                            <div style="width:100%;background:var(--status-low);border-radius:2px 2px 0 0;height:${(t.count / max * 100)}%;min-height:4px;"></div>
                            <span style="font-size:0.5rem;color:var(--text-tertiary);margin-top:0.2rem;">${dayName}</span>
                            <span style="font-size:0.6rem;font-weight:600;color:var(--text-primary);">${t.count}</span>
                        </div>
                    `;
                }).join('');
            }

        } catch (error) {
            console.error('Erro ao carregar charts:', error);
        }
    },

    setupYear: function () {
        const year = new Date().getFullYear();
        document.querySelectorAll('#footerYear, #sidebarYear').forEach(el => {
            if (el) el.textContent = year;
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.stats-section')) {
        Estatisticas.init();
    }
});

window.Estatisticas = Estatisticas;
