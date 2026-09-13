/**
 * Engenharia Social — Curso CTUOS
 * Lógica do curso
 */

document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ELEMENTOS
  // ============================================================
  const side = document.getElementById("side");
  const toggle = document.getElementById("toggle");
  const navLinks = [...document.querySelectorAll(".nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const readingProgress = document.getElementById("reading-progress");
  const moduleProgress = document.getElementById("module-progress");
  const visitedLabel = document.getElementById("visited");
  const toTop = document.getElementById("up");
  const moduleIds = ["modulo-1", "modulo-2", "modulo-3", "modulo-4", "modulo-5", "modulo-6"];
  const visitedModules = new Set(JSON.parse(localStorage.getItem("ctuos-es-progress") || "[]"));

  // ============================================================
  // PROGRESSO DOS MÓDULOS
  // ============================================================
  function updateModuleProgress() {
    const progress = Math.round((visitedModules.size / moduleIds.length) * 100);
    moduleProgress.style.width = progress + "%";
    visitedLabel.textContent = progress + "%";
    localStorage.setItem("ctuos-es-progress", JSON.stringify([...visitedModules]));
  }

  // ============================================================
  // MENU MOBILE
  // ============================================================
  toggle.addEventListener("click", () => {
    const open = side.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        side.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // ============================================================
  // SCROLL UI
  // ============================================================
  function updateScrollUI() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    readingProgress.style.width = percent + "%";
    toTop.classList.toggle("show", window.scrollY > 550);

    let activeId = "inicio";
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= 165) activeId = section.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + activeId);
    });
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();
  updateModuleProgress();

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ============================================================
  // FADE-IN + VISITED MODULES
  // ============================================================
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");

      if (moduleIds.includes(entry.target.id)) {
        visitedModules.add(entry.target.id);
        updateModuleProgress();
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".fade").forEach(item => observer.observe(item));

  // ============================================================
  // CHECKLIST
  // ============================================================
  document.querySelectorAll(".safecheck").forEach(check => {
    const key = "ctuos-es-check-" + check.dataset.key;
    const saved = localStorage.getItem(key) === "true";
    check.checked = saved;
    check.closest(".check").classList.toggle("done", saved);

    check.addEventListener("change", () => {
      localStorage.setItem(key, String(check.checked));
      check.closest(".check").classList.toggle("done", check.checked);
    });
  });

  // ============================================================
  // QUIZ
  // ============================================================
  let score = 0;
  let answered = 0;
  const totalQuestions = 10;
  const scoreDisplay = document.getElementById("score");
  const completeBox = document.getElementById("complete");
  const finalScore = document.getElementById("final");

  function updateScore() {
    scoreDisplay.textContent = score + " / " + totalQuestions + " corretas";
  }

  document.querySelectorAll(".question").forEach(question => {
    question.querySelectorAll(".answer").forEach(answer => {
      answer.addEventListener("click", () => {
        if (question.dataset.answered) return;
        question.dataset.answered = "true";
        answered++;

        const correct = answer.dataset.correct === "true";
        const feedback = question.querySelector(".feedback");

        question.querySelectorAll(".answer").forEach(option => {
          option.disabled = true;
          if (option.dataset.correct === "true") option.classList.add("correct");
        });

        if (correct) {
          score++;
          feedback.textContent = "✓ Correto. Boa!";
          feedback.className = "feedback show good";
        } else {
          answer.classList.add("wrong");
          feedback.textContent = "✕ Atenção: a alternativa destacada em verde é a mais segura.";
          feedback.className = "feedback show bad";
        }

        updateScore();

        if (answered === totalQuestions) {
          finalScore.textContent = score + " de " + totalQuestions;
          completeBox.classList.add("show");
        }
      });
    });
  });

  // ============================================================
  // REFAZER QUIZ
  // ============================================================
  document.getElementById("retry").addEventListener("click", () => {
    score = 0;
    answered = 0;
    updateScore();
    completeBox.classList.remove("show");

    document.querySelectorAll(".question").forEach(question => {
      delete question.dataset.answered;
      const feedback = question.querySelector(".feedback");
      feedback.textContent = "";
      feedback.className = "feedback";

      question.querySelectorAll(".answer").forEach(answer => {
        answer.disabled = false;
        answer.classList.remove("correct", "wrong");
      });
    });

    document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
  });

  // ============================================================
  // CERTIFICADO
  // ============================================================
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("close");
  const openCert = document.getElementById("open-cert");
  const certForm = document.getElementById("cert-form");
  const certificate = document.getElementById("certificate");
  const nameInput = document.getElementById("name");

  openCert.addEventListener("click", () => {
    modal.classList.add("open");
    setTimeout(() => nameInput.focus(), 60);
  });

  function closeCert() {
    modal.classList.remove("open");
  }

  closeModal.addEventListener("click", closeCert);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeCert();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeCert();
  });

  certForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    document.getElementById("cert-name").textContent = name;
    document.getElementById("cert-date").textContent =
      "Emitido em " + new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());

    certificate.classList.add("show");
    certificate.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});