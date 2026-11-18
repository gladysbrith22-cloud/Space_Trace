/* ===== Bilingüe (ES/EN): idioma global, diccionario y voz de Oppi ===== */
var LANG = (function () {
  try {
    var s = window.localStorage.getItem("space-trace.lang.v1");
    if (s === "en" || s === "es") return s;
  } catch (e) {}
  return (navigator.language || "es").toLowerCase().indexOf("en") === 0 ? "en" : "es";
})();

var I18N = {
  es: {
    /* Documento */
    pageTitle: "Space Trace | Abandonados, no olvidados",
    metaDesc: "Archivo Interplanetario: Explorando las máquinas que la NASA dejó atrás y el legado de quienes las crearon.",

    /* Portada */
    kickerArchive: "ARCHIVO INTERPLANETARIO",
    kickerVol: "VOL. 01",
    heroTitle1: "Abandonados,",
    heroTitle2: "no olvidados",
    heroIntro: "Máquinas que la NASA dejó atrás. Personas que las imaginaron.",
    heroMessage: "Aunque ya no respondan, sus descubrimientos siguen hablando.",
    blink: "SEÑAL RECIBIDA · MISIÓN DISPONIBLE",
    start: "Comenzar exploración",
    bitacora: "BITÁCORA DE EXPLORACIÓN",
    files: "archivos",
    logComplete: "¡Bitácora completa!",
    stepHeroes: "Héroes",
    stepTime: "Tiempo",
    stepSci: "Ciencia",
    stepMedia: "Señales",
    stepGame: "Desafíos",

    vesselOpp: "OPPORTUNITY",
    vesselOppMeta: "MER-B · MARTE · 2004—2018",
    vesselOppAria: "Opportunity, rover en Marte, misión MER-B de 2004 a 2018",
    vesselLunar: "ROVER LUNAR",
    vesselLunarMeta: "APOLLO · LUNA",
    vesselLunarAria: "Rover lunar, vehículo de Apollo",
    vesselApollo: "APOLLO 11",
    vesselApolloMeta: "MÓDULO LUNAR · 1969",
    vesselApolloAria: "Módulo lunar Apollo 11 en la Luna",
    vesselIngenuity: "INGENUITY",
    vesselIngenuityMeta: "HELICÓPTERO · MARTE",
    vesselIngenuityAria: "Ingenuity, helicóptero en Marte",
    vesselVoyager: "VOYAGER 1",
    vesselVoyagerMeta: "ESPACIO PROFUNDO · 1977",
    vesselVoyagerAria: "Sonda Voyager 1 en el espacio interestelar",

    /* Sección Héroes */
    heroesTitle: "Nuestros héroes",
    heroesSub: "Cada misión y las personas que la hicieron posible.",
    heroEmpty: "Selecciona una misión para conocer su historia.",

    /* Sección Tiempo */
    timeKicker: "REGISTRO CRONOLÓGICO · 01",
    timeTitle: "Línea de tiempo",
    timeSub: "Momentos que cambiaron nuestra forma de mirar otros mundos.",

    /* Sección Ciencia */
    sciKicker: "HALLAZGOS · 02",
    sciTitle: "La ciencia que dejaron",
    sciSub: "Seis hallazgos que transformaron nuestra comprensión de la Luna, Marte, los mundos del sistema solar exterior y el espacio interestelar.",

    /* Sección Medios */
    mediaKicker: "SEÑALES RECUPERADAS · 03",
    mediaTitle: "Videos y sonidos",
    mediaSub: "Fragmentos de archivo del catálogo de la NASA: videos y audios de las misiones que siguen enviando señales.",
    openExternal: "Abrir en el sitio oficial ↗",
    pending: "Archivo pendiente",
    tlSource: "Ver imagen NASA",
    sciHow: "¿Cómo lo averiguaron?",
    sciSource: "Explorar fuente NASA",

    /* Sección Juego */
    gameKicker: "SIMULADOR DE MISIÓN · 04",
    gameTitle: "Elige tu misión",
    gameSub: "Cinco desafíos. Un pequeño paso para tu colección.",
    game1: "Rescata al rover",
    game1Desc: "Salva a Opportunity de la tormenta de polvo.",
    game2: "Detective espacial",
    game2Desc: "Encuentra lo que quedó abandonado en la Luna.",
    game3: "Rompecabezas lunar",
    game3Desc: "Acomoda las piezas hasta armar la imagen.",
    game4: "Misión Luna",
    game4Desc: "Instala los instrumentos del Apolo 11 antes de que un ratón convierta la Luna en queso.",
    game5: "Cohete a la Luna",
    game5Desc: "Pilota el cohete, esquiva meteoritos y escombros, y aluniza con el escudo intacto.",
    startMission: "Iniciar misión",
    collection: "Mi colección:",
    gameModalKicker: "SIMULADOR DE MISIÓN",
    gameModalTitle: "Misión",
    closeGame: "Cerrar juego",
    backToMissions: "← Volver a misiones",

    /* Créditos */
    creditsKicker: "FUENTES Y AGRADECIMIENTOS · 05",
    creditsTitle: "Créditos",
    team: "Equipo",
    teamDesc: "Desarrollado con pasión por el equipo Space Trace.",
    nasaResources: "Recursos de la NASA",
    mediaResources: "Medios y multimedia",
    toolsTitle: "Bibliotecas y herramientas",
    toolsDesc: "Three.js (renderizado 3D del rover y del cohete), Google Fonts (Cinzel y Manrope), Web Speech API (voz de Oppi) y Web Audio API (efectos de sonido).",
    aiTitle: "Asistencia de inteligencia artificial",
    aiDesc: "Asistente de IA de TRAE para generación de código, redacción de textos, revisión y depuración. Todo el contenido científico y los datos de las misiones provienen de fuentes oficiales de la NASA.",
    nasaNote: "Todos los recursos provienen de la NASA y se usan con su autorización. Verifica cada dato y crédito en las fuentes oficiales.",

    /* Navegación */
    brand: "SPACE TRACE-UPRIT",
    brandHome: "Space Trace-UPRIT, portada",
    navHeroes: "Héroes",
    navTime: "Tiempo",
    navSci: "Ciencia",
    navMedia: "Medios",
    navGame: "Juego",
    navCredits: "Créditos",
    navArchive: "Archivo",
    navLogin: "Ingresar",
    navAccount: "Mi panel",
    navReports: "Reportes",
    langToEs: "Cambiar a español",
    langToEn: "Switch to English",

    /* Controles globales */
    toTop: "Volver arriba",
    soundOn: "Activar sonido y música",
    soundOff: "Silenciar sonido y música",
    soundOnShort: "Activar sonido",
    soundOffShort: "Silenciar sonido",
    oppiLabel: "Hablar con Oppi, la mascota guía",

    /* Ficha de héroe */
    missionLabel: "MISIÓN",
    personKey: "Persona clave",
    storyDefault: "Quién la creó y qué hizo",
    imaginedMsg: "MENSAJE IMAGINADO DE LA MISIÓN",
    whatDid: "¿Qué hizo?",
    whatLeft: "¿Qué quedó?",
    srcMission: "Imagen de misión ↗",
    srcExtra: "Imagen complementaria ↗",
    srcNasa: "Ficha NASA ↗",
    portraitNA: "Imagen de retrato no disponible",

    /* Oppi */
    oppiPortada: "¡Hola! Soy Oppi, tu guía espacial. 🤖 Tócame y te llevo de recorrido por todo el archivo.",
    oppiHeroes: "Cada misión guarda la historia de quien la hizo posible. ¡Toca una tarjeta para descubrirla!",
    oppiTiempo: "Aquí viajamos por el tiempo: desliza la línea y encuentra los momentos clave. ⏳",
    oppiCiencia: "Estos son los hallazgos más asombrosos. Abre «¿Cómo lo averiguaron?» para ver el secreto. 🔬",
    oppiMedios: "Estas son las señales recuperadas: videos y sonidos de las misiones. 📡",
    oppiJuego: "¡Hora de jugar! Hay cinco desafíos esperándote. ¿Los superas todos? 🚀",
    oppiCreditos: "Estas son nuestras fuentes. ¡Los buenos exploradores citan su trabajo! 📚",
    tour0: "¡Empecemos por los Héroes! 👉 Estas son las cinco misiones que la NASA dejó atrás. Toca una tarjeta para conocerla.",
    tour1: "Aquí aparece su historia completa: quién la creó, qué hizo y qué quedó. 👉 Prueba con otra misión.",
    tour2: "Ahora viajemos en el Tiempo. 👉 Desliza la línea y descubre los momentos clave de la exploración espacial.",
    tour3: "Estos son los hallazgos que dejaron. 👉 Abre «¿Cómo lo averiguaron?» para ver el secreto científico.",
    tour4: "Aquí están las señales recuperadas: videos y sonidos de las misiones. 📡",
    tour5: "¡Y ahora a jugar! 👉 Rescata al rover, sé detective, arma el rompecabezas, viaja a la Luna y pilota el cohete.",
    tour6: "Por último, las fuentes. 📚 ¡Los buenos exploradores citan su trabajo!",
    step: "Paso",
    of: "de",
    didYouKnow: "¿Sabías que…? ",
    oppiDone: "¡Recorrido completo! 🎉 Ya conoces todo el archivo. Tócame cuando quieras un dato curioso.",

    /* Juegos */
    hint: "💡 Pista",
    playAgain: "Jugar otra vez",
    left: "Izquierda",
    right: "Derecha",
    roverBase: "Junta 10 ⭐ antes de que llegue la tormenta. Las esferas celestes son viento: limpian tus paneles solares y recargan la 🔋.",
    roverNoWebgl: "Tu navegador no puede mostrar el rover 3D. Prueba con uno que tenga WebGL activado. 🛰️",
    roverWin: "¡Rescataste al rover! En 2018 Opportunity no pudo recargarse en la tormenta; tú sí. 🎉",
    roverCrash: "Chocaste demasiado. ¡Inténtalo otra vez!",
    roverEmpty: "Te quedaste sin energía, como Opportunity en 2018.",
    roverStorm: "La tormenta llegó antes de juntar todas las muestras.",
    roverFact1: "Opportunity halló pruebas de agua en Marte.",
    roverFact2: "Duró casi 15 años; se planeó para 90 días.",
    roverFact3: "Steve Squyres lideró sus instrumentos.",
    detIntro: "Selecciona los objetos escondidos en la Luna.",
    detSceneAria: "Escena lunar con cinco objetos por encontrar",
    detWhatIs: "Qué es:",
    detWho: "Quién la creó o la dejó:",
    detDid: "Qué hizo:",
    detWin: "🎉 ¡Detective espacial!",
    detWinText: "Encontraste todo lo que quedó en la Luna.",
    puzIntro: "Toca dos piezas para intercambiarlas y ordena la imagen del módulo lunar.",
    puzGridAria: "Rompecabezas de 16 piezas del módulo lunar Apollo 11",
    puzPieceAria: "Pieza",
    puzProgress: "Piezas en su lugar:",
    puzShuffle: "Mezclar de nuevo",
    puzWin: "🏁 ¡Imagen restaurada! Así como armaste estas piezas, la NASA recompone señales dispersas para reconstruir la historia de las misiones que dejamos atrás. 🚀"
  },
  en: {
    pageTitle: "Space Trace | Abandoned, not forgotten",
    metaDesc: "Interplanetary Archive: Exploring the machines NASA left behind and the legacy of the people who built them.",

    kickerArchive: "INTERPLANETARY ARCHIVE",
    kickerVol: "VOL. 01",
    heroTitle1: "Abandoned,",
    heroTitle2: "not forgotten",
    heroIntro: "Machines NASA left behind. People who imagined them.",
    heroMessage: "Even if they no longer answer, their discoveries keep speaking.",
    blink: "SIGNAL RECEIVED · MISSION AVAILABLE",
    start: "Start exploring",
    bitacora: "EXPLORATION LOG",
    files: "files",
    logComplete: "Log complete!",
    stepHeroes: "Heroes",
    stepTime: "Time",
    stepSci: "Science",
    stepMedia: "Signals",
    stepGame: "Challenges",

    vesselOpp: "OPPORTUNITY",
    vesselOppMeta: "MER-B · MARS · 2004—2018",
    vesselOppAria: "Opportunity, rover on Mars, MER-B mission from 2004 to 2018",
    vesselLunar: "LUNAR ROVER",
    vesselLunarMeta: "APOLLO · MOON",
    vesselLunarAria: "Lunar rover, the Apollo vehicle",
    vesselApollo: "APOLLO 11",
    vesselApolloMeta: "LUNAR MODULE · 1969",
    vesselApolloAria: "Apollo 11 lunar module on the Moon",
    vesselIngenuity: "INGENUITY",
    vesselIngenuityMeta: "HELICOPTER · MARS",
    vesselIngenuityAria: "Ingenuity, helicopter on Mars",
    vesselVoyager: "VOYAGER 1",
    vesselVoyagerMeta: "DEEP SPACE · 1977",
    vesselVoyagerAria: "Voyager 1 probe in interstellar space",

    heroesTitle: "Our heroes",
    heroesSub: "Every mission and the people who made it possible.",
    heroEmpty: "Select a mission to discover its story.",

    timeKicker: "CHRONOLOGICAL RECORD · 01",
    timeTitle: "Timeline",
    timeSub: "Moments that changed the way we look at other worlds.",

    sciKicker: "FINDINGS · 02",
    sciTitle: "The science they left behind",
    sciSub: "Six findings that transformed our understanding of the Moon, Mars, the worlds of the outer solar system and interstellar space.",

    mediaKicker: "RECOVERED SIGNALS · 03",
    mediaTitle: "Videos and sounds",
    mediaSub: "Archive fragments from NASA's catalog: videos and audio from the missions that keep sending signals.",
    openExternal: "Open on the official site ↗",
    pending: "Pending file",
    tlSource: "View NASA image",
    sciHow: "How did they find out?",
    sciSource: "Explore NASA source",

    gameKicker: "MISSION SIMULATOR · 04",
    gameTitle: "Choose your mission",
    gameSub: "Five challenges. One small step for your collection.",
    game1: "Rescue the rover",
    game1Desc: "Save Opportunity from the dust storm.",
    game2: "Space detective",
    game2Desc: "Find what was left behind on the Moon.",
    game3: "Lunar puzzle",
    game3Desc: "Arrange the pieces to rebuild the image.",
    game4: "Moon Mission",
    game4Desc: "Install the Apollo 11 instruments before a mouse turns the Moon into cheese.",
    game5: "Rocket to the Moon",
    game5Desc: "Pilot the rocket, dodge meteors and debris, and land on the Moon with your shield intact.",
    startMission: "Start mission",
    collection: "My collection:",
    gameModalKicker: "MISSION SIMULATOR",
    gameModalTitle: "Mission",
    closeGame: "Close game",
    backToMissions: "← Back to missions",

    creditsKicker: "SOURCES AND ACKNOWLEDGEMENTS · 05",
    creditsTitle: "Credits",
    team: "Team",
    teamDesc: "Built with passion by the Space Trace team.",
    nasaResources: "NASA resources",
    mediaResources: "Media and multimedia",
    toolsTitle: "Libraries and tools",
    toolsDesc: "Three.js (3D rendering of the rover and rocket), Google Fonts (Cinzel and Manrope), Web Speech API (Oppi's voice) and Web Audio API (sound effects).",
    aiTitle: "Artificial intelligence assistance",
    aiDesc: "TRAE AI assistant for code generation, text writing, review and debugging. All scientific content and mission data come from official NASA sources.",
    nasaNote: "All resources come from NASA and are used with authorization. Verify every fact and credit in the official sources.",

    brand: "SPACE TRACE-UPRIT",
    brandHome: "Space Trace-UPRIT, home",
    navHeroes: "Heroes",
    navTime: "Time",
    navSci: "Science",
    navMedia: "Media",
    navGame: "Game",
    navCredits: "Credits",
    navArchive: "Archive",
    navLogin: "Sign in",
    navAccount: "My panel",
    navReports: "Reports",
    langToEs: "Cambiar a español",
    langToEn: "Switch to English",

    toTop: "Back to top",
    soundOn: "Turn on sound and music",
    soundOff: "Mute sound and music",
    soundOnShort: "Turn on sound",
    soundOffShort: "Mute sound",
    oppiLabel: "Talk to Oppi, your guide",

    missionLabel: "MISSION",
    personKey: "Key person",
    storyDefault: "Who built it and what it did",
    imaginedMsg: "IMAGINED MESSAGE FROM THE MISSION",
    whatDid: "What did it do?",
    whatLeft: "What's left?",
    srcMission: "Mission image ↗",
    srcExtra: "Complementary image ↗",
    srcNasa: "NASA page ↗",
    portraitNA: "Portrait image unavailable",

    oppiPortada: "Hi! I'm Oppi, your space guide. 🤖 Tap me and I'll take you on a tour of the whole archive.",
    oppiHeroes: "Every mission holds the story of the person who made it possible. Tap a card to discover it!",
    oppiTiempo: "Here we travel through time: slide the timeline and find the key moments. ⏳",
    oppiCiencia: "These are the most amazing findings. Open «How did they find out?» to see the secret. 🔬",
    oppiMedios: "These are the recovered signals: videos and sounds from the missions. 📡",
    oppiJuego: "Time to play! Five challenges are waiting for you. Can you beat them all? 🚀",
    oppiCreditos: "These are our sources. Good explorers cite their work! 📚",
    tour0: "Let's start with the Heroes! 👉 These are the five missions NASA left behind. Tap a card to learn about it.",
    tour1: "Here you'll find its full story: who built it, what it did and what's left. 👉 Try another mission.",
    tour2: "Now let's travel through Time. 👉 Slide the timeline and discover the key moments of space exploration.",
    tour3: "These are the findings they left. 👉 Open «How did they find out?» to see the scientific secret.",
    tour4: "Here are the recovered signals: videos and sounds from the missions. 📡",
    tour5: "And now let's play! 👉 Rescue the rover, be a detective, solve the puzzle, travel to the Moon and pilot the rocket.",
    tour6: "Finally, the sources. 📚 Good explorers cite their work!",
    step: "Step",
    of: "of",
    didYouKnow: "Did you know…? ",
    oppiDone: "Tour complete! 🎉 You know the whole archive now. Tap me whenever you want a fun fact.",

    hint: "💡 Hint",
    playAgain: "Play again",
    left: "Left",
    right: "Right",
    roverBase: "Collect 10 ⭐ before the storm arrives. The sky-blue spheres are wind: they clean your solar panels and recharge the 🔋.",
    roverNoWebgl: "Your browser can't display the 3D rover. Try one with WebGL enabled. 🛰️",
    roverWin: "You rescued the rover! In 2018 Opportunity couldn't recharge in the storm; you did. 🎉",
    roverCrash: "You crashed too much. Try again!",
    roverEmpty: "You ran out of energy, like Opportunity in 2018.",
    roverStorm: "The storm arrived before you collected all the samples.",
    roverFact1: "Opportunity found evidence of water on Mars.",
    roverFact2: "It lasted almost 15 years; it was planned for 90 days.",
    roverFact3: "Steve Squyres led its instruments.",
    detIntro: "Select the objects hidden on the Moon.",
    detSceneAria: "Lunar scene with five objects to find",
    detWhatIs: "What it is:",
    detWho: "Who made or left it:",
    detDid: "What it did:",
    detWin: "🎉 Space detective!",
    detWinText: "You found everything left on the Moon.",
    puzIntro: "Tap two pieces to swap them and order the image of the lunar module.",
    puzGridAria: "16-piece puzzle of the Apollo 11 lunar module",
    puzPieceAria: "Piece",
    puzProgress: "Pieces in place:",
    puzShuffle: "Shuffle again",
    puzWin: "🏁 Image restored! Just as you assembled these pieces, NASA pieces together scattered signals to rebuild the story of the missions we left behind. 🚀"
  }
};

