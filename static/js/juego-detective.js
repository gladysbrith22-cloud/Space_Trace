/* ===== Juego 2: Detective espacial ===== */
function gDet() {
  var I = D().DET, fd = [];

  var sh = [
    '<path d="M-14 10 L-10 -6 L10 -6 L14 10Z" fill="#d6a43a"/><rect x="-16" y="10" width="32" height="3" fill="#8a6d1f"/>',
    '<rect x="-8" y="-5" width="16" height="10" fill="#9aa3c7"/><circle cx="-3" r="1.6" fill="#fff"/><circle cx="3" r="1.6" fill="#fff"/>',
    '<rect x="-14" y="-4" width="28" height="8" fill="#e6e9f5"/><circle cx="-10" cy="6" r="4" fill="#444"/><circle cx="10" cy="6" r="4" fill="#444"/>',
    '<ellipse cx="-4" rx="3" ry="6" fill="#6b7391"/><ellipse cx="4" cy="-4" rx="3" ry="6" fill="#6b7391"/>',
    '<rect x="-1" y="-22" width="2" height="30" fill="#ccc"/><rect x="1" y="-22" width="16" height="10" fill="#ff4d4d"/>'
  ];

  var g = I.map(function(o, i) {
    return '<g data-i="' + i + '" role="button" tabindex="0" aria-label="' + o.n + '" aria-pressed="false" transform="translate(' + o.x + ',' + o.y + ')" style="cursor:pointer">' + sh[i] + '<circle r="22" fill="transparent" id="h' + i + '" stroke="none" stroke-width="3"/></g>';
  }).join("");

  $("gbody").innerHTML = '<p>' + t("detIntro") + ' <b id="cn">0/5</b></p>' +
    '<svg id="sc" role="group" aria-label="' + t("detSceneAria") + '" viewBox="0 0 400 260" style="width:100%;border-radius:14px;display:block;touch-action:manipulation">' +
    '<rect width="400" height="260" fill="#0b0f2a"/>' +
    '<circle cx="40" cy="30" r="1.5" fill="#fff"/><circle cx="150" cy="60" r="1.5" fill="#fff"/><circle cx="260" cy="25" r="1.5" fill="#fff"/><circle cx="360" cy="70" r="1.5" fill="#fff"/>' +
    '<circle cx="330" cy="38" r="15" fill="#2d8cff"/>' +
    '<ellipse cx="200" cy="300" rx="320" ry="170" fill="#8d93aa"/>' +
    '<ellipse cx="90" cy="215" rx="22" ry="7" fill="#737a94"/><ellipse cx="280" cy="205" rx="26" ry="8" fill="#737a94"/>' +
    g + '</svg><button class="btn" id="pk">' + t("hint") + '</button><div id="di"></div>';

  function select(i) {
    var o = I[i];
    if (fd.indexOf(i) < 0) {
      fd.push(i);
      $("h" + i).setAttribute("stroke", "#22c55e");
      $("sc").querySelector('[data-i="' + i + '"]').setAttribute("aria-pressed", "true");
    }
    $("cn").textContent = fd.length + "/5";
    $("di").innerHTML = '<div class="card"><b>' + o.n + '</b><p><b>' + t("detWhatIs") + '</b> ' + o.d + '</p><p><b>' + t("detWho") + '</b> ' + o.c + '</p><p><b>' + t("detDid") + '</b> ' + o.h + '</p></div>' +
      (fd.length == 5 ? '<div class="card"><b>' + t("detWin") + '</b><p>' + t("detWinText") + '</p></div>' : '');
    if (fd.length == 5) col.det = true;
  }

  $("sc").onclick = function(e) {
    var t = e.target.closest("[data-i]");
    if (t) select(+t.dataset.i);
  };

  $("sc").onkeydown = function(e) {
    var t = e.target.closest("[data-i]");
    if (t && (e.key == "Enter" || e.key == " ")) {
      e.preventDefault();
      select(+t.dataset.i);
    }
  };

  $("pk").onclick = function() {
    var n = [0, 1, 2, 3, 4].filter(function(i) { return fd.indexOf(i) < 0; })[0];
    if (n == null) return;
    var h = $("h" + n);
    h.setAttribute("stroke", "#ffd23f");
    setTimeout(function() {
      if (fd.indexOf(n) < 0) h.setAttribute("stroke", "none");
    }, 2000);
  };

  cur = function() {};
}
