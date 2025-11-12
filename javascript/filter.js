"use strict";

/* ===========================
   OVERLAY ÅBN/LUK + UI
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.querySelector(".chip--filter");
  const overlay = document.querySelector("#filter-overlay");
  const sheet = overlay?.querySelector(".filter-sheet");
  const closeBtn = overlay?.querySelector(".filter-back");
  const clearBtn = overlay?.querySelector(".filter-clear");
  const applyBtn = overlay?.querySelector("#f-apply");
  const searchInput = overlay?.querySelector("#f-search");
  const countEl = overlay?.querySelector("#f-count");

  if (!filterBtn || !overlay) {
    console.error("Filter-knap eller overlay ikke fundet.");
    return;
  }

  // Åbn overlay
  filterBtn.addEventListener("click", () => {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    filterBtn.setAttribute("aria-expanded", "true");
    // Sæt korrekt tæller, når overlay åbnes
    updateCount();
    sheet?.focus();
  });

  // Luk overlay
  const closeOverlay = () => {
    overlay.hidden = true;
    document.body.style.overflow = "";
    filterBtn.setAttribute("aria-expanded", "false");
    filterBtn.focus();
  };

  closeBtn?.addEventListener("click", closeOverlay);

  // Luk ved klik udenfor "sheet"
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // Luk ved Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeOverlay();
  });

  // Ryd filter (sæt alle "Alle" chips til aktiv og tomt søgefelt)
  clearBtn?.addEventListener("click", () => {
    resetAllChipsToAll();
    if (searchInput) searchInput.value = "";
    updateCount();
  });

  // Anvend filter
  applyBtn?.addEventListener("click", () => {
    const list = filterGames(window.allGames || []);
    const sorted = sortGames(list, currentSort);
    window.displayGames?.(sorted);
    closeOverlay();
  });

  // Live opdater count ved søgning
  searchInput?.addEventListener("input", updateCount);

  // Live opdater count når man klikker chips (delegation sættes længere nede)
  // Vi kalder updateCount i chip-handleren.

  // Når data er klar fra app.js (første render kun på by)
  window.addEventListener("games:loaded", () => {
    window.applyCurrentLocationFilter?.();
  });

  // Eksponer en funktion så lokations-overlay kan opdatere listen med det samme
  window.applyCurrentLocationFilter = function applyCurrentLocationFilter() {
    const location = getCurrentLocation();
    const list = (window.allGames || []).filter(
      (g) => !location || g.location === location
    );
    window.displayGames?.(list);
    updateCount(); // sørg for tæller matcher den nye base
  };

  /* ===========================
     CHIP TOGGLE (vælge/afvægte)
  =========================== */
  const chipRows = overlay.querySelectorAll(".chip-row");
  chipRows.forEach((row) => {
    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;

      const isAll = btn.dataset.value === "all";
      const chips = Array.from(row.querySelectorAll(".chip"));
      const allBtn = chips.find((c) => c.dataset.value === "all");

      if (isAll) {
        // Vælg "Alle": slå andre fra
        chips.forEach((c) => {
          const active = c === btn;
          c.setAttribute("aria-pressed", active ? "true" : "false");
          c.classList.toggle("chip--active", active);
        });
      } else {
        // Toggle den ene chip
        const nowPressed = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", String(!nowPressed));
        btn.classList.toggle("chip--active", !nowPressed);

        // Slå "Alle" fra, når en anden vælges
        if (allBtn) {
          allBtn.setAttribute("aria-pressed", "false");
          allBtn.classList.remove("chip--active");
        }

        // Hvis ingen andre er valgt, falder vi tilbage til "Alle"
        const anyPressed = chips.some(
          (c) => c !== allBtn && c.getAttribute("aria-pressed") === "true"
        );
        if (!anyPressed && allBtn) {
          allBtn.setAttribute("aria-pressed", "true");
          allBtn.classList.add("chip--active");
        }
      }

      // Opdater tæller live
      updateCount();
    });
  });

  /* ===========================
     HJÆLPEFUNKTIONER (DOM + logik)
  =========================== */

  function resetAllChipsToAll() {
    overlay.querySelectorAll(".chip-row").forEach((row) => {
      const chips = row.querySelectorAll(".chip");
      chips.forEach((c) => {
        const isAll = c.dataset.value === "all";
        c.setAttribute("aria-pressed", isAll ? "true" : "false");
        c.classList.toggle("chip--active", isAll);
      });
    });
  }

  function getSelectedValues(rowId) {
    // Returnerer et array med valgte chip-værdier (ekskl. "all")
    const row = overlay.querySelector(`#${rowId}`);
    if (!row) return [];
    const selected = Array.from(
      row.querySelectorAll('.chip[aria-pressed="true"]')
    )
      .map((c) => c.dataset.value)
      .filter((v) => v && v !== "all");
    return selected;
  }

  function getCurrentLocation() {
    // Læser teksten i lokations-chippen og udtrækker "Fredensgade", "Vestergade", "Kolding", "Aalborg" osv.
    const txt =
      document.querySelector(".chip--location span")?.textContent || "";
    // Split på – eller -
    const parts = txt.split(/–|-/);
    if (parts.length >= 2) return parts[1].trim();
    // Hvis chip kun indeholder bynavnet, returner hele
    return txt.trim();
  }

  function parseDurationTag(tag) {
    // "10-30" => {min:10, max:30}, "120+" => {min:120, max:Infinity}
    if (!tag) return null;
    if (tag.endsWith("+")) {
      const min = parseInt(tag, 10);
      return { min, max: Infinity };
    }
    const [a, b] = tag.split("-").map((n) => parseInt(n, 10));
    if (Number.isFinite(a) && Number.isFinite(b)) return { min: a, max: b };
    return null;
  }

  function playersMatch(gamePlayers, selected) {
    // selected: ["2","3","6+", ...]
    if (!selected.length) return true;
    const gmin = gamePlayers?.min ?? 0;
    const gmax = gamePlayers?.max ?? 99;
    return selected.some((s) => {
      if (s.endsWith("+")) {
        const n = parseInt(s, 10);
        return gmax >= n; // fx "6+" matcher spil hvor max >= 6
      }
      const n = parseInt(s, 10);
      return n >= gmin && n <= gmax; // et tal matcher hvis det ligger i intervallet
    });
  }

  function durationMatch(playtime, selectedTags) {
    if (!selectedTags.length) return true;
    return selectedTags.some((tag) => {
      const r = parseDurationTag(tag);
      if (!r) return false;
      return playtime >= r.min && playtime <= r.max;
    });
  }

  function difficultyMatch(diff, selectedDiffs) {
    if (!selectedDiffs.length) return true;
    if (!diff) return false;
    // Tillad små variationer ("Middel" ~ "Mellem")
    const norm = (diff + "").toLowerCase().replace("middel", "mellem");
    return selectedDiffs
      .map((d) => d.toLowerCase().replace("middel", "mellem"))
      .includes(norm);
  }

  function categoryMatch(genre, selectedCats) {
    if (!selectedCats.length) return true;
    if (!genre) return false;
    // genre er én streng i din JSON (fx "Familie", "Strategi" ...)
    return selectedCats.includes(genre);
  }

  function textMatch(game, q) {
    if (!q) return true;
    const needle = q.toLowerCase();
    const hay = [
      game.title,
      game.description,
      game.genre,
      game.difficulty,
      game.location,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  }

  /* ===========================
     SELVE FILTERET
  =========================== */
  function filterGames(list) {
    const location = getCurrentLocation(); // by/afdeling
    const q =
      overlay.querySelector("#f-search")?.value?.trim().toLowerCase() || "";

    const cats = getSelectedValues("f-category"); // genre
    const diffs = getSelectedValues("f-diff"); // sværhedsgrad
    const durs = getSelectedValues("f-duration"); // varighed (min)
    const players = getSelectedValues("f-players"); // antal spillere

    return list.filter((g) => {
      // 1) By/afdeling først
      if (location && g.location !== location) return false;

      // 2) Søgetekst
      if (!textMatch(g, q)) return false;

      // 3) Kategori / genre
      if (!categoryMatch(g.genre, cats)) return false;

      // 4) Sværhedsgrad
      if (!difficultyMatch(g.difficulty, diffs)) return false;

      // 5) Varighed
      if (!durationMatch(g.playtime, durs)) return false;

      // 6) Spillere
      if (!playersMatch(g.players, players)) return false;

      return true;
    });
  }

  function updateCount() {
    if (!countEl) return;
    const base = window.allGames || [];
    const filtered = filterGames(base);
    countEl.textContent = String(filtered.length);
  }
});

