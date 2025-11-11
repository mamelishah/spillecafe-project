"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.querySelector(".chip--filter");
  const overlay = document.querySelector("#filter-overlay");
  const closeBtn = overlay?.querySelector(".filter-back");

  if (!filterBtn || !overlay) {
    console.error("Filter-knap eller overlay ikke fundet.");
    return;
  }

  // Åbn overlay
  filterBtn.addEventListener("click", () => {
    overlay.hidden = false;
    document.body.style.overflow = "hidden"; // lås scroll
    filterBtn.setAttribute("aria-expanded", "true");
  });

  // Luk overlay
  closeBtn?.addEventListener("click", () => {
    overlay.hidden = true;
    document.body.style.overflow = "";
    filterBtn.setAttribute("aria-expanded", "false");
  });

  // Luk ved klik udenfor
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.hidden = true;
      document.body.style.overflow = "";
      filterBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Luk ved Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) {
      overlay.hidden = true;
      document.body.style.overflow = "";
      filterBtn.setAttribute("aria-expanded", "false");
    }
  });
});
