"use strict";

window.addEventListener("load", initDetail);

async function initDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return renderError("Ingen spil-id angivet i URL’en.");

  try {
    const response = await fetch("../assets/data/games.json");
    const games = await response.json();
    const game = games.find((g) => String(g.id) === id);
    if (!game) return renderError("Spil ikke fundet.");

    renderGameDetail(game);
  } catch (err) {
    console.error(err);
    renderError("Kunne ikke hente spildata.");
  }
}

function renderError(msg) {
  document.querySelector("#app").innerHTML = `<p>${msg}</p>`;
}

function renderGameDetail(game) {
  const placementCode = (game.shelf || game.location || "").trim();
  const ribbonText = placementCode.toUpperCase() || "—";
  const rowText = placementCode.toLowerCase() || "—";

  const html = `
    <article class="detail-card">
      <div class="media">
        <img src="${game.image}" alt="${game.title}" />
        <div class="placement-ribbon"><span>${ribbonText}</span></div>
      </div>

      <div class="detail-body">
        <div class="title-row">
          <h1 class="title">${game.title}</h1>
          <div class="like-pill"><span>❤</span>${Math.floor(
            game.rating * 35
          )}</div>
        </div>

        <div class="placement-row">
         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fffff"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/></svg>
          <span class="label">Placering:</span>
          <span class="value">${rowText}</span>
        </div>

        <h3>Anbefaling for dette spil</h3>
        <div class="reco">
          <div><div class="icon">👥</div><div class="caption">${
            game.players.min
          }-${game.players.max}</div></div>
          <div><div class="icon">🏃</div><div class="caption">${
            game.difficulty
          }</div></div>
          <div><div class="icon">🕒</div><div class="caption">${
            game.playtime
          } min</div></div>
          <div><div class="icon">📅</div><div class="caption">+${
            game.age
          } år</div></div>
        </div>

        <details class="accord" open>
          <summary>🧾 Beskrivelse</summary>
          <p>${game.description}</p>
        </details>

        <details class="accord">
          <summary>📜 Regler</summary>
          <p>${game.rules}</p>
        </details>
      </div>
    </article>
  `;

  document.querySelector("#app").innerHTML = html;
}
