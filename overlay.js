(function () {
  "use strict";

  const {
    SETS, nextLevel, isMaxed, computeStats, levelBreakdown,
    detectClassVariants, getPieceOverride, detectLevelVariants, romanNumeralFor
  } = window.EnhancementShared;

  const params = new URLSearchParams(window.location.search);
  const SET_KEY = params.get("set") || (document.body && document.body.dataset.set) || "ekleta";
  const SET_DEF = SETS[SET_KEY] || SETS.ekleta;
  const PITY_THRESHOLD = SET_DEF.pityThreshold;
  document.body.dataset.theme = SET_DEF.theme || "";
  const FILE = params.get("file") || "enhancement-tracker.json";
  const INTERVAL = Math.max(500, parseInt(params.get("interval"), 10) || 3000);
  const ONLY = params.get("items") ? params.get("items").split(",").map((s) => s.trim()).filter(Boolean) : null;
  const SHOW_STATS = params.get("stats") !== "0";
  const SHOW_LEVELS = params.get("levels") !== "0";
  const DEBUG = params.get("debug") === "1";

  const bgParam = parseFloat(params.get("bg"));
  if (!isNaN(bgParam)) {
    document.documentElement.style.setProperty("--panel-alpha", Math.min(1, Math.max(0, bgParam)));
  }

  // Matches app.js's STORAGE_KEY — index.html and overlay-*.html share localStorage on the
  // same origin, so when there's no local JSON file to poll (e.g. this page is running on a
  // hosted preview rather than sitting next to a real save file), the overlay can still show
  // something real by reading this browser's own tracker data instead.
  const STORAGE_KEY = "bdo-enhancement-tracker-v1";

  const root = document.getElementById("overlay-root");
  let lastLoadedAt = null;
  let hasLoadedOnce = false;
  let usingLocalStorageFallback = false;
  let debugEl = null;

  // For classVariant sets (Sovereign weapons), resolve icons once — cached across polls.
  const classVariantPromise = SET_DEF.classVariant ? detectClassVariants(SET_DEF) : null;
  let classVariantResult = null;

  // For levelVariant sets (Alchemy stones), resolve each piece's per-level icons once.
  const levelVariantPromise = SET_DEF.levelVariant ? detectLevelVariants(SET_DEF) : null;
  let levelVariantResult = null;

  if (DEBUG) {
    debugEl = document.createElement("div");
    debugEl.className = "ov-debug";
    document.body.appendChild(debugEl);
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function romanOverlayHtml(level) {
    const numeral = romanNumeralFor(level);
    return numeral ? `<span class="roman-numeral">${numeral}</span>` : "";
  }

  // Mirrors app.js's avgAttemptsHtml — "vs average" for one Rates-by-Level row, if this set
  // defines community averages (currently just Ekleta). Cleared levels get a colored delta;
  // an in-progress level just shows the average as a plain reference point.
  function avgAttemptsHtml(row) {
    if (!SET_DEF.avgAttempts) return "";
    const avg = SET_DEF.avgAttempts[row.level];
    if (avg == null) return "";
    if (!row.cleared) {
      return `<div class="ov-lvl-avg">avg ${avg.toFixed(2)}</div>`;
    }
    const delta = row.attempts - avg;
    const sign = delta > 0 ? "+" : "";
    const cls = delta < 0 ? "good" : delta > 0 ? "bad" : "";
    return `<div class="ov-lvl-avg">avg ${avg.toFixed(2)} <span class="ov-avg-delta ${cls}">${sign}${delta.toFixed(2)}</span></div>`;
  }

  function iconFor(acc, selectedClass) {
    if (SET_DEF.classVariant) {
      if (classVariantResult && selectedClass && classVariantResult.icons[selectedClass]) {
        return classVariantResult.icons[selectedClass][acc.id] || "";
      }
      return "";
    }
    if (SET_DEF.levelVariant) {
      if (levelVariantResult && levelVariantResult[acc.id]) return levelVariantResult[acc.id][acc.currentLevel] || "";
      return "";
    }
    return acc.icon;
  }

  // Mirrors app.js's pieceStatus: "locked" for a class-overridden piece with a fixed level
  // (e.g. Shai's awakening slot), "unavailable" for a classVariant piece with no image for the
  // selected class, otherwise "normal". Non-classVariant sets are always "normal".
  function pieceStatus(acc, selectedClass) {
    if (!SET_DEF.classVariant) return { kind: "normal" };
    const override = selectedClass ? getPieceOverride(selectedClass, acc.id) : null;
    if (override) return { kind: "locked", fixedLevel: override.fixedLevel };
    const hasIcon = !!(classVariantResult && selectedClass && classVariantResult.icons[selectedClass] && classVariantResult.icons[selectedClass][acc.id]);
    return hasIcon ? { kind: "normal" } : { kind: "unavailable" };
  }

  function renderCard(acc, selectedClass) {
    const status = pieceStatus(acc, selectedClass);
    const iconSrc = iconFor(acc, selectedClass);

    if (status.kind === "unavailable") {
      return `
        <div class="ov-card ov-unavailable">
          <div class="ov-head">
            <div class="ov-icon-wrap"></div>
            <div class="ov-name-col"><div class="ov-name">${escapeHtml(acc.name)}</div></div>
          </div>
          <div class="ov-unavailable-label">Not Available</div>
        </div>
      `;
    }

    if (status.kind === "locked") {
      return `
        <div class="ov-card ov-locked">
          <div class="ov-head">
            <div class="ov-icon-wrap">${iconSrc ? `<img src="${iconSrc}" alt="">` : ""}${romanOverlayHtml(status.fixedLevel)}</div>
            <div class="ov-name-col">
              <div class="ov-name">${escapeHtml(acc.name)}</div>
              <div class="ov-level-row"><span class="ov-level">${status.fixedLevel.toUpperCase()}</span></div>
            </div>
          </div>
        </div>
      `;
    }

    const maxed = isMaxed(acc.currentLevel, SET_DEF.levels);
    const target = nextLevel(acc.currentLevel, SET_DEF.levels);
    const threshold = target ? PITY_THRESHOLD[target] : 1;
    const pct = maxed ? 100 : Math.min(100, (acc.pityStack / threshold) * 100);
    const ready = !maxed && acc.pityStack >= threshold;

    const log = acc.log || [];
    const { total, successes, fails, rate } = computeStats(log, PITY_THRESHOLD);
    const levelRows = SHOW_LEVELS ? levelBreakdown(log, SET_DEF.levels, PITY_THRESHOLD) : [];

    return `
      <div class="ov-card">
        <div class="ov-head">
          <div class="ov-icon-wrap">${iconSrc ? `<img src="${iconSrc}" alt="">` : ""}${romanOverlayHtml(acc.currentLevel)}</div>
          <div class="ov-name-col">
            <div class="ov-name">${escapeHtml(acc.name)}</div>
            <div class="ov-level-row">
              <span class="ov-level${maxed ? " maxed" : ""}">${acc.currentLevel.toUpperCase()}</span>
              ${maxed ? "" : `<span class="ov-arrow-target">&rarr; ${target.toUpperCase()}</span>`}
            </div>
          </div>
        </div>
        ${maxed
          ? `<div class="ov-maxed-banner">&#9733; MAX</div>`
          : `<div class="ov-pity-track">
               <div class="ov-pity-bar${ready ? " ready" : ""}"><div style="width:${pct}%"></div></div>
               <div class="ov-pity-num">${acc.pityStack}/${threshold}</div>
             </div>`
        }
        ${SHOW_STATS ? `
        <div class="ov-stats">
          <div class="ov-stat"><div class="v">${total}</div><div class="l">Tries</div></div>
          <div class="ov-stat successes"><div class="v">${successes}</div><div class="l">Wins</div></div>
          <div class="ov-stat fails"><div class="v">${fails}</div><div class="l">Fails</div></div>
          <div class="ov-stat rate"><div class="v">${rate}%</div><div class="l">Overall</div></div>
        </div>` : ""}
        ${levelRows.length ? `
        <div class="ov-level-rates">
          ${levelRows.map((r) => `
            <div class="ov-lvl-row${!r.cleared ? " in-progress" : ""}">
              <div class="ov-lvl-main">
                <span class="lvl">${r.level.toUpperCase()}</span>
                <span class="cnt"><span class="s">${r.successes}s</span> <span class="p">${r.pity}p</span> <span class="f">${r.fails}f</span></span>
                <span class="pct">${r.rate}%</span>
              </div>
              ${avgAttemptsHtml(r)}
            </div>
          `).join("")}
        </div>` : ""}
      </div>
    `;
  }

  function render(setState) {
    const accessories = setState.accessories || {};
    const ids = ONLY && ONLY.length ? ONLY : SET_DEF.accessories.map((d) => d.id);
    const cards = ids
      .map((id) => accessories[id])
      .filter(Boolean)
      .map((acc) => renderCard(acc, setState.selectedClass))
      .join("");

    const badge = usingLocalStorageFallback
      ? `<div class="ov-preview-badge">&#9432; Browser preview &mdash; showing this browser's saved tracker data, not a linked file</div>`
      : "";
    root.innerHTML = badge + (cards || `<div class="overlay-empty">No accessory data found.</div>`);
  }

  function updateDebug(status) {
    if (!debugEl) return;
    const synced = lastLoadedAt ? new Date(lastLoadedAt).toLocaleTimeString() : "never";
    debugEl.textContent = `${status} · set=${SET_KEY} · last synced ${synced} · ${FILE}`;
  }

  async function poll() {
    try {
      if (classVariantPromise && !classVariantResult) {
        classVariantResult = await classVariantPromise;
      }
      if (levelVariantPromise && !levelVariantResult) {
        levelVariantResult = await levelVariantPromise;
      }
      let data, viaFallback = false;
      try {
        const res = await fetch(FILE + "?t=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        data = await res.json();
      } catch (fetchErr) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) throw fetchErr;
        data = JSON.parse(raw);
        viaFallback = true;
      }
      if (!data) throw new Error("malformed data");
      // Pre-Apeiron files were a flat { accessories, selectedId } shape, implicitly Ekleta.
      const sets = data.sets || (data.accessories ? { ekleta: data } : null);
      const setState = sets && sets[SET_KEY];
      if (!setState || !setState.accessories) throw new Error("no data for set '" + SET_KEY + "'");
      lastLoadedAt = Date.now();
      hasLoadedOnce = true;
      usingLocalStorageFallback = viaFallback;
      render(setState);
      updateDebug(viaFallback ? "ok (browser preview)" : "ok");
    } catch (err) {
      if (!hasLoadedOnce) {
        root.innerHTML = `<div class="overlay-empty">Waiting for ${escapeHtml(FILE)} (${escapeHtml(SET_KEY)})&hellip;</div>`;
      }
      // Otherwise keep showing the last good render — don't flash errors mid-stream.
      updateDebug("error: " + err.message);
    }
  }

  poll();
  setInterval(poll, INTERVAL);
})();
