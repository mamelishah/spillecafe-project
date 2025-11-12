"use strict";

let allGames = [];

window.addEventListener("load", initApp);

function initApp() {
  console.log("initApp: app.js is running 🎉");
  getGames();
}

async function getGames() {
  const response = await fetch("./assets/data/games.json"); 
  const raw = await response.json();

  allGames = [...raw];
  window.allGames = allGames;

  window.dispatchEvent(new Event("games:loaded"));

  if (typeof window.applyCurrentLocationFilter === "function") {
    window.applyCurrentLocationFilter();
  } else {
    displayGames(allGames);
  }
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
  const playerMin = game.players?.min;
  const playerMax = game.players?.max;
  const timeTxt = game.playtime;
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
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" 
                fill="#ffff"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/>
            </svg>
            <span>${
              playerMin === playerMax
                ? playerMin
                : `${playerMin} - ${playerMax}`
            }</span>
          </li>

          <li class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fffff">
              <path d="M582-298 440-440v-200h80v167l118 118-56 57ZM440-720v-80h80v80h-80Zm280 280v-80h80v80h-80ZM440-160v-80h80v80h-80ZM160-440v-80h80v80h-80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
            </svg>
            <span>${timeTxt || "–"} min</span>
          </li>

          <li class="meta-item">
            <!-- Beholder din nuværende SVG/PNG-opsætning -->
            <svg width="90" height="90" viewBox="0 0 90 90"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink">
              <image
                x="0" y="0" width="90" height="90"
                preserveAspectRatio="none"
                href="../assets/knapper/Effortgrey.svg"
                xlink:href="data:image/png;base64,PASTE_YOUR_BASE64_HERE"
              />
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
  const url = new URL("pages/game-detail.html", window.location.href);
  url.searchParams.set("id", game.id);
  window.location.href = url.toString();
}
