/* ===== Juego 1: Rescata al rover (3D) ===== */
function gRover() {
  if (!window.THREE) {
    $("gbody").innerHTML = '<p class="hint" style="text-align:center">' + t("roverNoWebgl") + '</p>';
    return;
  }
  g3D();
}

function g3D() {
  var base = t("roverBase");
  $("gbody").innerHTML = '<canvas id="rc" width="360" height="480" style="width:100%;max-width:360px;display:block;margin:10px auto;border-radius:14px;touch-action:none"></canvas><div id="hud" style="text-align:center;font-weight:800"></div><progress id="pb" max="100" value="100" style="width:100%;max-width:360px;display:block;margin:6px auto"></progress><div style="text-align:center"><button class="btn" id="bl" aria-label="' + t("left") + '">◀</button> <button class="btn" id="br" aria-label="' + t("right") + '">▶</button></div><p id="rm" class="hint" style="text-align:center">' + base + '</p>';

  var T = THREE, c = $("rc"), R = new T.WebGLRenderer({ canvas: c, antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  R.setSize(360, 480, false);
  R.shadowMap.enabled = true;
  R.shadowMap.type = T.PCFSoftShadowMap;
  if (T.sRGBEncoding) R.outputEncoding = T.sRGBEncoding;

  /* Paleta de la tormenta: naranja claro al inicio, marrón ceniza al final */
  var c0 = new T.Color(0xc0683a), c1 = new T.Color(0x2b1207);
  var sc = new T.Scene();
  sc.background = c0.clone();
  sc.fog = new T.Fog(0xc0683a, 24, 78);

  var cam = new T.PerspectiveCamera(58, 360 / 480, .1, 600);
  cam.position.set(0, 4.6, 7.8);
  cam.lookAt(0, 0, -7);

  /* Luces: ambiente cálida, sol con sombras suaves y una luz de contra azulada */
  sc.add(new T.HemisphereLight(0xffe6c8, 0x5a2c16, 1.05));
  var dl = new T.DirectionalLight(0xfff2de, 1.15);
  dl.position.set(7, 15, 5);
  dl.castShadow = true;
  dl.shadow.mapSize.set(1024, 1024);
  dl.shadow.camera.near = 1;
  dl.shadow.camera.far = 70;
  dl.shadow.camera.left = -18;
  dl.shadow.camera.right = 18;
  dl.shadow.camera.top = 26;
  dl.shadow.camera.bottom = -16;
  dl.shadow.bias = -0.0006;
  sc.add(dl);
  var rim = new T.DirectionalLight(0x9fb8ff, .3);
  rim.position.set(-7, 6, -9);
  sc.add(rim);

  /* Cielo: domo con degradado marciano (se oscurece con la tormenta) */
  var skyCv = document.createElement("canvas");
  skyCv.width = 8;
  skyCv.height = 256;
  var sg = skyCv.getContext("2d");
  var lg = sg.createLinearGradient(0, 0, 0, 256);
  lg.addColorStop(0, "#3b2237");
  lg.addColorStop(.45, "#a86a44");
  lg.addColorStop(.63, "#d99a68");
  lg.addColorStop(1, "#c0683a");
  sg.fillStyle = lg;
  sg.fillRect(0, 0, 8, 256);
  var skyTex = new T.CanvasTexture(skyCv);
  if (T.sRGBEncoding) skyTex.encoding = T.sRGBEncoding;
  var sky = new T.Mesh(new T.SphereGeometry(240, 24, 16), new T.MeshBasicMaterial({ map: skyTex, side: T.BackSide, fog: false, depthWrite: false }));
  sc.add(sky);
  var skyWhite = new T.Color(0xffffff), skyDark = new T.Color(0x2a1a14);

  /* Suelo: arena con grano, sal y vetas de polvo */
  var tc = document.createElement("canvas");
  tc.width = tc.height = 256;
  var tx = tc.getContext("2d");
  tx.fillStyle = "#b4562c";
  tx.fillRect(0, 0, 256, 256);
  for (var p = 0; p < 1200; p++) {
    tx.fillStyle = "rgba(" + (p % 2 ? "80,34,16" : "226,158,108") + "," + (.18 + Math.random() * .3) + ")";
    tx.beginPath();
    tx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 2.4 + .4, 0, 7);
    tx.fill();
  }
  for (var v = 0; v < 26; v++) {
    tx.strokeStyle = "rgba(120,58,30," + (.1 + Math.random() * .18) + ")";
    tx.lineWidth = 1 + Math.random() * 2;
    tx.beginPath();
    var vy = Math.random() * 256;
    tx.moveTo(0, vy);
    tx.bezierCurveTo(85, vy + 12, 170, vy - 12, 256, vy + 6);
    tx.stroke();
  }
  var tex = new T.CanvasTexture(tc);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(9, 44);
  tex.anisotropy = R.capabilities.getMaxAnisotropy ? R.capabilities.getMaxAnisotropy() : 1;
  if (T.sRGBEncoding) tex.encoding = T.sRGBEncoding;

  var gd = new T.Mesh(new T.PlaneGeometry(44, 220), new T.MeshPhongMaterial({ map: tex, shininess: 2 }));
  gd.rotation.x = -Math.PI / 2;
  gd.position.z = -95;
  gd.receiveShadow = true;
  sc.add(gd);

  /* Rocas y dunas decorativas: dan profundidad y sombras. Avanzan con el suelo
     para no quedar "flotando" mientras el terreno se desplaza. */
  var DECO = [], rockMat = new T.MeshPhongMaterial({ color: 0x6b3320, shininess: 6 });
  var rockMat2 = new T.MeshPhongMaterial({ color: 0x8a4527, shininess: 6 });
  for (var r = 0; r < 30; r++) {
    var sgn = Math.random() < .5 ? -1 : 1;
    var rk = new T.Mesh(new T.DodecahedronGeometry(.4 + Math.random() * 1.1, 0), r % 2 ? rockMat : rockMat2);
    rk.position.set(sgn * (6 + Math.random() * 12), .1, -80 + Math.random() * 88);
    rk.rotation.set(Math.random(), Math.random(), Math.random());
    rk.scale.y = .5 + Math.random() * .4;
    rk.castShadow = true;
    rk.receiveShadow = true;
    rk.userData.zmin = -80;
    rk.userData.zmax = 8;
    sc.add(rk);
    DECO.push(rk);
  }
  var duneMat = new T.MeshPhongMaterial({ color: 0x9c5430, shininess: 2 });
  for (var d = 0; d < 6; d++) {
    var dn = new T.Mesh(new T.DodecahedronGeometry(6 + Math.random() * 6, 0), duneMat);
    dn.position.set((Math.random() < .5 ? -1 : 1) * (14 + Math.random() * 22), -1.5, -55 - Math.random() * 45);
    dn.scale.y = .28;
    dn.userData.zmin = -100;
    dn.userData.zmax = -55;
    sc.add(dn);
    DECO.push(dn);
  }

  /* Rover: construido con piezas, con sombras y materiales con brillo */
  var rv = new T.Group(), WH = [];
  var MAT = {
    body: new T.MeshPhongMaterial({ color: 0xdfe3ee, shininess: 45, specular: 0x555a66 }),
    dark: new T.MeshPhongMaterial({ color: 0x231b12, shininess: 12 }),
    panel: new T.MeshPhongMaterial({ color: 0x1b2740, shininess: 95, specular: 0x9fc0ff }),
    metal: new T.MeshPhongMaterial({ color: 0xbfc4cc, shininess: 65, specular: 0xffffff }),
    gold: new T.MeshPhongMaterial({ color: 0xd9a441, shininess: 85, specular: 0xfff0c0 }),
    wheel: new T.MeshPhongMaterial({ color: 0x1c1c1e, shininess: 18 }),
    lens: new T.MeshBasicMaterial({ color: 0x111318 })
  };
  function P(g, m, x, y, z) {
    var mesh = new T.Mesh(g, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rv.add(mesh);
    return mesh;
  }

  P(new T.BoxGeometry(1.15, .42, 1.7), MAT.body, 0, .56, 0);           // chasis
  P(new T.BoxGeometry(1.5, .06, 1.35), MAT.dark, 0, .82, 0);            // cubierta
  P(new T.BoxGeometry(.86, .05, 1.28), MAT.panel, -1.16, .9, 0).rotation.z = .14;   // panel solar izq.
  P(new T.BoxGeometry(.86, .05, 1.28), MAT.panel, 1.16, .9, 0).rotation.z = -.14;   // panel solar der.
  P(new T.BoxGeometry(.94, .03, .1), MAT.gold, -1.16, .9, .58).rotation.z = .14;    // marco del panel
  P(new T.BoxGeometry(.94, .03, .1), MAT.gold, -1.16, .9, -.58).rotation.z = .14;
  P(new T.BoxGeometry(.94, .03, .1), MAT.gold, 1.16, .9, .58).rotation.z = -.14;
  P(new T.BoxGeometry(.94, .03, .1), MAT.gold, 1.16, .9, -.58).rotation.z = -.14;
  P(new T.CylinderGeometry(.05, .05, .92, 10), MAT.metal, 0, 1.24, -.34);           // mástil
  P(new T.BoxGeometry(.6, .2, .2), MAT.body, 0, 1.72, -.34);                        // cabezal de cámaras
  P(new T.BoxGeometry(.12, .12, .07), MAT.lens, -.15, 1.72, -.23);                  // cámara izq.
  P(new T.BoxGeometry(.12, .12, .07), MAT.lens, .15, 1.72, -.23);                   // cámara der.
  P(new T.CylinderGeometry(.03, .03, .5, 8), MAT.metal, 0, 1.45, -.2);
  P(new T.CylinderGeometry(.24, .24, .04, 20), MAT.gold, .48, 1.0, .42).rotation.x = 1.15;   // antena de alta ganancia
  P(new T.CylinderGeometry(.02, .02, .5, 6), MAT.metal, .48, .72, .42);
  P(new T.BoxGeometry(.12, .1, .5), MAT.gold, .58, .62, -.6).rotation.x = -.2;      // brazo
  P(new T.BoxGeometry(.14, .14, .14), MAT.lens, .58, .58, -.86);
  P(new T.BoxGeometry(.3, .12, .16), MAT.body, -.5, .86, .5);                       // instrumentos
  P(new T.SphereGeometry(.045, 8, 8), new T.MeshBasicMaterial({ color: 0x59ff9d }), -.62, .9, .5);   // luz de estado
  P(new T.SphereGeometry(.04, 8, 8), new T.MeshBasicMaterial({ color: 0xff6a5a }), -.48, .9, .5);
  [-.72, 0, .72].forEach(function(z) {
    [1, -1].forEach(function(sx) {
      var g = new T.CylinderGeometry(.25, .25, .2, 18);
      g.rotateZ(Math.PI / 2);
      WH.push(P(g, MAT.wheel, sx * .92, .26, z));
      var hub = new T.CylinderGeometry(.08, .08, .22, 12);
      hub.rotateZ(Math.PI / 2);
      P(hub, MAT.gold, sx * .92, .26, z);
      P(new T.BoxGeometry(.06, .48, .06), MAT.metal, sx * .95, .52, z);
    });
  });
  sc.add(rv);

  if (GLB && T.GLTFLoader) {
    new T.GLTFLoader().load(GLB, function(g) {
      var m = g.scene, b = new T.Box3().setFromObject(m), z = b.getSize(new T.Vector3()), ct = b.getCenter(new T.Vector3()), f = 1.9 / Math.max(z.x, z.z);
      m.scale.setScalar(f);
      m.position.set(-ct.x * f, -b.min.y * f, -ct.z * f);
      m.traverse(function(o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      while (rv.children.length) rv.remove(rv.children[0]);
      var w = new T.Group();
      w.add(m);
      rv.add(w);
    });
  }

  var LX = [-3, 0, 3], tl = 1, O = [], FX = [], s = 0, lv = 3, en = 100, t0 = Date.now(), last = t0, dd = 0, run = true, nt = 0, hit = 0, sp = .28,
      F = [t("roverFact1"), t("roverFact2"), t("roverFact3")];

  cur = function() { run = false; R.dispose(); };
  function mv(d) { tl = Math.max(0, Math.min(2, tl + d)); }
  $("bl").onclick = function() { mv(-1); };
  $("br").onclick = function() { mv(1); };
  c.onpointerdown = function(e) {
    var r = c.getBoundingClientRect();
    mv(e.clientX - r.left < r.width / 2 ? -1 : 1);
  };
  document.onkeydown = function(e) {
    if (e.key == "ArrowLeft") mv(-1);
    if (e.key == "ArrowRight") mv(1);
  };

  function end(w, m) {
    run = false;
    R.dispose();
    if (w) col.rover = true;
    $("rm").innerHTML = m + '<br><button class="btn" id="ag">' + t("playAgain") + '</button>';
    $("ag").onclick = gRover;
  }

  /* Onda expansiva al recoger una muestra */
  function ring(x, z, col) {
    var m = new T.Mesh(new T.RingGeometry(.24, .38, 26), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .95, side: T.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, .07, z);
    m.userData.age = 0;
    sc.add(m);
    FX.push(m);
  }

  function mk(k, l) {
    var m;
    if (k == 0) {
      m = new T.Mesh(new T.OctahedronGeometry(.46), new T.MeshPhongMaterial({ color: 0xffd23f, emissive: 0x9c6a00 , shininess: 90, specular: 0xfff3c0 }));
      m.position.y = .95;
    } else if (k == 1) {
      m = new T.Mesh(new T.DodecahedronGeometry(.72, 0), new T.MeshPhongMaterial({ color: 0x6b6f86, shininess: 14 }));
      m.scale.set(1 + Math.random() * .4, .8 + Math.random() * .5, 1);
      m.position.y = .5;
    } else if (k == 2) {
      m = new T.Mesh(new T.TorusGeometry(1.15, .28, 8, 26), new T.MeshPhongMaterial({ color: 0x3a1608, shininess: 4 }));
      m.rotation.x = -Math.PI / 2;
      m.position.y = .12;
    } else {
      m = new T.Mesh(new T.IcosahedronGeometry(.52, 2), new T.MeshPhongMaterial({ color: 0x9be7ff, emissive: 0x2277aa, transparent: true, opacity: .72, shininess: 80, specular: 0xccf6ff }));
      m.position.y = .95;
    }
    m.position.x = LX[l];
    m.position.z = -70;
    m.castShadow = true;
    m.userData = { k: k };
    sc.add(m);
    O.push(m);
  }

  function tick() {
    if (!run) return;
    var now = Date.now(), dt = Math.min(3, (now - last) / 16.67), el = (now - t0) / 1000, tm = 40 - el, st = Math.min(1, el / 40);
    last = now;
    sp = .28 + el * .004;

    /* Movimiento del rover: interpolado, con inclinación y rebote al chocar */
    var dx = LX[tl] - rv.position.x;
    rv.position.x += dx * Math.min(1, .15 * dt);
    rv.rotation.y = -dx * .1;
    rv.rotation.z = dx * .04;
    WH.forEach(function(w) { w.rotation.x -= sp * dt * 2; });
    tex.offset.y += sp * dt * .2;
    /* Las decoraciones avanzan con el suelo y reaparecen al pasar la cámara */
    DECO.forEach(function(o) {
      o.position.z += sp * dt;
      if (o.position.z > o.userData.zmax) o.position.z -= (o.userData.zmax - o.userData.zmin);
    });
    if (hit > 0) hit -= dt;
    var shake = hit > 0 ? hit * .02 : 0;
    rv.position.y = hit > 0 ? Math.abs(Math.sin(hit)) * .15 : 0;

    /* Cámara: sigue levemente al rover y vibra en los impactos */
    cam.position.x += (rv.position.x * .3 - cam.position.x) * Math.min(1, .08 * dt);
    cam.position.y = 4.6 + shake * Math.sin(el * 40) * 6;
    cam.lookAt(rv.position.x * .3, 0, -7);

    /* Aparición de objetos */
    dd += sp * dt;
    if (dd >= 12) {
      dd = 0;
      var q = Math.random(), l = Math.floor(Math.random() * 3);
      mk(q < .36 ? 0 : q < .58 ? 1 : q < .78 ? 2 : 3, l);
      if (q >= .36 && q < .78 && Math.random() < .4) {
        mk(Math.random() < .5 ? 1 : 2, (l + 1 + Math.floor(Math.random() * 2)) % 3);
      }
    }

    /* Energía y colisiones */
    en -= (.035 + st * .05) * dt;
    for (var i = O.length - 1; i >= 0; i--) {
      var m = O[i], k = m.userData.k;
      m.position.z += sp * dt;
      if (k == 0) { m.rotation.y += .06 * dt; m.position.y = .95 + Math.sin(el * 3 + m.position.x) * .08; }
      else if (k == 3) { m.rotation.y += .04 * dt; m.position.y = .95 + Math.cos(el * 2.4 + m.position.z * .1) * .1; }
      if (Math.abs(m.position.z) < 1.2 && Math.abs(rv.position.x - m.position.x) < 1.4) {
        if (k == 0) {
          s++;
          bp(880);
          ring(m.position.x, m.position.z, 0xffe08a);
          if (s % 3 == 0 && s < 10) {
            $("rm").textContent = F[s / 3 - 1];
            nt = 150;
          }
        } else if (k == 3) {
          en = Math.min(100, en + 25);
          bp(660);
          ring(m.position.x, m.position.z, 0x9be7ff);
        } else {
          lv--;
          hit = 20;
          bp(160);
          ring(m.position.x, m.position.z, 0xff6a5a);
          if (navigator.vibrate) navigator.vibrate(80);
        }
        sc.remove(m);
        O.splice(i, 1);
        continue;
      }
      if (m.position.z > 8) {
        sc.remove(m);
        O.splice(i, 1);
      }
    }

    /* Animación de las ondas expansivas */
    for (var f = FX.length - 1; f >= 0; f--) {
      var fx = FX[f];
      fx.userData.age += dt * .045;
      var a = fx.userData.age, o = .95 - a * 1.2;
      if (o <= 0) {
        sc.remove(fx);
        fx.geometry.dispose();
        fx.material.dispose();
        FX.splice(f, 1);
        continue;
      }
      var sca = 1 + a * 2.6;
      fx.scale.set(sca, sca, 1);
      fx.material.opacity = o;
    }

    /* Ambiente: la tormenta se acerca */
    sc.background.copy(c0).lerp(c1, st);
    sc.fog.color.copy(sc.background);
    sc.fog.near = 24 - 18 * st;
    sc.fog.far = 78 - 40 * st;
    sky.material.color.copy(skyWhite).lerp(skyDark, st);
    dl.intensity = 1.15 - .78 * st;
    R.render(sc, cam);

    $("hud").textContent = "⭐ " + s + "/10   ❤ " + lv + "   ⏱ " + Math.max(0, Math.ceil(tm)) + "   🔋 " + Math.max(0, Math.round(en)) + "%";
    $("pb").value = Math.max(0, en);
    if (nt > 0 && --nt == 0) $("rm").textContent = base;
    if (s >= 10) return end(true, t("roverWin"));
    if (lv <= 0) return end(false, t("roverCrash"));
    if (en <= 0) return end(false, t("roverEmpty"));
    if (tm <= 0) return end(false, t("roverStorm"));
    requestAnimationFrame(tick);
  }
  tick();
}
