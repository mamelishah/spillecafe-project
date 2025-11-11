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
          <svg viewBox="0 0 24 24" class="pin" aria-hidden="true">
            <path d="M12 22s7-7.6 7-12a7 7 0 1 0-14 0c0 4.4 7 12 7 12z"/>
            <circle cx="12" cy="10" r="2.5"/>
          </svg>
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