/* ===========================
     SORTERING (dropdown)
  =========================== */
const sortBtn = document.getElementById("f-sort-btn");
const sortPopover = document.getElementById("f-sort-popover");
const sortLabel = document.getElementById("f-sort-label");

// Standard sortering (kan du ændre, hvis du vil)
let currentSort = { field: "title", dir: "asc", label: "Titel (A–Å)" };

// Toggle popover
sortBtn?.addEventListener("click", (e) => {
  const isOpen = sortBtn.getAttribute("aria-expanded") === "true";
  sortBtn.setAttribute("aria-expanded", String(!isOpen));
  if (isOpen) {
    sortPopover.hidden = true;
  } else {
    sortPopover.hidden = false;
  }
});

// Luk popover ved klik udenfor
document.addEventListener("click", (e) => {
  if (!sortPopover || sortPopover.hidden) return;
  const inside =
    e.target === sortPopover ||
    sortPopover.contains(e.target) ||
    e.target === sortBtn ||
    sortBtn.contains(e.target);
  if (!inside) {
    sortPopover.hidden = true;
    sortBtn.setAttribute("aria-expanded", "false");
  }
});

// Vælg en sorteringsmulighed
sortPopover?.addEventListener("click", (e) => {
  const opt = e.target.closest(".sort-opt");
  if (!opt) return;

  const val = opt.dataset.value || ""; // "field:dir"
  const [field, dir] = val.split(":");
  const label = opt.textContent.trim();

  currentSort = { field, dir, label };
  if (sortLabel) sortLabel.textContent = label;

  // Luk popover
  sortPopover.hidden = true;
  sortBtn.setAttribute("aria-expanded", "false");

  // Opdater tælleren, så det matcher, hvad der kommer efter sortering
  updateCount();
});

