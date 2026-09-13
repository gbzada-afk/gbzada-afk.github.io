/* ============================================================
       INIT
       ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Variáveis ---------- */
  const sidebar = document.getElementById("course-sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = [...document.querySelectorAll(".sidebar-nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const readingProgress = document.getElementById("reading-progress");
  const moduleProgress = document.getElementById("module-progress");
  const moduleProgressText = document.getElementById("module-progress-text");
  const toTop = document.getElementById("to-top");
  const moduleIds = [
    "modulo-1",
    "modulo-2",
    "modulo-3",
    "modulo-4",
    "modulo-5",
  ];
  const visitedModules = new Set(
    JSON.parse(localStorage.getItem("ctuos-pix-progress") || "[]"),
  );

  /* ---------- Progresso do módulo ---------- */
  function updateModuleProgress() {
    const progress = Math.round((visitedModules.size / moduleIds.length) * 100);
    moduleProgress.style.width = progress + "%";
    moduleProgressText.textContent = progress + "%";
    localStorage.setItem(
      "ctuos-pix-progress",
      JSON.stringify([...visitedModules]),
    );
  }

  /* ---------- Menu mobile ---------- */
  menuToggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Scroll UI ---------- */
  function updateScrollUI() {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const percent =
      scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    readingProgress.style.width = percent + "%";
    toTop.classList.toggle("visible", window.scrollY > 550);

    let activeId = "inicio";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 165) activeId = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + activeId,
      );
    });
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();
  updateModuleProgress();

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Fade-in observer ---------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");

        if (moduleIds.includes(entry.target.id)) {
          visitedModules.add(entry.target.id);
          updateModuleProgress();
        }
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll(".fade-in")
    .forEach((item) => observer.observe(item));

  /* ---------- Stats counter ---------- */
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.animated) return;
        entry.target.dataset.animated = "true";

        const target = Number(entry.target.dataset.count);
        const prefix = entry.target.dataset.prefix || "";
        const suffix = entry.target.dataset.suffix || "";
        const decimal = entry.target.dataset.format === "decimal";
        const duration = 1400;
        const started = performance.now();

        function animate(now) {
          const ratio = Math.min((now - started) / duration, 1);
          const eased = 1 - Math.pow(1 - ratio, 3);
          const current = target * eased;
          entry.target.textContent =
            prefix +
            (decimal
              ? current.toFixed(1).replace(".", ",")
              : Math.floor(current).toLocaleString("pt-BR")) +
            suffix;
          if (ratio < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      });
    },
    { threshold: 0.45 },
  );

  document
    .querySelectorAll(".stat-number")
    .forEach((stat) => statsObserver.observe(stat));

  /* ---------- Checklist ---------- */
  document.querySelectorAll(".safety-check").forEach((check) => {
    const key = "ctuos-pix-check-" + check.dataset.check;
    const saved = localStorage.getItem(key) === "true";
    check.checked = saved;
    check.closest(".check-item").classList.toggle("checked", saved);

    check.addEventListener("change", () => {
      localStorage.setItem(key, String(check.checked));
      check.closest(".check-item").classList.toggle("checked", check.checked);
    });
  });

  /* ---------- Quiz ---------- */
  let score = 0;
  let answered = 0;
  const scoreDisplay = document.getElementById("quiz-score");
  const completeBox = document.getElementById("quiz-complete");
  const finalScore = document.getElementById("final-score");

  function updateScore() {
    scoreDisplay.textContent = score + " / 5 corretas";
  }

  document.querySelectorAll(".question").forEach((question) => {
    question.querySelectorAll(".answer").forEach((answer) => {
      answer.addEventListener("click", () => {
        if (question.dataset.answered) return;
        question.dataset.answered = "true";
        answered++;

        const correct = answer.dataset.correct === "true";
        const feedback = question.querySelector(".feedback");

        question.querySelectorAll(".answer").forEach((option) => {
          option.disabled = true;
          if (option.dataset.correct === "true")
            option.classList.add("correct");
        });

        if (correct) {
          score++;
          feedback.textContent = "✓ Correto. Essa é a atitude mais segura.";
          feedback.className = "feedback visible good";
        } else {
          answer.classList.add("wrong");
          feedback.textContent =
            "✕ Atenção: a alternativa em verde é a conduta correta.";
          feedback.className = "feedback visible bad";
        }

        updateScore();
        if (answered === 5) {
          finalScore.textContent = score + " de 5";
          completeBox.classList.add("visible");
        }
      });
    });
  });

  document.getElementById("retry-quiz").addEventListener("click", () => {
    score = 0;
    answered = 0;
    updateScore();
    completeBox.classList.remove("visible");

    document.querySelectorAll(".question").forEach((question) => {
      delete question.dataset.answered;
      const feedback = question.querySelector(".feedback");
      feedback.textContent = "";
      feedback.className = "feedback";
      question.querySelectorAll(".answer").forEach((answer) => {
        answer.disabled = false;
        answer.classList.remove("correct", "wrong");
      });
    });

    document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Certificado ---------- */
  const modal = document.getElementById("certificate-modal");
  const closeModal = document.getElementById("close-certificate");
  const openCertificate = document.getElementById("open-certificate");
  const certificateForm = document.getElementById("certificate-form");
  const certificatePaper = document.getElementById("certificate-paper");
  const nameInput = document.getElementById("participant-name");

  openCertificate.addEventListener("click", () => {
    modal.classList.add("open");
    setTimeout(() => nameInput.focus(), 60);
  });

  function closeCertificate() {
    modal.classList.remove("open");
  }

  closeModal.addEventListener("click", closeCertificate);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeCertificate();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open"))
      closeCertificate();
  });

  certificateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    document.getElementById("certificate-name").textContent = name;
    document.getElementById("certificate-date").textContent =
      "Emitido em " +
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
        new Date(),
      );

    certificatePaper.classList.add("show");
    certificatePaper.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});
