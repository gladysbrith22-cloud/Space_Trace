/* ===== Fondo animado. FONDO = imagen o video propio (opcional) ===== */
var FONDO = "/static/Fondo/EspacioExterior.jpg";  // Ruta de la imagen o video de fondo
if (FONDO) {
  var fv = document.createElement(/\.mp4|video/.test(FONDO) ? "video" : "img");
  fv.id = "fv";
  fv.className = "hero-media";
  fv.src = FONDO;
  if (fv.tagName == "VIDEO") {
    fv.autoplay = fv.loop = fv.muted = fv.playsInline = true;
  }
  document.body.appendChild(fv);
}

(function() {
  var cv = $("bg"),
      x = cv.getContext("2d"),
      W, Hh,
      P = [],
      S = null,
      t = 0,
      pl = [
        [.2, .3, 26, "#8f7540", "#e1c47b"],
        [.75, .65, 18, "#77756f", "#d8d2c4"],
        [.5, .85, 34, "#625a45", "#c5a85e"]
      ];

  function size() {
    W = cv.width = innerWidth;
    Hh = cv.height = innerHeight;
  }
  size();
  addEventListener("resize", size);

  for (var i = 0; i < 48; i++) {
    P.push({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 2 + .8,
      v: Math.random() * .0004 + .0001,
      k: Math.random() * 6
    });
  }

  var rm = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function dark() {
    var th = document.documentElement.dataset.theme;
    return document.body.classList.contains("home") || (th ? th == "dark" : matchMedia("(prefers-color-scheme:dark)").matches);
  }

  function draw() {
    t++;
    x.clearRect(0, 0, W, Hh);
    var d = dark(),
        C = d ? ["#e8e4d8", "#d9bd70", "#b7ad94"] : ["#565149", "#a8863b", "#80765d"];

    P.forEach(function(p, i) {
      p.y -= p.v;
      p.x += p.v / 2;
      if (p.y < 0) p.y = 1;
      if (p.x > 1) p.x = 0;
      x.globalAlpha = .25 + .4 * Math.abs(Math.sin(t / 40 + p.k));
      x.fillStyle = C[i % 3];
      x.beginPath();
      x.arc(p.x * W, p.y * Hh, p.s, 0, 7);
      x.fill();
    });

    pl.forEach(function(q, i) {
      var px = ((q[0] + t * .00012 * (i + 1)) % 1.2 - .1) * W,
          py = q[1] * Hh + Math.sin(t / 90 + i) * 10,
          g = x.createRadialGradient(px - q[2] / 3, py - q[2] / 3, 2, px, py, q[2]);
      g.addColorStop(0, q[4]);
      g.addColorStop(1, q[3]);
      x.globalAlpha = d ? .65 : .3;
      x.fillStyle = g;
      x.beginPath();
      x.arc(px, py, q[2], 0, 7);
      x.fill();
    });

    if (!S && Math.random() < .004) {
      S = { x: Math.random() * W * .6, y: Math.random() * Hh * .4, l: 0 };
    }
    if (S) {
      x.globalAlpha = 1 - S.l / 40;
      x.strokeStyle = d ? "#e6d39a" : "#9c7d3c";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(S.x + S.l * 10, S.y + S.l * 5);
      x.lineTo(S.x + S.l * 10 - 40, S.y + S.l * 5 - 20);
      x.stroke();
      if (++S.l > 40) S = null;
    }

    x.globalAlpha = 1;
    if (!rm) requestAnimationFrame(draw);
  }

  window.addEventListener("hashchange", function() { if (rm) draw(); });
  draw();
})();
