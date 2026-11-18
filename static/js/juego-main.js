/* ===== Controlador general de la sección de juegos y sonido ===== */
const col = { rover: false, det: false, puz: false, luna: false, cohete: false };
let cur = null,
    AC = null,
    GLB = "",
    lastLauncher = null,
    master = null,
    sndMuted = false;

const GAME_KEYS = { rover: "game1", det: "game2", puz: "game3", luna: "game4", cohete: "game5" };
const tituloJuego = (g) => (GAME_KEYS[g] ? t(GAME_KEYS[g]) : t("gameModalTitle"));

document.body.appendChild($("gm"));

function upd() {
  $("col").textContent = `${t("collection")} 🚙 ${col.rover ? "✅" : "⬜"}   🔎 ${col.det ? "✅" : "⬜"}   🧩 ${col.puz ? "✅" : "⬜"}   🌕 ${col.luna ? "✅" : "⬜"}   🚀 ${col.cohete ? "✅" : "⬜"}`;
}

function leave() {
  if (cur) {
    cur();
    cur = null;
  }
  curGame = null;
  document.onkeydown = null;
  $("gm").hidden = true;
  $("gm").setAttribute("aria-hidden", "true");
  document.body.classList.remove("game-open");
  $("menu").hidden = false;
  upd();
  if (lastLauncher && location.hash === "#juego") lastLauncher.focus();
}

let curGame = null;

function launch(game) {
  curGame = game;
  $("game-title").textContent = tituloJuego(game);
  $("menu").hidden = true;
  $("gm").hidden = false;
  $("gm").setAttribute("aria-hidden", "false");
  document.body.classList.add("game-open");
  if (game === "rover") gRover();
  else if (game === "det") gDet();
  else if (game === "puz") gPuzzle();
  else if (game === "luna") gLuna();
  else if (game === "cohete") gCohete();
  $("game-window").focus();
}

/* ===== Juegos externos embebidos (Misión Luna, Cohete a la Luna) ===== */
function mountEmbed(src) {
  $("game-window").classList.add("is-embed");
  $("gbody").innerHTML = '<iframe class="game-embed" src="' + src + '" title="' + t(GAME_KEYS[curGame]) + '" allow="autoplay" loading="eager"></iframe>';
  const fr = $("gbody").querySelector("iframe");
  if (fr) fr.onload = () => { try { fr.focus(); } catch (e) {} };
  cur = function () {
    $("gbody").innerHTML = "";
    $("game-window").classList.remove("is-embed");
  };
}
function gLuna() { mountEmbed("/mision-luna"); }
function gCohete() { mountEmbed("/cohete-luna"); }

window.addEventListener("message", e => {
  if (!e || !e.data) return;
  if (e.data.type === "luna-win") col.luna = true;
  else if (e.data.type === "cohete-win") col.cohete = true;
  else return;
  upd();
});

document.querySelectorAll(".g").forEach(b => {
  b.onclick = () => {
    lastLauncher = b;
    launch(b.dataset.g);
  };
});

$("back").onclick = leave;
$("game-close").onclick = leave;
$("gm").onclick = e => {
  if (e.target === $("gm")) leave();
};

$("gm").addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const focusable = [...$("gm").querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")];
  if (!focusable.length) {
    e.preventDefault();
    $("game-window").focus();
    return;
  }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (document.activeElement === $("game-window")) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

window.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("gm").hidden) {
    e.preventDefault();
    leave();
  }
});

window.addEventListener("hashchange", () => {
  if (location.hash !== "#juego") leave();
});
upd();

/* ===== Sonido: efectos de interfaz y música ambiental ===== */
const SND_KEY = "space-trace.sound.v1";
try {
  sndMuted = window.localStorage.getItem(SND_KEY) === "off";
} catch (e) {}

function ensureAudio() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (!master) {
      master = AC.createGain();
      master.gain.value = sndMuted ? 0 : 1;
      master.connect(AC.destination);
    }
    if (AC.state === "suspended") AC.resume();
    return AC;
  } catch (e) {
    return null;
  }
}

function bp(f) {
  const a = ensureAudio();
  if (!a || sndMuted) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = "triangle";
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.08, a.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.16);
  o.connect(g);
  g.connect(master);
  o.start();
  o.stop(a.currentTime + 0.18);
}

/* Música de fondo del sitio: audio en bucle (Espacio Exterior). */
const AMB_SRC = "/static/Fondo/SonidoEspacial.mp3";
const AMB_VOL = 0.35;
let bgAudio = null, ambFade = null;

