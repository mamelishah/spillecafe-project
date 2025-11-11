"use strict";

let allGames = [];

window.addEventListener("load", initApp);

function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames();
}

async function getGames() {
  const response = await fetch("./assets/data/games.json"); // ret sti efter behov
  const raw = await response.json();

  // Hvis din JSON allerede matcher felterne, så brug denne linje:
  // const games = raw;

  allGames = [...raw];

  console.log("🎮 Games loaded:", allGames.length);

  displayGames(allGames);
}

/* ---------- RENDERING ---------- */

function displayGames(games) {
  const root = document.querySelector("#game-list");
  root.innerHTML = "";

  if (!games.length) {
    root.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre 😢</p>';
    return;
  }
  for (const g of games) displayGame(root, g);
}

function displayGame(root, game) {
  const playersTxt = formatRange(game.playersMin, game.playersMax);

  const playerMin = game.players["min"];
  const playerMax = game.players["max"];

  const timeTxt = game["playtime"];

  const diffTxt = game.difficulty || "—";

  const html = `
    <article class="game-card" data-game-id="${game.id ?? ""}">
      <div class="card-media">
        <img src="${game.image}" alt="Billede af ${
    game.title
  }" class="game-image" loading="lazy" />
        <button class="fav-btn" aria-label="Tilføj til favoritter" aria-pressed="false">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-7-4.3-7-10a4.1 4.1 0 0 1 7-2.6A4.1 4.1 0 0 1 19 10c0 5.7-7 10-7 10z"></path>
          </svg>
          <span class="sr-only">Favorit</span>
        </button>
      </div>

      <div class="card-body">
        <h3 class="title">${game.title} ${
    game.year ? `<span class="game-year">(${game.year})</span>` : ""
  }</h3>

        <ul class="meta">
          <li class="meta-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM2 20a7 7 0 0 1 14 0"></path>
            </svg>
<span>${
    playerMin === playerMax ? playerMin : `${playerMin} - ${playerMax}`
  }</span>
          </li>
          <li class="meta-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 7v6l4 2"></path>
            </svg>
            <span>${timeTxt || "–"}</span>
          </li>
          <li class="meta-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="2.5"></circle>
              <path d="M6 20a6 6 0 0 1 12 0"></path>
            </svg>
            <span>${diffTxt}</span>
          </li>
        </ul>
      </div>
    </article>
  `;

  root.insertAdjacentHTML("beforeend", html);

  const card = root.lastElementChild;
  card.addEventListener("click", () => showGameDetails(game));

  const favBtn = card.querySelector(".fav-btn");
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const pressed = favBtn.getAttribute("aria-pressed") === "true";
    favBtn.setAttribute("aria-pressed", String(!pressed));
    window.dispatchEvent(
      new CustomEvent("game:fav-toggle", {
        detail: { id: game.id, isFavorite: !pressed },
      })
    );
  });
}

function capitalize(s = "") {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function formatRange(min, max, suffix = "") {
  if (min && max && min !== max) return `${min}–${max}${suffix}`;
  if (min && !max) return `${min}${suffix}`;
  if (!min && max) return `${max}${suffix}`;
  return "";
}

function showGameDetails(game) {
  // Åbn detaljesiden med ID som query parameter
  window.location.href = `./pages/game-detail.html?id=${game.id}`;
}