// Sorteringsfunktion
function sortGames(list, sort) {
  const dirMul = sort?.dir === "desc" ? -1 : 1;

  // til sværhedsgrad-ordre
  const diffOrder = { let: 1, mellem: 2, middel: 2, svær: 3 };

  return [...list].sort((a, b) => {
    switch (sort?.field) {
      case "title": {
        const aa = (a.title || "").toLocaleLowerCase();
        const bb = (b.title || "").toLocaleLowerCase();
        return aa.localeCompare(bb, "da") * dirMul;
      }
      case "playtime": {
        const aa = Number(a.playtime) || 0;
        const bb = Number(b.playtime) || 0;
        return (aa - bb) * dirMul;
      }
      case "rating": {
        const aa = Number(a.rating) || 0;
        const bb = Number(b.rating) || 0;
        return (aa - bb) * dirMul;
      }
      case "age": {
        const aa = Number(a.age) || 0;
        const bb = Number(b.age) || 0;
        return (aa - bb) * dirMul;
      }
      case "players": {
        const amin = a.players?.min ?? 0;
        const bmin = b.players?.min ?? 0;
        if (amin !== bmin) return (amin - bmin) * dirMul;
        const amax = a.players?.max ?? 0;
        const bmax = b.players?.max ?? 0;
        return (amax - bmax) * dirMul;
      }
      case "difficulty": {
        const ad = (a.difficulty || "").toLowerCase();
        const bd = (b.difficulty || "").toLowerCase();
        const av = diffOrder[ad] ?? 99;
        const bv = diffOrder[bd] ?? 99;
        return (av - bv) * dirMul;
      }
      default:
        return 0;
    }
  });
}
