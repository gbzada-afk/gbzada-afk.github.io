/**
 * Bulletin Editor - Criar/Editar Boletins
 */

const BulletinEditor = {
  id: null,
  isEdit: false,

  // ===== INIT =====
  init: function () {
    if (!CMS_API.checkAuth()) return;

    const params = new URLSearchParams(window.location.search);
    this.id = params.get("id");

    if (this.id) {
      this.isEdit = true;
      document.getElementById("editorTitle").textContent = "✏️ Editar Boletim";
      this.loadBulletin();
    }

    this.setupForm();
    this.setupTags();
    this.setupFileUpload();
    this.setupYear();
  },

  // ===== LOAD =====
  loadBulletin: async function () {
    try {
      const result = await API.getBulletinById(this.id);
      if (result.success && result.data) {
        const b = result.data.bulletin;
        document.getElementById("editTitle").value = b.title || "";
        document.getElementById("editSubtitle").value = b.subtitle || "";
        document.getElementById("editContent").value = b.content || "";
        document.getElementById("editExcerpt").value = b.excerpt || "";
        document.getElementById("editFilter").value = b.filter || "outros";
        document.getElementById("editSeverity").value = b.severity || "low";
        document.getElementById("editReadingTime").value = b.reading_time || 5;
        if (b.tags) {
          document.getElementById("editTags").value = b.tags;
        }
        if (b.banner) {
          document.getElementById("currentBanner").innerHTML = `
                        <p>Banner atual:</p>
                        <img src="${b.banner}" style="max-width:200px;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);" />
                    `;
        }
      }
    } catch (error) {
      console.error("Erro ao carregar boletim:", error);
      alert("Erro ao carregar boletim para edição.");
    }
  },

  // ===== FORM =====
  setupForm: function () {
    const form = document.getElementById("bulletinForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("editTitle").value.trim();
      const content = document.getElementById("editContent").value.trim();

      if (!title) {
        alert("O título é obrigatório.");
        document.getElementById("editTitle").focus();
        return;
      }

      if (!content || content.length < 20) {
        alert("O conteúdo deve ter pelo menos 20 caracteres.");
        document.getElementById("editContent").focus();
        return;
      }

      const submitBtn = document.getElementById("submitBtn");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Salvando...";
      submitBtn.disabled = true;

      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append(
          "subtitle",
          document.getElementById("editSubtitle").value.trim(),
        );
        formData.append("content", content);
        formData.append(
          "excerpt",
          document.getElementById("editExcerpt").value.trim(),
        );
        formData.append("filter", document.getElementById("editFilter").value);
        formData.append(
          "severity",
          document.getElementById("editSeverity").value,
        );
        formData.append(
          "reading_time",
          document.getElementById("editReadingTime").value,
        );
        formData.append(
          "tags",
          document.getElementById("editTags").value.trim(),
        );

        const fileInput = document.getElementById("bannerInput");
        if (fileInput && fileInput.files.length > 0) {
          formData.append("banner", fileInput.files[0]);
        }

        let result;
        if (BulletinEditor.isEdit) {
          result = await CMS_API.updateBulletin(BulletinEditor.id, formData);
        } else {
          result = await CMS_API.createBulletin(formData);
        }

        if (result.success) {
          alert(
            BulletinEditor.isEdit
              ? "✅ Boletim atualizado com sucesso!"
              : "✅ Boletim criado com sucesso!",
          );
          window.location.href = "/admin/bulletins.html";
        } else {
          alert("❌ " + (result.message || "Erro ao salvar boletim."));
        }
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("❌ Erro ao salvar boletim. Tente novamente.");
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  },

  // ===== TAGS =====
  setupTags: function () {
    const tagButtons = document.querySelectorAll(".tag-suggestions span");
    const tagsInput = document.getElementById("editTags");

    tagButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const value = this.textContent.trim();
        const current = tagsInput.value;
        const tags = current ? current.split(",").map((t) => t.trim()) : [];
        if (!tags.includes(value)) {
          tags.push(value);
          tagsInput.value = tags.join(", ");
        } else {
          tagsInput.value = tags.filter((t) => t !== value).join(", ");
        }
        tagsInput.dispatchEvent(new Event("input"));
      });
    });

    // Atualizar sugestões ativas
    tagsInput.addEventListener("input", function () {
      const current = this.value
        ? this.value.split(",").map((t) => t.trim())
        : [];
      document.querySelectorAll(".tag-suggestions span").forEach((btn) => {
        const value = btn.textContent.trim();
        if (current.includes(value)) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    });
  },

  // ===== FILE UPLOAD =====
  setupFileUpload: function () {
    const input = document.getElementById("bannerInput");
    const fileName = document.getElementById("bannerName");
    const preview = document.getElementById("bannerPreview");

    if (!input) return;

    input.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        if (fileName) {
          fileName.textContent = file.name;
          fileName.style.color = "var(--accent-gold)";
        }
        if (preview) {
          const reader = new FileReader();
          reader.onload = function (e) {
            preview.innerHTML = `
                            <p>Pré-visualização:</p>
                            <img src="${e.target.result}" style="max-width:200px;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);" />
                        `;
          };
          reader.readAsDataURL(file);
        }
      }
    });
  },

  // ===== YEAR =====
  setupYear: function () {
    const year = new Date().getFullYear();
    const footerYear = document.getElementById("footerYear");
    const sidebarYear = document.getElementById("sidebarYear");
    if (footerYear) footerYear.textContent = year;
    if (sidebarYear) sidebarYear.textContent = year;
  },

  // ===== UTILS =====
  escapeHtml: function (text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".cms-editor")) {
    BulletinEditor.init();
  }
});
