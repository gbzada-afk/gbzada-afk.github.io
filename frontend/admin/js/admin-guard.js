/**
 * Admin Guard — Protege páginas do admin no frontend
 * Roda ANTES de qualquer outro script
 * 
 * Se o usuário não está logado OU não é admin:
 * → Redireciona para login
 * → Salva a URL para voltar depois
 */

(function () {
    // ===== Verificar localStorage =====
    const token = localStorage.getItem('ctuos_token');
    const userStr = localStorage.getItem('ctuos_user');

    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        user = null;
    }

    // ===== Verificações =====
    const hasToken = !!token;
    const hasUser = !!user;
    const isAdmin = user && user.role === 'admin';

    // Se falta algo → redirecionar
    if (!hasToken || !hasUser || !isAdmin) {
        // Salvar URL para voltar após login
        const intendedUrl = window.location.pathname + window.location.search;
        sessionStorage.setItem('ctuos_redirect_after_login', intendedUrl);

        // Redirecionar
        window.location.href = '/conta/login.html';
        return;
    }

    // ===== Tudo OK — expor usuário globalmente =====
    window.adminUser = user;

    // ===== Verificar token com a API (async) =====
    // Se o token for inválido, o servidor vai retornar 401
    // O `auth.js` do admin cuida do resto
})();