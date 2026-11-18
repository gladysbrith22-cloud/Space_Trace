/* ===== Juego 4: Rompecabezas (intercambia las piezas hasta armar la imagen) ===== */
function gPuzzle() {
  var N = 4, TOTAL = N * N;
  var IMG = "https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg";
  var order = [], sel = -1, bloq = false;

  /* Posición de fondo (%) que muestra la pieza p dentro de una rejilla N×N. */
  function fondo(p) {
    var c = p % N, r = (p - c) / N;
    return (c * 100 / (N - 1)) + "% " + (r * 100 / (N - 1)) + "%";
  }

  function mezclar() {
    order = [];
    for (var i = 0; i < TOTAL; i++) order.push(i);
    do {
      for (var j = TOTAL - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1)), tmp = order[j];
        order[j] = order[k];
        order[k] = tmp;
      }
    } while (order.every(function(v, i) { return v === i; }));
    sel = -1;
    bloq = false;
  }

  var piezas = "";
  for (var i = 0; i < TOTAL; i++) {
    piezas += '<button type="button" class="puz-piece" data-slot="' + i + '" aria-label="' + t("puzPieceAria") + " " + (i + 1) + '" aria-pressed="false"></button>';
  }

  $("gbody").innerHTML = '<p>' + t("puzIntro") + '</p>' +
    '<div class="puz-grid" id="pg" role="group" aria-label="' + t("puzGridAria") + '">' + piezas + '</div>' +
    '<p id="pp" class="hint puz-status" aria-live="polite"></p>' +
    '<div style="text-align:center"><button class="btn" id="psh">' + t("puzShuffle") + '</button></div>';

  var grid = $("pg");
  grid.style.setProperty("--puz-img", 'url("' + IMG + '")');
  var btns = grid.querySelectorAll(".puz-piece");

  function pintar() {
    for (var i = 0; i < TOTAL; i++) {
      btns[i].style.backgroundPosition = fondo(order[i]);
      btns[i].classList.toggle("is-sel", i === sel);
      btns[i].setAttribute("aria-pressed", i === sel ? "true" : "false");
    }
  }

  function estado() {
    var n = 0;
    for (var i = 0; i < TOTAL; i++) if (order[i] === i) n++;
    if (n === TOTAL) {
      bloq = true;
      sel = -1;
      pintar();
      col.puz = true;
      upd();
      grid.classList.add("is-done");
      if (typeof bp === "function") bp(990);
      var msg = $("pp");
      msg.classList.remove("hint");
      msg.classList.add("is-win");
      msg.innerHTML = t("puzWin");
    } else {
      $("pp").textContent = t("puzProgress") + " " + n + "/" + TOTAL;
    }
  }

  grid.addEventListener("click", function(e) {
    var b = e.target.closest(".puz-piece");
    if (!b || bloq) return;
    var s = +b.dataset.slot;
    if (sel === -1) {
      sel = s;
      if (typeof bp === "function") bp(600);
    } else if (sel === s) {
      sel = -1;
    } else {
      var tmp = order[sel];
      order[sel] = order[s];
      order[s] = tmp;
      sel = -1;
      if (typeof bp === "function") bp(720);
    }
    pintar();
    estado();
  });

  $("psh").onclick = function() {
    grid.classList.remove("is-done");
    $("pp").classList.remove("is-win");
    $("pp").classList.add("hint");
    mezclar();
    pintar();
    estado();
  };

  mezclar();
  pintar();
  estado();

  cur = function() {};
}
