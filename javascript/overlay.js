"use strict";

const locationBtn = document.querySelector(".chip--location");
const overlay = document.querySelector("#location-overlay");
const closeBtn = overlay.querySelector(".close-overlay");
const locationItems = overlay.querySelectorAll(".locations li");

function applyAndRenderForCurrentLocation() {
  if (typeof window.applyCurrentLocationFilter === "function") {
    window.applyCurrentLocationFilter();
  } else if (
    Array.isArray(window.allGames) &&
    typeof window.displayGames === "function"
  ) {
    const locText =
      document.querySelector(".chip--location span")?.textContent?.trim() || "";
    const parts = locText.split(/–|-/);
    const location = parts.length >= 2 ? parts[1].trim() : locText;
    const list = window.allGames.filter(
      (g) => !location || g.location === location
    );
    window.displayGames(list);
  }
  window.dispatchEvent(new CustomEvent("location:changed"));
}

const savedLocation = localStorage.getItem("selectedLocation");

if (savedLocation) {
  document.querySelector(".chip--location span").textContent = savedLocation;
  locationItems.forEach((li) => {
    li.classList.toggle("active", li.textContent.trim() === savedLocation);
  });
}

window.addEventListener("games:loaded", applyAndRenderForCurrentLocation);

applyAndRenderForCurrentLocation();

locationBtn.addEventListener("click", () => {
  overlay.hidden = false;
  locationBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";

  const current =
    document.querySelector(".chip--location span")?.textContent.trim() || "";
  locationItems.forEach((li) => {
    li.classList.toggle("active", li.textContent.trim() === current);
  });

  overlay.querySelector(".overlay-content")?.focus();
});

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

locationItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selectedName = item.textContent.trim();

    locationItems.forEach((li) => li.classList.remove("active"));
    item.classList.add("active");

    document.querySelector(".chip--location span").textContent = selectedName;
    localStorage.setItem("selectedLocation", selectedName);

    closeOverlay();
    applyAndRenderForCurrentLocation();
  });
});
