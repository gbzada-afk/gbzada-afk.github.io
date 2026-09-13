/**
 * Cadastro — Formulário de criação de conta
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
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
                errorEl.textContent = 'Senha deve ter pelo menos 6 caracteres.';
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
                successEl.textContent = 'Conta criada! Redirecionando...';
                successEl.classList.add('visible');
            }
            setTimeout(() => {
                window.location.href = '/conta/login.html';
            }, 1500);
        } else {
            if (errorEl) {
                errorEl.textContent = result.message || 'Erro ao criar conta.';
                errorEl.classList.add('visible');
            }
        }
    });
});