function t(key) {
  var pack = I18N[LANG] || I18N.es;
  if (pack[key] != null) return pack[key];
  return I18N.es[key] != null ? I18N.es[key] : key;
}

/* Aplica el idioma a los textos estáticos del HTML (data-i18n / data-i18n-attr) */
function applyStatic() {
  document.documentElement.lang = LANG;
  document.title = t("pageTitle");
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", t("metaDesc"));

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var v = t(el.getAttribute("data-i18n"));
    if (el.hasAttribute("data-i18n-html")) el.innerHTML = v;
    else el.textContent = v;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
    el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
      var p = pair.split(":");
      if (p[0] && p[1]) el.setAttribute(p[0].trim(), t(p[1].trim()));
    });
  });

  var lb = document.getElementById("lang");
  if (lb) {
    lb.textContent = LANG === "en" ? "ES" : "EN";
    lb.setAttribute("aria-label", t(LANG === "en" ? "langToEs" : "langToEn"));
    lb.title = t(LANG === "en" ? "langToEs" : "langToEn");
  }
}

function setLang(next) {
  LANG = next === "en" ? "en" : "es";
  try { window.localStorage.setItem("space-trace.lang.v1", LANG); } catch (e) {}
  OppiVoice.stop();
  if (typeof window.__onLangChange === "function") window.__onLangChange();
  else applyStatic();
}

