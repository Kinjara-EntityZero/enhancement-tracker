(function () {
  "use strict";

  const STORAGE_KEY = "bdo-enhancement-tracker-v1";
  const CHANGELOG_SEEN_KEY = "bdo-enhancement-tracker-changelog-seen";

  // Manually maintained, newest first. Add an entry here whenever a change ships.
  const CHANGELOG = [
    {
      date: "2026-09-04",
      title: "Pity is no longer counted as a success",
      items: [
        "A success that only happened because your pity stack hit the guaranteed threshold is now split out as its own \"Pity\" outcome, separate from a genuine (lucky) success, everywhere stats are shown — the detail panel, Overall History, the Overview tab, share cards, and the Ekleta overlay.",
        "A pity proc no longer breaks a fail streak: fail, fail, ..., pity, fail, fail now counts as one continuous streak instead of resetting.",
        "Rates by Level now shows successes/pity/fails as three explicit numbers (green/blue/red) instead of folding pity into the success count, and \"tries\" is now labeled \"taps\".",
      ],
    },
    {
      date: "2026-09-04",
      title: "Stats for Nerds",
      items: [
        "New collapsible \"Stats for Nerds\" section on each item: a days-to-Dec projection at your current pace, busiest day, longest dry spell, pace, and (Ekleta only) a luck score versus the community average.",
        "Luckiest/Cursed Accessory: which piece in the set has the best and worst success rate so far.",
        "An hour-of-day histogram of when you tend to log attempts.",
        "Overview tab now also shows a lifetime total across all 5 sets combined, and every set card/streak flag is caught up with the pity split and the fire/ice streak coloring.",
      ],
    },
    {
      date: "2026-09-02",
      title: "What's New panel",
      items: [
        "Added this changelog so you can see what's changed as the tracker gets updated.",
      ],
    },
    {
      date: "2026-09-02",
      title: "Ekleta overlay vs-average comparison",
      items: [
        "The Ekleta OBS overlay now shows how your attempts compare to the community average per level, matching the main tracker.",
      ],
    },
    {
      date: "2026-08-28",
      title: "Ekleta vs community average",
      items: [
        "Ekleta's Rates by Level now shows how many tries you needed for each level next to the community average, color-coded for lucky/unlucky.",
      ],
    },
    {
      date: "2026-08-24",
      title: "Streak icons: fire vs ice",
      items: [
        "Current/longest streaks now show a fire icon for a run of successes and an ice cube for a run of fails, colored red/blue to match.",
        "The Overall History panel now shows its own current/longest streak too, not just the per-item detail view.",
      ],
    },
    {
      date: "2026-08-21",
      title: "Safer save-file linking",
      items: [
        "Linking or reconnecting a save file now checks whether the picked file already has real data in it and asks before overwriting, instead of silently replacing it.",
      ],
    },
    {
      date: "2026-08-21",
      title: "Overlays tab",
      items: [
        "Added an \"Overlays\" tab with downloadable, ready-to-use OBS overlay bundles (icon art + setup guide included), and a live in-browser preview for every gear set.",
      ],
    },
    {
      date: "2026-08-21",
      title: "Initial release",
      items: [
        "Tracker for Ekleta, Apeiron, Edana, Sovereign, and Alchemy Stones, each with its own pity table, level ladder, and theme.",
        "An \"Overview\" tab: all-sets dashboard, cross-set activity feed, and fail-streak tracking.",
        "Shareable summary cards you can download as an image.",
        "Roman-numeral badges on enhancement icons, per-level rate breakdowns, and matching OBS Browser Source overlays for every set.",
      ],
    },
  ];

  const {
    SETS, SET_ORDER,
    nextLevel, isMaxed, freshSetState,
    computeStats, isPityEntry, currentFailStreak, longestFailStreak, currentStreak, longestStreak, levelBreakdown, normalizeState,
    detectClassVariants, getPieceOverride, detectLevelVariants, romanNumeralFor
  } = window.EnhancementShared;

  // The little roman-numeral badge painted over an accessory's icon (Pri->I ... Dec->X).
  // Returns "" for levels with no numeral (Base, or a non-standard ladder like Alchemy's).
  function romanOverlayHtml(level) {
    const numeral = romanNumeralFor(level);
    return numeral ? `<span class="roman-numeral">${numeral}</span>` : "";
  }

  // ---------- What's New (changelog) ----------

  function hasUnseenChangelog() {
    const seen = localStorage.getItem(CHANGELOG_SEEN_KEY);
    return !seen || seen < CHANGELOG[0].date;
  }

  function updateChangelogDot() {
    const dot = document.getElementById("changelog-dot");
    if (dot) dot.classList.toggle("show", hasUnseenChangelog());
  }

  function formatChangelogDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function closeChangelog() {
    document.getElementById("changelog-modal-root").innerHTML = "";
  }

  function openChangelog() {
    const root = document.getElementById("changelog-modal-root");
    root.innerHTML = `
      <div class="modal-backdrop" id="changelog-backdrop">
        <div class="modal-box changelog-modal">
          <div class="modal-header">
            <h2>What's New</h2>
            <button id="btn-close-changelog" class="modal-close" title="Close">&times;</button>
          </div>
          <div class="changelog-list">
            ${CHANGELOG.map((entry) => `
              <div class="changelog-entry">
                <div class="changelog-date">${formatChangelogDate(entry.date)}</div>
                <div class="changelog-title">${escapeHtml(entry.title)}</div>
                <ul class="changelog-items">
                  ${entry.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
    document.getElementById("changelog-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "changelog-backdrop") closeChangelog();
    });
    document.getElementById("btn-close-changelog").addEventListener("click", closeChangelog);

    localStorage.setItem(CHANGELOG_SEEN_KEY, CHANGELOG[0].date);
    updateChangelogDot();
  }

  document.getElementById("btn-changelog").addEventListener("click", openChangelog);

  // ---------- Stats for Nerds ----------
  // Deeper, opt-in stats computed straight from one item's log — pity behavior, pacing, and
  // timing patterns that aren't interesting enough for the main stats row but are fun to dig
  // into. "adjust" entries are never real clicks, so every stat here ignores them.

  function msToDuration(ms) {
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  function computeNerdStats(setDef, acc) {
    const real = acc.log.filter((e) => e.type === "success" || e.type === "fail");

    const dayCounts = new Map();
    real.forEach((e) => {
      const day = new Date(e.timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    let busiestDay = null;
    dayCounts.forEach((count, day) => {
      if (!busiestDay || count > busiestDay.count) busiestDay = { day, count };
    });

    const sorted = real.slice().sort((a, b) => a.timestamp - b.timestamp);
    let longestGapMs = 0;
    for (let i = 1; i < sorted.length; i++) {
      longestGapMs = Math.max(longestGapMs, sorted[i].timestamp - sorted[i - 1].timestamp);
    }

    const elapsedMs = sorted.length >= 2 ? sorted[sorted.length - 1].timestamp - sorted[0].timestamp : 0;
    const elapsedDays = Math.max(1, Math.round(elapsedMs / 86400000));
    const pacePerDay = real.length ? real.length / Math.max(1, dayCounts.size) : 0;

    const hourCounts = new Array(24).fill(0);
    real.forEach((e) => hourCounts[new Date(e.timestamp).getHours()]++);

    return { total: real.length, busiestDay, longestGapMs, elapsedDays, activeDays: dayCounts.size, pacePerDay, hourCounts };
  }

  // Rough projection: sum of the community average attempts for every level between the
  // current one and the ladder's last level, divided by this item's own current pace. Only
  // meaningful for sets that define avgAttempts (currently just Ekleta), and doesn't account
  // for pity already banked toward the next level -- a ballpark, not a promise.
  function computeDaysToMax(setDef, acc, pacePerDay) {
    if (!setDef.avgAttempts || !pacePerDay) return null;
    const levels = setDef.levels;
    const maxLevel = levels[levels.length - 1];
    if (acc.currentLevel === maxLevel) return { maxed: true, maxLevel };
    const curIdx = levels.indexOf(acc.currentLevel);
    if (curIdx === -1) return null;
    let remainingAttempts = 0;
    for (let i = curIdx + 1; i < levels.length; i++) {
      const avg = setDef.avgAttempts[levels[i]];
      if (avg != null) remainingAttempts += avg;
    }
    return { maxed: false, maxLevel, remainingAttempts, days: remainingAttempts / pacePerDay };
  }

  // Which piece in the current set has the best/worst success rate, so far — needs at least
  // two tracked pieces with real attempts logged to be a meaningful comparison.
  function computeSetLeaderboard(setDef, setState) {
    const rows = setDef.accessories
      .filter((a) => pieceStatus(setDef, setState, a.id).kind === "normal")
      .map((a) => ({ name: setState.accessories[a.id].name, ...computeStats(setState.accessories[a.id].log, setDef.pityThreshold) }))
      .filter((r) => r.total > 0);
    if (rows.length < 2) return null;
    const best = rows.slice().sort((a, b) => b.rate - a.rate || a.total - b.total)[0];
    const worst = rows.slice().sort((a, b) => a.rate - b.rate || b.total - a.total)[0];
    if (best === worst) return null;
    return { best, worst };
  }

  // Sum of (your attempts - community average) across every level you've cleared on this
  // item, for sets that define avgAttempts (currently just Ekleta). Negative = luckier than
  // average overall; positive = unluckier.
  function computeLuckScore(setDef, acc) {
    if (!setDef.avgAttempts) return null;
    const rows = levelBreakdown(acc.log, setDef.levels, setDef.pityThreshold).filter((r) => r.cleared);
    if (!rows.length) return null;
    let score = 0;
    rows.forEach((r) => {
      const avg = setDef.avgAttempts[r.level];
      if (avg != null) score += r.attempts - avg;
    });
    return { score, levelsCleared: rows.length };
  }

  function hourHistogramHtml(hourCounts) {
    const max = Math.max(1, ...hourCounts);
    return `
      <div class="nerd-histogram" title="Attempts logged by hour of day (your local time)">
        ${hourCounts.map((c) => `<div class="nerd-histogram-bar" style="height:${Math.round((c / max) * 100)}%" title="${c} at this hour"></div>`).join("")}
      </div>
      <div class="nerd-histogram-labels"><span>12am</span><span>12pm</span><span>11pm</span></div>
    `;
  }

  function daysToMaxHtml(info) {
    if (!info) return "";
    if (info.maxed) {
      return nerdStatHtml(`Days to ${info.maxLevel.toUpperCase()}`, "&#9733;", "already maxed");
    }
    const approx = info.days >= 730 ? ` (~${(info.days / 365).toFixed(1)}y)` : info.days >= 60 ? ` (~${(info.days / 30).toFixed(1)}mo)` : "";
    return nerdStatHtml(
      `Days to ${info.maxLevel.toUpperCase()}`,
      `${info.days.toFixed(1)}${approx}`,
      `at your current pace &mdash; ~${info.remainingAttempts.toFixed(1)} attempts left, on average`
    );
  }

  function nerdStatHtml(label, value, sub) {
    return `
      <div class="nerd-stat">
        <div class="nerd-stat-label">${label}</div>
        <div class="nerd-stat-value">${value}</div>
        ${sub ? `<div class="nerd-stat-sub">${sub}</div>` : ""}
      </div>
    `;
  }

  function nerdStatsBlockHtml(setDef, setState, acc) {
    const n = computeNerdStats(setDef, acc);
    if (!n.total) {
      return `
        <div class="card-block nerd-stats-block">
          ${nerdStatsToggleHtml()}
          ${statsForNerdsOpen ? `<div class="nerd-stats-empty">Log a few attempts to unlock these.</div>` : ""}
        </div>
      `;
    }

    const luck = computeLuckScore(setDef, acc);
    const leaderboard = computeSetLeaderboard(setDef, setState);
    const daysToMax = computeDaysToMax(setDef, acc, n.pacePerDay);

    return `
      <div class="card-block nerd-stats-block">
        ${nerdStatsToggleHtml()}
        ${statsForNerdsOpen ? `
          <div class="nerd-stats-grid">
            ${daysToMaxHtml(daysToMax)}
            ${nerdStatHtml(
              "Busiest day",
              n.busiestDay ? n.busiestDay.count : "&mdash;",
              n.busiestDay ? `attempts on ${n.busiestDay.day}` : ""
            )}
            ${nerdStatHtml(
              "Longest dry spell",
              n.longestGapMs ? msToDuration(n.longestGapMs) : "&mdash;",
              "between two attempts"
            )}
            ${nerdStatHtml(
              "Pace",
              n.pacePerDay.toFixed(1),
              `attempts/active day &middot; ${n.activeDays} active day${n.activeDays === 1 ? "" : "s"} over ${n.elapsedDays} day${n.elapsedDays === 1 ? "" : "s"}`
            )}
            ${luck ? nerdStatHtml(
              "Luck score",
              `${luck.score > 0 ? "+" : ""}${luck.score.toFixed(1)}`,
              `vs average across ${luck.levelsCleared} cleared level${luck.levelsCleared === 1 ? "" : "s"} &mdash; ${luck.score < 0 ? "luckier" : luck.score > 0 ? "unluckier" : "dead on"} than average`
            ) : ""}
          </div>
          ${leaderboard ? `
            <div class="nerd-stats-grid nerd-stats-grid-2">
              ${nerdStatHtml("Luckiest Accessory", escapeHtml(leaderboard.best.name), `${leaderboard.best.rate}% success rate`)}
              ${nerdStatHtml("Cursed Accessory", escapeHtml(leaderboard.worst.name), `${leaderboard.worst.rate}% success rate`)}
            </div>
          ` : ""}
          <div class="nerd-stats-caption">Attempts by hour of day</div>
          ${hourHistogramHtml(n.hourCounts)}
        ` : ""}
      </div>
    `;
  }

  function nerdStatsToggleHtml() {
    return `
      <button class="nerd-stats-toggle" id="btn-toggle-nerd-stats">
        <h3>Stats for Nerds</h3>
        <span class="nerd-stats-caret">${statsForNerdsOpen ? "&#9650;" : "&#9660;"}</span>
      </button>
    `;
  }

  // `log` must be in chronological (oldest-first) order — the same array a pity stack would
  // have been built from. Used both for a single item's log and for a merged, re-sorted
  // multi-item timeline (Overall History), where it reads as "how many of the most recent
  // attempts across everything shown here, in the order they happened, were fails."
  // A flame for a run of successes, an ice cube for a run of fails.
  function streakPillHtml(label, streak) {
    if (!streak.count) return "";
    const hot = streak.type === "success";
    const singular = hot ? "success" : "fail";
    const plural = hot ? "successes" : "fails";
    const word = streak.count === 1 ? singular : plural;
    const icon = hot ? "\u{1F525}" : "\u{1F9CA}";
    return `<span class="streak-pill ${hot ? "hot" : "cold"}">${icon} ${label}: ${streak.count} ${word}</span>`;
  }

  // "vs average" comparison for one Rates-by-Level row, if this set defines community averages
  // (currently just Ekleta). Cleared levels get a colored delta (fewer tries than average is
  // lucky/green, more is unlucky/red); an in-progress level just shows the average as a plain
  // reference point, since partial attempts aren't meaningfully comparable to a full average yet.
  function avgAttemptsHtml(setDef, row) {
    if (!setDef.avgAttempts) return "";
    const avg = setDef.avgAttempts[row.level];
    if (avg == null) return "";
    if (!row.cleared) {
      return `<span class="level-rate-avg">avg ${avg.toFixed(2)}</span>`;
    }
    const delta = row.attempts - avg;
    const sign = delta > 0 ? "+" : "";
    const cls = delta < 0 ? "good" : delta > 0 ? "bad" : "";
    return `<span class="level-rate-avg">avg ${avg.toFixed(2)}</span><span class="level-rate-delta ${cls}">${sign}${delta.toFixed(2)} vs avg</span>`;
  }

  function streakRowHtml(log, pityThreshold, centered) {
    const cur = currentStreak(log, pityThreshold);
    const longest = longestStreak(log, pityThreshold);
    if (!longest.count) return "";
    return `
      <div class="streak-row${centered ? " centered" : ""}">
        ${streakPillHtml("Current streak", cur)}
        ${streakPillHtml("Longest streak", longest)}
      </div>
    `;
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function loadState() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      raw = null;
    }
    return normalizeState(raw);
  }

  let state = loadState();
  let overallFilter = "all";
  let statsForNerdsOpen = false;

  // The set (Ekleta / Apeiron / Edana / Sovereign / ...) currently shown in the UI, and its config/state shortcuts.
  function activeSetDef() {
    return SETS[state.activeSet];
  }
  function activeSetState() {
    return state.sets[state.activeSet];
  }

  // ---------- classVariant image detection (Sovereign weapons: pick which class's icons to show) ----------
  // Keyed by set key -> { availableClasses: [...], icons: { ClassName: { accId: "path", ... } } }.
  // Populated asynchronously (image probing) and re-rendered once ready; not persisted.
  const classVariantCache = {};

  function loadClassVariants(setKey) {
    const def = SETS[setKey];
    detectClassVariants(def).then((result) => {
      classVariantCache[setKey] = result;
      const setState = state.sets[setKey];
      if (!setState.selectedClass || !result.availableClasses.includes(setState.selectedClass)) {
        setState.selectedClass = result.availableClasses[0] || null;
        save();
      }
      if (state.activeSet === setKey || state.activeSet === "overview") render();
    });
  }

  // ---------- levelVariant image detection (Alchemy stones: icon depends on the piece's own level) ----------
  // Keyed by set key -> { accId: { LevelName: "path"|null, ... }, ... }. Populated once at
  // startup (no user choice involved, unlike classVariant) and re-rendered when ready.
  const levelVariantCache = {};

  function loadLevelVariants(setKey) {
    const def = SETS[setKey];
    detectLevelVariants(def).then((result) => {
      levelVariantCache[setKey] = result;
      if (state.activeSet === setKey || state.activeSet === "overview") render();
    });
  }

  // Resolves the actual <img> src for an accessory: a fixed per-set icon, the currently
  // selected class's resolved icon (classVariant, e.g. Sovereign), or this piece's own current
  // level's resolved icon (levelVariant, e.g. Alchemy stones).
  function getAccessoryIcon(setDef, setState, accId) {
    if (setDef.classVariant) {
      const cache = classVariantCache[setDef.key];
      const cls = setState.selectedClass;
      if (cache && cls && cache.icons[cls]) return cache.icons[cls][accId] || "";
      return "";
    }
    if (setDef.levelVariant) {
      const cache = levelVariantCache[setDef.key];
      const acc = setState.accessories[accId];
      if (cache && cache[accId]) return cache[accId][acc.currentLevel] || "";
      return "";
    }
    return setState.accessories[accId].icon;
  }

  // Whether a piece renders/behaves normally, is class-overridden (has art but isn't
  // enhancement-tracked — e.g. Shai's fixed-PEN "awakening" slot), or has no image at all for
  // the currently selected class (shows as a muted "Not Available" placeholder). Only
  // meaningful for classVariant sets — everything else is always "normal".
  function pieceStatus(setDef, setState, accId) {
    if (!setDef.classVariant) return { kind: "normal" };
    const cls = setState.selectedClass;
    const override = cls ? getPieceOverride(cls, accId) : null;
    if (override) return { kind: "locked", fixedLevel: override.fixedLevel };
    const cache = classVariantCache[setDef.key];
    const hasIcon = !!(cls && cache && cache.icons[cls] && cache.icons[cls][accId]);
    return hasIcon ? { kind: "normal" } : { kind: "unavailable" };
  }

  // If the currently selected piece isn't actually interactive (locked or unavailable for the
  // current class), fall back to the first normal one so the detail panel never gets stuck on
  // something you can't have navigated to on purpose (e.g. after switching class).
  function ensureValidSelection(setDef, setState) {
    if (!setDef.classVariant) return;
    if (pieceStatus(setDef, setState, setState.selectedId).kind === "normal") return;
    const fallback = setDef.accessories.find((a) => pieceStatus(setDef, setState, a.id).kind === "normal");
    if (fallback) setState.selectedId = fallback.id;
  }

  // Whether every normally-tracked piece in the set has hit max level. Locked/unavailable
  // pieces (Shai's fixed-PEN awakening, a class missing its awakening image, ...) don't count
  // against this — they aren't really "in progress" in the first place.
  function isSetFullyMaxed(setDef, setState) {
    return setDef.accessories.every((a) => {
      if (pieceStatus(setDef, setState, a.id).kind !== "normal") return true;
      return isMaxed(setState.accessories[a.id].currentLevel, setDef.levels);
    });
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    queueFileSync();
  }

  // ---------- Linked save file (File System Access API) ----------
  // Chromium browsers (Chrome/Edge) only. Firefox/Safari fall back to manual Export/Import.

  const FS_SUPPORTED = "showSaveFilePicker" in window && "indexedDB" in window;
  const IDB_NAME = "enhancement-tracker-fs";
  const IDB_STORE = "handles";
  const IDB_KEY = "saveFileHandle";

  let fileHandle = null;
  let pendingHandle = null;
  let fileSyncTimer = null;
  let fileStatus = "none"; // none | linked | pending-permission | error

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSet(key, val) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbGet(key) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function writeStateToFile() {
    if (!fileHandle) return;
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(state, null, 2));
      await writable.close();
      fileStatus = "linked";
    } catch (err) {
      fileStatus = "error";
    }
    renderFileStatus();
  }

  function queueFileSync() {
    if (!fileHandle) return;
    clearTimeout(fileSyncTimer);
    fileSyncTimer = setTimeout(writeStateToFile, 400);
  }

  async function tryReconnectFile() {
    if (!FS_SUPPORTED) return;
    try {
      const handle = await idbGet(IDB_KEY);
      if (!handle) return;
      const perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm === "granted") {
        fileHandle = handle;
        fileStatus = "linked";
      } else {
        pendingHandle = handle;
        fileStatus = "pending-permission";
      }
    } catch (e) {
      // Handle no longer valid (file moved/deleted) — ignore, user can relink.
    }
    renderFileStatus();
  }

  // Shared by linkNewFile() and reconnectFile() — both end up (re)pointing this write-only
  // sync at a file handle, and either one could be pointing at a file that already has real
  // (possibly different) data in it. Returns true if it's safe to proceed and overwrite the
  // file from here on, false if the caller should abort without touching anything.
  async function checkExistingFileBeforeOverwrite(handle) {
    let existingFile;
    try {
      existingFile = await handle.getFile();
    } catch (e) {
      showToast("Couldn't read the existing file — canceled");
      return false;
    }

    if (existingFile.size === 0) return true;

    let parsed = null;
    try {
      parsed = JSON.parse(await existingFile.text());
    } catch (e) {
      // Not valid JSON — still not empty, so still worth confirming below.
    }
    const looksLikeTrackerData = parsed && (parsed.sets || parsed.accessories);

    if (looksLikeTrackerData) {
      const useExisting = confirm(
        "That file already has enhancement tracker data in it.\n\n" +
        "OK — load that file's data into this tracker (use it as your save).\n" +
        "Cancel — keep what's currently shown here, and overwrite the file with it instead."
      );
      if (useExisting) {
        state = normalizeState(parsed);
        save();
        render();
      }
      return true;
    }

    const overwriteAnyway = confirm(
      "That file already has content in it that doesn't look like tracker data.\n\n" +
      "OK — overwrite it with this tracker's current data.\n" +
      "Cancel — leave the file alone and cancel."
    );
    if (!overwriteAnyway) {
      showToast("Canceled");
      return false;
    }
    return true;
  }

  async function linkNewFile() {
    if (!FS_SUPPORTED) {
      showToast("Your browser doesn't support direct file saving — use Export/Import instead");
      return;
    }
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "enhancement-tracker.json",
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
      });

      // Linking is a write-only connection from here on — it overwrites the picked file on
      // every change from now on, so if it already has something in it (an old save, a
      // different device's export, ...) that's worth checking before committing to that.
      if (!(await checkExistingFileBeforeOverwrite(handle))) return;

      fileHandle = handle;
      pendingHandle = null;
      await idbSet(IDB_KEY, handle);
      await writeStateToFile();
      showToast("Linked — changes will now auto-save to this file");
    } catch (err) {
      if (err.name !== "AbortError") showToast("Could not link file");
    }
  }

  async function reconnectFile() {
    if (!pendingHandle) return;
    try {
      const perm = await pendingHandle.requestPermission({ mode: "readwrite" });
      if (perm !== "granted") { renderFileStatus(); return; }

      // Same risk as a fresh link: this browser's current state might not match what's
      // actually in the file anymore (localStorage cleared, different profile, ...), and
      // reconnecting would otherwise silently overwrite it with no check at all.
      if (!(await checkExistingFileBeforeOverwrite(pendingHandle))) { renderFileStatus(); return; }

      fileHandle = pendingHandle;
      pendingHandle = null;
      showToast("Reconnected to save file");
      await writeStateToFile();
    } catch (e) {
      showToast("Could not reconnect");
    }
    renderFileStatus();
  }

  async function unlinkFile() {
    fileHandle = null;
    pendingHandle = null;
    fileStatus = "none";
    await idbSet(IDB_KEY, null);
    renderFileStatus();
  }

  function renderFileStatus() {
    const el = document.getElementById("file-sync");
    if (!FS_SUPPORTED) {
      el.innerHTML = "";
      return;
    }
    if (fileStatus === "linked" && fileHandle) {
      el.innerHTML = `
        <div class="file-sync-badge" title="Every change auto-saves to this file">
          <span class="dot synced"></span>
          <span class="fname">${escapeHtml(fileHandle.name)}</span>
          <button id="btn-unlink-file" title="Stop auto-saving to this file">&times;</button>
        </div>
      `;
      document.getElementById("btn-unlink-file").addEventListener("click", unlinkFile);
    } else if (fileStatus === "pending-permission" && pendingHandle) {
      el.innerHTML = `
        <div class="file-sync-pending" title="Re-grant access to continue auto-saving to this file, or forget it to pick a different one">
          <button class="btn btn-ghost" id="btn-reconnect-file">Reconnect save file</button>
          <button class="file-sync-forget" id="btn-unlink-file" title="Forget this file — lets you link a different one instead">&times;</button>
        </div>
      `;
      document.getElementById("btn-reconnect-file").addEventListener("click", reconnectFile);
      document.getElementById("btn-unlink-file").addEventListener("click", unlinkFile);
    } else if (fileStatus === "error") {
      el.innerHTML = `
        <div class="file-sync-badge" title="Last write failed — check the file still exists">
          <span class="dot error"></span>
          <span class="fname">Save failed</span>
          <button id="btn-unlink-file" title="Unlink">&times;</button>
        </div>
      `;
      document.getElementById("btn-unlink-file").addEventListener("click", unlinkFile);
    } else {
      el.innerHTML = `<button class="btn btn-ghost" id="btn-link-file" title="Pick a JSON file to auto-save to on every change">Link Save File&hellip;</button>`;
      document.getElementById("btn-link-file").addEventListener("click", linkNewFile);
    }
  }

  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    });
  }

  // ---------- Mutations ----------

  function logAttempt(accId, result) {
    const acc = activeSetState().accessories[accId];
    const setDef = activeSetDef();
    if (isMaxed(acc.currentLevel, setDef.levels)) return;
    const target = nextLevel(acc.currentLevel, setDef.levels);
    const threshold = setDef.pityThreshold[target];
    if (result === "fail" && acc.pityStack >= threshold) return;

    const levelBefore = acc.currentLevel;
    const pityBefore = acc.pityStack;
    let levelAfter, pityAfter;

    if (result === "success") {
      levelAfter = target;
      pityAfter = 0;
    } else {
      levelAfter = levelBefore;
      pityAfter = pityBefore + 1;
    }

    acc.currentLevel = levelAfter;
    acc.pityStack = pityAfter;
    acc.log.push({
      id: genId(),
      type: result,
      timestamp: Date.now(),
      targetLevel: target,
      levelBefore, levelAfter,
      pityBefore, pityAfter
    });
    save();
    render();
  }

  function undoLast(accId) {
    const acc = activeSetState().accessories[accId];
    const last = acc.log.pop();
    if (!last) return;
    acc.currentLevel = last.levelBefore;
    acc.pityStack = last.pityBefore;
    save();
    render();
  }

  function manualSetLevel(accId, level, pity) {
    const acc = activeSetState().accessories[accId];
    const levelBefore = acc.currentLevel;
    const pityBefore = acc.pityStack;
    if (level === levelBefore && pity === pityBefore) return;
    acc.currentLevel = level;
    acc.pityStack = pity;
    acc.log.push({
      id: genId(),
      type: "adjust",
      timestamp: Date.now(),
      targetLevel: level,
      levelBefore, levelAfter: level,
      pityBefore, pityAfter: pity
    });
    save();
    render();
    showToast("Level manually updated");
  }

  function deleteHistoryEntry(accId, entryId) {
    const acc = activeSetState().accessories[accId];
    const idx = acc.log.findIndex((e) => e.id === entryId);
    if (idx === -1) return;
    const isLast = idx === acc.log.length - 1;
    if (!isLast) {
      showToast("Only the most recent entry can be removed");
      return;
    }
    acc.log.pop();
    acc.currentLevel = acc.log.length
      ? acc.log[acc.log.length - 1].levelAfter
      : "Base";
    acc.pityStack = acc.log.length
      ? acc.log[acc.log.length - 1].pityAfter
      : 0;
    save();
    render();
  }

  function renameAccessory(accId, name) {
    const acc = activeSetState().accessories[accId];
    acc.name = name.trim() || acc.name;
    save();
    renderGrid();
    renderOverallHistory();
  }

  // ---------- Rendering ----------

  function render() {
    renderTabs();
    const overview = state.activeSet === "overview";
    const overlays = state.activeSet === "overlays";
    const normal = !overview && !overlays;
    document.getElementById("accessory-grid").style.display = normal ? "" : "none";
    document.getElementById("detail-panel").style.display = normal ? "" : "none";
    document.getElementById("overall-panel").style.display = normal ? "" : "none";
    document.getElementById("overview-panel").style.display = overview ? "block" : "none";
    document.getElementById("overlays-panel").style.display = overlays ? "block" : "none";
    if (overview) {
      renderOverviewPanel();
    } else if (overlays) {
      renderOverlaysPanel();
    } else {
      renderGrid();
      renderDetail();
      renderOverallHistory();
    }
  }

  // Markup for the "Weapon Class" card-block (Sovereign-style classVariant sets only) —
  // rendered as its own box stacked under "Manually Set Level / Pity" in the detail panel.
  function classPickerBoxHtml(setDef, setState) {
    if (!setDef.classVariant) return "";
    const cache = classVariantCache[setDef.key];

    let inner;
    if (!cache) {
      inner = `<div class="class-picker-status">Detecting available ${setDef.label} classes&hellip;</div>`;
    } else if (!cache.availableClasses.length) {
      inner = `<div class="class-picker-status">No class image folders found. Add one at <code>Images/${setDef.imageFolder}/&lt;ClassName&gt;/</code> with mainhand/awakening/offhand images.</div>`;
    } else {
      inner = `
        <div class="set-level-form">
          <div class="form-row">
            <label for="class-select">Class</label>
            <select id="class-select">
              ${cache.availableClasses.map((c) => `<option value="${c}" ${c === setState.selectedClass ? "selected" : ""}>${c}</option>`).join("")}
            </select>
          </div>
        </div>
      `;
    }

    return `<div class="card-block"><h3>Weapon Class</h3>${inner}</div>`;
  }

  function renderTabs() {
    const isPseudoTab = state.activeSet === "overview" || state.activeSet === "overlays";
    document.body.dataset.theme = isPseudoTab ? "" : activeSetDef().theme || "";

    const el = document.getElementById("set-tabs");
    const overviewBtn = `<button class="set-tab overview-tab${state.activeSet === "overview" ? " active" : ""}" data-set="overview">&#9733; Overview</button>`;
    const overlaysBtn = `<button class="set-tab overview-tab${state.activeSet === "overlays" ? " active" : ""}" data-set="overlays">&#8862; Overlays</button>`;
    const setBtns = SET_ORDER.map((key) => {
      const def = SETS[key];
      return `<button class="set-tab${key === state.activeSet ? " active" : ""}" data-set="${key}" data-theme="${def.theme || ""}">${def.label}</button>`;
    }).join("");
    el.innerHTML = overviewBtn + overlaysBtn + setBtns;
    el.querySelectorAll(".set-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.set === state.activeSet) return;
        state.activeSet = btn.dataset.set;
        save();
        render();
      });
    });

    const resetBtn = document.getElementById("btn-reset-all");
    resetBtn.style.display = isPseudoTab ? "none" : "";
    if (!isPseudoTab) {
      resetBtn.textContent = `Reset ${activeSetDef().label}`;
      resetBtn.title = `Erase all ${activeSetDef().label} ${categoryLabel(activeSetDef())} and history (the other sets are untouched)`;
    }
  }

  const CATEGORY_LABELS = { accessory: "accessories", armor: "armor pieces", weapon: "weapons", alchemy: "alchemy stones" };
  function categoryLabel(setDef) {
    return CATEGORY_LABELS[setDef.category] || "items";
  }

  function renderGrid() {
    const grid = document.getElementById("accessory-grid");
    grid.innerHTML = "";
    const setDef = activeSetDef();
    const setState = activeSetState();
    ensureValidSelection(setDef, setState);

    setDef.accessories.forEach((def) => {
      const acc = setState.accessories[def.id];
      const status = pieceStatus(setDef, setState, acc.id);
      const iconSrc = getAccessoryIcon(setDef, setState, acc.id);
      const card = document.createElement("div");

      if (status.kind === "unavailable") {
        card.className = "acc-card unavailable";
        card.innerHTML = `
          <div class="acc-icon-wrap"></div>
          <div class="acc-name">${escapeHtml(acc.name)}</div>
          <div class="unavailable-overlay">Not Available</div>
        `;
        grid.appendChild(card);
        return;
      }

      if (status.kind === "locked") {
        card.className = "acc-card locked";
        card.innerHTML = `
          <div class="acc-icon-wrap">${iconSrc ? `<img src="${iconSrc}" alt="${acc.type}">` : ""}${romanOverlayHtml(status.fixedLevel)}</div>
          <div class="acc-name">${escapeHtml(acc.name)}</div>
          <div class="acc-level-badge">${status.fixedLevel.toUpperCase()}</div>
        `;
        grid.appendChild(card);
        return;
      }

      const maxed = isMaxed(acc.currentLevel, setDef.levels);
      const target = nextLevel(acc.currentLevel, setDef.levels);
      const threshold = target ? setDef.pityThreshold[target] : 1;
      const pct = maxed ? 100 : Math.min(100, (acc.pityStack / threshold) * 100);
      const ready = !maxed && acc.pityStack >= threshold;

      card.className = "acc-card" + (acc.id === setState.selectedId ? " selected" : "");
      card.innerHTML = `
        <div class="acc-icon-wrap">${iconSrc ? `<img src="${iconSrc}" alt="${acc.type}">` : ""}${romanOverlayHtml(acc.currentLevel)}</div>
        <div class="acc-name">${escapeHtml(acc.name)}</div>
        <div class="acc-level-badge${maxed ? " maxed" : ""}">${maxed ? "MAX &bull; " + acc.currentLevel.toUpperCase() : acc.currentLevel}</div>
        <div class="acc-mini-pity${ready ? " ready" : ""}"><div style="width:${pct}%"></div></div>
      `;
      card.addEventListener("click", () => {
        setState.selectedId = acc.id;
        save();
        render();
      });
      grid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function renderDetail() {
    const panel = document.getElementById("detail-panel");
    const setDef = activeSetDef();
    const setState = activeSetState();
    const acc = setState.accessories[setState.selectedId];
    if (!acc) {
      panel.innerHTML = `<div class="empty-state">Select an accessory above to get started.</div>`;
      return;
    }

    const maxed = isMaxed(acc.currentLevel, setDef.levels);
    const target = nextLevel(acc.currentLevel, setDef.levels);
    const threshold = target ? setDef.pityThreshold[target] : 0;
    const ready = !maxed && acc.pityStack >= threshold;

    const { total, successes, pity, fails, rate } = computeStats(acc.log, setDef.pityThreshold);
    const levelRows = levelBreakdown(acc.log, setDef.levels, setDef.pityThreshold);
    const iconSrc = getAccessoryIcon(setDef, setState, acc.id);
    const setFullyMaxed = maxed && isSetFullyMaxed(setDef, setState);

    function statsRowHtml(caption, stats, centered) {
      return `
        <div class="stats-caption">${caption}</div>
        <div class="stats-row${centered ? " centered" : ""}">
          <div class="stat"><div class="val">${stats.total}</div><div class="lbl">Attempts</div></div>
          <div class="stat"><div class="val">${stats.successes}</div><div class="lbl">Successes</div></div>
          <div class="stat"><div class="val">${stats.pity}</div><div class="lbl">Pity</div></div>
          <div class="stat"><div class="val">${stats.fails}</div><div class="lbl">Fails</div></div>
          <div class="stat"><div class="val">${stats.rate}%</div><div class="lbl">Success Rate</div></div>
        </div>
      `;
    }

    // The box that pairs with "Manually Set Level / Pity" — normal pity progress, a per-item
    // "maxed" celebration, or (once every piece in the set is done) a set-wide one. Always
    // rendered so the two boxes stay the same height regardless of state.
    let leftBoxHtml;
    if (setFullyMaxed) {
      const allLogs = setDef.accessories.flatMap((a) => setState.accessories[a.id].log);
      leftBoxHtml = `
        <div class="card-block maxed-celebration">
          <div class="maxed-celebration-title">★ Everything Max Level</div>
          ${statsRowHtml(`Overall &mdash; every level combined, all ${categoryLabel(setDef)}`, computeStats(allLogs, setDef.pityThreshold), true)}
          ${streakRowHtml(allLogs, setDef.pityThreshold, true)}
          <div class="undo-row centered">
            <button id="btn-undo" ${acc.log.length ? "" : "disabled"}>Undo ${escapeHtml(acc.name)}'s last log entry</button>
          </div>
        </div>
      `;
    } else if (maxed) {
      leftBoxHtml = `
        <div class="card-block maxed-celebration">
          <div class="maxed-celebration-title">★ Max Level Reached</div>
          ${statsRowHtml("Overall &mdash; every level combined", { total, successes, pity, fails, rate }, true)}
          ${streakRowHtml(acc.log, setDef.pityThreshold, true)}
          <div class="undo-row centered">
            <button id="btn-undo" ${acc.log.length ? "" : "disabled"}>Undo last log entry</button>
          </div>
        </div>
      `;
    } else {
      leftBoxHtml = `
        <div class="card-block">
          <h3>Pity Progress &mdash; toward ${target.toUpperCase()}</h3>
          <div class="pity-track">
            <div class="pity-bar${ready ? " ready" : ""}"><div style="width:${Math.min(100, (acc.pityStack / threshold) * 100)}%"></div></div>
            <div class="pity-count">${acc.pityStack} / ${threshold}</div>
          </div>
          ${ready ? `<div class="pity-ready-text">✨ Guaranteed success on next enhancement</div>` : ""}
          <div class="log-buttons">
            <button class="btn-log btn-success" id="btn-success">Log Success</button>
            <button class="btn-log btn-fail" id="btn-fail" ${ready ? "disabled" : ""}>Log Fail</button>
          </div>
          <div class="undo-row">
            <button id="btn-undo" ${acc.log.length ? "" : "disabled"}>Undo last log entry</button>
          </div>
          ${statsRowHtml("Overall &mdash; every level combined", { total, successes, pity, fails, rate })}
          ${streakRowHtml(acc.log, setDef.pityThreshold)}
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="detail-header">
        <div class="detail-icon-wrap">${iconSrc ? `<img src="${iconSrc}" alt="${acc.type}">` : ""}${romanOverlayHtml(acc.currentLevel)}</div>
        <div class="detail-title-row">
          <div class="name-edit-row">
            <input class="acc-name-input" id="name-input" value="${escapeHtml(acc.name)}" maxlength="30">
            <span class="type-tag">${acc.type}</span>
          </div>
          <div class="level-big-row">
            <div class="level-big-badge">${acc.currentLevel.toUpperCase()}</div>
            ${maxed
              ? `<div class="maxed-banner">★ Max Level Reached</div>`
              : `<div class="level-arrow">&rarr;</div><div class="level-target-badge">${target.toUpperCase()}</div>`
            }
          </div>
        </div>
        <button class="btn btn-ghost btn-share" id="btn-share-card" title="Download a shareable summary image of this item's progress">Share Card</button>
      </div>

      <div class="action-section">
        ${leftBoxHtml}
        <div class="action-col">
          <div class="card-block">
            <h3>Manually Set Level / Pity</h3>
            <div class="set-level-form">
              <div class="form-row">
                <label for="set-level">Current level</label>
                <select id="set-level">
                  ${setDef.levels.map((l) => `<option value="${l}" ${l === acc.currentLevel ? "selected" : ""}>${l}</option>`).join("")}
                </select>
              </div>
              <div class="form-row">
                <label for="set-pity">Pity stack</label>
                <input type="number" id="set-pity" min="0" value="${acc.pityStack}">
              </div>
              <button class="btn btn-primary" id="btn-apply-set">Apply</button>
            </div>
          </div>
          ${classPickerBoxHtml(setDef, setState)}
        </div>
      </div>

      ${levelRows.length ? `
      <div class="card-block level-rates-block">
        <h3>Rates by Level</h3>
        <div class="level-rates-list">
          ${levelRows.map((r) => `
            <div class="level-rate-row${!r.cleared ? " in-progress" : ""}">
              <span class="level-rate-badge">${r.level.toUpperCase()}</span>
              <span class="level-rate-stats">
                <span>${r.attempts} taps</span>
                <span class="level-rate-success">${r.successes} success${r.successes === 1 ? "" : "es"}</span>
                <span class="level-rate-pity">${r.pity} pity</span>
                <span class="level-rate-fail">${r.fails} fail${r.fails === 1 ? "" : "s"}</span>
                ${!r.cleared ? `<span class="level-rate-tag">in progress</span>` : ""}
                ${avgAttemptsHtml(setDef, r)}
              </span>
              <span class="level-rate-pct">${r.rate}%</span>
            </div>
          `).join("")}
        </div>
      </div>
      ` : ""}

      ${nerdStatsBlockHtml(setDef, setState, acc)}

      <div class="history-section">
        <h3>History (${acc.log.length})</h3>
        <div class="history-list" id="history-list">
          ${renderHistoryRows(acc)}
        </div>
      </div>
    `;

    // Wire events
    document.getElementById("name-input").addEventListener("change", (e) => {
      renameAccessory(acc.id, e.target.value);
    });
    if (!maxed) {
      document.getElementById("btn-success").addEventListener("click", () => logAttempt(acc.id, "success"));
      document.getElementById("btn-fail").addEventListener("click", () => logAttempt(acc.id, "fail"));
    }
    document.getElementById("btn-undo").addEventListener("click", () => undoLast(acc.id));
    document.getElementById("btn-apply-set").addEventListener("click", () => {
      const level = document.getElementById("set-level").value;
      const pity = Math.max(0, parseInt(document.getElementById("set-pity").value, 10) || 0);
      manualSetLevel(acc.id, level, pity);
    });
    const classSelect = document.getElementById("class-select");
    if (classSelect) {
      classSelect.addEventListener("change", (e) => {
        setState.selectedClass = e.target.value;
        save();
        render();
      });
    }
    panel.querySelectorAll(".hist-del").forEach((btn) => {
      btn.addEventListener("click", () => deleteHistoryEntry(acc.id, btn.dataset.id));
    });
    document.getElementById("btn-share-card").addEventListener("click", () => {
      generateShareCard(setDef, acc, iconSrc, { total, successes, pity, fails, rate }, maxed, target);
    });
    document.getElementById("btn-toggle-nerd-stats").addEventListener("click", () => {
      statsForNerdsOpen = !statsForNerdsOpen;
      renderDetail();
    });
  }

  function describeEntry(e, setDefOverride) {
    const setDef = setDefOverride || activeSetDef();
    if (e.type === "success") {
      if (isPityEntry(e, setDef.pityThreshold)) {
        return {
          badgeClass: "pity", badgeText: "Pity",
          desc: `Reached <b>${e.targetLevel.toUpperCase()}</b> &mdash; guaranteed at ${e.pityBefore}/${setDef.pityThreshold[e.targetLevel]}`
        };
      }
      return { badgeClass: "success", badgeText: "Success", desc: `Reached <b>${e.targetLevel.toUpperCase()}</b>` };
    } else if (e.type === "fail") {
      return {
        badgeClass: "fail", badgeText: "Fail",
        desc: `Attempt at <b>${e.targetLevel.toUpperCase()}</b> &mdash; pity ${e.pityAfter}/${setDef.pityThreshold[e.targetLevel]}`
      };
    }
    return { badgeClass: "adjust", badgeText: "Adjusted", desc: `Set to <b>${e.levelAfter.toUpperCase()}</b>, pity ${e.pityAfter}` };
  }

  function renderHistoryRows(acc) {
    if (!acc.log.length) {
      return `<div class="history-empty">No enhancement attempts logged yet.</div>`;
    }
    const lastId = acc.log[acc.log.length - 1].id;
    return acc.log
      .slice()
      .reverse()
      .map((e) => {
        const { badgeClass, badgeText, desc } = describeEntry(e);
        const canDelete = e.id === lastId;
        return `
          <div class="hist-row result-${badgeClass}">
            <span class="hist-badge ${badgeClass}">${badgeText}</span>
            <span class="hist-desc">${desc}</span>
            <span class="hist-time">${formatTime(e.timestamp)}</span>
            ${canDelete ? `<button class="hist-del" data-id="${e.id}" title="Remove this entry">&times;</button>` : `<span style="width:14px;"></span>`}
          </div>
        `;
      })
      .join("");
  }

  function renderOverallHistory() {
    const panel = document.getElementById("overall-panel");
    const setDef = activeSetDef();
    const setState = activeSetState();

    const allEntries = [];
    setDef.accessories.forEach((def) => {
      const acc = setState.accessories[def.id];
      const accIcon = getAccessoryIcon(setDef, setState, acc.id);
      acc.log.forEach((e) => allEntries.push({ ...e, accId: acc.id, accName: acc.name, accIcon }));
    });
    allEntries.sort((a, b) => b.timestamp - a.timestamp);

    const filtered = overallFilter === "all" ? allEntries : allEntries.filter((e) => e.accId === overallFilter);

    const total = filtered.filter((e) => e.type !== "adjust").length;
    const pity = filtered.filter((e) => isPityEntry(e, setDef.pityThreshold)).length;
    const successes = filtered.filter((e) => e.type === "success" && !isPityEntry(e, setDef.pityThreshold)).length;
    const fails = filtered.filter((e) => e.type === "fail").length;
    const rate = total ? Math.round((successes / total) * 100) : 0;
    // filtered is newest-first (for display); streaks need chronological order.
    const chronological = filtered.slice().reverse();

    const rows = filtered.length
      ? filtered.map((e) => {
          const { badgeClass, badgeText, desc } = describeEntry(e);
          return `
            <div class="hist-row result-${badgeClass}" data-acc-id="${e.accId}">
              <span class="hist-acc-tag">${e.accIcon ? `<img src="${e.accIcon}" alt="">` : ""}<span>${escapeHtml(e.accName)}</span></span>
              <span class="hist-badge ${badgeClass}">${badgeText}</span>
              <span class="hist-desc">${desc}</span>
              <span class="hist-time">${formatTime(e.timestamp)}</span>
            </div>
          `;
        }).join("")
      : `<div class="history-empty">No enhancement attempts logged yet.</div>`;

    panel.innerHTML = `
      <div class="overall-header">
        <h3>Overall History (${filtered.length})</h3>
        <select class="overall-filter" id="overall-filter">
          <option value="all" ${overallFilter === "all" ? "selected" : ""}>All accessories</option>
          ${setDef.accessories.map((def) => `<option value="${def.id}" ${overallFilter === def.id ? "selected" : ""}>${escapeHtml(setState.accessories[def.id].name)}</option>`).join("")}
        </select>
      </div>
      <div class="stats-caption">Overall &mdash; every level combined${overallFilter === "all" ? ", all accessories" : ""}</div>
      <div class="stats-row" style="margin-top:0; margin-bottom:14px;">
        <div class="stat"><div class="val">${total}</div><div class="lbl">Attempts</div></div>
        <div class="stat"><div class="val">${successes}</div><div class="lbl">Successes</div></div>
        <div class="stat"><div class="val">${pity}</div><div class="lbl">Pity</div></div>
        <div class="stat"><div class="val">${fails}</div><div class="lbl">Fails</div></div>
        <div class="stat"><div class="val">${rate}%</div><div class="lbl">Success Rate</div></div>
      </div>
      ${streakRowHtml(chronological, setDef.pityThreshold)}
      <div class="history-list">${rows}</div>
    `;

    document.getElementById("overall-filter").addEventListener("change", (e) => {
      overallFilter = e.target.value;
      renderOverallHistory();
    });
    panel.querySelectorAll(".hist-row[data-acc-id]").forEach((row) => {
      row.addEventListener("click", () => {
        activeSetState().selectedId = row.dataset.accId;
        save();
        render();
        document.getElementById("detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ---------- Overview dashboard (all sets at a glance + cross-set activity feed) ----------

  const THEME_ACCENT = { purple: "#a875e0", red: "#e2554f", gold: "#d9a521", crimson: "#c23b5c", emerald: "#2fb894" };

  // Aggregate stats for one set: only pieces that are actually trackable (skips locked/
  // unavailable classVariant pieces, same rule isSetFullyMaxed uses).
  function setSummary(key) {
    const setDef = SETS[key];
    const setState = state.sets[key];
    const trackedIds = setDef.accessories.filter((a) => pieceStatus(setDef, setState, a.id).kind === "normal");
    const allLogs = trackedIds.flatMap((a) => setState.accessories[a.id].log);
    const stats = computeStats(allLogs, setDef.pityThreshold);
    const maxedCount = trackedIds.filter((a) => isMaxed(setState.accessories[a.id].currentLevel, setDef.levels)).length;
    const worstCurrent = trackedIds.reduce((m, a) => Math.max(m, currentFailStreak(setState.accessories[a.id].log, setDef.pityThreshold)), 0);
    const worstLongest = trackedIds.reduce((m, a) => Math.max(m, longestFailStreak(setState.accessories[a.id].log, setDef.pityThreshold)), 0);
    return {
      key, setDef, setState, trackedIds, stats,
      maxedCount, totalCount: trackedIds.length,
      worstCurrent, worstLongest,
      fullyMaxed: trackedIds.length > 0 && maxedCount === trackedIds.length,
      iconSrc: trackedIds.length ? getAccessoryIcon(setDef, setState, trackedIds[0].id) : "",
    };
  }

  function renderOverviewPanel() {
    const panel = document.getElementById("overview-panel");
    const summaries = SET_ORDER.map((key) => setSummary(key));

    const cardsHtml = summaries.map((s) => {
      const pct = s.totalCount ? Math.round((s.maxedCount / s.totalCount) * 100) : 0;
      return `
        <div class="overview-card" data-set="${s.key}" data-theme="${s.setDef.theme || ""}">
          <div class="overview-card-head">
            <div class="overview-card-icon">${s.iconSrc ? `<img src="${s.iconSrc}" alt="">` : ""}</div>
            <div>
              <div class="overview-card-title">${s.setDef.label}</div>
              <div class="overview-card-sub">${s.totalCount ? `${s.maxedCount} / ${s.totalCount} maxed${s.fullyMaxed ? " &bull; complete" : ""}` : "No trackable pieces yet"}</div>
            </div>
          </div>
          <div class="overview-progress-bar"><div style="width:${pct}%"></div></div>
          <div class="overview-stats-row">
            <div class="stat"><div class="val">${s.stats.total}</div><div class="lbl">Attempts</div></div>
            <div class="stat"><div class="val">${s.stats.successes}</div><div class="lbl">Success</div></div>
            <div class="stat"><div class="val">${s.stats.pity}</div><div class="lbl">Pity</div></div>
            <div class="stat"><div class="val">${s.stats.fails}</div><div class="lbl">Fails</div></div>
            <div class="stat"><div class="val">${s.stats.rate}%</div><div class="lbl">Rate</div></div>
          </div>
          ${s.worstCurrent > 0 ? `<div class="overview-streak-flag">\u{1F9CA} Worst current streak: ${s.worstCurrent} fails</div>` : ""}
        </div>
      `;
    }).join("");

    const feedEntries = [];
    summaries.forEach((s) => {
      s.trackedIds.forEach((a) => {
        const acc = s.setState.accessories[a.id];
        const accIcon = getAccessoryIcon(s.setDef, s.setState, a.id);
        acc.log.forEach((e) => {
          feedEntries.push({ ...e, setKey: s.key, setLabel: s.setDef.label, theme: s.setDef.theme, accId: a.id, accName: acc.name, accIcon });
        });
      });
    });
    feedEntries.sort((a, b) => b.timestamp - a.timestamp);
    const recent = feedEntries.slice(0, 40);

    const feedHtml = recent.length ? recent.map((e) => {
      const { badgeClass, badgeText, desc } = describeEntry(e, SETS[e.setKey]);
      return `
        <div class="hist-row result-${badgeClass}" data-set="${e.setKey}" data-acc-id="${e.accId}">
          <span class="feed-set-tag" data-theme="${e.theme || ""}">${e.setLabel}</span>
          <span class="hist-acc-tag">${e.accIcon ? `<img src="${e.accIcon}" alt="">` : ""}<span>${escapeHtml(e.accName)}</span></span>
          <span class="hist-badge ${badgeClass}">${badgeText}</span>
          <span class="hist-desc">${desc}</span>
          <span class="hist-time">${formatTime(e.timestamp)}</span>
        </div>
      `;
    }).join("") : `<div class="history-empty">No enhancement attempts logged yet across any set.</div>`;

    const lifetimeTotal = summaries.reduce((a, s) => a + s.stats.total, 0);
    const lifetimeSuccesses = summaries.reduce((a, s) => a + s.stats.successes, 0);
    const lifetimeFails = summaries.reduce((a, s) => a + s.stats.fails, 0);
    const lifetimeRate = lifetimeTotal ? Math.round((lifetimeSuccesses / lifetimeTotal) * 100) : 0;

    panel.innerHTML = `
      <div class="card-block lifetime-totals-block">
        <h3>Lifetime &mdash; every set combined</h3>
        <div class="stats-row" style="margin-top:0;">
          <div class="stat"><div class="val">${lifetimeTotal}</div><div class="lbl">Attempts</div></div>
          <div class="stat"><div class="val">${lifetimeSuccesses}</div><div class="lbl">Successes</div></div>
          <div class="stat"><div class="val">${lifetimeFails}</div><div class="lbl">Fails</div></div>
          <div class="stat"><div class="val">${lifetimeRate}%</div><div class="lbl">Success Rate</div></div>
        </div>
      </div>
      <div class="overview-cards">${cardsHtml}</div>
      <div class="history-section overview-feed">
        <h3>Cross-Set Activity (last ${recent.length})</h3>
        <div class="history-list">${feedHtml}</div>
      </div>
    `;

    panel.querySelectorAll(".overview-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.activeSet = card.dataset.set;
        save();
        render();
      });
    });
    panel.querySelectorAll(".hist-row[data-set]").forEach((row) => {
      row.addEventListener("click", () => {
        state.activeSet = row.dataset.set;
        state.sets[row.dataset.set].selectedId = row.dataset.accId;
        save();
        render();
        document.getElementById("detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ---------- Overlays tab (OBS Browser Source downloads) ----------

  const OVERLAY_BLURBS = {
    ekleta: "One card per Ekleta piece (2 rings, 2 earrings, belt, neck) — current level, pity progress, and rates.",
    apeiron: "Same layout as Ekleta, for your Apeiron accessory set.",
    edana: "One card per Edana armor piece (Heavensmite, Abyssveil, Oathgrip, Furystride).",
    sovereign: "One card per weapon slot (main hand, awakening, offhand), showing whichever class you have selected.",
    alchemy: "One card per alchemy stone (Destruction, Life, Protection) — its icon changes as it enhances.",
  };

  function renderOverlaysPanel() {
    const panel = document.getElementById("overlays-panel");

    const cardsHtml = SET_ORDER.map((key) => {
      const def = SETS[key];
      return `
        <div class="overlay-card" data-theme="${def.theme || ""}">
          <div class="overlay-card-head">
            <div class="overlay-card-title">${def.label}</div>
            <a class="overlay-live-link" href="overlay-${key}.html" target="_blank" rel="noopener" title="Opens the real overlay page. It has no local save file to read here, so it falls back to previewing your current browser data for this tracker.">Preview &#8599;</a>
          </div>
          <div class="overlay-preview-frame">
            <img src="overlay-previews/${key}.png" alt="${def.label} overlay example" loading="lazy">
          </div>
          <div class="overlay-card-blurb">${OVERLAY_BLURBS[key] || ""}</div>
          <a class="btn btn-primary overlay-download-btn" href="downloads/overlay-${key}.zip" download>Download ${def.label} Overlay</a>
        </div>
      `;
    }).join("");

    panel.innerHTML = `
      <div class="overlay-intro card-block">
        <h3>Using these in OBS</h3>
        <p>Each overlay below is a small standalone webpage meant for OBS Studio's <b>Browser Source</b> (or any
        browser) — a read-only, live view of one gear set's progress, styled to match that set's theme.</p>
        <ol class="overlay-steps">
          <li>Download the set you want below and unzip it anywhere on your PC.</li>
          <li>Put a copy of your <code>enhancement-tracker.json</code> save file in that same folder. If you use
          this tracker's <b>Link Save File</b> feature, point it at that folder so the file stays updated
          automatically — otherwise, re-use <b>Export</b> whenever you want the overlay to catch up.</li>
          <li>In OBS: <b>Add Source &rarr; Browser &rarr; Local File</b>, and select the overlay's <code>.html</code> file.</li>
        </ol>
        <p class="overlay-note">The overlay re-reads that JSON file every few seconds on its own — no manual
        refresh needed, and nothing is ever uploaded anywhere. It only reads local data; it never writes to it.</p>
        <p class="overlay-note">Each card's <b>Preview</b> link opens the real overlay page right here in your
        browser. Since there's no save file for it to find on this site, it automatically falls back to showing
        your current browser data for this tracker instead — handy for seeing the layout before you ever touch
        OBS. Once it's actually reading a real linked/exported file (locally, next to your downloaded copy), it
        uses that instead.</p>
        <p class="overlay-note">Optional URL parameters (append to the file path in OBS, e.g.
        <code>overlay-ekleta.html?interval=2000&amp;bg=0.85</code>): <code>interval</code> (poll rate in ms, default
        3000), <code>bg</code> (panel opacity 0&ndash;1), <code>items</code> (comma-separated piece ids to show only
        some cards), <code>stats=0</code> / <code>levels=0</code> (hide the stats row / per-level breakdown),
        <code>file</code> (a different JSON filename/path than the default).</p>
      </div>
      <div class="overlay-cards">${cardsHtml}</div>
    `;
  }

  // ---------- Shareable summary card (Canvas -> PNG download) ----------
  // Text/vector only (no drawn images) so the canvas never gets tainted by a file:// image
  // load, which would otherwise block toBlob() when the app is opened directly from disk.
  function generateShareCard(setDef, acc, iconSrc, stats, maxed, target) {
    const accent = THEME_ACCENT[setDef.theme] || THEME_ACCENT.purple;
    const W = 900, H = 460;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#15111c");
    bgGrad.addColorStop(1, "#1f1828");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, W - 6, H - 6);

    ctx.fillStyle = accent;
    ctx.font = "700 22px Georgia, serif";
    ctx.fillText(setDef.label.toUpperCase(), 48, 62);

    ctx.fillStyle = "#f2ecf7";
    ctx.font = "700 46px Georgia, serif";
    ctx.fillText(acc.name, 48, 128);

    const cx = W - 140, cy = 118, r = 78;
    const circGrad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, r);
    circGrad.addColorStop(0, accent);
    circGrad.addColorStop(1, "#000");
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = circGrad;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;
    ctx.strokeStyle = accent;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "700 38px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(acc.currentLevel.toUpperCase(), cx, cy + 12);
    ctx.textAlign = "left";

    if (maxed) {
      ctx.fillStyle = "#f0d878";
      ctx.font = "700 26px Georgia, serif";
      ctx.fillText("★ MAX LEVEL REACHED", 48, 172);
    } else {
      ctx.fillStyle = "#c3b6d1";
      ctx.font = "20px -apple-system, Segoe UI, sans-serif";
      ctx.fillText(`Working toward ${target.toUpperCase()}`, 48, 172);
    }

    const statsList = [
      ["Attempts", stats.total],
      ["Successes", stats.successes],
      ["Pity", stats.pity],
      ["Fails", stats.fails],
      ["Success Rate", stats.rate + "%"],
    ];
    const statW = (W - 96) / statsList.length;
    statsList.forEach(([label, val], i) => {
      const x = 48 + i * statW;
      ctx.fillStyle = "#8d7f9d";
      ctx.font = "600 14px -apple-system, Segoe UI, sans-serif";
      ctx.fillText(label.toUpperCase(), x, 248);
      ctx.fillStyle = "#f2ecf7";
      ctx.font = "700 34px Georgia, serif";
      ctx.fillText(String(val), x, 290);
    });

    const cur = currentFailStreak(acc.log, setDef.pityThreshold);
    const longest = longestFailStreak(acc.log, setDef.pityThreshold);
    if (longest > 0) {
      ctx.fillStyle = "#f0827d";
      ctx.font = "600 18px -apple-system, Segoe UI, sans-serif";
      const streakText = cur > 0
        ? `Current fail streak: ${cur}  •  Longest fail streak: ${longest}`
        : `Longest fail streak: ${longest}`;
      ctx.fillText(streakText, 48, 335);
    }

    ctx.fillStyle = "#5a4f66";
    ctx.font = "13px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Enhancement Tracker", 48, H - 28);
    ctx.textAlign = "right";
    ctx.fillText(new Date().toLocaleDateString(), W - 48, H - 28);
    ctx.textAlign = "left";

    canvas.toBlob((blob) => {
      if (!blob) { showToast("Could not generate share card"); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${setDef.label}-${acc.name}-share-card.png`.replace(/\s+/g, "-").toLowerCase();
      a.click();
      URL.revokeObjectURL(url);
      showToast("Share card downloaded");
    }, "image/png");
  }

  // ---------- Export / Import / Reset ----------

  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `accessory-tracker-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  });

  document.getElementById("btn-import").addEventListener("click", () => {
    document.getElementById("file-import").click();
  });

  document.getElementById("file-import").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || (!parsed.accessories && !parsed.sets)) throw new Error("invalid file");
        state = normalizeState(parsed);
        save();
        render();
        showToast("Data imported");
      } catch (err) {
        showToast("Could not read that file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("btn-reset-all").addEventListener("click", () => {
    const setDef = activeSetDef();
    const label = setDef.label;
    if (!confirm(`This will permanently erase all ${label} ${categoryLabel(setDef)} and enhancement history. The other sets are not affected. Continue?`)) return;
    const previousClass = state.sets[state.activeSet].selectedClass;
    state.sets[state.activeSet] = freshSetState(state.activeSet);
    // selectedClass is a display preference, not progress — resetting shouldn't blank the icons.
    if (setDef.classVariant) state.sets[state.activeSet].selectedClass = previousClass;
    save();
    render();
    showToast(`${label} data reset`);
  });

  render();
  renderFileStatus();
  updateChangelogDot();
  tryReconnectFile();
  SET_ORDER.forEach((key) => {
    if (SETS[key].classVariant) loadClassVariants(key);
    if (SETS[key].levelVariant) loadLevelVariants(key);
  });
})();
