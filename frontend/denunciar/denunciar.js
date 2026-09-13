/**
 * Denunciar — Formulário de denúncia
 */

const Denunciar = {

    init: function () {
        this.setupTags();
        this.setupFileUpload();
        this.setupForm();
        this.setupYear();
    },

    setupTags: function () {
        document.querySelectorAll('.report-tags span').forEach(tag => {
            tag.addEventListener('click', function () {
                const value = this.textContent.trim();
                const textarea = document.getElementById('reportDescription');
                if (textarea) {
                    const current = textarea.value;
                    const prefix = current && !current.endsWith(' ') ? ' ' : '';
                    textarea.value = current + prefix + value;
                    textarea.focus();
                }
            });
        });
    },

    setupFileUpload: function () {
        const input = document.getElementById('fileInput');
        const fileName = document.getElementById('fileName');
        const removeBtn = document.getElementById('fileRemove');
        const preview = document.getElementById('filePreview');

        if (!input) return;

        input.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;

            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('❌ Arquivo muito grande! Máximo 10MB.');
                this.value = '';
                return;
            }

            if (fileName) {
                fileName.textContent = file.name;
                fileName.style.color = 'var(--accent-gold)';
            }
            if (removeBtn) removeBtn.style.display = 'inline-block';

            const reader = new FileReader();
            reader.onload = function (e) {
                if (!preview) return;
                preview.style.display = 'block';
                preview.innerHTML = '';
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100%';
                    preview.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.controls = true;
                    video.style.maxHeight = '150px';
                    video.style.width = '100%';
                    preview.appendChild(video);
                } else {
                    preview.innerHTML = `<div style="padding:0.5rem;text-align:center;color:var(--text-secondary);font-size:0.7rem;">${file.name}</div>`;
                }
            };
            reader.readAsDataURL(file);
        });

        removeBtn?.addEventListener('click', function () {
            input.value = '';
            if (fileName) {
                fileName.textContent = 'Nenhum arquivo';
                fileName.style.color = 'var(--text-tertiary)';
            }
            this.style.display = 'none';
            if (preview) {
                preview.style.display = 'none';
                preview.innerHTML = '';
            }
        });
    },

    setupForm: function () {
        const form = document.getElementById('reportForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!Auth.isLoggedIn()) {
                Auth.openModal('login');
                return;
            }

            const platform = document.getElementById('reportPlatform').value;
            const category = document.getElementById('reportCategory')?.value || 'Golpe';
            const state = document.getElementById('reportState').value;
            const city = document.getElementById('reportCity')?.value.trim() || '';
            const contactType = document.getElementById('reportContactType')?.value || 'other';
            const contactValue = document.getElementById('reportContactValue')?.value.trim() || '';
            const incidentDate = document.getElementById('reportIncidentDate')?.value || '';
            const estimatedValueRaw = document.getElementById('reportEstimatedValue')?.value.trim() || '';
            const description = document.getElementById('reportDescription').value.trim();
            const evidence = document.getElementById('reportEvidence')?.value.trim() || '';

            if (!platform) { alert('Selecione onde o golpe aconteceu.'); return; }
            if (!state) { alert('Selecione o estado.'); return; }
            if (description.length < 10) { alert('Descreva com mais detalhes (mín. 10 caracteres).'); return; }

            let estimatedValue = null;
            if (estimatedValueRaw) {
                const lower = estimatedValueRaw.toLowerCase();
                if (!lower.includes('não') && !lower.includes('nao')) {
                    const cleaned = estimatedValueRaw.replace(/[^\d,.]/g, '').replace(',', '.');
                    const parsed = parseFloat(cleaned);
                    if (!isNaN(parsed)) estimatedValue = parsed;
                }
            }

            const submitBtn = document.getElementById('reportSubmitBtn');
            const originalText = submitBtn?.textContent || 'Enviar';
            if (submitBtn) {
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;
            }

            try {
                const formData = new FormData();
                formData.append('platform', platform);
                formData.append('category', category);
                formData.append('state', state);
                formData.append('city', city);
                formData.append('contact_type', contactType);
                formData.append('contact_value', contactValue);
                formData.append('incident_date', incidentDate);
                formData.append('estimated_value', estimatedValue !== null ? estimatedValue : '');
                formData.append('description', description);
                formData.append('evidence', evidence);

                const fileInput = document.getElementById('fileInput');
                if (fileInput && fileInput.files.length > 0) {
                    formData.append('media', fileInput.files[0]);
                }

                const result = await API.createReport(formData);

                if (result.success) {
                    alert('✅ Denúncia enviada com sucesso!\n\nNossa equipe vai analisar.');
                    form.reset();
                    if (document.getElementById('fileName')) {
                        document.getElementById('fileName').textContent = 'Nenhum arquivo';
                        document.getElementById('fileName').style.color = 'var(--text-tertiary)';
                    }
                    if (document.getElementById('fileRemove')) {
                        document.getElementById('fileRemove').style.display = 'none';
                    }
                    if (document.getElementById('filePreview')) {
                        document.getElementById('filePreview').style.display = 'none';
                        document.getElementById('filePreview').innerHTML = '';
                    }
                } else {
                    alert('❌ Erro: ' + (result.message || 'Tente novamente.'));
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('❌ Erro ao enviar.');
            } finally {
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
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
    if (document.getElementById('reportForm')) {
        Denunciar.init();
    }
});

window.Denunciar = Denunciar;
