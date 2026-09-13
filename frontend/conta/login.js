/**
 * Login — Formulário de login
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
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
            window.location.href = '/';
        } else {
            if (errorEl) {
                errorEl.textContent = result.message || 'Credenciais inválidas.';
                errorEl.classList.add('visible');
            }
        }
    });
});
