(() => {
  "use strict";

  const root = document.querySelector("#exam-root");
  if (!root) return;

  const exams = [
    ...(window.SOC_EXAMS_2025 || []),
    ...(window.SOC_EXAMS_MODERN || []),
    ...(window.SOC_EXAMS_2015 || []),
    ...(window.SOC_EXAMS_2013 || [])
  ];
  const normalize = (value) => String(value || "")
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  const stripHtml = (value) => {
    const node = document.createElement("div");
    node.innerHTML = value || "";
    return node.textContent.replace(/\s+/g, " ").trim();
  };
  const slug = (value) => normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  function renderQuestion(exam, section, question, index) {
    const id = question.id || `annale-${exam.year}-${slug(question.n || index + 1)}-${slug(question.title)}`;
    const statement = question.prompt || "Répondre en justifiant chaque étape.";
    const shortStatement = stripHtml(statement);
    const isVerbatim = question.verbatim === true;
    const promptLabel = isVerbatim ? "Énoncé exact" : "Question reformulée";
    const sourcePage = question.sourcePage
      ? `<a class="exam-source-page" href="${escapeHtml(exam.pdf)}#page=${escapeHtml(question.sourcePage)}" target="_blank" rel="noopener">PDF p. ${escapeHtml(question.sourcePage)} ↗</a>`
      : "";
    return `
      <article class="exam-question searchable" id="${escapeHtml(id)}"
        data-year="${escapeHtml(exam.year)}" data-theme="${escapeHtml(section.theme)}"
        data-title="Annale ${escapeHtml(exam.label || exam.year)} · ${escapeHtml(question.n)} · ${escapeHtml(question.title)}"
        data-panel-id="annales">
        <header class="exam-question-head">
          <span class="exam-q-number">${escapeHtml(question.n || `Q${index + 1}`)}</span>
          <div>
            <p class="exam-q-theme">${escapeHtml(section.theme)}</p>
            <h3>${escapeHtml(question.title)}</h3>
          </div>
        </header>
        <div class="exam-prompt${isVerbatim ? " is-verbatim" : ""}">
          <div class="exam-prompt-meta"><span class="exam-prompt-label">${promptLabel}</span>${sourcePage}</div>
          <div class="exam-prompt-copy">${statement}</div>
        </div>
        <details class="exam-correction">
          <summary><span>Afficher la correction détaillée, pas à pas</span><small>${escapeHtml(shortStatement.slice(0, 105))}${shortStatement.length > 105 ? "…" : ""}</small></summary>
          <div class="exam-answer-roadmap" aria-label="Structure de la correction">
            <span><b>1</b> Comprendre la demande</span>
            <span><b>2</b> Poser les données</span>
            <span><b>3</b> Dérouler le raisonnement</span>
            <span><b>4</b> Conclure comme en examen</span>
          </div>
          ${question.intuition ? `<div class="exam-first-glance"><strong>💡 D’abord, l’idée simple</strong>${question.intuition}</div>` : ""}
          <div class="exam-answer-grid">
            <div class="exam-copy-answer">
              <p class="eyebrow">Réponse — copie d’examen</p>
              ${question.answer || "<p>Correction en cours de chargement.</p>"}
            </div>
            <aside class="exam-friendly-notes" aria-label="Pièges et contrôles">
              ${question.trap ? `<div class="trap"><strong>⚠ Piège à éviter</strong>${question.trap}</div>` : ""}
            </aside>
          </div>
        </details>
      </article>`;
  }

  function renderExam(exam) {
    const count = exam.sections.reduce((sum, section) => sum + section.questions.length, 0);
    let runningIndex = 0;
    const sections = exam.sections.map((section) => {
      const questions = section.questions.map((question) => {
        const result = renderQuestion(exam, section, question, runningIndex);
        runningIndex += 1;
        return result;
      }).join("");
      return `
        <section class="exam-section" data-exam-section>
          <div class="exam-section-title"><span>${escapeHtml(section.theme)}</span><h2>${escapeHtml(section.title)}</h2><small>${section.questions.length} question${section.questions.length > 1 ? "s" : ""}</small></div>
          ${(section.intro || section.context) ? `<div class="exam-section-context">${section.intro || section.context}</div>` : ""}
          <div class="exam-question-list">${questions}</div>
        </section>`;
    }).join("");

    return `
      <article class="exam-paper" data-exam-year="${escapeHtml(exam.year)}">
        <header class="exam-paper-head">
          <div><p class="eyebrow">Sujet ${escapeHtml(exam.label || exam.year)}</p><h2>${escapeHtml(exam.title)}</h2><div class="exam-paper-intro">${exam.intro || "<p>Correction complète et commentée.</p>"}</div></div>
          <div class="exam-paper-actions"><span>${count} questions</span><a class="btn secondary" href="${escapeHtml(exam.pdf)}" target="_blank" rel="noopener">Voir l’énoncé PDF ↗</a></div>
        </header>
        ${sections}
      </article>`;
  }

  if (!exams.length) {
    root.innerHTML = '<div class="warning"><strong>Corrigés indisponibles</strong>Les fichiers de données des annales n’ont pas été chargés.</div>';
    return;
  }

  root.innerHTML = exams.map(renderExam).join("");

  const questions = [...root.querySelectorAll(".exam-question")];
  const papers = [...root.querySelectorAll(".exam-paper")];
  const search = document.querySelector("#exam-search");
  const year = document.querySelector("#exam-year");
  const theme = document.querySelector("#exam-theme");
  const count = document.querySelector("#exam-result-count");
  const toggleAll = document.querySelector("#exam-toggle-all");
  const themes = [...new Set(questions.map((item) => item.dataset.theme))].sort((a, b) => a.localeCompare(b, "fr"));
  themes.forEach((name) => theme?.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`));

  function visibleQuestions() {
    return questions.filter((question) => !question.hidden);
  }

  function syncToggleAll() {
    if (!toggleAll) return;
    const details = visibleQuestions().map((question) => question.querySelector("details")).filter(Boolean);
    const allOpen = details.length > 0 && details.every((detail) => detail.open);
    toggleAll.textContent = allOpen ? "Tout replier" : "Tout déplier";
    toggleAll.setAttribute("aria-expanded", String(allOpen));
    toggleAll.disabled = details.length === 0;
  }

  function updateFilters() {
    const terms = normalize(search?.value).split(" ").filter(Boolean);
    const selectedYear = year?.value || "all";
    const selectedTheme = theme?.value || "all";
    questions.forEach((question) => {
      const haystack = normalize(question.textContent);
      const matchesText = terms.every((term) => haystack.includes(term));
      const matchesYear = selectedYear === "all" || question.dataset.year === selectedYear;
      const matchesTheme = selectedTheme === "all" || question.dataset.theme === selectedTheme;
      question.hidden = !(matchesText && matchesYear && matchesTheme);
    });
    root.querySelectorAll("[data-exam-section]").forEach((section) => {
      section.hidden = ![...section.querySelectorAll(".exam-question")].some((question) => !question.hidden);
    });
    papers.forEach((paper) => {
      paper.hidden = ![...paper.querySelectorAll(".exam-question")].some((question) => !question.hidden);
    });
    const shown = visibleQuestions().length;
    if (count) count.textContent = `${shown} question${shown !== 1 ? "s" : ""} affichée${shown !== 1 ? "s" : ""} sur ${questions.length}`;
    syncToggleAll();
  }

  [search, year, theme].forEach((control) => control?.addEventListener(control === search ? "input" : "change", updateFilters));

  function openAndFocus(question) {
    if (!question) return;
    const detail = question.querySelector("details");
    if (detail) detail.open = true;
    question.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    question.classList.remove("exam-highlight");
    requestAnimationFrame(() => question.classList.add("exam-highlight"));
    setTimeout(() => question.classList.remove("exam-highlight"), 1800);
  }

  document.querySelector("#exam-open-first")?.addEventListener("click", () => openAndFocus(visibleQuestions()[0]));
  document.querySelector("#exam-random")?.addEventListener("click", () => {
    const visible = visibleQuestions();
    openAndFocus(visible[Math.floor(Math.random() * visible.length)]);
  });
  toggleAll?.addEventListener("click", () => {
    const visible = visibleQuestions();
    const shouldOpen = visible.some((question) => !question.querySelector("details")?.open);
    visible.forEach((question) => { const detail = question.querySelector("details"); if (detail) detail.open = shouldOpen; });
    syncToggleAll();
  });

  questions.forEach((question) => question.querySelector("details")?.addEventListener("toggle", syncToggleAll));

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-open-exam]");
    if (!link) return;
    const target = document.querySelector(link.dataset.openExam);
    if (target) openAndFocus(target);
  });

  updateFilters();
  window.SOC_EXAM_COUNT = questions.length;
})();
