"use strict";

/* ========== ELEMENTER ========== */
const locationBtn = document.querySelector(".chip--location");
const overlay = document.querySelector("#location-overlay");
const closeBtn = overlay.querySelector(".close-overlay");
const locationItems = overlay.querySelectorAll(".locations li");

/* ========== HJÆLP: render ud fra aktuel by ========== */
function applyAndRenderForCurrentLocation() {
  // Prøv at bruge filter.js’ funktion (by først)
  if (typeof window.applyCurrentLocationFilter === "function") {
    window.applyCurrentLocationFilter();
  } else if (
    Array.isArray(window.allGames) &&
    typeof window.displayGames === "function"
  ) {
    // Fallback hvis filter.js ikke er loaded
    const locText =
      document.querySelector(".chip--location span")?.textContent?.trim() || "";
    const parts = locText.split(/–|-/);
    const location = parts.length >= 2 ? parts[1].trim() : locText;
    const list = window.allGames.filter(
      (g) => !location || g.location === location
    );
    window.displayGames(list);
  }
  // Informér evt. andre lyttere
  window.dispatchEvent(new CustomEvent("location:changed"));
}

/* ========== GENSKAB GEMT LOKATION ========== */
const savedLocation = localStorage.getItem("selectedLocation");

// Hvis der er en gemt afdeling, vis den i chippen og marker den som aktiv
if (savedLocation) {
  document.querySelector(".chip--location span").textContent = savedLocation;
  locationItems.forEach((li) => {
    li.classList.toggle("active", li.textContent.trim() === savedLocation);
  });
}

/* Når spil-data er loaded første gang, rendér efter aktuel by */
window.addEventListener("games:loaded", applyAndRenderForCurrentLocation);

/* Kald også med det samme – hvis data allerede er klar, sker der noget; ellers sker der ikke noget skidt */
applyAndRenderForCurrentLocation();

/* ========== ÅBN OVERLAY ========== */
locationBtn.addEventListener("click", () => {
  overlay.hidden = false;
  locationBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";

  // Sørg for at den aktuelle er markeret, når overlay åbnes
  const current =
    document.querySelector(".chip--location span")?.textContent.trim() || "";
  locationItems.forEach((li) => {
    li.classList.toggle("active", li.textContent.trim() === current);
  });

  overlay.querySelector(".overlay-content")?.focus();
});

/* ========== LUK OVERLAY ========== */
function closeOverlay() {
  overlay.hidden = true;
  locationBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  locationBtn.focus();
}

closeBtn.addEventListener("click", closeOverlay);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeOverlay();
});

/* ========== VÆLG LOKATION ========== */
locationItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selectedName = item.textContent.trim();

    // Marker valgt
    locationItems.forEach((li) => li.classList.remove("active"));
    item.classList.add("active");

    // Opdater chip + gem
    document.querySelector(".chip--location span").textContent = selectedName;
    localStorage.setItem("selectedLocation", selectedName);

    // Luk + filtrér nu ud fra by
    closeOverlay();
    applyAndRenderForCurrentLocation();
  });
});