function fadeAmbient(target, ms) {
  if (!bgAudio) return;
  clearInterval(ambFade);
  const pasos = Math.max(1, Math.round(ms / 50));
  const inicio = bgAudio.volume;
  const delta = (target - inicio) / pasos;
  let n = 0;
  ambFade = setInterval(() => {
    n++;
    bgAudio.volume = Math.min(1, Math.max(0, inicio + delta * n));
    if (n >= pasos) {
      clearInterval(ambFade);
      bgAudio.volume = target;
      if (target === 0) bgAudio.pause();
    }
  }, 50);
}

function startAmbient() {
  if (sndMuted) return;
  if (!bgAudio) {
    bgAudio = new Audio(AMB_SRC);
    bgAudio.loop = true;
    bgAudio.preload = "auto";
    bgAudio.volume = 0;
  }
  const p = bgAudio.play();
  if (p && p.catch) p.catch(() => {});
  fadeAmbient(AMB_VOL, 1400);
}

function stopAmbient() {
  if (!bgAudio) return;
  fadeAmbient(0, 500);
}

/* Botón para silenciar / activar el sonido */
const SND_SVG = {
  on: '<path d="M4 9v6h3l4 3.5v-13L7 9H4z"/><path d="M15 9.2a4 4 0 0 1 0 5.6M17.6 6.6a7.6 7.6 0 0 1 0 10.8"/>',
  off: '<path d="M4 9v6h3l4 3.5v-13L7 9H4z"/><path d="m15 9.5 5 5m0-5-5 5"/>'
};

const sndBtn = document.createElement("button");
sndBtn.type = "button";
sndBtn.id = "snd";
sndBtn.className = "sound-toggle";
sndBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"></svg>';
document.body.appendChild(sndBtn);

function renderSound() {
  sndBtn.querySelector("svg").innerHTML = sndMuted ? SND_SVG.off : SND_SVG.on;
  sndBtn.setAttribute("aria-pressed", sndMuted ? "true" : "false");
  sndBtn.setAttribute("aria-label", sndMuted ? t("soundOn") : t("soundOff"));
  sndBtn.title = sndMuted ? t("soundOnShort") : t("soundOffShort");
}

sndBtn.onclick = () => {
  sndMuted = !sndMuted;
  try { window.localStorage.setItem(SND_KEY, sndMuted ? "off" : "on"); } catch (e) {}
  if (master) master.gain.value = sndMuted ? 0 : 1;
  OppiVoice.setEnabled(!sndMuted);
  if (sndMuted) {
    if (bgAudio) bgAudio.muted = true;
    stopAmbient();
  } else {
    if (bgAudio) bgAudio.muted = false;
    bp(660);
    startAmbient();
  }
  renderSound();
};
renderSound();
OppiVoice.setEnabled(!sndMuted);

/* La música solo arranca tras el primer gesto del usuario. */
let sndReady = false;
function desbloquearSonido() {
  if (sndReady) return;
  sndReady = true;
  ensureAudio();
  if (!sndMuted) startAmbient();
  document.removeEventListener("pointerdown", desbloquearSonido);
  document.removeEventListener("keydown", desbloquearSonido);
}
document.addEventListener("pointerdown", desbloquearSonido);
document.addEventListener("keydown", desbloquearSonido);

document.addEventListener("visibilitychange", () => {
  if (AC) {
    if (document.hidden) AC.suspend();
    else if (!sndMuted) AC.resume();
  }
  if (bgAudio) {
    if (document.hidden) bgAudio.pause();
    else if (!sndMuted && sndReady) {
      const p = bgAudio.play();
      if (p && p.catch) p.catch(() => {});
    }
  }
});

/* Pequeños sonidos al navegar */
document.addEventListener("click", e => {
  if (e.target.closest('a[href^="#"], .go')) bp(540);
});

/* Al cambiar de idioma: refrescar textos de la sección y relanzar el juego abierto */
const __langBase = window.__onLangChange;
window.__onLangChange = function () {
  if (__langBase) __langBase();
  upd();
  renderSound();
  const titulo = TITULOS_EL();
  if (titulo) titulo.textContent = tituloJuego(curGame);
  if (!$("gm").hidden && curGame && typeof curGame === "string") {
    const abierto = curGame;
    leave();
    launch(abierto);
  }
};
function TITULOS_EL() { return document.getElementById("game-title"); }
