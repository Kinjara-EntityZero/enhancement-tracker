# Enhancement Tracker

A personal, static (no build step) tracker for Black Desert Online gear enhancement progress —
Ekleta, Apeiron, Edana, Sovereign, and Alchemy Stones — plus matching [OBS](https://obsproject.com/)
Browser Source overlays for each set.

**Live app:** https://kinjara-entityzero.github.io/enhancement-tracker/

## What's here

- `index.html` / `app.js` / `shared.js` / `style.css` — the main tracker. Runs entirely in your
  browser; your save data stays on your machine (`localStorage`, plus an optional linked save
  file via the File System Access API).
- `overlay-*.html` / `overlay.js` / `overlay.css` — standalone OBS Browser Source overlays, one
  per gear set. Get these (bundled with the icon art and setup instructions) from the **Overlays**
  tab in the live app.

## Asset notice

The icon artwork under `Images/` (and bundled inside the overlay download `.zip` files under
`downloads/`) depicts in-game items from *Black Desert Online*, © Pearl Abyss Corp. Some icons
were sourced via [bdocodex.com](https://bdocodex.com). This is an unofficial, non-commercial
fan-made tool; no ownership of this artwork is claimed, and the project is not affiliated with or
endorsed by Pearl Abyss. If you're a rights holder and would like this content removed, please
open an issue on this repository.