/* ===== Voz de Oppi (Web Speech API) ===== */
var OppiVoice = (function () {
  var supported = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  var enabled = true;
  var voices = [];

  function refreshVoices() {
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
  }
  if (supported) {
    refreshVoices();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }

  function targetLang() { return LANG === "en" ? "en-US" : "es-ES"; }

  /* Nombres conocidos de voces femeninas por plataforma (Windows, macOS, Android, iOS) */
  var FEMALE = /monica|m[oó]nica|helena|laura|sabina|elvira|paulina|angelica|ang[eé]lica|maria|mar[ií]a|lucia|luc[ií]a|carmen|pen[eé]lope|isabela|catalina|sofia|sof[ií]a|camila|valentina|esperanza|zira|samantha|karen|moira|tessa|victoria|ava|allison|susan|joanna|salli|kimberly|ivy|kendra|aria|jenny|michelle|sonia|libby|natasha|clara|emma|catherine|amy|emily|serena|kayla|female|femenina|mujer/i;
  /* Nombres conocidos de voces masculinas, para evitarlas cuando no haya femeninas */
  var MALE = /david|mark|daniel|alex\b|diego|jorge|pablo|fred|thomas|oliver|george|james|ryan|guy|juan|carlos|miguel|male|masculina|hombre/i;

  function pickVoice() {
    var want = targetLang().slice(0, 2);
    var same = [];
    for (var i = 0; i < voices.length; i++) {
      if ((voices[i].lang || "").toLowerCase().indexOf(want) === 0) same.push(voices[i]);
    }
    if (!same.length) return null;
    /* 1) voz femenina por nombre conocido o marca de género */
    for (var a = 0; a < same.length; a++) if (FEMALE.test(same[a].name || "")) return same[a];
    /* 2) cualquier voz que no sea claramente masculina */
    for (var b = 0; b < same.length; b++) if (!MALE.test(same[b].name || "")) return same[b];
    /* 3) la primera disponible del idioma */
    return same[0];
  }

  function clean(text) {
    return String(text || "")
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function speak(text) {
    if (!supported || !enabled) return;
    var msg = clean(text);
    if (!msg) return;
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(msg);
      u.lang = targetLang();
      var v = pickVoice();
      if (v) u.voice = v;
      u.rate = 0.98;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function stop() {
    if (!supported) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  return {
    speak: speak,
    stop: stop,
    setEnabled: function (b) { enabled = !!b; if (!b) stop(); },
    isEnabled: function () { return enabled; }
  };
})();
