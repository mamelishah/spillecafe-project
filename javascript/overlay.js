const locationBtn = document.querySelector(".chip--location");
const overlay = document.querySelector("#location-overlay");
const closeBtn = overlay.querySelector(".close-overlay");
const locationItems = overlay.querySelectorAll(".locations li");

// Hent gemt afdeling (hvis der er en)
const savedLocation = localStorage.getItem("selectedLocation");

// Hvis der er en gemt afdeling, vis den i chippen og marker den som aktiv
if (savedLocation) {
  document.querySelector(".chip--location span").textContent = savedLocation;
  locationItems.forEach((li) => {
    if (li.textContent.trim() === savedLocation) li.classList.add("active");
  });
}

// Åbn overlay
locationBtn.addEventListener("click", () => {
  overlay.hidden = false;
  locationBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";

  // Sørg for at den aktuelle er markeret, når overlay åbnes
  const currentLocation = document
    .querySelector(".chip--location span")
    .textContent.trim();
  locationItems.forEach((li) => {
    li.classList.toggle("active", li.textContent.trim() === currentLocation);
  });

  overlay.querySelector(".overlay-content")?.focus();
});

// Luk overlay
closeBtn.addEventListener("click", closeOverlay);

// Luk når man klikker udenfor boksen
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

// Luk med Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeOverlay();
});

// Vælg lokation
locationItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selectedName = item.textContent.trim();

    // Fjern .active fra alle og tilføj til den valgte
    locationItems.forEach((li) => li.classList.remove("active"));
    item.classList.add("active");

    // Opdater chip
    document.querySelector(".chip--location span").textContent = selectedName;

    // Gem i localStorage så den huskes
    localStorage.setItem("selectedLocation", selectedName);

    // Luk overlay
    closeOverlay();
  });
});

function closeOverlay() {
  overlay.hidden = true;
  locationBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  locationBtn.focus();
}
