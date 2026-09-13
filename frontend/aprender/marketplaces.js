/**
 * Marketplaces — Curso CTUOS
 * Lógica do curso
 */

document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ELEMENTOS
  // ============================================================
  const side = document.getElementById("side");
  const toggle = document.getElementById("toggle");
  const links = [...document.querySelectorAll(".nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const mods = ["modulo-1", "modulo-2", "modulo-3", "modulo-4", "modulo-5"];
  const seen = new Set(
    JSON.parse(localStorage.getItem("ctuos-marketplaces-modules") || "[]"),
  );

  // ============================================================
  // PROGRESSO DOS MÓDULOS
  // ============================================================
  const updateMods = () => {
    const p = Math.round((seen.size / mods.length) * 100);
    document.getElementById("module-progress").style.width = p + "%";
    document.getElementById("visited").textContent = p + "%";
    localStorage.setItem(
      "ctuos-marketplaces-modules",
      JSON.stringify([...seen]),
    );
  };
  updateMods();

  // ============================================================
  // MENU MOBILE
  // ============================================================
  toggle.addEventListener("click", () => {
    const open = side.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.forEach((a) => {
    a.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        side.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // ============================================================
  // SCROLL UI
  // ============================================================
  const scrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max ? (window.scrollY / max) * 100 : 0;
    document.getElementById("reading-progress").style.width = percent + "%";
    document
      .getElementById("up")
      .classList.toggle("show", window.scrollY > 500);

    let current = "inicio";
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top < 160) current = s.id;
    });

    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  };

  window.addEventListener("scroll", scrollUI, { passive: true });
  scrollUI();

  // ============================================================
  // FADE-IN + VISITED
  // ============================================================
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          if (mods.includes(e.target.id)) {
            seen.add(e.target.id);
            updateMods();
          }
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".fade").forEach((e) => io.observe(e));

  // ============================================================
  // VOLTAR AO TOPO
  // ============================================================
  document.getElementById("up").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ============================================================
  // CHECKLIST
  // ============================================================
  document.querySelectorAll(".safecheck").forEach((c) => {
    const k = "ctuos-marketplaces-check-" + c.dataset.key;
    c.checked = localStorage.getItem(k) === "true";
    c.closest(".check").classList.toggle("done", c.checked);

    c.addEventListener("change", () => {
      localStorage.setItem(k, String(c.checked));
      c.closest(".check").classList.toggle("done", c.checked);
    });
  });

  // ============================================================
  // QUIZ
  // ============================================================
  let score = 0;
  let answered = 0;
  const scoreEl = document.getElementById("score");
  const complete = document.getElementById("complete");
  const totalQuestions = 10;

  const update = () => {
    scoreEl.textContent = score + " / " + totalQuestions + " corretas";
  };

  document.querySelectorAll(".question").forEach((q) => {
    q.querySelectorAll(".answer").forEach((a) => {
      a.addEventListener("click", () => {
        if (q.dataset.done) return;
        q.dataset.done = "1";
        answered++;

        const right = a.dataset.correct === "true";
        const feed = q.querySelector(".feedback");

        q.querySelectorAll(".answer").forEach((x) => {
          x.disabled = true;
          if (x.dataset.correct === "true") x.classList.add("correct");
        });

        if (right) {
          score++;
          feed.textContent = "✓ Correto. Esta é a atitude mais segura.";
          feed.className = "feedback show good";
        } else {
          a.classList.add("wrong");
          feed.textContent = "✕ Atenção: a opção em verde é a resposta segura.";
          feed.className = "feedback show bad";
        }

        update();

        if (answered === totalQuestions) {
          document.getElementById("final").textContent =
            score + " de " + totalQuestions;
          complete.classList.add("show");
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
    update();
    complete.classList.remove("show");

    document.querySelectorAll(".question").forEach((q) => {
      delete q.dataset.done;
      q.querySelector(".feedback").className = "feedback";
      q.querySelectorAll(".answer").forEach((a) => {
        a.disabled = false;
        a.classList.remove("correct", "wrong");
      });
    });

    document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
  });

  // ============================================================
  // CERTIFICADO
  // ============================================================
  const modal = document.getElementById("modal");
  const name = document.getElementById("name");

  document.getElementById("open-cert").addEventListener("click", () => {
    modal.classList.add("open");
    setTimeout(() => name.focus(), 50);
  });

  const close = () => modal.classList.remove("open");
  document.getElementById("close").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  document.getElementById("cert-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = name.value.trim();
    if (!v) return;

    document.getElementById("cert-name").textContent = v;
    document.getElementById("cert-date").textContent =
      "Emitido em " +
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
        new Date(),
      ) +
      " · Equipe CTUOS";

    document.getElementById("certificate").classList.add("show");
    document
      .getElementById("certificate")
      .scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});
