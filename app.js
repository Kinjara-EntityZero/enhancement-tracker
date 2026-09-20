(function () {
  "use strict";

  const STORAGE_KEY = "bdo-enhancement-tracker-v1";
  const CHANGELOG_SEEN_KEY = "bdo-enhancement-tracker-changelog-seen";

  // Manually maintained, newest first. Add an entry here whenever a change ships.
  const CHANGELOG = [
    {
      date: "2026-09-20",
      title: "Contact me",
      items: [
        "Added a Contact Me button next to What's New. Questions, bug reports, or feedback — my Discord is in there.",
      ],
    },
    {
      date: "2026-09-20",
      title: "Rates by Level now shows three separate averages",
      items: [
        "Each cleared level now spells out the global (community) average, your own average, and the difference between them, each with its own label.",
        "Your average is now your attempts divided by how many times you actually cleared that level, so the set-wide breakdown compares like for like instead of tacking a \"(4.61×2)\" multiplier onto the community number.",
        "The global average now stays visible on levels you haven't cleared yet — \"in progress\" replaces just your average and the comparison.",
      ],
    },
    {
      date: "2026-09-20",
      title: "Spacing and alignment cleanup",
      items: [
        "Rates by Level now pins the level to the far left and the success rate to the far right, with the leftover width split evenly so every gap in the row is the same size at any window width.",
        "History and Overall History badges (Success/Pity/Fail/Adjusted) are all one width now, so the text beside them starts in the same place on every row, with even spacing either side.",
        "The enhancement level over the icon on share cards is twice as big.",
      ],
    },
    {
      date: "2026-09-20",
      title: "Fixed Pace claiming more active days than days",
      items: [
        "Pace could read something like \"34 active days over 33 days\". Active days counted calendar dates while the total counted elapsed time between your first and last attempt, so logging late on one day and early on another lost a day. Both are counted as calendar dates now.",
      ],
    },
    {
      date: "2026-09-17",
      title: "Share a card for your whole set, and a fresh look for both",
      items: [
        "New Share Overall Card button beside the per-item one: combined totals, streaks, Luck Score, Rates by Level, and Crons across every accessory in the set at once.",
        "Both share cards were redesigned — a pill-shaped set badge, a glowing ring around the icon, stats as rounded tiles, section dividers, and a large faded version of the item's icon behind the card.",
        "The per-item button now names the item, so it reads \"Share Ring 1 Card\".",
      ],
    },
    {
      date: "2026-09-17",
      title: "Rates by Level columns now actually line up",
      items: [
        "Taps/successes/pity/fails/avg all sit in fixed columns now, so every row lines up top to bottom instead of drifting based on things like \"1 success\" vs. \"0 successes\", or whether a level is in progress.",
        "An in-progress level's \"in progress\" now shows where the average would go, instead of its own separate column — one less column, and nothing to line up oddly against.",
        "The percentage on the right now reads \"Success rate: X%\", with the label and value both landing in the same spot on every row.",
        "Tightened up the spacing throughout so nothing looks stretched out or unevenly gapped.",
      ],
    },
    {
      date: "2026-09-17",
      title: "Pity progress bar now shows the numbers too",
      items: [
        "The pity bar on each accessory card now shows \"current / needed\" next to the bar, not just the fill.",
      ],
    },
    {
      date: "2026-09-14",
      title: "Import and Link Save File now warn you about which copy is newer",
      items: [
        "Every save is now timestamped, in both localStorage and your linked save file.",
        "Importing a backup, or linking/reconnecting to a file that already has data, now shows when each copy was last saved and flags which one is newer before you commit to overwriting anything.",
        "Importing a backup now asks for confirmation at all — previously it silently overwrote your current data with no warning.",
      ],
    },
    {
      date: "2026-09-14",
      title: "Hour-of-day chart is now one combined graph with hover details",
      items: [
        "Attempts by hour of day is now a single stacked bar chart — each bar splits into red (fails), blue (pity), and green (successes) — instead of three separate charts, with a color-key legend above it.",
        "Bars and the Y-axis now show raw counts instead of percentages.",
        "Hovering a bar (or an empty hour) now shows an instant tooltip with the full fail/pity/success breakdown for that hour, plus a subtle highlight — no more waiting on the browser's slow native tooltip.",
      ],
    },
    {
      date: "2026-09-12",
      title: "Cron Stones used (Ekleta)",
      items: [
        "Stats for Nerds now tracks Cron Stones: a box for each level showing how many were spent there, plus a Total Crons Used box, across every accessory in the set combined.",
        "A pity-guaranteed click always costs 0 Crons, same as in game, since there's no fail risk left to protect against.",
        "Built to extend to other gear sets later (each just needs its own cron-cost table) — Alchemy Stones don't use Crons at all, so they're skipped entirely.",
      ],
    },
    {
      date: "2026-09-07",
      title: "Bigger, more detailed share cards",
      items: [
        "The share card now includes the item's icon (with its roman-numeral level, matching everywhere else in the app) and a full Rates by Level breakdown.",
        "Clicking Share Card now opens a preview in a new tab with its own Download PNG button, instead of downloading immediately.",
        "Made the card noticeably more compact overall, with its height now based on how much you've actually logged instead of a fixed size that left empty space.",
        "Fixed long level names (like Alchemy's Shining) overlapping neighboring text in the Rates by Level rows and overflowing the icon circle.",
      ],
    },
    {
      date: "2026-09-06",
      title: "Attempts-by-hour chart is taller and shows percentages",
      items: [
        "The Stats for Nerds hour-of-day chart is taller, with a labeled Y-axis and the exact value shown above each bar in white.",
        "Bars now show the percentage of your total attempts that happened in that hour, instead of a raw count.",
      ],
    },
    {
      date: "2026-09-06",
      title: "Stats for Nerds is now cumulative, not per-item",
      items: [
        "Moved to its own standalone section (like Overall History) instead of living inside the item detail panel.",
        "Every stat is now computed across all tracked accessories combined and no longer changes depending on which item you have selected.",
        "Removed the days-to-Dec projection.",
        "Added Best/Worst Enhance Level: which level (not accessory) has had the best and worst success rate so far.",
        "Fixed the vs-average comparisons (Rates by Level and Luck score) to scale by how many accessories actually cleared a level, instead of comparing a merged total against a single accessory's average.",
      ],
    },
    {
      date: "2026-09-05",
      title: "Set-wide Rates by Level in Stats for Nerds",
      items: [
        "Stats for Nerds now includes a per-level breakdown merged across every tracked accessory in the set — all Pen attempts combined, all Hex attempts combined, and so on — using the same success/pity/fail styling as the per-item Rates by Level. Levels nobody has attempted yet are simply left out.",
      ],
    },
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

  // ---------- Contact ----------

  const DISCORD_ID = "Kinjara";

  function closeContact() {
    document.getElementById("contact-modal-root").innerHTML = "";
  }

  function openContact() {
    const root = document.getElementById("contact-modal-root");
    root.innerHTML = `
      <div class="modal-backdrop" id="contact-backdrop">
        <div class="modal-box contact-modal">
          <div class="modal-header">
            <h2>Contact Me</h2>
            <button id="btn-close-contact" class="modal-close" title="Close">&times;</button>
          </div>
          <div class="contact-body">
            <p>Questions, bug reports, or feedback on the tracker &mdash; all welcome. Reach me on Discord:</p>
            <div class="contact-handle">${escapeHtml(DISCORD_ID)}</div>
          </div>
        </div>
      </div>
    `;
    document.getElementById("contact-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "contact-backdrop") closeContact();
    });
    document.getElementById("btn-close-contact").addEventListener("click", closeContact);
  }

  document.getElementById("btn-contact").addEventListener("click", openContact);

  // ---------- Stats for Nerds ----------
  // Deeper, opt-in stats computed cumulatively across every trackable accessory in the set —
  // pity behavior, pacing, and timing patterns that aren't interesting enough for the main
  // stats row but are fun to dig into. Deliberately independent of which accessory happens to
  // be selected, unlike the per-item Rates by Level above it. "adjust" entries are never real
  // clicks, so every stat here ignores them.

  function msToDuration(ms) {
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  // Local midnight for a timestamp. Rounding the difference between two of these to whole days
  // survives DST, where a calendar day is 23 or 25 hours rather than exactly 24.
  function startOfLocalDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // Merges every trackable accessory's log into one timeline for the pacing/timing stats below,
  // the same "whole set combined" logs already used by computeSetLevelBreakdown.
  function computeNerdStats(setDef, setState) {
    const allLogs = setDef.accessories
      .filter((a) => pieceStatus(setDef, setState, a.id).kind === "normal")
      .flatMap((a) => setState.accessories[a.id].log);
    const real = allLogs.filter((e) => e.type === "success" || e.type === "fail");

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

    // Counted the same way activeDays is -- as calendar dates, first through last inclusive, not
    // as the raw duration between the two timestamps. Those are different units, and the duration
    // reads low: logging late on the first day and early on the last one spans 34 dates but only
    // ~32 days of elapsed time, so you could end up with more active days than days.
    const elapsedDays = sorted.length
      ? Math.round((startOfLocalDay(sorted[sorted.length - 1].timestamp) - startOfLocalDay(sorted[0].timestamp)) / 86400000) + 1
      : 1;
    const pacePerDay = real.length ? real.length / Math.max(1, dayCounts.size) : 0;

    const hourCounts = new Array(24).fill(0);
    const hourCountsSuccess = new Array(24).fill(0);
    const hourCountsFail = new Array(24).fill(0);
    const hourCountsPity = new Array(24).fill(0);
    real.forEach((e) => {
      const h = new Date(e.timestamp).getHours();
      hourCounts[h]++;
      if (e.type === "fail") hourCountsFail[h]++;
      else if (isPityEntry(e, setDef.pityThreshold)) hourCountsPity[h]++;
      else hourCountsSuccess[h]++;
    });

    return { total: real.length, busiestDay, longestGapMs, elapsedDays, activeDays: dayCounts.size, pacePerDay, hourCounts, hourCountsSuccess, hourCountsFail, hourCountsPity };
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

  // Sum of (your attempts - community average) across every level cleared anywhere in the set,
  // for sets that define avgAttempts (currently just Ekleta). Negative = luckier than average
  // overall; positive = unluckier. Takes the same merged setLevelRows as the set-wide Rates by
  // Level breakdown, and scales each level's average by how many accessories cleared it there
  // (same reasoning as avgAttemptsParts) rather than comparing against a single clear's average.
  function computeLuckScore(setDef, setLevelRows) {
    if (!setDef.avgAttempts) return null;
    const rows = setLevelRows.filter((r) => r.cleared);
    if (!rows.length) return null;
    let score = 0;
    let totalClears = 0;
    rows.forEach((r) => {
      const perClear = setDef.avgAttempts[r.level];
      const clears = r.successes + r.pity;
      if (perClear != null) score += r.attempts - perClear * clears;
      totalClears += clears;
    });
    return { score, levelsCleared: rows.length, totalClears };
  }

  // Which level (not accessory) has had the best/worst success rate so far, across every
  // accessory in the set combined -- e.g. "Pri clears easily, Dec is brutal." Only compares
  // cleared levels, same reasoning as the Rates by Level delta (an in-progress level's rate
  // isn't decided yet). Needs at least 2 comparable levels.
  function computeLevelExtremes(setLevelRows) {
    const rows = setLevelRows.filter((r) => r.cleared);
    if (rows.length < 2) return null;
    const best = rows.slice().sort((a, b) => b.rate - a.rate || a.attempts - b.attempts)[0];
    const worst = rows.slice().sort((a, b) => a.rate - b.rate || b.attempts - a.attempts)[0];
    if (best === worst) return null;
    return { best, worst };
  }

  // Cron Stones consumed per level (and the running total), across every accessory in the set
  // combined. A pity-guaranteed click costs 0, so only successes+fails (== attempts - pity)
  // at a level actually spend crons -- derived straight from the already-computed
  // setLevelRows rather than re-scanning raw logs. Optional per set (setDef.cronCost) so this
  // naturally only shows up where it's been configured (currently just Ekleta).
  function computeCronStats(setDef, setLevelRows) {
    if (!setDef.cronCost) return null;
    const perLevel = setLevelRows
      .map((r) => {
        const cost = setDef.cronCost[r.level];
        if (cost == null) return null;
        const clicks = r.successes + r.fails;
        return { level: r.level, cost, clicks, crons: cost * clicks };
      })
      .filter(Boolean);
    if (!perLevel.length) return null;
    const total = perLevel.reduce((sum, p) => sum + p.crons, 0);
    return { perLevel, total };
  }

  // "3 PM" / "12 AM" style label for an hour index (0-23), used in hover tooltips.
  function hourLabel(h) {
    const period = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${period}`;
  }

  // One combined chart: each hour's bar is stacked fail (bottom) / pity (middle) / success (top),
  // scaled against the busiest hour's total attempts. Segment heights are set via flex-grow
  // equal to that segment's raw count, so within a bar of fixed total height the three pieces
  // divide up proportionally without a second round of percent math.
  //
  // Hover tooltips: native `title` attributes have a ~1s delay before the browser shows them and
  // felt like "nothing happens" while testing, so instead every column (and each colored segment
  // within it) carries a `data-tooltip` string that a shared floating tooltip (see
  // attachHistogramTooltips below) shows INSTANTLY on mouseenter, following the cursor. The column
  // covers the whole hour slot -- including empty hours with no bar at all -- with the full
  // breakdown; a segment's own data-tooltip is more specific and simply wins while the cursor is
  // directly over it, since mouseenter/mouseleave don't bubble.
  function stackedHourHistogramHtml(hourCountsFail, hourCountsPity, hourCountsSuccess) {
    const totals = hourCountsFail.map((f, i) => f + hourCountsPity[i] + hourCountsSuccess[i]);
    const max = Math.max(1, ...totals);
    // Cap bars at 80% of the chart height (rather than 100%) so the busiest hour's count label
    // always has headroom above it instead of getting clipped at the top of the chart.
    return `
      <div class="nerd-histogram-legend">
        <span class="nerd-histogram-legend-item"><span class="nerd-histogram-swatch nerd-histogram-bar-fail"></span>Fails</span>
        <span class="nerd-histogram-legend-item"><span class="nerd-histogram-swatch nerd-histogram-bar-pity"></span>Pity</span>
        <span class="nerd-histogram-legend-item"><span class="nerd-histogram-swatch nerd-histogram-bar-success"></span>Successes</span>
      </div>
      <div class="nerd-histogram-chart">
        <div class="nerd-histogram-yaxis">
          <span class="nerd-histogram-ylabel">Attempts</span>
          <div class="nerd-histogram-yticks"><span>${max}</span><span>0</span></div>
        </div>
        <div class="nerd-histogram">
          ${totals.map((total, h) => {
            const f = hourCountsFail[h];
            const p = hourCountsPity[h];
            const s = hourCountsSuccess[h];
            const stackPct = Math.round((total / max) * 80);
            const colTip = `${hourLabel(h)} — ${f} fail${f === 1 ? "" : "s"}, ${p} pity, ${s} success${s === 1 ? "" : "es"} (${total} total)`;
            return `
              <div class="nerd-histogram-col" data-tooltip="${escapeHtml(colTip)}">
                ${total > 0 ? `<span class="nerd-histogram-count" style="bottom:${stackPct}%">${total}</span>` : ""}
                <div class="nerd-histogram-stack" style="height:${stackPct}%">
                  ${f > 0 ? `<div class="nerd-histogram-bar nerd-histogram-bar-fail" style="flex:${f} 0 0%" data-tooltip="${escapeHtml(`${hourLabel(h)}: ${f} fail${f === 1 ? "" : "s"}`)}"></div>` : ""}
                  ${p > 0 ? `<div class="nerd-histogram-bar nerd-histogram-bar-pity" style="flex:${p} 0 0%" data-tooltip="${escapeHtml(`${hourLabel(h)}: ${p} pity`)}"></div>` : ""}
                  ${s > 0 ? `<div class="nerd-histogram-bar nerd-histogram-bar-success" style="flex:${s} 0 0%" data-tooltip="${escapeHtml(`${hourLabel(h)}: ${s} success${s === 1 ? "" : "es"}`)}"></div>` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
      <div class="nerd-histogram-labels"><span>12am</span><span>12pm</span><span>11pm</span></div>
    `;
  }

  // Shared floating tooltip for the hour-of-day chart -- created once, reused, and repositioned
  // next to the cursor. Delegates a single set of listeners from the chart container instead of
  // binding 24+ columns x 3 segments individually, and re-runs harmlessly on every re-render.
  let nerdHistogramTooltipEl = null;
  function attachHistogramTooltips(container) {
    if (!nerdHistogramTooltipEl) {
      nerdHistogramTooltipEl = document.createElement("div");
      nerdHistogramTooltipEl.className = "nerd-histogram-tooltip";
      document.body.appendChild(nerdHistogramTooltipEl);
    }
    const tip = nerdHistogramTooltipEl;
    const chart = container.querySelector(".nerd-histogram");
    if (!chart) return;

    const show = (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (!target || !chart.contains(target)) return;
      tip.textContent = target.getAttribute("data-tooltip");
      tip.style.display = "block";
      position(e);
    };
    const position = (e) => {
      const pad = 14;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      const rect = tip.getBoundingClientRect();
      if (x + rect.width > window.innerWidth - 8) x = e.clientX - rect.width - pad;
      if (y + rect.height > window.innerHeight - 8) y = e.clientY - rect.height - pad;
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
    };
    const hide = () => { tip.style.display = "none"; };

    chart.addEventListener("mouseover", show);
    chart.addEventListener("mousemove", (e) => { if (tip.style.display === "block") position(e); });
    chart.addEventListener("mouseleave", hide);
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

  // Renders the #nerd-stats-panel section — a standalone panel like Overall History, not
  // nested inside the detail panel — for the currently selected item.
  function renderNerdStatsPanel() {
    const panel = document.getElementById("nerd-stats-panel");
    const setDef = activeSetDef();
    const setState = activeSetState();

    const n = computeNerdStats(setDef, setState);
    if (!n.total) {
      panel.innerHTML = `
        ${nerdStatsToggleHtml()}
        ${statsForNerdsOpen ? `<div class="nerd-stats-empty">Log a few attempts to unlock these.</div>` : ""}
      `;
    } else {
      const setLevelRows = computeSetLevelBreakdown(setDef, setState);
      const luck = computeLuckScore(setDef, setLevelRows);
      const leaderboard = computeSetLeaderboard(setDef, setState);
      const levelExtremes = computeLevelExtremes(setLevelRows);
      const cronStats = computeCronStats(setDef, setLevelRows);

      panel.innerHTML = `
        ${nerdStatsToggleHtml()}
        ${statsForNerdsOpen ? `
          <div class="nerd-stats-grid">
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
              `vs average across ${luck.totalClears} clear${luck.totalClears === 1 ? "" : "s"} over ${luck.levelsCleared} level${luck.levelsCleared === 1 ? "" : "s"} &mdash; ${luck.score < 0 ? "luckier" : luck.score > 0 ? "unluckier" : "dead on"} than average`
            ) : ""}
          </div>
          ${leaderboard || levelExtremes ? `
            <div class="nerd-stats-grid nerd-stats-grid-2">
              ${leaderboard ? nerdStatHtml("Luckiest Accessory", escapeHtml(leaderboard.best.name), `${leaderboard.best.rate}% success rate`) : ""}
              ${leaderboard ? nerdStatHtml("Cursed Accessory", escapeHtml(leaderboard.worst.name), `${leaderboard.worst.rate}% success rate`) : ""}
              ${levelExtremes ? nerdStatHtml("Best Enhance Level", levelExtremes.best.level.toUpperCase(), `${levelExtremes.best.rate}% success rate`) : ""}
              ${levelExtremes ? nerdStatHtml("Worst Enhance Level", levelExtremes.worst.level.toUpperCase(), `${levelExtremes.worst.rate}% success rate`) : ""}
            </div>
          ` : ""}
          <div class="nerd-stats-caption">Attempts by hour of day</div>
          ${stackedHourHistogramHtml(n.hourCountsFail, n.hourCountsPity, n.hourCountsSuccess)}
          ${setLevelRows.length ? `
            <div class="nerd-stats-caption">Rates by level &mdash; all ${categoryLabel(setDef)} combined</div>
            <div class="level-rates-list">
              ${setLevelRows.map((r) => levelRateRowHtml(setDef, r)).join("")}
            </div>
          ` : ""}
          ${cronStats ? `
            <div class="nerd-stats-caption">Cron Stones used &mdash; all ${categoryLabel(setDef)} combined</div>
            <div class="nerd-stats-grid">
              ${nerdStatHtml(
                "Total Crons Used",
                cronStats.total.toLocaleString(),
                `across ${cronStats.perLevel.reduce((sum, p) => sum + p.clicks, 0)} paid click${cronStats.perLevel.reduce((sum, p) => sum + p.clicks, 0) === 1 ? "" : "s"}`
              )}
              ${cronStats.perLevel.map((p) => nerdStatHtml(
                `${p.level.toUpperCase()} Crons`,
                p.crons.toLocaleString(),
                `${p.clicks} click${p.clicks === 1 ? "" : "s"} &times; ${p.cost.toLocaleString()} each`
              )).join("")}
            </div>
          ` : ""}
        ` : ""}
      `;
      if (statsForNerdsOpen) attachHistogramTooltips(panel);
    }

    document.getElementById("btn-toggle-nerd-stats").addEventListener("click", () => {
      statsForNerdsOpen = !statsForNerdsOpen;
      renderNerdStatsPanel();
    });
  }

  function nerdStatsToggleHtml() {
    return `
      <button class="nerd-stats-toggle" id="btn-toggle-nerd-stats">
        <h3>Stats for Nerds</h3>
        <span class="nerd-stats-caret">${statsForNerdsOpen ? "&#9650;" : "&#9660;"}</span>
      </button>
    `;
  }

  // Shared by the per-item "Rates by Level" block and the Stats for Nerds set-wide breakdown
  // below — same row shape, just fed by a different log (one item's vs. the whole set's merged).
  //
  // .level-rate-stats is a CSS grid with fixed-width columns (see style.css), and every row
  // always emits the same 7 spans in the same order -- taps/success/pity/fail/global-avg/your-avg/
  // comparison -- even when a column has nothing to show (an empty span still reserves its slot).
  // Without that, "0 successes" vs. "1 success" (or a level being in-progress vs. not) shifts every
  // column after it by a different amount on every row, so nothing lines up top to bottom.
  //
  // The global average always shows (it's a fixed reference point, not tied to your own
  // progress). "in progress" replaces the your-average AND comparison columns together for a
  // level you haven't cleared yet -- there's no personal average or delta to show until you have.
  function levelRateRowHtml(setDef, r) {
    const avgParts = avgAttemptsParts(setDef, r);
    const globalAvgText = avgParts ? avgParts.globalAvgText : "";
    const yourAvgText = r.cleared ? (avgParts ? avgParts.yourAvgText : "") : "in progress";
    const yourAvgCls = r.cleared ? "level-rate-avg" : "level-rate-tag";
    return `
      <div class="level-rate-row${!r.cleared ? " in-progress" : ""}">
        <span class="level-rate-badge">${r.level.toUpperCase()}</span>
        <span class="level-rate-stats">
          <span>${r.attempts} taps</span>
          <span class="level-rate-success">${r.successes} success${r.successes === 1 ? "" : "es"}</span>
          <span class="level-rate-pity">${r.pity} pity</span>
          <span class="level-rate-fail">${r.fails} fail${r.fails === 1 ? "" : "s"}</span>
          <span class="level-rate-avg">${globalAvgText}</span>
          <span class="${yourAvgCls}">${yourAvgText}</span>
          <span class="level-rate-delta ${r.cleared && avgParts ? avgParts.cls : ""}">${r.cleared && avgParts ? avgParts.comparisonText : ""}</span>
        </span>
        <span class="level-rate-pct">
          <span class="level-rate-pct-label">Success rate:</span>
          <span class="level-rate-pct-value">${r.rate}%</span>
        </span>
      </div>
    `;
  }

  // Per-level breakdown merged across every trackable accessory in the set (not just the one
  // you're looking at) -- "all Pen rates across the accessories," etc. Levels nobody has ever
  // attempted are simply absent, same as the per-item version.
  function computeSetLevelBreakdown(setDef, setState) {
    const allLogs = setDef.accessories
      .filter((a) => pieceStatus(setDef, setState, a.id).kind === "normal")
      .flatMap((a) => setState.accessories[a.id].log);
    return levelBreakdown(allLogs, setDef.levels, setDef.pityThreshold);
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

  // Three-way average comparison for one Rates-by-Level row, if this set defines community
  // averages (currently just Ekleta): the global (community) average for one clear, your own
  // average per clear, and the difference between them. Comparing per-clear averages instead of
  // scaling the global average by however many accessories cleared it (the old approach) means a
  // row merged across several accessories in Stats for Nerds compares apples to apples without
  // needing a "(X.XX×N)" footnote to explain itself.
  // The global average is always meaningful even before you've cleared the level -- it's a
  // reference point that doesn't depend on your own progress -- but "your average" and the
  // comparison need a finished clear to mean anything, so those two come back empty (the caller
  // shows "in progress" in their place) until row.cleared.
  // Returns { globalAvgText, yourAvgText, comparisonText, cls } instead of HTML, so the caller can
  // drop each piece into its own grid column for alignment across rows. Null when this set has no
  // community-average data at all (most sets) -- callers fall back to leaving those columns blank.
  function avgAttemptsParts(setDef, row) {
    if (!setDef.avgAttempts) return null;
    const perClear = setDef.avgAttempts[row.level];
    if (perClear == null) return null;
    const globalAvgText = `Global avg ${perClear.toFixed(2)}`;
    if (!row.cleared) {
      return { globalAvgText, yourAvgText: "", comparisonText: "", cls: "" };
    }
    // A level is cleared at most once per accessory (one success or pity entry), so for a row
    // merged across several accessories (Stats for Nerds' set-wide breakdown), successes+pity is
    // exactly how many of them cleared it here -- "your average" divides the combined attempts by
    // that many clears rather than staying pinned to one, so it's a fair per-clear comparison
    // regardless of how many accessories fed into this row. For a single-accessory row this is
    // always 1, so per-item behavior is unchanged (yourAvg === attempts).
    const clears = row.successes + row.pity;
    const yourAvg = row.attempts / clears;
    const delta = yourAvg - perClear;
    const sign = delta > 0 ? "+" : "";
    const cls = delta < 0 ? "good" : delta > 0 ? "bad" : "";
    return {
      globalAvgText,
      yourAvgText: `Your avg ${yourAvg.toFixed(2)}`,
      comparisonText: `${sign}${delta.toFixed(2)} vs avg`,
      cls,
    };
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

  // Stamped on every real change, in localStorage AND (via queueFileSync) the linked file --
  // lets import/link/reconnect compare "which copy is actually newer" instead of guessing.
  function save() {
    state.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    queueFileSync();
  }

  function formatSavedAt(ts) {
    if (!ts) return "unknown";
    return new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  // Builds the "which one is newer" block used in both the manual Import confirm and the
  // link/reconnect-to-an-existing-file confirm. Falls back to a plain "can't compare" note when
  // either side predates this feature (no savedAt) or was never saved at all.
  function savedAtComparisonText(currentTs, otherTs, otherLabel) {
    if (!currentTs || !otherTs) return "(Save time unknown for one or both — unable to compare.)";
    const lines = [
      `Current data last saved: ${formatSavedAt(currentTs)}`,
      `${otherLabel} last saved: ${formatSavedAt(otherTs)}`,
    ];
    if (otherTs > currentTs) lines.push(`${otherLabel} is NEWER.`);
    else if (otherTs < currentTs) lines.push("Your current data is NEWER.");
    else lines.push("Both were saved at the same time.");
    return lines.join("\n");
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
      const comparison = savedAtComparisonText(state.savedAt, parsed.savedAt, "The file's data");
      const useExisting = confirm(
        "That file already has enhancement tracker data in it.\n\n" +
        comparison + "\n\n" +
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
    // Deliberately not a full renderDetail() -- that would rebuild the name input out from under
    // an in-progress edit. Its label depends on the name too, though, so patch it directly.
    const shareBtn = document.getElementById("btn-share-card");
    if (shareBtn) shareBtn.textContent = `Share ${acc.name} Card`;
  }

  // ---------- Rendering ----------

  function render() {
    renderTabs();
    const overview = state.activeSet === "overview";
    const overlays = state.activeSet === "overlays";
    const normal = !overview && !overlays;
    document.getElementById("accessory-grid").style.display = normal ? "" : "none";
    document.getElementById("detail-panel").style.display = normal ? "" : "none";
    document.getElementById("nerd-stats-panel").style.display = normal ? "" : "none";
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
      renderNerdStatsPanel();
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
      // Maxed pieces force threshold to a placeholder 1 just to fill the bar, so the count next
      // to it would be meaningless there -- only show it for pieces still actually climbing.
      const pityLabel = maxed ? "" : `${acc.pityStack} / ${threshold}`;

      card.className = "acc-card" + (acc.id === setState.selectedId ? " selected" : "");
      card.innerHTML = `
        <div class="acc-icon-wrap">${iconSrc ? `<img src="${iconSrc}" alt="${acc.type}">` : ""}${romanOverlayHtml(acc.currentLevel)}</div>
        <div class="acc-name">${escapeHtml(acc.name)}</div>
        <div class="acc-level-badge${maxed ? " maxed" : ""}">${maxed ? "MAX &bull; " + acc.currentLevel.toUpperCase() : acc.currentLevel}</div>
        <div class="acc-mini-pity-row">
          <div class="acc-mini-pity${ready ? " ready" : ""}"><div style="width:${pct}%"></div></div>
          ${pityLabel ? `<span class="acc-mini-pity-count">${pityLabel}</span>` : ""}
        </div>
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
        <div class="detail-header-actions">
          <button class="btn btn-ghost btn-share" id="btn-share-card" title="Download a shareable summary image of this item's progress">Share ${escapeHtml(acc.name)} Card</button>
          <button class="btn btn-ghost btn-share" id="btn-share-overall-card" title="Download a shareable summary image of every accessory combined">Share Overall Card</button>
        </div>
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
          ${levelRows.map((r) => levelRateRowHtml(setDef, r)).join("")}
        </div>
      </div>
      ` : ""}

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
      generateShareCard(setDef, acc, iconSrc, { total, successes, pity, fails, rate }, maxed, target, levelRows);
    });
    document.getElementById("btn-share-overall-card").addEventListener("click", () => {
      generateOverallShareCard(setDef, setState);
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

  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) { resolve(null); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // ---------- Share card visual helpers (background, badge circle, stat chips, dividers) ----------
  // Extracted so the per-item and overall share cards look like the same "series" of card instead
  // of visually drifting apart over time.

  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  // Diagonal gradient + two soft accent glows (bright behind the badge circle, dim in the
  // opposite corner for depth) + a large, very faint watermark of the item's own icon bleeding
  // off the bottom-right corner (a common "trading card" touch) + a doubled border, instead of a
  // flat fill and a single stroke. The watermark shares the same withIcon/iconImg gating as the
  // badge circle -- drawing either one taints the canvas the same way under file://, so both need
  // to disappear together on the icon-less fallback pass.
  function drawShareCardBackground(ctx, W, H, accent, iconImg, withIcon) {
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#120e18");
    bgGrad.addColorStop(0.55, "#1a1522");
    bgGrad.addColorStop(1, "#221a2c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const glow1 = ctx.createRadialGradient(W - 84, 70, 10, W - 84, 70, 240);
    glow1.addColorStop(0, hexToRgba(accent, 0.28));
    glow1.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(50, H - 40, 10, 50, H - 40, 220);
    glow2.addColorStop(0, hexToRgba(accent, 0.14));
    glow2.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    if (withIcon && iconImg) {
      ctx.save();
      const size = Math.min(H * 1.15, 380);
      ctx.globalAlpha = 0.07;
      ctx.drawImage(iconImg, W - size * 0.62, H - size * 0.62, size, size);
      ctx.restore();
    }

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    roundRectPath(ctx, 4, 4, W - 8, H - 8, 14);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    roundRectPath(ctx, 10, 10, W - 20, H - 20, 10);
    ctx.stroke();
  }

  // Small rounded pill badge (used for the set name in the header) -- filled with a translucent
  // tint of the accent color and outlined, rather than plain floating text.
  function drawPillLabel(ctx, text, x, y, accent) {
    ctx.font = "700 11px -apple-system, Segoe UI, sans-serif";
    const textW = ctx.measureText(text).width;
    const padX = 10, h = 22;
    ctx.fillStyle = hexToRgba(accent, 0.2);
    roundRectPath(ctx, x, y, textW + padX * 2, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    roundRectPath(ctx, x, y, textW + padX * 2, h, h / 2);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + padX, y + h / 2 + 1);
    ctx.textBaseline = "alphabetic";
    return h;
  }

  // The circular badge in the top-right: a soft glow behind it, the icon (if available) clipped
  // into a ring, a double-ring border, and whatever center overlay the caller draws (a roman
  // numeral for one accessory, an "X/Y" maxed count for the overall card).
  function drawBadgeCircle(ctx, { cx, cy, r, accent, iconImg, withIcon, drawCenter }) {
    const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.4);
    glow.addColorStop(0, hexToRgba(accent, 0.45));
    glow.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    const circGrad = ctx.createRadialGradient(cx, cy - 16, 8, cx, cy, r);
    circGrad.addColorStop(0, accent);
    circGrad.addColorStop(1, "#000");
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = circGrad;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (withIcon && iconImg) {
      const size = r * 1.18;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(iconImg, cx - size / 2, cy - size / 2, size, size);
      ctx.restore();
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = "center";
    drawCenter(ctx);
    ctx.textAlign = "left";
  }

  // Each stat as a rounded "chip" tile (translucent fill + hairline border) instead of raw
  // floating text, so the stats row reads as a unified strip of tiles.
  function drawStatChips(ctx, statsList, { M, W, y, h }) {
    const gap = 10;
    const n = statsList.length;
    const chipW = (W - M * 2 - gap * (n - 1)) / n;
    statsList.forEach(([label, val], i) => {
      const x = M + i * (chipW + gap);
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      roundRectPath(ctx, x, y, chipW, h, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      roundRectPath(ctx, x, y, chipW, h, 10);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#a496b8";
      ctx.font = "600 11px -apple-system, Segoe UI, sans-serif";
      ctx.fillText(label.toUpperCase(), x + chipW / 2, y + 23);
      ctx.fillStyle = "#f2ecf7";
      ctx.font = "700 24px Georgia, serif";
      ctx.fillText(String(val), x + chipW / 2, y + 50);
      ctx.textAlign = "left";
    });
  }

  // Thin accent-to-transparent divider line, used to separate major sections of a card.
  function drawDivider(ctx, x1, x2, y, accent) {
    const grad = ctx.createLinearGradient(x1, 0, x2, 0);
    grad.addColorStop(0, hexToRgba(accent, 0.6));
    grad.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(x1, y, x2 - x1, 2);
  }

  // Shared by the per-item share card and the overall (all-accessories) share card -- draws the
  // "RATES BY LEVEL" block starting at ratesTop, one row per level. Level names vary hugely in
  // width across sets (PRI/DEC vs. Alchemy's SHINING/RESPLENDENT), so the later columns can't sit
  // at a fixed offset without either overlapping long names or wasting space for short ones --
  // size the level column to whatever's actually the longest name in THIS card instead.
  function drawRatesByLevelBlock(ctx, levelRows, { M, W, ratesTop, ratesRowH, accent }) {
    ctx.fillStyle = "#a496b8";
    ctx.font = "700 12px -apple-system, Segoe UI, sans-serif";
    ctx.fillText("RATES BY LEVEL", M, ratesTop);
    drawDivider(ctx, M, W - M, ratesTop + 8, accent);

    ctx.font = "700 13px Georgia, serif";
    const levelColW = Math.max(...levelRows.map((r) => ctx.measureText(r.level.toUpperCase()).width));
    const colTaps = M + levelColW + 26;
    const colSuccess = colTaps + 66;
    const colPity = colSuccess + 110;
    const colFail = colPity + 70;

    levelRows.forEach((r, i) => {
      const ry = ratesTop + 30 + i * ratesRowH;
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)";
      roundRectPath(ctx, M, ry - 17, W - M * 2, 24, 6);
      ctx.fill();

      ctx.fillStyle = accent;
      ctx.font = "700 13px Georgia, serif";
      ctx.fillText(r.level.toUpperCase(), M + 10, ry);

      ctx.font = "12px -apple-system, Segoe UI, sans-serif";
      ctx.fillStyle = "#c3b6d1";
      ctx.fillText(`${r.attempts} taps`, colTaps, ry);
      ctx.fillStyle = "#4caf7d";
      ctx.fillText(`${r.successes} success${r.successes === 1 ? "" : "es"}`, colSuccess, ry);
      ctx.fillStyle = "#5aa9e6";
      ctx.fillText(`${r.pity} pity`, colPity, ry);
      ctx.fillStyle = "#e0645f";
      ctx.fillText(`${r.fails} fail${r.fails === 1 ? "" : "s"}`, colFail, ry);

      ctx.fillStyle = "#f2ecf7";
      ctx.font = "700 13px Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText(`${r.rate}%`, W - M - 10, ry);
      ctx.textAlign = "left";
    });
  }

  async function generateShareCard(setDef, acc, iconSrc, stats, maxed, target, levelRows) {
    // Opened synchronously (still inside the click handler's call stack, before any await) so
    // browsers treat it as a direct result of the user's click rather than an unsolicited
    // popup. Filled in with the real content further down once the canvas is ready.
    const win = window.open("", "_blank");
    if (!win) {
      showToast("Could not open the preview — check your popup blocker");
      return;
    }
    win.document.write(`<!DOCTYPE html><title>Generating&hellip;</title><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0a12;color:#8d7f9d;font-family:-apple-system,'Segoe UI',sans-serif;">Generating share card&hellip;</body>`);
    win.document.close();

    const iconImg = await loadImage(iconSrc);
    if (win.closed) return;

    const accent = THEME_ACCENT[setDef.theme] || THEME_ACCENT.purple;
    const cur = currentFailStreak(acc.log, setDef.pityThreshold);
    const longest = longestFailStreak(acc.log, setDef.pityThreshold);

    // Compact, dynamically-sized layout: a left-column cursor advances only as far as the
    // content actually drawn (e.g. no streak line -> no leftover gap before Rates by Level),
    // instead of every section living at a fixed offset sized for the worst case.
    const W = 720;
    const M = 36;
    let cursorY = 154; // below the header block (name + circle badge)
    cursorY += 76; // stats row (chips end at y=202; this leaves real breathing room before the
    // next line's text, instead of its ascenders nearly touching the chip bottoms)
    if (longest > 0) cursorY += 34; // streak line
    const ratesTop = cursorY + 20;
    const ratesRowH = 26;
    const ratesBlockH = levelRows.length ? 30 + levelRows.length * ratesRowH + 8 : 0;
    const H = (levelRows.length ? ratesTop + ratesBlockH : cursorY + 4) + 40;

    // Draws the whole card onto a brand-new canvas and returns it. Tainting (from drawing a
    // local file:// icon without image access) is permanent for a given canvas element once it
    // happens -- retrying toDataURL() on the SAME canvas after removing the icon would still
    // fail, so the icon-less fallback below draws on a fresh canvas instead of reusing this one.
    function draw(withIcon) {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      drawShareCardBackground(ctx, W, H, accent, iconImg, withIcon);
      drawPillLabel(ctx, setDef.label.toUpperCase(), M, 26, accent);

      ctx.fillStyle = "#f2ecf7";
      ctx.font = "700 32px Georgia, serif";
      ctx.fillText(acc.name, M, 84);

      // Smaller than before (was r=56) and nudged up -- at the old size its glow reached down far
      // enough to overlap the Success Rate chip below it.
      const cx = W - 84, cy = 70, r = 42;
      drawBadgeCircle(ctx, {
        cx, cy, r, accent, iconImg, withIcon,
        drawCenter: (ctx) => {
          // Doubled from the old 19/20px so the level reads at a glance. Both forms still
          // shrink to fit: the widest numeral (VIII) is 80px at 38px type against an 84px
          // circle, and the spelled-out levels (Alchemy's SHINING/RESPLENDENT) never fit at
          // full size, so they step down until they do rather than overflowing the badge.
          const numeral = romanNumeralFor(acc.currentLevel);
          const label = numeral || acc.currentLevel.toUpperCase();
          const maxWidth = (r - 5) * 2; // keeps the widest numeral clear of the ring
          let fontSize = 38;
          ctx.font = `700 ${fontSize}px Georgia, serif`;
          // 1px steps rather than 2px: only VIII needs trimming at all, and a coarse step would
          // drop it further below the others than it has to.
          while (ctx.measureText(label).width > maxWidth && fontSize > 9) {
            fontSize -= 1;
            ctx.font = `700 ${fontSize}px Georgia, serif`;
          }
          if (numeral) {
            // White text with a black outline, same convention as the roman-numeral badges
            // painted over icons everywhere else in the app. The outline scales with the type
            // so it stays proportional at whatever size the fit loop settled on.
            ctx.lineWidth = Math.max(3, Math.round(fontSize / 5));
            ctx.strokeStyle = "#000";
            ctx.lineJoin = "round";
            ctx.strokeText(label, cx, cy + fontSize / 3);
          }
          ctx.fillStyle = "#fff";
          ctx.fillText(label, cx, cy + fontSize / 3);
        },
      });

      if (maxed) {
        ctx.fillStyle = "#f0d878";
        ctx.font = "700 20px Georgia, serif";
        ctx.fillText("★ MAX LEVEL REACHED", M, 120);
      } else {
        ctx.fillStyle = "#c3b6d1";
        ctx.font = "16px -apple-system, Segoe UI, sans-serif";
        ctx.fillText(`Working toward ${target.toUpperCase()}`, M, 120);
      }

      const statsList = [
        ["Attempts", stats.total],
        ["Successes", stats.successes],
        ["Pity", stats.pity],
        ["Fails", stats.fails],
        ["Success Rate", stats.rate + "%"],
      ];
      drawStatChips(ctx, statsList, { M, W, y: 138, h: 64 });

      let y = 230; // 154 + 76 -- matches the cursorY reservation above
      if (longest > 0) {
        ctx.fillStyle = "#f0827d";
        ctx.font = "600 15px -apple-system, Segoe UI, sans-serif";
        const streakText = cur > 0
          ? `\u{1F9CA} Current fail streak: ${cur}  •  Longest fail streak: ${longest}`
          : `\u{1F9CA} Longest fail streak: ${longest}`;
        ctx.fillText(streakText, M, y);
        y += 34;
      }

      if (levelRows.length) {
        drawRatesByLevelBlock(ctx, levelRows, { M, W, ratesTop, ratesRowH, accent });
      }

      drawDivider(ctx, M, W - M, H - 40, accent);
      ctx.fillStyle = "#5a4f66";
      ctx.font = "12px -apple-system, Segoe UI, sans-serif";
      ctx.fillText("Enhancement Tracker", M, H - 20);
      ctx.textAlign = "right";
      ctx.fillText(new Date().toLocaleDateString(), W - M, H - 20);
      ctx.textAlign = "left";
      return canvas;
    }

    let dataUrl;
    try {
      dataUrl = draw(true).toDataURL("image/png");
    } catch (e) {
      // Drawing the icon tainted the canvas (e.g. file:// without local image access) --
      // a fresh canvas without it will export fine instead of failing the whole share card.
      dataUrl = draw(false).toDataURL("image/png");
    }

    if (win.closed) return;
    const filename = `${setDef.label}-${acc.name}-share-card.png`.replace(/\s+/g, "-").toLowerCase();
    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(acc.name)} Share Card</title>
        <style>
          html, body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            background: #0d0a12;
            font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
            padding: 32px;
            box-sizing: border-box;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
          }
          a.download-btn {
            background: linear-gradient(135deg, #7c4dbd, #a875e0);
            color: #17101f;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 0.95rem;
            font-family: inherit;
          }
          a.download-btn:hover { filter: brightness(1.1); }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="${escapeHtml(acc.name)} share card preview">
        <a class="download-btn" href="${dataUrl}" download="${filename}">Download PNG</a>
      </body>
      </html>
    `);
    win.document.close();
    showToast("Share card preview opened in a new tab");
  }

  // Same idea as generateShareCard, but for the whole set instead of one accessory -- everything
  // merged across every trackable piece (the same merged data Overall History and Stats for
  // Nerds already use), so it reads as "here's my Ekleta progress overall" rather than one item.
  async function generateOverallShareCard(setDef, setState) {
    const win = window.open("", "_blank");
    if (!win) {
      showToast("Could not open the preview — check your popup blocker");
      return;
    }
    win.document.write(`<!DOCTYPE html><title>Generating&hellip;</title><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0a12;color:#8d7f9d;font-family:-apple-system,'Segoe UI',sans-serif;">Generating share card&hellip;</body>`);
    win.document.close();

    const trackedIds = setDef.accessories.filter((a) => pieceStatus(setDef, setState, a.id).kind === "normal");
    const iconSrc = trackedIds.length ? getAccessoryIcon(setDef, setState, trackedIds[0].id) : "";
    const iconImg = await loadImage(iconSrc);
    if (win.closed) return;

    const accent = THEME_ACCENT[setDef.theme] || THEME_ACCENT.purple;
    const allLogs = trackedIds.flatMap((a) => setState.accessories[a.id].log);
    const stats = computeStats(allLogs, setDef.pityThreshold);
    // Chronological (oldest-first) across every accessory combined, same merge Overall History
    // uses for its streak row -- a fail streak can span accessory boundaries in time order.
    const chronological = allLogs
      .filter((e) => e.type === "success" || e.type === "fail")
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp);
    const cur = currentFailStreak(chronological, setDef.pityThreshold);
    const longest = longestFailStreak(chronological, setDef.pityThreshold);
    const levelRows = computeSetLevelBreakdown(setDef, setState);
    const luck = computeLuckScore(setDef, levelRows);
    const cronStats = computeCronStats(setDef, levelRows);
    const maxedCount = trackedIds.filter((a) => isMaxed(setState.accessories[a.id].currentLevel, setDef.levels)).length;
    const totalCount = trackedIds.length;
    const fullyMaxed = totalCount > 0 && maxedCount === totalCount;

    const W = 720;
    const M = 36;
    let cursorY = 154;
    cursorY += 76; // stats row (chips end at y=202; this leaves real breathing room before the
    // next line's text, instead of its ascenders nearly touching the chip bottoms)
    if (longest > 0) cursorY += 34; // streak line
    if (luck) cursorY += 26; // luck score line
    const ratesTop = cursorY + 20;
    const ratesRowH = 26;
    const ratesBlockH = levelRows.length ? 30 + levelRows.length * ratesRowH + 8 : 0;
    const afterRatesY = levelRows.length ? ratesTop + ratesBlockH : cursorY + 4;
    const cronLineY = afterRatesY + (cronStats ? 12 : 0);
    const H = cronLineY + (cronStats ? 28 : 0) + 40;

    function draw(withIcon) {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      drawShareCardBackground(ctx, W, H, accent, iconImg, withIcon);
      drawPillLabel(ctx, setDef.label.toUpperCase(), M, 26, accent);

      ctx.fillStyle = "#f2ecf7";
      ctx.font = "700 32px Georgia, serif";
      ctx.fillText("All Accessories", M, 84);

      // Smaller than before (was r=56) and nudged up -- at the old size its glow reached down far
      // enough to overlap the Success Rate chip below it.
      const cx = W - 84, cy = 70, r = 42;
      drawBadgeCircle(ctx, {
        cx, cy, r, accent, iconImg, withIcon,
        // "3/6" maxed-count overlay instead of a single roman numeral -- there's no one level to
        // show when this card is summarizing every accessory at once.
        drawCenter: (ctx) => {
          const countLabel = `${maxedCount}/${totalCount}`;
          ctx.font = "700 18px Georgia, serif";
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#000";
          ctx.lineJoin = "round";
          ctx.strokeText(countLabel, cx, cy + 6);
          ctx.fillStyle = "#fff";
          ctx.fillText(countLabel, cx, cy + 6);
        },
      });

      if (fullyMaxed) {
        ctx.fillStyle = "#f0d878";
        ctx.font = "700 20px Georgia, serif";
        ctx.fillText("★ ALL ACCESSORIES MAXED", M, 120);
      } else {
        ctx.fillStyle = "#c3b6d1";
        ctx.font = "16px -apple-system, Segoe UI, sans-serif";
        ctx.fillText(`${maxedCount} of ${totalCount} accessories maxed`, M, 120);
      }

      const statsList = [
        ["Attempts", stats.total],
        ["Successes", stats.successes],
        ["Pity", stats.pity],
        ["Fails", stats.fails],
        ["Success Rate", stats.rate + "%"],
      ];
      drawStatChips(ctx, statsList, { M, W, y: 138, h: 64 });

      let y = 230; // 154 + 76 -- matches the cursorY reservation above
      if (longest > 0) {
        ctx.fillStyle = "#f0827d";
        ctx.font = "600 15px -apple-system, Segoe UI, sans-serif";
        const streakText = cur > 0
          ? `\u{1F9CA} Current fail streak: ${cur}  •  Longest fail streak: ${longest}`
          : `\u{1F9CA} Longest fail streak: ${longest}`;
        ctx.fillText(streakText, M, y);
        y += 34;
      }

      if (luck) {
        ctx.fillStyle = luck.score < 0 ? "#4caf7d" : luck.score > 0 ? "#e0645f" : "#c3b6d1";
        ctx.font = "600 15px -apple-system, Segoe UI, sans-serif";
        const verdict = luck.score < 0 ? "luckier" : luck.score > 0 ? "unluckier" : "dead on";
        ctx.fillText(`\u{1F340} Luck Score: ${luck.score > 0 ? "+" : ""}${luck.score.toFixed(1)} (${verdict} than average)`, M, y);
        y += 26;
      }

      if (levelRows.length) {
        drawRatesByLevelBlock(ctx, levelRows, { M, W, ratesTop, ratesRowH, accent });
      }

      if (cronStats) {
        ctx.fillStyle = "#8d7f9d";
        ctx.font = "600 13px -apple-system, Segoe UI, sans-serif";
        ctx.fillText(`Total Crons Used: ${cronStats.total.toLocaleString()}`, M, cronLineY + 16);
      }

      drawDivider(ctx, M, W - M, H - 40, accent);
      ctx.fillStyle = "#5a4f66";
      ctx.font = "12px -apple-system, Segoe UI, sans-serif";
      ctx.fillText("Enhancement Tracker", M, H - 20);
      ctx.textAlign = "right";
      ctx.fillText(new Date().toLocaleDateString(), W - M, H - 20);
      ctx.textAlign = "left";
      return canvas;
    }

    let dataUrl;
    try {
      dataUrl = draw(true).toDataURL("image/png");
    } catch (e) {
      dataUrl = draw(false).toDataURL("image/png");
    }

    if (win.closed) return;
    const filename = `${setDef.label}-all-accessories-share-card.png`.replace(/\s+/g, "-").toLowerCase();
    win.document.open();
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(setDef.label)} Overall Share Card</title>
        <style>
          html, body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            background: #0d0a12;
            font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
            padding: 32px;
            box-sizing: border-box;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
          }
          a.download-btn {
            background: linear-gradient(135deg, #7c4dbd, #a875e0);
            color: #17101f;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 0.95rem;
            font-family: inherit;
          }
          a.download-btn:hover { filter: brightness(1.1); }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="${escapeHtml(setDef.label)} overall share card preview">
        <a class="download-btn" href="${dataUrl}" download="${filename}">Download PNG</a>
      </body>
      </html>
    `);
    win.document.close();
    showToast("Share card preview opened in a new tab");
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
        const comparison = savedAtComparisonText(state.savedAt, parsed.savedAt, "This file");
        const proceed = confirm(
          "Import this file and replace what's currently loaded here?\n\n" +
          comparison + "\n\n" +
          "OK — import and overwrite. Cancel — keep your current data."
        );
        if (!proceed) { showToast("Import canceled"); return; }
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
