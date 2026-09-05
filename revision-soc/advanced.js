(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Exception précise -------------------------------------------------------
  const precisionRoot = $("#precision-frontier");
  const precisionMessages = [
    "Étape 1/4 · les unités exécutent avec des latences différentes.",
    "Étape 2/4 · I₂ termine avant la DIV, mais son résultat reste spéculatif.",
    "Étape 3/4 · la DIV signale une exception ; elle doit encore atteindre la tête du ROB.",
    "Étape 4/4 · I₀ committe ; I₁ ne committe pas ; I₂ et I₃ sont supprimées. L’état est précis."
  ];
  let precisionStep = 0;
  function renderPrecision() {
    if (!precisionRoot) return;
    precisionRoot.dataset.step = String(precisionStep);
    const instructions = $$(".precision-inst", precisionRoot);
    instructions.forEach((node) => node.classList.remove("completed", "committed", "squashed", "exception-head"));
    if (precisionStep >= 1) instructions[2]?.classList.add("completed");
    if (precisionStep >= 2) instructions[1]?.classList.add("exception-head");
    if (precisionStep >= 3) {
      instructions[0]?.classList.add("committed");
      instructions[2]?.classList.add("squashed");
      instructions[3]?.classList.add("squashed");
    }
    $("#precision-status").textContent = precisionMessages[precisionStep];
    $("#precision-next").disabled = precisionStep === precisionMessages.length - 1;
  }
  $("#precision-next")?.addEventListener("click", () => { precisionStep = Math.min(3, precisionStep + 1); renderPrecision(); });
  $("#precision-reset")?.addEventListener("click", () => { precisionStep = 0; renderPrecision(); });
  renderPrecision();

  // Mini ROB ---------------------------------------------------------------
  const robStates = [
    { slots: ["en cours", "en cours", "en cours", "en cours"], classes: ["", "", "", ""], text: "Cycle logique 0 · aucune instruction n’est encore prête." },
    { slots: ["en cours", "prête", "prête", "adresse prête"], classes: ["", "ready", "ready", "ready"], text: "Les jeunes ont terminé, mais la DIV en tête interdit leur commit." },
    { slots: ["exception", "prête", "prête", "prête"], classes: ["faulty", "ready", "ready", "ready"], text: "La DIV arrive en tête avec une exception : aucun de ses effets ne doit devenir architectural." },
    { slots: ["handler", "supprimée", "supprimée", "supprimée"], classes: ["handler", "squashed", "squashed", "squashed"], text: "Flush précis : les entrées plus jeunes sont annulées, EPC/Cause redirigent vers le handler." }
  ];
  let robStep = 0;
  function renderRob() {
    const root = $("#rob-lab");
    if (!root) return;
    const state = robStates[robStep];
    $$(".rob-slot", root).forEach((slot, index) => {
      slot.className = `rob-slot ${state.classes[index]}`.trim();
      $("strong", slot).textContent = state.slots[index];
    });
    $("#rob-status").textContent = state.text;
    $("#rob-next").disabled = robStep === robStates.length - 1;
  }
  $("#rob-next")?.addEventListener("click", () => { robStep = Math.min(robStates.length - 1, robStep + 1); renderRob(); });
  $("#rob-reset")?.addEventListener("click", () => { robStep = 0; renderRob(); });
  renderRob();

  // In-order vs OoO --------------------------------------------------------
  $("#ooo-road-toggle")?.addEventListener("click", (event) => {
    const root = $("#ooo-road");
    const active = !root.classList.contains("active-ooo");
    root.classList.toggle("active-ooo", active);
    root.dataset.mode = active ? "ooo" : "inorder";
    event.currentTarget.textContent = active ? "Revenir au dispatch in-order" : "Activer l’ordonnancement OoO";
    $("#ooo-road-status").textContent = active
      ? "OoO · l’ADD dépendante attend dans la RS ; les deux instructions indépendantes dépassent le miss."
      : "In-order · l’ADD dépendante empêche les deux instructions prêtes de passer.";
  });

  // Simulation Tomasulo ----------------------------------------------------
  const tomasuloEvents = [
    "Machine vide ; tous les registres R1…R11 contiennent leur numéro.",
    "Fetch I1 : MUL R1,R2→R3.",
    "I1 entre dans x ; sources 1 et 2 prêtes ; R3→x.",
    "x démarre. I2 entre dans a, attend x et possède 4 ; R5→a.",
    "I3 entre dans b avec 2 et 6 ; R7→b. Elle peut dépasser I2.",
    "b démarre. I4 entre dans c avec 8 et 9 ; R10→c.",
    "c démarre. I5 entre dans y et attend b puis c ; R11→y.",
    "I6 lit d’abord a et y, puis R5 est renommé une seconde fois : R5→d.",
    "Cycle 8 · x et b terminent leur exécution ; c exécute encore. Aucun résultat n’est encore diffusé.",
    "Cycle 9 · x diffuse 2 et b diffuse 8 sur deux bus : a démarre ; y attend encore c. c termine.",
    "Cycle 10 · c diffuse 17 : y possède 8 et 17 et démarre ; a continue.",
    "Cycle 11 · a et y exécutent en parallèle.",
    "Cycle 12 · a termine ; y poursuit la multiplication.",
    "Cycle 13 · a diffuse 6 : d capture 6, mais le RAT R5 reste d — jamais a.",
    "Cycle 14 · y poursuit la multiplication 8×17 ; d attend son second opérande.",
    "Cycle 15 · y termine ; sa valeur n’est pas encore diffusée.",
    "Cycle 16 · y diffuse 136 : R11 devient 136 et d démarre ADD 6+136.",
    "Cycle 17 · d exécute.",
    "Cycle 18 · d exécute.",
    "Cycle 19 · d termine ; R5 reste associé au tag d en attente du write.",
    "Cycle 20 · d diffuse 142 ; son tag correspond au RAT, R5 devient 142."
  ];
  let tomasuloTimer = null;
  function tomasuloMappings(cycle) {
    const mapping = {
      R3: cycle < 2 ? "valeur" : cycle < 9 ? "x · attente" : "2 · prête",
      R5: cycle < 3 ? "valeur" : cycle < 7 ? "a · attente" : cycle < 19 ? "d · attente" : "142 · prête",
      R7: cycle < 4 ? "valeur" : cycle < 9 ? "b · attente" : "8 · prête",
      R10: cycle < 5 ? "valeur" : cycle < 10 ? "c · attente" : "17 · prête",
      R11: cycle < 6 ? "valeur" : cycle < 16 ? "y · attente" : "136 · prête"
    };
    return mapping;
  }
  function renderTomasulo() {
    const range = $("#tomasulo-cycle");
    if (!range) return;
    const cycle = Number(range.value);
    $("#tomasulo-cycle-label").textContent = String(cycle);
    $("#tomasulo-event").textContent = tomasuloEvents[cycle];
    const mapping = tomasuloMappings(cycle);
    $("#tomasulo-rat").innerHTML = Object.entries(mapping).map(([register, value]) => `<span><b>${register}</b>: ${value}</span>`).join("");
    $("#tomasulo-prev").disabled = cycle === 0;
    $("#tomasulo-next").disabled = cycle === 20;
  }
  function stopTomasulo() {
    if (tomasuloTimer) window.clearInterval(tomasuloTimer);
    tomasuloTimer = null;
    if ($("#tomasulo-play")) $("#tomasulo-play").textContent = "Lecture auto";
  }
  $("#tomasulo-cycle")?.addEventListener("input", () => { stopTomasulo(); renderTomasulo(); });
  $("#tomasulo-prev")?.addEventListener("click", () => { const r = $("#tomasulo-cycle"); r.value = String(Math.max(0, Number(r.value) - 1)); renderTomasulo(); });
  $("#tomasulo-next")?.addEventListener("click", () => { const r = $("#tomasulo-cycle"); r.value = String(Math.min(20, Number(r.value) + 1)); renderTomasulo(); });
  $("#tomasulo-play")?.addEventListener("click", () => {
    if (tomasuloTimer) { stopTomasulo(); return; }
    const range = $("#tomasulo-cycle");
    if (Number(range.value) === 20) range.value = "0";
    $("#tomasulo-play").textContent = "Pause";
    const delay = prefersReducedMotion.matches ? 1500 : 800;
    tomasuloTimer = window.setInterval(() => {
      range.value = String(Math.min(20, Number(range.value) + 1));
      renderTomasulo();
      if (Number(range.value) === 20) stopTomasulo();
    }, delay);
  });
  renderTomasulo();

  // Désambiguïsation mémoire ----------------------------------------------
  const memoryPolicies = {
    conservative: "La load attend toutes les adresses des stores plus anciennes : sûr, parfois très lent.",
    aggressive: "La load part avant de connaître l’adresse de la store. Si elles se chevauchent, détecter la violation et rejouer la load et ses dépendants.",
    predictive: "Le prédicteur apprend les couples store→load récurrents et ne retarde que les loads à risque ; une récupération reste indispensable."
  };
  $$("[data-memory-policy]").forEach((button) => button.addEventListener("click", () => {
    $$("[data-memory-policy]").forEach((item) => item.classList.toggle("active", item === button));
    $("#memory-policy-result").textContent = memoryPolicies[button.dataset.memoryPolicy];
  }));

  // Amdahl -----------------------------------------------------------------
  function renderAmdahl() {
    const pInput = $("#amdahl-p");
    const nInput = $("#amdahl-n");
    if (!pInput || !nInput) return;
    const p = Number(pInput.value) / 100;
    const n = Number(nInput.value);
    const speedup = 1 / ((1 - p) + p / n);
    const limit = p === 1 ? Infinity : 1 / (1 - p);
    $("#amdahl-p-out").textContent = `${Math.round(p * 100)} %`;
    $("#amdahl-n-out").textContent = String(n);
    $("#amdahl-speedup").textContent = `${speedup.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}×`;
    $("#amdahl-limit").textContent = Number.isFinite(limit) ? `${limit.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}×` : "∞";
  }
  [$("#amdahl-p"), $("#amdahl-n")].filter(Boolean).forEach((input) => input.addEventListener("input", renderAmdahl));
  renderAmdahl();

  // Organisations mémoire --------------------------------------------------
  const orgMessages = {
    distributed: "Mémoire distribuée : pour obtenir M₁, Cœur 0 doit demander un message à Cœur 1.",
    uma: "SMP/UMA : les deux cœurs voient le même espace et paient idéalement le même coût vers la mémoire centrale.",
    numa: "DSM/NUMA : même espace d’adresses, mais M₀ est proche de Cœur 0 et M₁ proche de Cœur 1 ; le placement compte."
  };
  $$(".org-btn").forEach((button) => button.addEventListener("click", () => {
    $$(".org-btn").forEach((item) => item.classList.toggle("active", item === button));
    $("#memory-org-map").dataset.org = button.dataset.org;
    $("#memory-org-status").textContent = orgMessages[button.dataset.org];
  }));

  // Cohérence write-back ---------------------------------------------------
  function resetCoherence() {
    const copies = $$(".cache-copy", $("#coherence-lab") || document);
    copies.forEach((copy) => copy.classList.remove("stale", "dirty"));
    const values = ["BABEF00D", "BABEF00D", "BABEF00D"];
    copies.forEach((copy, index) => $("strong", copy).textContent = values[index]);
    if (copies[0]) $("span", copies[0]).textContent = "Cache P0 · V=1 D=0";
    $("#coherence-status").textContent = "Les trois copies sont cohérentes.";
  }
  $("#coherence-write")?.addEventListener("click", () => {
    const root = $("#coherence-lab");
    const p0 = $('[data-copy="p0"]', root), p1 = $('[data-copy="p1"]', root), mem = $('[data-copy="mem"]', root);
    $("strong", p0).textContent = "DEADBEEF";
    $("span", p0).textContent = "Cache P0 · V=1 D=1";
    p0.classList.add("dirty"); p1.classList.add("stale"); mem.classList.add("stale");
    $("#coherence-status").textContent = "P0 est dirty ; P1 et la mémoire conservent l’ancienne valeur. Sans protocole, deux lectures peuvent diverger.";
  });
  $("#coherence-reset")?.addEventListener("click", resetCoherence);

  // Trace MSI ---------------------------------------------------------------
  const msiStates = [
    { p0: "S · 0908 CAFE", p1: "S · 0908 CAFE", mem: "0908 CAFE", bus: "bus : —", text: "Départ : P0 et P1 partagent @410." },
    { p0: "M · CAFE CAFE", p1: "I · —", mem: "0908 CAFE", bus: "P0: IV(@410)", text: "P0 écrit @412=CAFE : invalide P1 et devient M ; la mémoire reste ancienne." },
    { p0: "I · —", p1: "M · CAFE 0000", mem: "CAFE CAFE", bus: "P1: WM · P0: WB", text: "P1 écrit @410=0000 : P0 avait M, donc write-back puis invalidation ; P1 devient M." },
    { p0: "S · CAFE 0000", p1: "S · CAFE 0000", mem: "CAFE 0000", bus: "P0: RM · P1: WB", text: "Lecture distante de P0 : P1 restitue la donnée dirty puis les deux copies deviennent S." }
  ];
  let msiStep = 0;
  function renderMsi() {
    const state = msiStates[msiStep];
    const root = $("#msi-lab");
    if (!root) return;
    $("[data-msi=p0] strong", root).textContent = state.p0;
    $("[data-msi=p1] strong", root).textContent = state.p1;
    $("[data-msi=mem] strong", root).textContent = state.mem;
    $(".msi-bus", root).textContent = state.bus;
    $("#msi-status").textContent = state.text;
    $("#msi-next").disabled = msiStep === msiStates.length - 1;
  }
  $("#msi-next")?.addEventListener("click", () => { msiStep = Math.min(msiStates.length - 1, msiStep + 1); renderMsi(); });
  $("#msi-reset")?.addEventListener("click", () => { msiStep = 0; renderMsi(); });
  renderMsi();

  // Lost update -------------------------------------------------------------
  const race = { value: 0, atomic: false, threads: { a: { stage: 0, local: null }, b: { stage: 0, local: null } } };
  function raceStateText(thread) {
    if (thread.stage === 0) return "prête à lire";
    if (thread.stage === 1) return `a lu ${thread.local}`;
    if (thread.stage === 2) return `a calculé ${thread.local}`;
    return `a écrit ${thread.local}`;
  }
  function renderRace(message = "") {
    $("#race-value").textContent = String(race.value);
    $("#race-a-state").textContent = raceStateText(race.threads.a);
    $("#race-b-state").textContent = raceStateText(race.threads.b);
    if (message) $("#race-status").textContent = message;
    $("#race-atomic").textContent = race.atomic ? "Revenir au RMW non atomique" : "Rendre chaque RMW atomique";
  }
  function resetRace() {
    race.value = 0;
    race.threads.a = { stage: 0, local: null };
    race.threads.b = { stage: 0, local: null };
    renderRace(race.atomic ? "Mode atomique : chaque clic réalise l’incrément complet." : "Essaie A, B, A, B, A, B : les deux lisent 0 et écrivent 1.");
  }
  $$(".race-step").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.thread;
    const thread = race.threads[id];
    const label = id.toUpperCase();
    if (race.atomic) {
      race.value += 1;
      thread.stage = 3; thread.local = race.value;
      renderRace(`${label} exécute atomiquement read+add+write : x=${race.value}.`);
      return;
    }
    if (thread.stage === 0) { thread.local = race.value; thread.stage = 1; renderRace(`${label} lit x=${thread.local}.`); }
    else if (thread.stage === 1) { thread.local += 1; thread.stage = 2; renderRace(`${label} calcule localement ${thread.local}.`); }
    else if (thread.stage === 2) { race.value = thread.local; thread.stage = 3; renderRace(`${label} écrit ${thread.local}. Valeur partagée : ${race.value}.`); }
    else renderRace(`${label} a terminé ; réinitialise pour un nouvel entrelacement.`);
  }));
  $("#race-reset")?.addEventListener("click", resetRace);
  $("#race-atomic")?.addEventListener("click", () => { race.atomic = !race.atomic; resetRace(); });
  resetRace();
})();
