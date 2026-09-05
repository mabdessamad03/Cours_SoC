(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storage = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (_) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* file:// privacy mode */ }
    }
  };

  const toast = (message) => {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  };

  // Color theme ------------------------------------------------------------
  const colorThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const themeToggle = $("#theme-toggle");
  let explicitColorTheme = storage.get("soc-color-theme", null);

  function applyColorTheme(theme, { persist = false, announce = false } = {}) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    const dark = normalizedTheme === "dark";
    document.documentElement.dataset.theme = normalizedTheme;
    document.documentElement.style.colorScheme = normalizedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#091b21" : "#0d3038");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute("aria-label", "Mode sombre");
      themeToggle.title = dark ? "Activer le mode clair" : "Activer le mode sombre";
      themeToggle.dataset.theme = normalizedTheme;
      const icon = $(".theme-icon", themeToggle);
      const label = $(".theme-label", themeToggle);
      if (icon) icon.textContent = dark ? "☀" : "☾";
      if (label) label.textContent = dark ? "Clair" : "Sombre";
    }
    if (persist) {
      explicitColorTheme = normalizedTheme;
      storage.set("soc-color-theme", normalizedTheme);
    }
    if (announce) toast(dark ? "Mode sombre activé" : "Mode clair activé");
  }

  const validStoredColorTheme = explicitColorTheme === "dark" || explicitColorTheme === "light";
  applyColorTheme(validStoredColorTheme ? explicitColorTheme : (colorThemeQuery.matches ? "dark" : "light"));
  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyColorTheme(nextTheme, { persist: true, announce: true });
  });
  colorThemeQuery.addEventListener?.("change", (event) => {
    if (!validStoredColorTheme && explicitColorTheme !== "dark" && explicitColorTheme !== "light") {
      applyColorTheme(event.matches ? "dark" : "light");
    }
  });

  // Navigation --------------------------------------------------------------
  const panels = $$(".course-panel");
  const navLinks = $$(".nav-link[data-target]");

  const mobileQuery = window.matchMedia("(max-width: 820px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => reducedMotionQuery.matches ? "auto" : "smooth";

  function syncMobileNavigation(open = document.body.classList.contains("menu-open"), focusInside = false) {
    const sidebar = $(".sidebar");
    const menu = $("#mobile-menu");
    const hidden = mobileQuery.matches && !open;
    const lockBackground = mobileQuery.matches && open;
    if (sidebar) {
      sidebar.setAttribute("aria-hidden", String(hidden));
      sidebar.inert = hidden;
    }
    [$(".content"), $(".search-wrap"), $(".mode-switch"), themeToggle].forEach((node) => {
      if (node) node.inert = lockBackground;
    });
    if (menu) {
      menu.setAttribute("aria-expanded", String(lockBackground));
      menu.setAttribute("aria-label", lockBackground ? "Fermer le menu" : "Ouvrir le menu");
      menu.textContent = lockBackground ? "×" : "☰";
    }
    if (lockBackground && focusInside) {
      const target = $('.nav-link[aria-current="page"]', sidebar) || $(".nav-link", sidebar);
      target?.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (document.activeElement !== target) target?.focus({ preventScroll: true });
      });
    }
  }

  function showPanel(name, updateHash = true, moveFocus = false) {
    const panel = $(`[data-panel="${name}"]`);
    if (!panel) return;
    panels.forEach((item) => item.classList.toggle("active", item === panel));
    navLinks.forEach((item) => {
      const active = item.dataset.target === name;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    document.body.classList.remove("menu-open");
    syncMobileNavigation(false);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    if (updateHash && location.hash !== `#${name}`) history.pushState(null, "", `#${name}`);
    document.title = name === "home" ? "SoC — Révision interactive" : `${panel.querySelector("h1")?.textContent.trim() || "SoC"} — Révision SoC`;
    if (moveFocus) {
      const heading = panel.querySelector("h1");
      if (heading) {
        heading.tabIndex = -1;
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    }
  }

  navLinks.forEach((link) => link.addEventListener("click", () => showPanel(link.dataset.target, true, true)));
  $$('[data-go]').forEach((item) => {
    const go = () => showPanel(item.dataset.go, true, true);
    item.addEventListener("click", go);
    if (item.matches("[tabindex]")) item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); go(); }
    });
  });
  $$('[data-scroll]').forEach((button) => button.addEventListener("click", () => {
    document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }));

  $(".skip-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    $("#main-content")?.focus({ preventScroll: true });
    $("#main-content")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  });

  const initialPanel = location.hash.slice(1);
  if (initialPanel && $(`[data-panel="${initialPanel}"]`)) showPanel(initialPanel, false);
  else {
    showPanel("home", false);
    if (initialPanel) history.replaceState(null, "", "#home");
  }

  window.addEventListener("popstate", () => {
    const target = location.hash.slice(1) || "home";
    const validTarget = $(`[data-panel="${target}"]`) ? target : "home";
    showPanel(validTarget, false, true);
    if (target !== validTarget) history.replaceState(null, "", `#${validTarget}`);
  });

  $("#mobile-menu")?.addEventListener("click", (event) => {
    const open = document.body.classList.toggle("menu-open");
    syncMobileNavigation(open, open);
  });
  mobileQuery.addEventListener?.("change", () => {
    if (!mobileQuery.matches) document.body.classList.remove("menu-open");
    syncMobileNavigation(false);
  });
  syncMobileNavigation(false);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !mobileQuery.matches || !document.body.classList.contains("menu-open")) return;
    const focusable = [...$$(".sidebar a[href], .sidebar button:not([disabled])"), $("#mobile-menu")].filter(Boolean);
    const current = focusable.indexOf(document.activeElement);
    const next = event.shiftKey
      ? (current <= 0 ? focusable.length - 1 : current - 1)
      : (current < 0 || current === focusable.length - 1 ? 0 : current + 1);
    event.preventDefault();
    focusable[next]?.focus();
  });

  // Detail mode -------------------------------------------------------------
  const savedMode = storage.get("soc-detail-mode", "complete");
  function setMode(mode) {
    document.body.classList.toggle("focus-mode", mode === "focus");
    $$(".mode-btn").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    storage.set("soc-detail-mode", mode);
    toast(mode === "focus" ? "Mode essentiel activé" : "Cours complet affiché");
  }
  $$(".mode-btn").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  document.body.classList.toggle("focus-mode", savedMode === "focus");
  $$(".mode-btn").forEach((button) => {
    const active = button.dataset.mode === savedMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  // Lesson progress ---------------------------------------------------------
  let completed = new Set(storage.get("soc-completed-lessons", []));
  const completeButtons = $$(".lesson[data-lesson] .complete-btn");

  function updateProgress() {
    const valid = new Set($$(".lesson[data-lesson]").map((lesson) => lesson.dataset.lesson));
    completed = new Set([...completed].filter((id) => valid.has(id)));
    $$(".lesson[data-lesson]").forEach((lesson) => {
      const done = completed.has(lesson.dataset.lesson);
      const button = $(".complete-btn", lesson);
      button?.classList.toggle("done", done);
      button?.setAttribute("aria-pressed", String(done));
      if (button) button.title = done ? "Marquée comme comprise" : "Marquer comme comprise";
    });
    const count = completed.size;
    const total = valid.size;
    $("#progress-label").textContent = `${count} / ${total}`;
    $("#progress-fill").style.width = `${total ? (count / total) * 100 : 0}%`;
    storage.set("soc-completed-lessons", [...completed]);
  }

  completeButtons.forEach((button) => button.addEventListener("click", () => {
    const lesson = button.closest(".lesson");
    const id = lesson.dataset.lesson;
    if (completed.has(id)) completed.delete(id);
    else completed.add(id);
    updateProgress();
    toast(completed.has(id) ? "Leçon marquée comme comprise ✓" : "Leçon remise à réviser");
  }));
  updateProgress();

  // Search ------------------------------------------------------------------
  const searchInput = $("#global-search");
  const searchResults = $("#search-results");
  const searchable = $$(".searchable").map((element) => ({
    element,
    title: element.dataset.title || element.querySelector("h2,h3")?.textContent || "Résultat",
    panel: element.dataset.panelId || element.closest("[data-panel]")?.dataset.panel || "home",
    text: element.textContent.replace(/\s+/g, " ").trim()
  }));
  const normalize = (value) => value.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function runSearch(query) {
    const q = normalize(query.trim());
    searchResults.innerHTML = "";
    if (q.length < 2) { searchResults.classList.remove("open"); return; }
    const terms = q.split(/\s+/).filter(Boolean);
    const matches = searchable
      .map((item) => {
        const haystack = normalize(`${item.title} ${item.text}`);
        const hits = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
        const score = hits + (normalize(item.title).includes(q) ? 3 : 0);
        return { ...item, score };
      })
      .filter((item) => item.score >= terms.length)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);

    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-result"><strong>Aucun résultat</strong><small>Essaie un terme plus court.</small></div>';
    } else {
      matches.forEach((match) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.innerHTML = `<strong>${match.title}</strong><small>${match.panel === "synthesis" ? "Fiche express" : `Chapitre ${match.panel}`}</small>`;
        button.addEventListener("click", () => {
          showPanel(match.panel);
          searchResults.classList.remove("open");
          searchInput.value = "";
          const ownDetail = match.element.matches("details") ? match.element : null;
          const parentDetail = match.element.closest("details");
          const childDetail = match.element.querySelector?.("details");
          if (ownDetail) ownDetail.open = true;
          if (parentDetail) parentDetail.open = true;
          if (childDetail && (match.panel === "annales" || match.panel === "quiz")) childDetail.open = true;
          setTimeout(() => match.element.scrollIntoView({ behavior: scrollBehavior(), block: "center" }), 80);
        });
        searchResults.appendChild(button);
      });
    }
    searchResults.classList.add("open");
  }
  searchInput?.addEventListener("input", (event) => runSearch(event.target.value));
  searchInput?.addEventListener("focus", () => { if (searchInput.value.length >= 2) runSearch(searchInput.value); });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrap")) searchResults?.classList.remove("open");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchResults?.classList.remove("open");
      if (document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        syncMobileNavigation(false);
        $("#mobile-menu")?.focus();
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); searchInput?.focus();
    }
  });

  // SoC anatomy -------------------------------------------------------------
  const socDescriptions = {
    cpu: "<strong>CPU :</strong> très programmable, idéal pour le contrôle et les calculs irréguliers, mais moins efficace qu’un accélérateur sur une tâche régulière.",
    dsp: "<strong>DSP :</strong> jeu d’instructions et chemin de données adaptés aux boucles de signal ; bon compromis entre programmation et efficacité.",
    memory: "<strong>Mémoires :</strong> registres, caches et SRAM près du calcul ; contrôleur vers une DDR externe plus grande mais plus lente.",
    accel: "<strong>ASIC / IP :</strong> puissance et énergie par opération excellentes sur une fonction stable ; peu souple et plus long à concevoir.",
    analog: "<strong>Analogique :</strong> ADC, DAC, filtrage RF et mise en forme relient les données numériques aux signaux physiques.",
    io: "<strong>MEMS / I/O :</strong> capteurs, actionneurs et contrôleurs d’interface connectent le SoC au monde extérieur."
  };
  $$(".soc-block").forEach((button) => button.addEventListener("click", () => {
    $$(".soc-block").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    $("#soc-explain").innerHTML = socDescriptions[button.dataset.soc];
  }));
  $$(".soc-block").forEach((item) => item.setAttribute("aria-pressed", String(item.classList.contains("active"))));

  // Dynamic power -----------------------------------------------------------
  const powerIds = ["c", "v", "f"];
  function updatePower() {
    const values = Object.fromEntries(powerIds.map((id) => [id, Number($(`#power-${id}`)?.value || 1)]));
    $("#power-c-out").textContent = values.c.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    $("#power-v-out").textContent = values.v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    $("#power-f-out").textContent = values.f.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    $("#power-result").textContent = `${(values.c * values.v ** 2 * values.f).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ×`;
  }
  powerIds.forEach((id) => $(`#power-${id}`)?.addEventListener("input", updatePower));
  updatePower();

  // Arbiter and burst -------------------------------------------------------
  const requests = [false, false, false];
  let roundPointer = 0;
  function chooseGrant(advance = false) {
    const policy = $("#arb-policy")?.value || "fixed";
    let grant = -1;
    if (policy === "fixed") grant = requests.findIndex(Boolean);
    else {
      for (let offset = 0; offset < requests.length; offset += 1) {
        const index = (roundPointer + offset) % requests.length;
        if (requests[index]) { grant = index; break; }
      }
      if (advance && grant >= 0) roundPointer = (grant + 1) % requests.length;
    }
    $$('[data-master]').forEach((node) => node.classList.toggle("granted", Number(node.dataset.master) === grant));
    const result = $("#arb-result");
    if (result) result.textContent = grant < 0 ? "Aucune requête" : `Maître ${grant} accordé${policy === "round" ? ` · prochain départ M${roundPointer}` : ""}`;
  }
  $$('[data-request]').forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.request);
    requests[index] = !requests[index];
    button.classList.toggle("on", requests[index]);
    chooseGrant(false);
  }));
  $("#arb-policy")?.addEventListener("change", () => { roundPointer = 0; chooseGrant(false); });
  $("#arb-next")?.addEventListener("click", () => chooseGrant(true));

  function updateBurst() {
    const a = Number($("#burst-a")?.value || 3);
    const l = Number($("#burst-l")?.value || 8);
    $("#burst-a-out").textContent = `${a} cyc.`;
    $("#burst-l-out").textContent = `${l} mots`;
    $("#burst-result").textContent = `${(100 * l / (a + l)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
  }
  ["#burst-a", "#burst-l"].forEach((id) => $(id)?.addEventListener("input", updateBurst));
  updateBurst();

  // AXI channels ------------------------------------------------------------
  $$('[data-axi-mode]').forEach((button) => button.addEventListener("click", () => {
    const mode = button.dataset.axiMode;
    $$('[data-axi-mode]').forEach((item) => {
      const active = item === button;
      item.classList.toggle("on", active);
      item.setAttribute("aria-pressed", String(active));
    });
    $$('[data-axi]').forEach((channel) => {
      const active = mode === "read" ? ["ar", "r"].includes(channel.dataset.axi) : ["aw", "w", "b"].includes(channel.dataset.axi);
      channel.classList.toggle("active", active);
    });
  }));
  $$('[data-axi-mode]').forEach((item) => item.setAttribute("aria-pressed", String(item.classList.contains("on"))));

  // SDRAM sequence ----------------------------------------------------------
  const dramGrid = $("#sdram-grid");
  let dramStep = 0;
  let dramTimer = null;
  if (dramGrid) {
    for (let i = 0; i < 64; i += 1) {
      const cell = document.createElement("span");
      cell.className = "dram-cell";
      cell.dataset.row = String(Math.floor(i / 8));
      cell.dataset.col = String(i % 8);
      cell.textContent = `${Math.floor(i / 8)},${i % 8}`;
      dramGrid.appendChild(cell);
    }
  }
  function renderDram() {
    const cells = $$(".dram-cell", dramGrid || document);
    cells.forEach((cell) => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      cell.classList.toggle("row-open", row === 2 && dramStep < 4);
      cell.classList.toggle("column-selected", row === 2 && col === 2 && (dramStep === 1 || dramStep === 2));
      cell.classList.toggle("word-read", row === 2 && col >= 2 && col <= 5 && dramStep === 3);
    });
    $$(".dram-step").forEach((item) => item.classList.toggle("active", Number(item.dataset.dramStep) === dramStep));
  }
  function nextDram() { dramStep = (dramStep + 1) % 5; renderDram(); }
  $("#dram-next")?.addEventListener("click", nextDram);
  $("#dram-auto")?.addEventListener("click", (event) => {
    if (dramTimer) { clearInterval(dramTimer); dramTimer = null; event.currentTarget.textContent = "Lecture auto"; }
    else { dramTimer = setInterval(nextDram, 850); event.currentTarget.textContent = "Pause"; }
  });
  renderDram();

  // Memory pyramid ----------------------------------------------------------
  $$(".memory-level").forEach((button) => button.addEventListener("click", () => {
    $$(".memory-level").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    $("#memory-explain").textContent = button.dataset.memory;
  }));
  $$(".memory-level").forEach((item) => item.setAttribute("aria-pressed", "false"));

  // Cache simulator ---------------------------------------------------------
  const cache = { totalLines: 8, sets: 4, lineSize: 16, ways: 2, tick: 0, lines: [] };
  function resetCache() {
    cache.ways = Number($("#cache-ways")?.value || 2);
    cache.sets = cache.totalLines / cache.ways;
    cache.tick = 0;
    cache.lines = Array.from({ length: cache.sets }, () => Array.from({ length: cache.ways }, () => ({ valid: false, tag: 0, age: 0 })));
    if ($("#cache-result")) $("#cache-result").textContent = "Cache vide";
    if ($("#cache-geometry")) $("#cache-geometry").textContent = `${cache.sets} sets × ${cache.ways} voie${cache.ways > 1 ? "s" : ""} · 8 lignes de 16 octets = 128 octets`;
    ["#cache-tag", "#cache-index", "#cache-offset"].forEach((selector) => {
      if ($(selector)) $(selector).textContent = "—";
    });
    renderCache();
  }
  function renderCache(highlight = null) {
    const root = $("#cache-sets");
    if (!root) return;
    root.innerHTML = "";
    root.style.setProperty("--ways", cache.ways);
    cache.lines.forEach((set, setIndex) => {
      const row = document.createElement("div");
      row.className = "cache-set";
      row.style.setProperty("--ways", cache.ways);
      const label = document.createElement("span");
      label.className = "set-label";
      label.textContent = `Set ${setIndex}`;
      row.appendChild(label);
      set.forEach((line, way) => {
        const node = document.createElement("span");
        node.className = "cache-line";
        if (highlight && highlight.set === setIndex && highlight.way === way) node.classList.add(highlight.type);
        node.textContent = line.valid ? `V${way} · tag ${line.tag}` : `V${way} · vide`;
        row.appendChild(node);
      });
      root.appendChild(row);
    });
  }
  function parseAddress(raw) {
    const value = String(raw).trim();
    if (!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(value)) return Number.NaN;
    const parsed = /^0x/i.test(value) ? Number.parseInt(value.slice(2), 16) : Number.parseInt(value, 10);
    return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
  }
  function accessCache() {
    const address = parseAddress($("#cache-input")?.value ?? "");
    if (!Number.isFinite(address) || address < 0) { toast("Adresse invalide"); return; }
    const block = Math.floor(address / cache.lineSize);
    const setIndex = block % cache.sets;
    const tag = Math.floor(block / cache.sets);
    const offset = address % cache.lineSize;
    $("#cache-tag").textContent = String(tag);
    $("#cache-index").textContent = String(setIndex);
    $("#cache-offset").textContent = String(offset);
    cache.tick += 1;
    const set = cache.lines[setIndex];
    let way = set.findIndex((line) => line.valid && line.tag === tag);
    let type = "hit";
    if (way >= 0) {
      set[way].age = cache.tick;
      $("#cache-result").textContent = `HIT · set ${setIndex}, voie ${way}`;
    } else {
      type = "miss";
      way = set.findIndex((line) => !line.valid);
      if (way < 0) way = set.reduce((oldest, line, index, lines) => line.age < lines[oldest].age ? index : oldest, 0);
      const evicted = set[way].valid ? ` · remplace tag ${set[way].tag}` : "";
      set[way] = { valid: true, tag, age: cache.tick };
      $("#cache-result").textContent = `MISS · charge set ${setIndex}, voie ${way}${evicted}`;
    }
    renderCache({ set: setIndex, way, type });
  }
  $("#cache-access")?.addEventListener("click", accessCache);
  $("#cache-input")?.addEventListener("keydown", (event) => { if (event.key === "Enter") accessCache(); });
  $("#cache-ways")?.addEventListener("change", resetCache);
  $("#cache-reset")?.addEventListener("click", resetCache);
  resetCache();

  // Fixed-point quantizer ---------------------------------------------------
  function formatNumber(value, digits = 6) {
    return value.toLocaleString("fr-FR", { maximumFractionDigits: digits });
  }
  function updateFixed() {
    const e = Number($("#fixed-e")?.value || 3);
    const v = Number($("#fixed-v")?.value || 7);
    const input = $("#fixed-value");
    const step = 2 ** (-v);
    const max = 2 ** e - step;
    input.max = String(max);
    if (Number(input.value) > max) input.value = String(max);
    const value = Number(input.value);
    const code = Math.min(2 ** (e + v) - 1, Math.max(0, Math.round(value * 2 ** v)));
    const quantized = code / 2 ** v;
    const bits = code.toString(2).padStart(e + v, "0");
    const binary = v ? `${bits.slice(0, e)}.${bits.slice(e)}` : bits;
    $("#fixed-e-out").textContent = String(e);
    $("#fixed-v-out").textContent = String(v);
    $("#fixed-value-out").textContent = formatNumber(value, 2);
    $("#fixed-range").textContent = `Plage 0…${formatNumber(max, 8)} · pas ${formatNumber(step, 8)}`;
    $("#fixed-result").textContent = `${binary} = ${formatNumber(quantized, 8)}`;
    const error = quantized - value;
    $("#fixed-error").textContent = `Erreur d’arrondi : ${error >= 0 ? "+" : ""}${formatNumber(error, 8)}`;
  }
  ["#fixed-e", "#fixed-v", "#fixed-value"].forEach((id) => $(id)?.addEventListener("input", updateFixed));
  updateFixed();

  // Convolution animation ---------------------------------------------------
  const imageValues = [
    2, 3, 1, 0, 2,
    4, 5, 2, 1, 0,
    3, 6, 4, 2, 1,
    1, 2, 5, 4, 3,
    0, 1, 3, 5, 6
  ];
  const kernelValues = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  let convPosition = 0;
  let convTimer = null;
  const convGrid = $("#conv-grid");
  const kernelGrid = $("#kernel-grid");
  if (convGrid) imageValues.forEach((value, index) => {
    const cell = document.createElement("span"); cell.className = "pixel"; cell.textContent = String(value); cell.dataset.index = String(index); convGrid.appendChild(cell);
  });
  if (kernelGrid) kernelValues.forEach((value) => {
    const cell = document.createElement("span"); cell.className = "kernel-cell active"; cell.textContent = String(value); kernelGrid.appendChild(cell);
  });
  function renderConvolution() {
    const row = Math.floor(convPosition / 3);
    const col = convPosition % 3;
    let sum = 0;
    $$(".pixel", convGrid || document).forEach((cell, index) => {
      const r = Math.floor(index / 5), c = index % 5;
      const inside = r >= row && r < row + 3 && c >= col && c < col + 3;
      cell.classList.toggle("window", inside);
      cell.classList.toggle("center", r === row + 1 && c === col + 1);
      if (inside) sum += imageValues[index] * kernelValues[(r - row) * 3 + (c - col)];
    });
    if ($("#conv-result")) $("#conv-result").textContent = `${sum} · sortie [${row},${col}]`;
  }
  function nextConvolution() { convPosition = (convPosition + 1) % 9; renderConvolution(); }
  $("#conv-next")?.addEventListener("click", nextConvolution);
  $("#conv-auto")?.addEventListener("click", (event) => {
    if (convTimer) { clearInterval(convTimer); convTimer = null; event.currentTarget.textContent = "Balayage auto"; }
    else { convTimer = setInterval(nextConvolution, 700); event.currentTarget.textContent = "Pause"; }
  });
  renderConvolution();

  function updateConvCalculator() {
    const size = Number($("#conv-size")?.value || 28);
    const cin = Number($("#conv-cin")?.value || 32);
    const cout = Number($("#conv-cout")?.value || 64);
    const k = Number($("#conv-k")?.value || 3);
    const out = size - k + 1;
    const weights = cin * cout * k * k;
    const mac = out * out * weights;
    $("#conv-size-out").textContent = String(size);
    $("#conv-cin-out").textContent = String(cin);
    $("#conv-cout-out").textContent = String(cout);
    $("#conv-k-out").textContent = `${k}×${k}`;
    if (k > size) {
      $("#conv-dims").textContent = "Configuration invalide : K doit être ≤ H";
      $("#conv-complexity").textContent = "Aucune sortie sans padding supplémentaire";
      return;
    }
    $("#conv-dims").textContent = `Sortie ${out}×${out}×${cout}`;
    $("#conv-complexity").textContent = `${weights.toLocaleString("fr-FR")} poids · ${mac.toLocaleString("fr-FR")} MAC`;
  }
  ["#conv-size", "#conv-cin", "#conv-cout", "#conv-k"].forEach((id) => $(id)?.addEventListener("input", updateConvCalculator));
  updateConvCalculator();

  // CNN steppers ------------------------------------------------------------
  const readNumbers = (node, key) => (node?.dataset[key] || "")
    .split(",")
    .filter((value) => value !== "")
    .map(Number);

  function fillNumericGrid(root, className = "cnn-grid-cell") {
    if (!root) return [];
    const values = readNumbers(root, "values");
    root.style.setProperty("--grid-cols", root.dataset.cols || "1");
    root.innerHTML = "";
    return values.map((value, index) => {
      const cell = document.createElement("span");
      cell.className = className;
      cell.textContent = String(value).replace("-", "−");
      cell.dataset.index = String(index);
      root.appendChild(cell);
      return cell;
    });
  }

  function bindStepper(prefix, count, render, nextLabel = "Étape suivante") {
    const root = $(`#${prefix}-simulator`);
    if (!root) return;
    const total = Number(root.dataset.stepCount) || count;
    const previous = $(`#${prefix}-prev`);
    const next = $(`#${prefix}-next`);
    const auto = $(`#${prefix}-auto`);
    let step = 0;
    let timer = null;
    const update = () => {
      root.dataset.step = String(step);
      render(step);
      if (previous) previous.disabled = step === 0;
      if (next) next.textContent = step === total - 1 ? "Recommencer ↻" : nextLabel;
    };
    const move = (delta) => {
      step = delta > 0 && step === total - 1 ? 0 : Math.max(0, Math.min(total - 1, step + delta));
      update();
    };
    previous?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
    auto?.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        auto.textContent = "Lecture auto";
        auto.setAttribute("aria-pressed", "false");
      } else {
        timer = setInterval(() => move(1), 1100);
        auto.textContent = "Pause";
        auto.setAttribute("aria-pressed", "true");
      }
    });
    auto?.setAttribute("aria-pressed", "false");
    update();
  }

  const maxPoolInput = $("#maxpool-input");
  const maxPoolOutput = $("#maxpool-output");
  const maxPoolInputCells = fillNumericGrid(maxPoolInput, "pool-cell");
  const maxPoolOutputCells = fillNumericGrid(maxPoolOutput, "pool-cell");
  const maxPoolValues = readNumbers(maxPoolInput, "values");
  const poolWindows = [[0, 1, 4, 5], [2, 3, 6, 7], [8, 9, 12, 13], [10, 11, 14, 15]];
  const poolNames = ["coin supérieur gauche", "coin supérieur droit", "coin inférieur gauche", "coin inférieur droit"];
  bindStepper("maxpool", 4, (step) => {
    const windowIndices = poolWindows[step];
    const values = windowIndices.map((index) => maxPoolValues[index]);
    const maximum = Math.max(...values);
    maxPoolInputCells.forEach((cell, index) => {
      const inWindow = windowIndices.includes(index);
      cell.classList.toggle("active-window", inWindow);
      cell.classList.toggle("pool-max", inWindow && maxPoolValues[index] === maximum);
    });
    maxPoolOutputCells.forEach((cell, index) => {
      const revealed = index <= step;
      cell.classList.toggle("revealed", revealed);
      cell.classList.toggle("current", index === step);
      cell.textContent = revealed ? String(readNumbers(maxPoolOutput, "values")[index]) : "·";
    });
    $("#maxpool-step span").textContent = `Fenêtre ${step + 1}/4 · ${poolNames[step]}`;
    $("#maxpool-equation").textContent = `max(${values.join(", ")}) = ${maximum}`;
    maxPoolInput?.setAttribute("aria-label", `Fenêtre ${step + 1} sélectionnée ; maximum ${maximum}`);
  }, "Fenêtre suivante");

  const channelLanes = $$("#simd-channel-lanes .simd-lane");
  const channelInputs = readNumbers($("#simd-channel-lanes"), "inputs");
  const channelWeights = readNumbers($("#simd-channel-lanes"), "weights");
  const channelProducts = channelInputs.map((value, index) => value * channelWeights[index]);
  const channelPairs = [channelProducts[0] + channelProducts[1], channelProducts[2] + channelProducts[3]];
  const channelSteps = [
    ["1 · Charger quatre canaux contigus", `I[l₀…l₃] = [${channelInputs.join(", ")}]`],
    ["2 · Charger les quatre coefficients", `K[c,l₀…l₃,m,n] = [${channelWeights.join(", ")}]`],
    ["3 · Multiplier dans les quatre lanes", `produits = [${channelProducts.join(", ")}]`],
    ["4 · Réduire en arbre", `(${channelProducts[0]} + ${channelProducts[1]}) + (${channelProducts[2]} + ${channelProducts[3]}) = ${channelPairs[0]} + ${channelPairs[1]}`],
    ["5 · Accumuler dans le même pixel S[c,i,j]", `contribution des quatre canaux = ${channelPairs[0] + channelPairs[1]}`]
  ];
  bindStepper("simd-channel", 5, (step) => {
    channelLanes.forEach((lane) => {
      lane.classList.toggle("executing", step === 2);
      lane.classList.toggle("reducing", step >= 3);
      $(".lane-input", lane)?.classList.toggle("active-value", step === 0);
      $(".lane-weight", lane)?.classList.toggle("active-value", step === 1);
      $(".lane-product", lane)?.classList.toggle("revealed", step >= 2);
      $(".lane-product", lane)?.classList.toggle("active-value", step === 2);
    });
    $$("#simd-channel-reduction .reduce-node").forEach((node, index) => {
      node.textContent = `${channelProducts[index * 2]} + (${channelProducts[index * 2 + 1]}) = ${channelPairs[index]}`.replaceAll("-", "−");
      node.classList.toggle("revealed", step >= 3);
      node.classList.toggle("active-value", step === 3);
    });
    const accumulator = $("#simd-channel-accumulator");
    if (accumulator) {
      accumulator.textContent = `Σ = ${channelPairs[0] + channelPairs[1]}`;
      accumulator.classList.toggle("revealed", step >= 4);
      accumulator.classList.toggle("active-value", step === 4);
    }
    $("#simd-channel-step span").textContent = channelSteps[step][0];
    $("#simd-channel-equation").textContent = channelSteps[step][1].replaceAll("-", "−");
  });

  const spatialRoot = $("#simd-spatial-lanes");
  const spatialLanes = $$(".simd-lane", spatialRoot || document);
  const spatialPixels = readNumbers(spatialRoot, "pixels");
  const spatialAccumulators = readNumbers(spatialRoot, "accumulators");
  const spatialCoefficient = Number(spatialRoot?.dataset.coefficient || 0);
  const spatialResults = spatialPixels.map((value, index) => spatialAccumulators[index] + value * spatialCoefficient);
  const spatialSteps = [
    ["1 · Diffuser K[m,n] dans toutes les voies", `un coefficient (${spatialCoefficient}) · quatre accumulateurs indépendants`],
    ["2 · Lire quatre pixels voisins", `pixels = [${spatialPixels.join(", ")}]`],
    ["3 · Exécuter quatre MAC en parallèle", spatialAccumulators.map((acc, index) => `${acc}+${spatialPixels[index]}×${spatialCoefficient}`).join(" ; ")],
    ["4 · Conserver quatre sommes indépendantes", `S = [${spatialResults.join(", ")}]`]
  ];
  bindStepper("simd-spatial", 4, (step) => {
    $("#simd-spatial-coefficient")?.classList.toggle("active-value", step === 0 || step === 2);
    spatialLanes.forEach((lane) => {
      lane.classList.toggle("executing", step === 2);
      $(".lane-input", lane)?.classList.toggle("active-value", step === 1 || step === 2);
      $(".lane-product", lane)?.classList.toggle("revealed", step >= 3);
      $(".lane-product", lane)?.classList.toggle("active-value", step === 3);
    });
    $("#simd-spatial-step span").textContent = spatialSteps[step][0];
    $("#simd-spatial-equation").textContent = spatialSteps[step][1].replaceAll("-", "−");
  });

  const matrixA = $("#matrix-a");
  const matrixB = $("#matrix-b");
  const matrixC = $("#matrix-c");
  const matrixACells = fillNumericGrid(matrixA, "matrix-cell");
  const matrixBCells = fillNumericGrid(matrixB, "matrix-cell");
  const matrixCCells = fillNumericGrid(matrixC, "matrix-cell");
  const matrixPartialA = readNumbers(matrixC, "partialA");
  const matrixPartialB = readNumbers(matrixC, "partialB");
  const matrixFinal = readNumbers(matrixC, "values");
  const matrixSplit = Number(matrixA?.dataset.split || matrixB?.dataset.split || 2);
  const formatMatrix = (values) => `[[${values[0]}, ${values[1]}], [${values[2]}, ${values[3]}]]`;
  const matrixSteps = [
    ["1 · Initialiser les accumulateurs", "C = 0"],
    ["2 · Premier sous-produit", `C₀ = A_gauche × B_haut = ${formatMatrix(matrixPartialA)}`],
    ["3 · Second sous-produit", "C = C₀ + A_droite × B_bas"],
    ["4 · Tuile terminée", `C = ${formatMatrix(matrixFinal)}`]
  ];
  bindStepper("matrix-tiling", 4, (step) => {
    matrixACells.forEach((cell, index) => {
      const col = index % Number(matrixA?.dataset.cols || 1);
      cell.classList.toggle("tile-first", step === 1 && col < matrixSplit);
      cell.classList.toggle("tile-second", step === 2 && col >= matrixSplit);
    });
    matrixBCells.forEach((cell, index) => {
      const row = Math.floor(index / Number(matrixB?.dataset.cols || 1));
      cell.classList.toggle("tile-first", step === 1 && row < matrixSplit);
      cell.classList.toggle("tile-second", step === 2 && row >= matrixSplit);
    });
    matrixCCells.forEach((cell, index) => {
      cell.classList.toggle("partial-first", step === 1);
      cell.classList.toggle("partial-second", step === 2);
      cell.classList.toggle("complete", step === 3);
      if (step === 0) cell.textContent = "0";
      else if (step === 1) cell.textContent = String(matrixPartialA[index]);
      else if (step === 2) cell.textContent = `${matrixPartialA[index]}+${matrixPartialB[index]}`;
      else cell.textContent = String(matrixFinal[index]);
    });
    $("#matrix-tiling-step span").textContent = matrixSteps[step][0];
    $("#matrix-tiling-equation").textContent = matrixSteps[step][1];
  }, "Accumuler");

  let printClosedDetails = null;
  window.addEventListener("beforeprint", () => {
    if (printClosedDetails !== null) return;
    printClosedDetails = $$("details:not([open])");
    printClosedDetails.forEach((detail) => { detail.open = true; });
  });
  window.addEventListener("afterprint", () => {
    if (printClosedDetails === null) return;
    printClosedDetails.forEach((detail) => { detail.open = false; });
    printClosedDetails = null;
  });
  $("#print-course")?.addEventListener("click", () => window.print());

  // Flashcards --------------------------------------------------------------
  const flashcards = [
    ["Fondations", "Qu’est-ce qu’un SoC ?", "Un système complet intégré sur une puce : calcul, mémoire locale, interconnexion, accélérateurs et interfaces ; la RAM principale peut rester externe."],
    ["Fondations", "Pourquoi un SoC est-il hétérogène ?", "Parce que contrôle irrégulier, signal régulier, calcul massif et interfaces physiques ont des compromis différents ; on affecte chaque tâche au bloc le plus efficace."],
    ["Énergie", "Formule de la puissance dynamique CMOS ?", "P = ½·Ccharge·Vdd²·ftransition. Tension au carré ; capacité et activité linéaires."],
    ["Énergie", "Clock gating vs power gating ?", "Clock gating arrête les commutations d’horloge mais garde les fuites ; power gating coupe l’alimentation, avec coût de réveil et de conservation d’état."],
    ["Architecture", "SIMD vs VLIW ?", "SIMD : même opération sur plusieurs sous-données. VLIW : plusieurs opérations éventuellement différentes sont encodées et émises ensemble."],
    ["Multicœur", "Définir le Memory Wall.", "Le calcul progresse plus vite que bande passante et surtout latence mémoire ; les unités attendent les données malgré leur puissance théorique."],
    ["Méthode", "Top-down vs bottom-up ?", "Top-down raffine du besoin abstrait vers la réalisation ; bottom-up assemble des briques existantes. Les projets réels combinent les deux."],
    ["Bus", "Arbitre vs décodeur ?", "L’arbitre choisit quel maître obtient la ressource ; le décodeur d’adresses choisit quel esclave est visé."],
    ["Bus", "Que signifie maître ?", "Le bloc qui initie la transaction, pas nécessairement celui qui fournit la donnée."],
    ["Bus", "Pourquoi un burst ?", "Dans le modèle simplifié sans wait state, il amortit A cycles d’arbitrage sur L mots : rendement L/(A+L), au prix d’une attente/préemption moins favorable."],
    ["Bus", "Risque d’une priorité fixe ?", "La famine d’un maître peu prioritaire. Round-robin apporte l’équité si les transactions ont une durée bornée."],
    ["DMA", "Pourquoi un DMA est-il maître et esclave ?", "Esclave quand le CPU programme ses registres ; maître quand il initie les lectures/écritures de la copie."],
    ["DMA", "Séquence d’une copie DMA ?", "Configurer → lire un burst → FIFO → écrire le burst → répéter → interruption de fin/erreur."],
    ["AXI", "Les cinq canaux AXI et leur sens ?", "AR M→S, R S→M, AW M→S, W M→S, B S→M."],
    ["AXI", "Quand un battement AXI est-il transféré ?", "Au front d’horloge où VALID et READY valent simultanément 1 ; la source garde la charge utile stable tant qu’elle attend."],
    ["AXI", "Règle d’ordre des ID ?", "Dans un même flux/domaine d’ordre, un même ID conserve l’ordre ; des ID différents peuvent être réordonnés. Lectures et écritures ont des canaux distincts."],
    ["AXI", "Pourquoi préfixer un ID dans un switch ?", "Deux maîtres peuvent utiliser le même ID local ; le numéro du port entrant rend l’ID unique et route la réponse au retour."],
    ["Mémoire", "SRAM vs DRAM ?", "SRAM 6T, rapide et peu dense, sans refresh ; DRAM 1T1C, dense mais charge fuyante, rafraîchissement et protocole complexe."],
    ["SDRAM", "Séquence simplifiée d’une lecture ?", "ACT/RAS ligne → attente tRCD → READ/CAS colonne → CAS latency → données en burst → précharge."],
    ["Mémoire", "Localité temporelle vs spatiale ?", "Temporelle : réutiliser bientôt la même donnée. Spatiale : utiliser bientôt ses adresses voisines."],
    ["Mémoire", "Cache vs scratchpad ?", "Cache transparent et automatique mais moins prédictible ; scratchpad adressable, explicitement rempli par logiciel/DMA, prédictible."],
    ["Cache", "Découpage d’une adresse de cache ?", "Tag identifie le bloc, index sélectionne le set, offset choisit l’octet/mot dans la ligne."],
    ["Cache", "Formule du temps moyen d’accès ?", "AMAT = temps de hit + taux de défaut × pénalité de défaut."],
    ["Cache", "Write-through vs write-back ?", "Écriture immédiate au niveau inférieur vs ligne dirty écrite seulement à l’éviction."],
    ["Fixe", "Plage et pas d’un Qe.v non signé ?", "Pas = 2⁻ᵛ ; plage de 0 à 2ᵉ−2⁻ᵛ."],
    ["Fixe", "Format résultat d’une addition ?", "e = max(ea,eb)+1 ; v = max(va,vb), après alignement des parties fractionnaires."],
    ["Fixe", "Format résultat d’une multiplication ?", "e = ea+eb ; v = va+vb. Pas d’alignement préalable mais largeur croissante."],
    ["CNN", "Équation d’une convolution multicanal ?", "Sc,i,j = somme sur l,m,n de Il,i+m,j+n × Kc,l,m,n + biasc."],
    ["CNN", "Nombre de poids d’une convolution ?", "Cout × Cin × Kh × Kw, plus éventuellement Cout biais."],
    ["CNN", "Nombre de MAC d’une convolution ?", "Hout × Wout × Cout × Cin × Kh × Kw."],
    ["CNN", "ReLU, MaxPool, Softmax ?", "ReLU=max(0,a) ; MaxPool garde un maximum local par canal ; Softmax transforme les logits en probabilités de somme 1."],
    ["CNN", "Vectoriser selon canaux ou éléments ?", "Canaux : plusieurs l puis réduction, layout canaux contigus. Éléments : plusieurs sorties voisines, coefficient diffusé, lignes contiguës."],
    ["Accélérateur", "Pourquoi trois SRAM I/K/S ?", "Pour lire activation et poids et écrire/relire somme sans conflit de port, et faciliter le pipeline."],
    ["Accélérateur", "Pourquoi im2col ? Quel coût ?", "Il transforme convolution en GEMM tuilable et réutilise une unité matricielle ; il peut dupliquer les pixels et demander mémoire/padding."],
    ["Accélérateur", "Cambricon-X vs Ascend ?", "Cambricon décode la sparsité dans le Buffer Controller, en amont des PE, et saute les zéros ; Ascend sépare décompression/im2col puis nourrit un cube matriciel dense régulier."],
    ["Examen IA", "Quelle grille pour analyser un accélérateur ?", "Opération, format, MAC/cycle, axes de parallélisme, hiérarchie/bande passante, réutilisation, irrégularités, optimisations, W et op/W, contexte et compromis."],
    ["Exceptions", "Définition exacte d’une exception précise à l’instruction Ik ?", "Toutes les instructions plus anciennes ont committé ; Ik et toutes les plus jeunes n’ont aucun effet architectural. EPC/Cause permettent alors de reprendre avec un état séquentiel cohérent."],
    ["Exceptions", "Instruction terminée et instruction committée : même chose ?", "Non. Terminée signifie que l’unité a produit un résultat ; committée signifie que ce résultat est devenu architectural, en ordre, après vérification des exceptions."],
    ["ROB", "À quoi sert le Reorder Buffer ?", "Il alloue en ordre, mémorise résultats/état/exception, puis retire en ordre. Il permet de différer la visibilité architecturale et donc de garantir des exceptions précises."],
    ["ROB", "Quand un store spéculatif peut-il modifier la mémoire ?", "Seulement lorsqu’il atteint la tête et committe. Avant cela, adresse et donnée restent dans le ROB/store queue afin qu’un flush puisse les annuler."],
    ["Spéculation", "Pourquoi un checkpoint doit-il recevoir certains résultats plus anciens ?", "Un résultat d’une instruction antérieure au branchement peut arriver après la création du checkpoint. Il doit être intégré à l’état récupérable, sinon la restauration perdrait une valeur légitime."],
    ["Renommage", "History Buffer vs Future File ?", "Le History Buffer journalise les anciennes valeurs pour défaire ; le Future File contient les valeurs spéculatives tandis qu’un fichier architectural séparé conserve l’état committé."],
    ["OoO", "Pourquoi un ROB seul ne suffit-il pas à exécuter hors ordre ?", "Si le dispatch reste bloqué par la première instruction dépendante, les jeunes prêtes n’atteignent jamais les unités. Il faut des stations d’attente et un ordonnanceur qui choisit les prêtes."],
    ["OoO", "Les quatre ingrédients pratiques de l’ordonnancement OoO ?", "Renommage par tags, stations de réservation, diffusion/disponibilité des résultats, puis logique wakeup/select pour réveiller et choisir les instructions prêtes."],
    ["Tomasulo", "Que représente un tag dans une station de réservation ?", "L’identité du producteur attendu, pas la valeur. Quand ce producteur diffuse son résultat, toutes les stations portant le tag capturent la valeur et deviennent éventuellement prêtes."],
    ["Tomasulo", "Pourquoi le RAT peut-il dire R5→d alors que a va encore produire une valeur de R5 ?", "a représente une ancienne version déjà capturée par ses consommateurs. La dernière écriture logique de R5 est d ; le RAT pointe donc vers d sans empêcher a de terminer."],
    ["Mémoire OoO", "Quel store alimente un load parmi plusieurs stores plus anciens à la même adresse ?", "Le plus jeune des stores qui restent plus anciens que le load : c’est la dernière écriture selon l’ordre du programme."],
    ["Renommage", "Pourquoi conserver une map spéculative et une map de retrait ?", "La première guide les jeunes instructions ; la seconde décrit l’état architectural validé. Après un flush global, elle permet de reconstruire un renommage correct."],
    ["Parallélisme", "ILP, TLP et DLP correspondent à quoi ?", "ILP : instructions d’un flot ; TLP : tâches/threads, généralement MIMD ; DLP : mêmes opérations sur données différentes, généralement SIMD."],
    ["Amdahl", "Formule de la loi d’Amdahl ?", "S(N)=1/((1−p)+p/N). La partie séquentielle 1−p fixe la limite S∞=1/(1−p), même avec une infinité de cœurs."],
    ["Multicœur", "Temps idéal de N tâches de même durée T ?", "T/N si elles sont divisibles et parfaitement parallèles. Pour des processus indépendants de durées Ti, le temps idéal est max(Ti), pas la somme divisée automatiquement par N."],
    ["Mémoire partagée", "UMA vs NUMA ?", "UMA offre un coût d’accès uniforme ; NUMA expose une mémoire partagée dont la latence/bande passante dépend du nœud propriétaire. Le placement des pages et des threads devient crucial."],
    ["Cohérence", "Invariant important de MSI ?", "Une ligne en M est l’unique copie valide et peut être plus récente que la mémoire. Plusieurs caches peuvent être en S, mais aucun ne doit alors être en M."],
    ["Cohérence", "Snooping vs répertoire ?", "Le snooping diffuse les requêtes et chaque cache observe le bus ; le répertoire mémorise les partageurs et envoie des messages ciblés, plus scalable mais avec stockage et indirections."],
    ["Atomique", "Qu’est-ce qu’une opération read-modify-write atomique ?", "Lecture, calcul et écriture forment un seul événement indivisible vis-à-vis des autres cœurs ; aucun entrelacement ne peut observer ou écraser l’état intermédiaire."],
    ["LR/SC", "Que signifie le code retour de SC en RISC-V ?", "SC renvoie 0 en cas de succès et une valeur non nulle en cas d’échec. Après échec, il faut recommencer depuis LR, donc relire et recalculer."],
    ["AMO", "Que fait un AMO comme amoswap ou amoadd ?", "Il écrit atomiquement en mémoire la valeur transformée et place dans le registre destination l’ancienne valeur mémoire. Pour MIN/MAX, les variantes sans U sont signées, les variantes U non signées."],
    ["Verrous", "Pourquoi load/test/store ne suffit-il pas à prendre un verrou ?", "Deux cœurs peuvent lire libre simultanément puis écrire tous les deux occupé. Il faut un CAS, LR/SC ou swap atomique ; test-test-set réduit ensuite le trafic en attendant par lectures."],
    ["Synchronisation", "Deadlock, famine et contention ?", "Deadlock : cycle où personne n’avance ; famine : le système avance mais une tâche attend indéfiniment ; contention : plusieurs tâches se disputent la même ligne/ressource et génèrent du trafic."],
    ["Barrière", "Pourquoi une barrière compteur naïve n’est-elle pas réutilisable ?", "Après la première génération le compteur reste à zéro : une tâche rapide peut traverser le tour suivant. Il faut réinitialiser avec une génération ou un sense bit, sans mélanger deux tours."]
  ];
  let flashDeck = flashcards.map((_, index) => index);
  let flashPosition = 0;
  let flashFlipped = false;
  function renderFlashcard() {
    const index = flashDeck[flashPosition];
    const [theme, question, answer] = flashcards[index];
    $("#flash-theme").textContent = theme;
    $("#flash-question").textContent = question;
    $("#flash-answer").textContent = answer;
    $("#flash-counter").textContent = `Carte ${flashPosition + 1} / ${flashDeck.length}`;
    flashFlipped = false;
    const card = $("#flashcard");
    card.classList.remove("flipped");
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-labelledby", "flash-question");
    card.setAttribute("aria-describedby", "flash-instruction");
    $(".flash-face.front", card)?.setAttribute("aria-hidden", "false");
    $(".flash-face.back", card)?.setAttribute("aria-hidden", "true");
    $("#flash-instruction").textContent = "Clique pour révéler la réponse";
    $("#flash-announcement").textContent = "";
  }
  function flipFlashcard() {
    flashFlipped = !flashFlipped;
    const card = $("#flashcard");
    card.classList.toggle("flipped", flashFlipped);
    card.setAttribute("aria-expanded", String(flashFlipped));
    card.setAttribute("aria-labelledby", flashFlipped ? "flash-answer" : "flash-question");
    if (flashFlipped) card.removeAttribute("aria-describedby");
    else card.setAttribute("aria-describedby", "flash-instruction");
    $(".flash-face.front", card)?.setAttribute("aria-hidden", String(flashFlipped));
    $(".flash-face.back", card)?.setAttribute("aria-hidden", String(!flashFlipped));
    $("#flash-announcement").textContent = flashFlipped
      ? `Réponse : ${$("#flash-answer").textContent}`
      : `Question : ${$("#flash-question").textContent}`;
  }
  function nextFlashcard() { flashPosition = (flashPosition + 1) % flashDeck.length; renderFlashcard(); }
  $("#flashcard")?.addEventListener("click", flipFlashcard);
  $("#flashcard")?.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); flipFlashcard(); } });
  $("#flash-next")?.addEventListener("click", nextFlashcard);
  $("#flash-prev")?.addEventListener("click", () => { flashPosition = (flashPosition - 1 + flashDeck.length) % flashDeck.length; renderFlashcard(); });
  $("#flash-hard")?.addEventListener("click", () => {
    const current = flashDeck[flashPosition];
    flashDeck.splice(Math.min(flashPosition + 4, flashDeck.length), 0, current);
    toast("Cette carte reviendra dans quelques tours");
    nextFlashcard();
  });
  renderFlashcard();

  // Quiz --------------------------------------------------------------------
  const quizBank = [
    { theme: "Fondations", q: "Quel élément peut légitimement rester hors de la puce dans un SoC ?", c: ["Le CPU", "La RAM principale", "Le bus interne", "Tous les accélérateurs"], a: 1, e: "SoC ne signifie pas que toute la mémoire est intégrée. Une DDR externe est courante et passe par un contrôleur mémoire." },
    { theme: "Énergie", q: "À C et f constants, passer de 1 V à 0,8 V multiplie la puissance dynamique par…", c: ["0,8", "0,64", "0,4", "1,25"], a: 1, e: "La tension est au carré : 0,8² = 0,64, soit environ 36 % de moins." },
    { theme: "Énergie", q: "Quel mécanisme réduit les commutations d’horloge mais pas directement les fuites ?", c: ["Power gating", "Clock gating", "Saturation", "Prefetch"], a: 1, e: "Le clock gating bloque l’horloge. Le power gating coupe l’alimentation et vise aussi les fuites." },
    { theme: "Architecture", q: "Quelle association est correcte ?", c: ["CPU : calcul massif rigide", "ASIC : contrôle irrégulier", "DSP : boucles régulières de signal", "MEMS : ordonnanceur logiciel"], a: 2, e: "Le DSP se situe entre CPU programmable et ASIC spécialisé, avec des chemins adaptés au signal." },
    { theme: "Multicœur", q: "Le Memory Wall désigne principalement…", c: ["Le coût du boîtier", "L’écart calcul–mémoire", "L’absence de logique", "Le bruit analogique"], a: 1, e: "Puissance de calcul et nombre de cœurs progressent plus vite que latence/bande passante mémoire." },
    { theme: "Méthode", q: "Pourquoi explorer les algorithmes tôt dans un flot top-down ?", c: ["Les netlists sont abstraites", "Il reste beaucoup d’alternatives et les modèles coûtent peu", "Le placement est déjà fixé", "La vérification devient inutile"], a: 1, e: "Au haut niveau, un choix change encore la complexité intrinsèque ; en fin de flot, les modifications sont chères." },
    { theme: "Bus", q: "Qui choisit l’esclave à partir de l’adresse ?", c: ["L’arbitre", "Le DMA", "Le décodeur", "Le maître précédent"], a: 2, e: "Arbitre = quel maître ; décodeur = quel esclave." },
    { theme: "Bus", q: "Une priorité fixe peut provoquer…", c: ["Un refresh", "Une famine", "Un NaN", "Une saturation"], a: 1, e: "Un maître peu prioritaire peut attendre indéfiniment si les plus prioritaires demandent toujours le bus." },
    { theme: "Bus", q: "Avec A=3 cycles d’arbitrage et L=12 mots, le rendement utile L/(A+L) vaut…", c: ["20 %", "75 %", "80 %", "400 %"], a: 2, e: "12/(3+12)=12/15=0,8, donc 80 %." },
    { theme: "Topologie", q: "Deux transferts d’un crossbar peuvent-ils être simultanés ?", c: ["Jamais", "Toujours", "Oui si les esclaves visés diffèrent", "Seulement sans adresse"], a: 2, e: "Des chemins indépendants existent vers des esclaves différents ; un même esclave reste un point de conflit." },
    { theme: "DMA", q: "Lors du déplacement des données, le DMA est…", c: ["Esclave car il obéit au CPU", "Maître car il initie les accès", "Toujours passif", "Un décodeur"], a: 1, e: "Il est esclave pendant sa configuration, puis maître pour les lectures/écritures." },
    { theme: "Interblocage", q: "Quel ensemble est nécessaire à un deadlock ?", c: ["Deux demandes seulement", "Une attente circulaire non préemptable", "Un seul maître", "Un burst court"], a: 1, e: "La simultanéité seule ne bloque pas définitivement ; la dépendance circulaire et l’absence de préemption sont décisives." },
    { theme: "AXI", q: "Quels canaux suffisent pour une lecture AXI ?", c: ["AW et W", "AR et R", "W et B", "AR, AW et B"], a: 1, e: "Le maître envoie l’adresse sur AR ; l’esclave renvoie les données sur R." },
    { theme: "AXI", q: "Un battement est accepté lorsque…", c: ["VALID seul vaut 1", "READY seul vaut 1", "VALID et READY valent 1", "l’ID vaut zéro"], a: 2, e: "Le handshake se produit au front où les deux signaux sont simultanément actifs." },
    { theme: "AXI", q: "Dans un même flux AXI, des transactions d’ID différents peuvent…", c: ["Être traitées dans le désordre", "Partager obligatoirement leur donnée", "Ignorer READY", "Verrouiller tout le NoC"], a: 0, e: "Dans un même domaine d’ordre, un même ID conserve l’ordre ; des IDs distincts rendent le parallélisme et le désordre possibles. Lecture et écriture restent des flux distincts." },
    { theme: "AXI", q: "Pourquoi le switch concatène-t-il son numéro de port à l’ID ?", c: ["Pour augmenter la donnée", "Pour distinguer les IDs locaux identiques", "Pour réduire la fréquence", "Pour calculer le tag cache"], a: 1, e: "Deux maîtres peuvent émettre le même ID local ; le préfixe rend la transaction unique en aval et route le retour." },
    { theme: "Mémoire", q: "Combien de transistors compte la cellule SRAM présentée ?", c: ["1", "2", "6", "16"], a: 2, e: "Le cours présente la cellule SRAM classique 6T. La DRAM utilise 1T+1C." },
    { theme: "SDRAM", q: "Quel mécanisme amortit surtout la latence de première donnée ?", c: ["Le burst", "La troncature", "Le tag", "Le softmax"], a: 0, e: "Après ouverture/CL, un burst transfère plusieurs mots contigus à bon débit." },
    { theme: "SDRAM", q: "Que mesure tRCD ?", c: ["Le délai ACT → READ/CAS", "La durée d’un refresh complet", "Le temps d’un hit cache", "Le nombre de bancs"], a: 0, e: "tRCD est le délai minimal entre l’activation de la ligne (ACT/RAS) et la commande colonne (READ/CAS)." },
    { theme: "SDRAM", q: "Pendant un REFRESH all-bank, tRFC désigne…", c: ["Le débit par broche", "Le temps où le composant est indisponible", "La largeur du burst", "Le délai du seul banc lu"], a: 1, e: "tRFC est le temps de cycle de rafraîchissement. Pour la commande all-bank étudiée, tous les bancs du composant sont indisponibles." },
    { theme: "Mémoire", q: "Une donnée utilisée récemment a de bonnes chances d’être réutilisée : c’est la localité…", c: ["Spatiale", "Temporelle", "Physique", "Associative"], a: 1, e: "La localité spatiale concerne les adresses voisines." },
    { theme: "Cache", q: "Dans une adresse de cache, l’index choisit…", c: ["Le set", "L’octet dans la ligne", "La pénalité", "Le contrôleur DDR"], a: 0, e: "Index→set ; tag→identité du bloc ; offset→position dans la ligne." },
    { theme: "Cache", q: "T_hit=1, miss rate=5 %, pénalité=20. Quel AMAT ?", c: ["1", "1,05", "2", "21"], a: 2, e: "1 + 0,05×20 = 2." },
    { theme: "Cache", q: "Pourquoi un cache plus associatif peut-il être plus lent ?", c: ["Il n’a pas de tags", "Plus de comparateurs/mux allongent le hit", "Il supprime les lignes", "Il interdit les bursts"], a: 1, e: "Le miss rate baisse souvent, mais le chemin de hit devient plus complexe. C’est l’AMAT qu’il faut comparer." },
    { theme: "Cache", q: "Cache 16 Kio, lignes de 32 octets, 2-way : combien de sets ?", c: ["32", "128", "256", "512"], a: 2, e: "16 384/(32×2)=256 sets : il faut 8 bits d’index, les bits [12..5] avec un adressage octet." },
    { theme: "Débit", q: "DDR 100 MHz, bus 32 bits, CL=3, burst B=4 et 2 mots/cycle : débit utile simplifié ?", c: ["160 MB/s", "228,6 MB/s", "320 MB/s", "800 MB/s"], a: 2, e: "100 MHz×(4 octets)×4/(3+4/2)=320 MB/s. Il faut toujours annoncer le modèle retenu." },
    { theme: "Fixe", q: "Quel est le pas d’un Q3.7 non signé ?", c: ["1/3", "1/7", "1/128", "1/1024"], a: 2, e: "Le pas est 2⁻ᵛ = 2⁻⁷ = 1/128." },
    { theme: "Fixe", q: "Multiplier Q2.5 par Q3.4 produit avant réduction…", c: ["Q3.5", "Q5.9", "Q6.4", "Q2.20"], a: 1, e: "Les bits entiers et fractionnaires s’additionnent : e=2+3=5, v=5+4=9." },
    { theme: "Fixe", q: "Sommer 16 valeurs de même plage exige typiquement combien de bits entiers de garde ?", c: ["1", "2", "4", "16"], a: 2, e: "⌈log₂16⌉ = 4." },
    { theme: "CNN", q: "Un canal de sortie d’une convolution utilise…", c: ["Un seul canal d’entrée", "Tous les canaux d’entrée", "Aucun coefficient", "Seulement le biais"], a: 1, e: "La somme porte sur l, m et n ; un kernel complet relie tous les canaux d’entrée à un canal c." },
    { theme: "CNN", q: "Entrée 8×8, kernel 3, stride 1, padding 0 : taille de sortie ?", c: ["5×5", "6×6", "8×8", "10×10"], a: 1, e: "⌊(8−3)/1⌋+1 = 6." },
    { theme: "CNN", q: "Une conv 10×10 en sortie, Cin=8, Cout=16, kernel 3×3 demande combien de MAC ?", c: ["11 520", "115 200", "1 152", "14 400"], a: 1, e: "10×10×8×16×3×3 = 115 200 MAC." },
    { theme: "CNN", q: "Un MaxPool 2×2 reçoit [1, 7 ; 3, 5]. Sa sortie vaut…", c: ["1", "4", "5", "7"], a: 3, e: "Le MaxPool conserve le maximum de la fenêtre, indépendamment dans chaque canal : ici 7." },
    { theme: "CNN", q: "La sortie d’un Softmax a notamment quelle propriété ?", c: ["Tous les termes sont entiers", "Les valeurs sont positives et leur somme vaut 1", "Elle supprime les canaux", "Elle vaut toujours le maximum"], a: 1, e: "Softmax transforme les logits en scores positifs normalisés ; leur somme vaut 1." },
    { theme: "SIMD", q: "Paralléliser une convolution sur les canaux d’entrée impose ensuite…", c: ["Une réduction des sommes partielles", "Un refresh DRAM", "De supprimer les poids", "Un seul multiplicateur"], a: 0, e: "Chaque lane calcule une contribution de canal ; ces produits/sommes partielles doivent être réduits pour former le même pixel de sortie." },
    { theme: "SIMD", q: "Quel axe permet de calculer plusieurs pixels de sortie voisins avec un coefficient diffusé ?", c: ["Les éléments spatiaux", "Le rafraîchissement", "Les ID AXI", "La mantisse"], a: 0, e: "Le SIMD spatial traite plusieurs positions de sortie ; un même coefficient est diffusé tandis que les fenêtres d’entrée se décalent." },
    { theme: "CNN", q: "Quel ordre de grandeur le support associe-t-il à GoogleNet ?", c: ["22 couches et ~5 M paramètres", "2 couches et 60 M paramètres", "152 couches et aucun poids", "1 couche et 1 Md de paramètres"], a: 0, e: "Le texte du support retient 22 couches et environ 5 millions de paramètres ; un schéma peut afficher 21 selon la convention de comptage." },
    { theme: "Accélérateur", q: "Quel est le principal coût d’im2col ?", c: ["Il supprime les matrices", "Duplication/espace temporaire et padding", "Il interdit le tuilage", "Il exige du FP64"], a: 1, e: "Les fenêtres chevauchantes peuvent dupliquer les activations ; en échange on réutilise un GEMM très optimisé." },
    { theme: "Accélérateur", q: "Pourquoi séparer les SRAM I, K et S ?", c: ["Pour réduire le nombre de ports disponibles", "Pour lire/écrire les flux simultanément", "Pour empêcher le pipeline", "Pour créer des NaN"], a: 1, e: "La séparation évite les conflits de ports et permet d’alimenter activation, poids et accumulation en parallèle." },
    { theme: "Accélérateur", q: "Un Tensor Core fait 64 FMA/cycle. Huit cœurs font combien de MAC/cycle ?", c: ["64", "128", "512", "1 024"], a: 2, e: "8×64 = 512 MAC. Cela peut être annoncé comme 1 024 opérations si multiplication et addition comptent séparément." },
    { theme: "Accélérateur", q: "48 op/cycle × 12 SHAVE × 600 MHz vaut…", c: ["34,56 GOPS", "345,6 GOPS", "3,456 TOPS", "28,8 GOPS"], a: 1, e: "48×12×600 millions = 345 600 millions = 345,6 GOPS." },
    { theme: "Sparsité", q: "Différence centrale Cambricon-X / Ascend ?", c: ["Ascend n’a pas de mémoire", "Cambricon décode en amont des PE ; Ascend régularise avant un cube dense", "Cambricon utilise seulement FP64", "Aucune"], a: 1, e: "Cambricon exploite les poids compressés via le Buffer Controller avant les PE ; Ascend sépare le traitement irrégulier puis utilise une matrice fixe régulière." },
    { theme: "Exceptions", q: "Une DIV plus ancienne lève une exception après qu’une ADD plus jeune a terminé. Pour un état précis…", c: ["L’ADD doit forcément committer", "La DIV et l’ADD ne doivent pas committer", "Toute la mémoire est effacée", "On ignore la DIV"], a: 1, e: "Terminer n’est pas committer. Les anciennes instructions saines peuvent committer ; la DIV fautive et les plus jeunes ne modifient pas l’état architectural." },
    { theme: "Exceptions", q: "Au moment de traiter Ik fautive, quelle frontière est correcte ?", c: ["Ik a committé, les jeunes non", "Toutes les jeunes ont committé", "Les anciennes ont committé, Ik et les jeunes non", "Rien n’a été exécuté"], a: 2, e: "C’est exactement la définition d’une exception précise : l’état correspond au programme arrêté juste avant Ik." },
    { theme: "Renommage", q: "Quel type de dépendance le renommage ne supprime jamais ?", c: ["WAR", "WAW", "RAW", "RAR"], a: 2, e: "RAW transporte une vraie valeur. WAR et WAW ne viennent que de la réutilisation d’un même nom architectural." },
    { theme: "ROB", q: "Le ROB est normalement…", c: ["Alloué et committé en ordre", "Alloué hors ordre et committé hors ordre", "Écrit en mémoire à chaque fin", "Réservé aux branches"], a: 0, e: "L’exécution/fin peut être hors ordre, mais allocation et retrait suivent l’ordre du programme." },
    { theme: "ROB", q: "Où garder un store spéculatif avant son commit ?", c: ["Directement dans la RAM", "Dans le store queue/ROB", "Dans EPC", "Dans le prédicteur seulement"], a: 1, e: "La mémoire est architecturale et difficile à annuler. Adresse et donnée attendent donc le commit dans une structure spéculative." },
    { theme: "Récupération", q: "Un History Buffer mémorise principalement…", c: ["Les anciennes valeurs à restaurer", "Uniquement les opcodes", "Les lignes DRAM", "Les interruptions externes"], a: 0, e: "Il rend la spéculation réversible en conservant ce qui a été écrasé." },
    { theme: "Spéculation", q: "Pourquoi mettre à jour un checkpoint avec un résultat plus ancien arrivé tard ?", c: ["Pour accélérer la DRAM", "Pour ne pas perdre une valeur légitime à la restauration", "Pour invalider tous les caches", "Pour supprimer une RAW"], a: 1, e: "Le checkpoint est créé au branchement, mais une instruction antérieure peut finir ensuite. Cette valeur appartient au bon état récupérable." },
    { theme: "OoO", q: "Pourquoi le ROB seul ne laisse-t-il pas forcément passer une instruction indépendante ?", c: ["Il supprime les résultats", "Le dispatch in-order peut rester bloqué devant une dépendance", "Il interdit les tags", "Il change les opcodes"], a: 1, e: "Il faut en plus des stations de réservation et un wakeup/select qui choisit les instructions prêtes." },
    { theme: "Tomasulo", q: "Une station contient le tag x comme opérande. Elle attend…", c: ["Le registre architectural x", "La diffusion du producteur x", "Un refresh", "Le commit de toutes les jeunes"], a: 1, e: "Le tag nomme la version productrice. Sa diffusion fournit la valeur et réveille les consommateurs." },
    { theme: "Tomasulo", q: "Dans la simulation du cours, quelle est la valeur finale de R5 ?", c: ["6", "17", "136", "142"], a: 3, e: "I2 produit 6, I5 produit 8×17=136, puis I6 calcule 6+136=142 et représente la dernière version de R5." },
    { theme: "Performance", q: "La simulation à six instructions finit en combien de cycles avec OoO et forwarding ?", c: ["20", "25", "31", "46"], a: 0, e: "Le dernier ADD s’exécute aux cycles 16–19 et diffuse au cycle 20. Les références comparées sont 31, 25 puis 20 cycles." },
    { theme: "Mémoire OoO", q: "Un load a deux stores plus anciens à la même adresse. Il doit forwarder depuis…", c: ["Le plus vieux", "Le plus jeune parmi les plus anciens", "Un store plus jeune", "Les deux additionnés"], a: 1, e: "La sémantique séquentielle retient la dernière écriture avant le load." },
    { theme: "Renommage", q: "La table de retrait décrit…", c: ["L’état spéculatif le plus jeune", "L’état architectural committé", "Seulement les caches", "Les ports d’ALU"], a: 1, e: "La frontend map/RAT est spéculative ; la retirement map reste le point de reconstruction validé." },
    { theme: "OoO", q: "Quelle liste contient les quatre mécanismes essentiels ?", c: ["Tags, stations, broadcast, wakeup/select", "Refresh, TLB, pixel, ReLU", "EPC, DDR, Softmax, DMA", "Seulement un ROB"], a: 0, e: "Ces mécanismes permettent aux dépendantes d’attendre tandis que les prêtes dépassent puis capturent les résultats." },
    { theme: "Amdahl", q: "80 % d’un programme est parallélisable sur 4 cœurs. Speedup idéal ?", c: ["2", "2,5", "3,2", "4"], a: 1, e: "S=1/(0,2+0,8/4)=1/0,4=2,5." },
    { theme: "Amdahl", q: "Quand N tend vers l’infini, le speedup tend vers…", c: ["N", "p", "1/(1−p)", "1/p"], a: 2, e: "La partie parallèle tend vers zéro, mais la fraction séquentielle 1−p demeure." },
    { theme: "Parallélisme", q: "Quatre processus indépendants durent 3, 5, 2 et 4 s avec assez de cœurs. Temps idéal ?", c: ["14 s", "3,5 s", "5 s", "2 s"], a: 2, e: "Ils s’exécutent simultanément ; la fin globale attend le plus long, soit max(Ti)=5 s." },
    { theme: "Multicœur", q: "Dans une machine NUMA…", c: ["Toutes les mémoires ont exactement le même coût", "Le coût dépend du nœud de la donnée", "Il n’existe aucune mémoire partagée", "Les caches sont interdits"], a: 1, e: "L’espace est partagé mais physiquement distribué : affinité et placement des pages comptent." },
    { theme: "MSI", q: "Si un cache détient une ligne en M…", c: ["Plusieurs autres peuvent aussi être M", "La mémoire est forcément à jour", "Il est l’unique détenteur valide", "La ligne est invalide"], a: 2, e: "M signifie modifiée et exclusive ; la mémoire peut encore contenir l’ancienne valeur." },
    { theme: "MSI", q: "P0 écrit dans une ligne actuellement partagée S avec P1. Action clé ?", c: ["Invalider la copie de P1", "Passer les deux en M", "Ne rien faire", "Écrire le registre EPC"], a: 0, e: "P0 obtient l’exclusivité par une transaction d’invalidation puis passe en M." },
    { theme: "Cohérence", q: "Pourquoi un répertoire scale-t-il mieux qu’un snoop diffusé ?", c: ["Il cible les détenteurs au lieu de solliciter tous les caches", "Il supprime les états", "Il rend la mémoire infinie", "Il évite toute latence"], a: 0, e: "Le trafic devient ciblé, au prix du stockage des partageurs et d’une indirection supplémentaire." },
    { theme: "Atomique", q: "Deux threads font chacun x=x+1 depuis x=0 sans atomicité et lisent tous deux 0. Valeur finale possible ?", c: ["Seulement 2", "1", "3", "Impossible"], a: 1, e: "Les deux calculent 1 puis l’une des écritures écrase l’autre : mise à jour perdue." },
    { theme: "LR/SC", q: "En RISC-V, SC renvoie 0 lorsque…", c: ["Le store a réussi", "Le store a échoué", "LR a lu zéro", "Le cache est partagé"], a: 0, e: "Zéro signifie succès ; une valeur non nulle impose de refaire LR puis le calcul." },
    { theme: "AMO", q: "Un AMO place généralement dans rd…", c: ["La nouvelle valeur seulement", "L’ancienne valeur mémoire", "Toujours zéro", "L’adresse du ROB"], a: 1, e: "L’opération modifie atomiquement la mémoire et rend l’ancienne valeur dans rd." },
    { theme: "AMO", q: "AMOMAX et AMOMAXU comparent respectivement…", c: ["Non signé puis signé", "Signé puis non signé", "Flottant puis signé", "Toujours des adresses"], a: 1, e: "Sans suffixe U, MIN/MAX sont signés ; U indique la variante non signée." },
    { theme: "Verrou", q: "Test-test-set réduit surtout…", c: ["Les écritures atomiques répétées pendant l’attente", "Le nombre de threads", "La capacité DRAM", "La précision flottante"], a: 0, e: "Les attenteurs lisent localement tant que le verrou paraît pris, puis tentent l’opération atomique seulement lorsqu’il semble libre." },
    { theme: "Deadlock", q: "Quelle règle simple casse les cycles de verrous ?", c: ["Les acquérir dans un ordre global unique", "Toujours prendre le dernier d’abord au hasard", "Supprimer l’atomicité", "Utiliser plus de caches"], a: 0, e: "Un ordre total commun empêche le cycle d’attente circulaire." },
    { theme: "Barrière", q: "Pour réutiliser correctement une barrière compteur, il faut notamment…", c: ["Une génération/sense bit", "Un registre p0", "Désactiver la cohérence", "Un Softmax"], a: 0, e: "La génération distingue les tours et empêche une tâche rapide de rejoindre le suivant avant que les autres aient quitté le précédent." }
  ];

  let quiz = [];
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  const shuffle = (array) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function selectedQuizLength() {
    const value = $("#quiz-length")?.value || "15";
    if (value === "all") return quizBank.length;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), quizBank.length) : 15;
  }
  function startQuiz(moveFocus = false) {
    quiz = shuffle(quizBank).slice(0, selectedQuizLength());
    quizIndex = 0; quizScore = 0; quizAnswered = false;
    renderQuiz(moveFocus);
  }
  function renderQuiz(moveFocus = false) {
    const item = quiz[quizIndex];
    if (!item) return;
    $("#quiz-position").textContent = `Question ${quizIndex + 1} / ${quiz.length}`;
    $("#quiz-score").textContent = `${quizScore} point${quizScore > 1 ? "s" : ""}`;
    $("#quiz-progress").style.width = `${(quizIndex / quiz.length) * 100}%`;
    $("#quiz-theme").textContent = item.theme;
    $("#quiz-prompt").textContent = item.q;
    $("#quiz-explanation").classList.remove("show");
    $("#quiz-explanation").textContent = "";
    $("#quiz-next").disabled = true;
    $("#quiz-next").textContent = quizIndex === quiz.length - 1 ? "Voir le résultat →" : "Question suivante →";
    quizAnswered = false;
    const root = $("#quiz-options"); root.innerHTML = "";
    item.c.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "quiz-option"; button.textContent = choice;
      button.addEventListener("click", () => answerQuiz(index));
      root.appendChild(button);
    });
    if (moveFocus) requestAnimationFrame(() => $("#quiz-prompt")?.focus({ preventScroll: true }));
  }
  function answerQuiz(selected) {
    if (quizAnswered) return;
    quizAnswered = true;
    const item = quiz[quizIndex];
    if (selected === item.a) quizScore += 1;
    $$(".quiz-option", $("#quiz-options")).forEach((button, index) => {
      button.disabled = true;
      if (index === item.a) button.classList.add("correct");
      else if (index === selected) button.classList.add("wrong");
    });
    const explanation = $("#quiz-explanation");
    const verdict = selected === item.a ? "Correct." : `À revoir. Bonne réponse : ${item.c[item.a]}.`;
    explanation.innerHTML = `<strong>${verdict}</strong> ${item.e}`;
    explanation.classList.add("show");
    $("#quiz-score").textContent = `${quizScore} point${quizScore > 1 ? "s" : ""}`;
    $("#quiz-progress").style.width = `${((quizIndex + 1) / quiz.length) * 100}%`;
    $("#quiz-next").disabled = false;
  }
  function nextQuiz() {
    if (!quizAnswered) return;
    if (quizIndex < quiz.length - 1) { quizIndex += 1; renderQuiz(true); return; }
    $("#quiz-progress").style.width = "100%";
    $("#quiz-position").textContent = "Série terminée";
    $("#quiz-theme").textContent = "Résultat";
    const percent = Math.round(100 * quizScore / quiz.length);
    $("#quiz-prompt").textContent = `${quizScore} / ${quiz.length} · ${percent} %`;
    $("#quiz-options").innerHTML = "";
    const message = percent >= 80 ? "Très solide. Revois seulement les erreurs." : percent >= 60 ? "Bonne base. Reprends les thèmes ratés puis relance une série." : "Retourne au mode Essentiel, refais les animations, puis réessaie.";
    $("#quiz-explanation").innerHTML = `<strong>${message}</strong>`;
    $("#quiz-explanation").classList.add("show");
    $("#quiz-next").disabled = true;
    requestAnimationFrame(() => $("#quiz-prompt")?.focus({ preventScroll: true }));
  }
  $("#quiz-next")?.addEventListener("click", nextQuiz);
  $("#quiz-restart")?.addEventListener("click", () => startQuiz(true));
  $("#quiz-length")?.addEventListener("change", () => startQuiz(true));
  startQuiz(false);
})();
