(function (global) {
  "use strict";

  // Default level ladder used by sets that don't define their own. Future sets (armor,
  // weapons, ...) can specify a different `levels` array if their gear doesn't follow
  // this same Base->Dec chain.
  const DEFAULT_LEVELS = ["Base", "Pri", "Duo", "Tri", "Tet", "Pen", "Hex", "Sep", "Oct", "Nov", "Dec"];

  // Candidate BDO class roster for the Sovereign weapon set's class picker. A class only
  // shows up in the picker once Images/Weapons/<Name>/ actually contains its mainhand,
  // awakening, and offhand images (auto-detected at runtime — nothing else to configure).
  // Add a name here whenever you create a new class folder; folder name must match exactly.
  const WEAPON_CLASSES = [
    "Warrior", "Ranger", "Sorceress", "Berserker", "Tamer", "Musa", "Maehwa", "Valkyrie",
    "Kunoichi", "Ninja", "Wizard", "Witch", "DarkKnight", "Striker", "Mystic", "Lahn",
    "Archer", "Shai", "Guardian", "Hashashin", "Nova", "Sage", "Corsair", "Drakania",
    "Woosa", "Maegu", "Scholar", "Deadeye", "Dosa", "Wukong", "Seraph", "Agent"
  ];

  // Each entry is one trackable gear set (a tab in the main sheet, and one overlay's worth
  // of cards). To add a new one later (armor, weapons, ...): add a key here with its own
  // `levels` ladder, `pityThreshold` map (keyed by every level in `levels` except the first),
  // and `accessories` list (any number of pieces, each just {id, name, type, icon}) — then
  // add that key to SET_ORDER. Nothing else in app.js/overlay.js needs to change.
  const SETS = {
    ekleta: {
      key: "ekleta",
      label: "Ekleta",
      category: "accessory",
      theme: "crimson",
      levels: DEFAULT_LEVELS,
      // Pity stack required (max fails) before the next enhancement is guaranteed, keyed by the level being reached.
      pityThreshold: {
        Pri: 7, Duo: 7, Tri: 8, Tet: 9, Pen: 10, Hex: 12, Sep: 14, Oct: 16, Nov: 20, Dec: 30
      },
      // Community-average total attempts (tries) to clear each level, keyed the same way as
      // pityThreshold. Optional per set — only Rates by Level rows for a level in here get a
      // "vs average" comparison; sets without this field render exactly as before.
      avgAttempts: {
        Pri: 2.96, Duo: 3.34, Tri: 3.64, Tet: 3.69, Pen: 4.61,
        Hex: 5.36, Sep: 5.76, Oct: 7.09, Nov: 8.86, Dec: 13.39
      },
      accessories: [
        { id: "ring1", name: "Ring 1", type: "ring", icon: "Images/Ekleta/ring.png" },
        { id: "ring2", name: "Ring 2", type: "ring", icon: "Images/Ekleta/ring.png" },
        { id: "earring1", name: "Earring 1", type: "earring", icon: "Images/Ekleta/earring.png" },
        { id: "earring2", name: "Earring 2", type: "earring", icon: "Images/Ekleta/earring.png" },
        { id: "belt", name: "Belt", type: "belt", icon: "Images/Ekleta/belt.png" },
        { id: "neck", name: "Neck", type: "neck", icon: "Images/Ekleta/neck.png" }
      ]
    },
    apeiron: {
      key: "apeiron",
      label: "Apeiron",
      category: "accessory",
      theme: "purple",
      levels: DEFAULT_LEVELS,
      pityThreshold: {
        Pri: 9, Duo: 9, Tri: 10, Tet: 10, Pen: 11, Hex: 12, Sep: 13, Oct: 15, Nov: 17, Dec: 27
      },
      accessories: [
        { id: "ring1", name: "Ring 1", type: "ring", icon: "Images/Apeiron/ring.png" },
        { id: "ring2", name: "Ring 2", type: "ring", icon: "Images/Apeiron/ring.png" },
        { id: "earring1", name: "Earring 1", type: "earring", icon: "Images/Apeiron/earring.png" },
        { id: "earring2", name: "Earring 2", type: "earring", icon: "Images/Apeiron/earring.png" },
        { id: "belt", name: "Belt", type: "belt", icon: "Images/Apeiron/belt.png" },
        { id: "neck", name: "Neck", type: "neck", icon: "Images/Apeiron/neck.png" }
      ]
    },
    edana: {
      key: "edana",
      label: "Edana",
      category: "armor",
      theme: "red",
      levels: DEFAULT_LEVELS,
      pityThreshold: {
        Pri: 2, Duo: 3, Tri: 5, Tet: 8, Pen: 11, Hex: 22, Sep: 25, Oct: 30, Nov: 65, Dec: 85
      },
      accessories: [
        { id: "helm", name: "Heavensmite", type: "helm", icon: "Images/Edana/helm.png" },
        { id: "chest", name: "Abyssveil", type: "armor", icon: "Images/Edana/chest.png" },
        { id: "gloves", name: "Oathgrip", type: "gloves", icon: "Images/Edana/gloves.png" },
        { id: "boots", name: "Furystride", type: "boots", icon: "Images/Edana/boots.png" }
      ]
    },
    sovereign: {
      key: "sovereign",
      label: "Sovereign",
      category: "weapon",
      theme: "gold",
      levels: DEFAULT_LEVELS,
      pityThreshold: {
        Pri: 3, Duo: 5, Tri: 10, Tet: 20, Pen: 30, Hex: 35, Sep: 50, Oct: 75, Nov: 165, Dec: 330
      },
      // classVariant sets don't have a fixed `icon` per piece — instead each piece has an
      // `iconFile` (basename, no extension), and the actual image is resolved at runtime as
      // Images/<imageFolder>/<selected class>/<iconFile>.{png,webp} once that class's
      // folder is detected to have all three pieces present.
      classVariant: true,
      imageFolder: "Weapons",
      classes: WEAPON_CLASSES,
      accessories: [
        { id: "mainhand", name: "Main Hand", type: "main hand", iconFile: "mainhand" },
        { id: "awakening", name: "Awakening", type: "awakening", iconFile: "awakening" },
        { id: "offhand", name: "Offhand", type: "offhand", iconFile: "offhand" }
      ]
    },
    alchemy: {
      key: "alchemy",
      label: "Alchemy Stones",
      category: "alchemy",
      theme: "emerald",
      // Alchemy stones don't follow the usual Base->Dec chain at all.
      levels: ["Imperfect", "Sturdy", "Sharp", "Resplendent", "Splendid", "Shining"],
      pityThreshold: {
        Sturdy: 2, Sharp: 5, Resplendent: 30, Splendid: 80, Shining: 250
      },
      // levelVariant sets don't have a fixed `icon` per piece either — unlike classVariant
      // (icon depends on a class YOU pick), here the icon depends on the piece's OWN current
      // level, since each stone visually changes as it enhances. Resolved at runtime as
      // Images/<imageFolder>/<iconFolder>/<level, lowercased>.{png,webp}.
      levelVariant: true,
      imageFolder: "Alchemy",
      accessories: [
        { id: "destruction", name: "Destruction", type: "stone", iconFolder: "Destruction" },
        { id: "life", name: "Life", type: "stone", iconFolder: "Life" },
        { id: "protection", name: "Protection", type: "stone", iconFolder: "Protection" }
      ]
    }
    // Future sets get added here, same shape as above. `theme` picks the color palette (see
    // the `body[data-theme]` blocks in style.css / overlay.css) — reuse an existing theme
    // name or add a new one + matching CSS block for a new palette.
  };

  // Roman numeral overlay shown on top of an icon, keyed by level name. Only the standard
  // Pri->Dec ladder has a natural numeral mapping — Base and Alchemy's custom level names
  // (Sturdy, Sharp, ...) simply aren't in this map, so they naturally get no overlay without
  // needing a per-set flag.
  const ROMAN_NUMERALS = {
    Pri: "I", Duo: "II", Tri: "III", Tet: "IV", Pen: "V",
    Hex: "VI", Sep: "VII", Oct: "VIII", Nov: "IX", Dec: "X"
  };

  function romanNumeralFor(level) {
    return ROMAN_NUMERALS[level] || null;
  }

  // Tab order on the main sheet. Append new set keys here as they're added to SETS.
  const SET_ORDER = ["ekleta", "apeiron", "edana", "sovereign", "alchemy"];

  function nextLevel(level, levels) {
    const ladder = levels || DEFAULT_LEVELS;
    const i = ladder.indexOf(level);
    if (i === -1 || i === ladder.length - 1) return null;
    return ladder[i + 1];
  }

  function isMaxed(level, levels) {
    const ladder = levels || DEFAULT_LEVELS;
    return ladder.indexOf(level) === ladder.length - 1;
  }

  function freshAccessoryState(def, startLevel) {
    return {
      id: def.id,
      name: def.name,
      type: def.type,
      icon: def.icon,
      currentLevel: startLevel || "Base",
      pityStack: 0,
      log: []
    };
  }

  function freshSetState(setKey) {
    const def = SETS[setKey];
    const startLevel = def.levels[0];
    const accessories = {};
    def.accessories.forEach((accDef) => {
      accessories[accDef.id] = freshAccessoryState(accDef, startLevel);
    });
    return { accessories, selectedId: def.accessories[0].id };
  }

  // Overall totals across every logged attempt, regardless of level. "adjust" entries
  // (manual level/pity corrections) are not real enhancement attempts, so they're excluded.
  function computeStats(log) {
    const total = log.filter((e) => e.type !== "adjust").length;
    const successes = log.filter((e) => e.type === "success").length;
    const fails = log.filter((e) => e.type === "fail").length;
    const rate = total ? Math.round((successes / total) * 100) : 0;
    return { total, successes, fails, rate };
  }

  // Consecutive fails at the very end of the log (i.e. since the last success), ignoring
  // "adjust" entries entirely since they aren't real attempts. Computed fresh from the log
  // rather than trusted from pityStack, so it stays correct even after an undo/manual edit.
  function currentFailStreak(log) {
    let streak = 0;
    for (let i = log.length - 1; i >= 0; i--) {
      const entry = log[i];
      if (entry.type === "adjust") continue;
      if (entry.type === "fail") { streak++; continue; }
      break; // success
    }
    return streak;
  }

  // The longest run of consecutive fails anywhere in the log's history, not just the current
  // one. A "worst it ever got" stat, independent of whatever the pity threshold happened to be.
  function longestFailStreak(log) {
    let longest = 0;
    let running = 0;
    for (const entry of log) {
      if (entry.type === "adjust") continue;
      if (entry.type === "fail") {
        running++;
        longest = Math.max(longest, running);
      } else {
        running = 0;
      }
    }
    return longest;
  }

  // The run of consecutive same-outcome attempts at the very end of the log — "success" while
  // you're on a hot streak, "fail" while you're on a cold one. Returns {type, count}, with
  // type null (count 0) if the log has no real attempts yet. Unlike currentFailStreak, this
  // doesn't stop counting the moment a success shows up — it just switches to tracking that.
  function currentStreak(log) {
    let type = null;
    let count = 0;
    for (let i = log.length - 1; i >= 0; i--) {
      const entry = log[i];
      if (entry.type === "adjust") continue;
      if (type === null) {
        type = entry.type;
        count = 1;
      } else if (entry.type === type) {
        count++;
      } else {
        break;
      }
    }
    return { type, count };
  }

  // The single longest same-outcome run anywhere in the log's history — could be a hot streak
  // or a cold one, whichever was longer. Returns {type, count}.
  function longestStreak(log) {
    let bestType = null;
    let best = 0;
    let curType = null;
    let cur = 0;
    for (const entry of log) {
      if (entry.type === "adjust") continue;
      if (entry.type === curType) {
        cur++;
      } else {
        curType = entry.type;
        cur = 1;
      }
      if (cur > best) {
        best = cur;
        bestType = curType;
      }
    }
    return { type: bestType, count: best };
  }

  // Per-level breakdown, in level order for the given ladder. A level is only included if
  // it has real logged attempts — levels skipped via a manual "start at Tet" style
  // adjustment have none, so they're correctly omitted rather than showing a fabricated 0/0 row.
  function levelBreakdown(log, levels) {
    const ladder = levels || DEFAULT_LEVELS;
    const rows = [];
    for (let i = 1; i < ladder.length; i++) {
      const level = ladder[i];
      const entries = log.filter((e) => e.type !== "adjust" && e.targetLevel === level);
      if (!entries.length) continue;
      const successes = entries.filter((e) => e.type === "success").length;
      const fails = entries.filter((e) => e.type === "fail").length;
      const attempts = successes + fails;
      const rate = attempts ? Math.round((successes / attempts) * 100) : 0;
      rows.push({ level, attempts, successes, fails, rate, cleared: successes > 0 });
    }
    return rows;
  }

  // Tries each extension in turn and resolves to whichever loads first (or null if none do).
  // Lets a class folder use raw .webp exports without requiring manual conversion.
  const IMAGE_EXTENSIONS = ["png", "webp"];

  function probeImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function resolvePieceIcon(basePath, fileName) {
    for (const ext of IMAGE_EXTENSIONS) {
      const path = `${basePath}/${fileName}.${ext}`;
      if (await probeImage(path)) return path;
    }
    return null;
  }

  // Piece ids that don't block a class from being "available" even without an image — some
  // classes genuinely don't have one (e.g. no awakening weapon yet, or ever). The piece still
  // renders in the UI, just in a disabled/"Not Available" state instead of hiding the whole class.
  const OPTIONAL_PIECE_IDS = ["awakening"];

  // Per-class, per-piece overrides for gear that doesn't follow the normal pity-tracked flow.
  // Shai's "awakening" slot is actually a different, non-awakening item capped at PEN — it still
  // shows its real icon once one exists, but displays a fixed level and isn't clickable/trackable.
  const CLASS_PIECE_OVERRIDES = {
    Shai: { awakening: { fixedLevel: "Pen" } }
  };

  function getPieceOverride(className, accId) {
    return (CLASS_PIECE_OVERRIDES[className] || {})[accId] || null;
  }

  // For a classVariant set, probes every candidate class in `def.classes` in parallel and
  // resolves which ones have enough accessory pieces present to be usable. Returns
  // { availableClasses: ["Warrior", ...], icons: { Warrior: { mainhand: "path", awakening: "path"|null, ... } } }.
  // Nothing needs configuring beyond dropping image files in Images/<imageFolder>/<Class>/ —
  // required pieces missing means the class doesn't appear; optional pieces (see
  // OPTIONAL_PIECE_IDS) missing just means that one piece shows as unavailable in the UI.
  async function detectClassVariants(def) {
    const results = await Promise.all(def.classes.map(async (classKey) => {
      const basePath = `Images/${def.imageFolder}/${classKey}`;
      const paths = await Promise.all(def.accessories.map((accDef) => resolvePieceIcon(basePath, accDef.iconFile)));
      const complete = def.accessories.every((accDef, i) => paths[i] || OPTIONAL_PIECE_IDS.includes(accDef.id));
      const icons = {};
      if (complete) def.accessories.forEach((accDef, i) => { icons[accDef.id] = paths[i] || null; });
      return { classKey, complete, icons };
    }));
    const availableClasses = results.filter((r) => r.complete).map((r) => r.classKey);
    const icons = {};
    results.forEach((r) => { if (r.complete) icons[r.classKey] = r.icons; });
    return { availableClasses, icons };
  }

  // For a levelVariant set (alchemy stones — each piece's icon depends on its OWN current
  // level, not a user choice), probes every accessory x every level in parallel. Returns
  // { destruction: { Imperfect: "path"|null, Sturdy: "path"|null, ... }, life: {...}, ... }.
  // A missing image for a given level just renders as a blank icon (no picker, no "unavailable"
  // treatment needed) — nothing else to configure beyond dropping files in
  // Images/<imageFolder>/<piece's iconFolder>/<level, lowercased>.{png,webp}.
  async function detectLevelVariants(def) {
    const entries = await Promise.all(def.accessories.map(async (accDef) => {
      const basePath = `Images/${def.imageFolder}/${accDef.iconFolder}`;
      const paths = await Promise.all(def.levels.map((level) => resolvePieceIcon(basePath, level.toLowerCase())));
      const byLevel = {};
      def.levels.forEach((level, i) => { byLevel[level] = paths[i] || null; });
      return [accDef.id, byLevel];
    }));
    return Object.fromEntries(entries);
  }

  // Normalizes any stored/imported JSON into the current { activeSet, sets: { ekleta:{...}, apeiron:{...}, ... } }
  // shape. Handles a fresh install (nothing yet), the legacy pre-Apeiron flat `{accessories, selectedId}`
  // shape (which was always implicitly Ekleta), and the current nested shape — backfilling any missing
  // accessories/sets so older saves keep working as more sets get added here in the future.
  function normalizeState(raw) {
    if (raw && raw.accessories && !raw.sets) {
      raw = { activeSet: "ekleta", sets: { ekleta: raw } };
    }
    if (!raw || typeof raw !== "object") raw = {};
    if (!raw.sets) raw.sets = {};

    SET_ORDER.forEach((setKey) => {
      const def = SETS[setKey];
      if (!raw.sets[setKey] || !raw.sets[setKey].accessories) {
        raw.sets[setKey] = freshSetState(setKey);
        return;
      }
      const setState = raw.sets[setKey];
      def.accessories.forEach((accDef) => {
        if (!setState.accessories[accDef.id]) {
          setState.accessories[accDef.id] = freshAccessoryState(accDef, def.levels[0]);
        } else {
          setState.accessories[accDef.id].icon = accDef.icon;
          setState.accessories[accDef.id].type = accDef.type;
        }
      });
      if (!setState.selectedId || !setState.accessories[setState.selectedId]) {
        setState.selectedId = def.accessories[0].id;
      }
    });

    // "overview" and "overlays" are special pseudo-tabs (all-sets dashboard, OBS overlay
    // downloads), not real sets in SETS.
    const PSEUDO_TABS = ["overview", "overlays"];
    if (!raw.activeSet || (!SETS[raw.activeSet] && !PSEUDO_TABS.includes(raw.activeSet))) raw.activeSet = "ekleta";
    return raw;
  }

  global.EnhancementShared = {
    DEFAULT_LEVELS, SETS, SET_ORDER, WEAPON_CLASSES,
    nextLevel, isMaxed, freshAccessoryState, freshSetState,
    computeStats, currentFailStreak, longestFailStreak, currentStreak, longestStreak, levelBreakdown, normalizeState,
    detectClassVariants, getPieceOverride, detectLevelVariants, romanNumeralFor
  };
})(window);
