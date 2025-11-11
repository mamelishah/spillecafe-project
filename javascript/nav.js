// Håndter aktiv tilstand og ripple-animation
const items = document.querySelectorAll(".nav-item");

function setActive(el) {
  items.forEach((i) => i.classList.remove("active"));
  el.classList.add("active");

  // Emit et custom event (kan opfanges af din app)
  const tab = el.dataset.tab;
  window.dispatchEvent(new CustomEvent("nav:change", { detail: { tab } }));
}

function ripple(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--rx", e.clientX - rect.left + "px");
  el.style.setProperty("--ry", e.clientY - rect.top + "px");
  el.classList.add("rippling");
  setTimeout(() => el.classList.remove("rippling"), 500);
}

items.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    setActive(e.currentTarget);
    ripple(e);
  });
  // Tastatur-aktivér (Enter/Space)
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActive(e.currentTarget);
    }
  });
});

// Eksempel på at lytte efter faneskift i din app:
// window.addEventListener('nav:change', (e)=> console.log('Aktiv fane:', e.detail.tab));
