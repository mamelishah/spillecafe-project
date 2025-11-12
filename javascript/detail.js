"use strict";

window.addEventListener("load", initDetail);

async function initDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return renderError("Ingen spil-id angivet i URL’en.");

  try {
    const games = await fetchGamesWithFallback();
    const game = games.find((g) => String(g.id) === String(id));
    if (!game) return renderError("Spil ikke fundet.");

    renderGameDetail(game);
  } catch (err) {
    console.error(err);
    renderError("Kunne ikke hente spildata.");
  }
}

async function fetchGamesWithFallback() {
  const urls = ["../assets/data/games.json", "./assets/data/games.json"];
  let lastErr;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Ukendt fetch-fejl");
}

function renderError(msg) {
  document.querySelector("#app").innerHTML = `
    <p>${msg}</p>
    <p><a href="../index.html">Tilbage</a></p>
  `;
}

function renderGameDetail(game) {
  const placementCode = (game.shelf || game.location || "").trim();
  const ribbonText = placementCode ? placementCode.toUpperCase() : "—";
  const rowText = placementCode ? placementCode.toLowerCase() : "—";

  const pMin = game.players?.min ?? null;
  const pMax = game.players?.max ?? null;
  const playersText = formatPlayers(pMin, pMax); // ← viser “4” når min==max

  const html = `
    <article class="detail-card">
      <div class="media">
        <img src="${game.image}" alt="${escapeHtml(
    game.title
  )}" loading="lazy" />
        <div class="placement-ribbon"><span>${escapeHtml(
          ribbonText
        )}</span></div>
      </div>

      <div class="detail-body">
        <div class="title-row">
          <h1 class="title">${escapeHtml(game.title)}</h1>
          <div class="like-pill"><span>❤</span>${Math.floor(
            (game.rating || 0) * 35
          )}</div>
        </div>

        <div class="placement-row">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill=""><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>
          <span class="label">Placering:</span>
          <span class="value">${escapeHtml(rowText)}</span>
        </div>

        <h3>Anbefaling for dette spil</h3>
        <div class="reco">
          <div><div class="icon">👥</div><div class="caption">${playersText}</div></div>
          <div><div class="icon">🏃</div><div class="caption">${escapeHtml(
            game.difficulty || "—"
          )}</div></div>
          <div><div class="icon">🕒</div><div class="caption">${
            Number.isFinite(game.playtime) ? game.playtime + " min" : "—"
          }</div></div>
          <div><div class="icon">📅</div><div class="caption">${
            Number.isFinite(game.age) ? `+${game.age} år` : "—"
          }</div></div>
        </div>

        <details class="accord" open>
          <summary>🧾 Beskrivelse</summary>
          <p>${escapeHtml(game.description || "—")}</p>
        </details>

        <details class="accord">
          <summary>📜 Regler</summary>
          <p>${escapeHtml(game.rules || "—")}</p>
        </details>
      </div>
    </article>
  `;

  document.querySelector("#app").innerHTML = html;
}

function formatPlayers(min, max) {
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);

  if (!hasMin && !hasMax) return "—";
  if (hasMin && hasMax) {
    return min === max ? String(min) : `${min} - ${max}`;
  }
  if (hasMin) return String(min);
  return String(max);
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
