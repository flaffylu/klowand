/* Klo-Wand: aufgeräumte Oberfläche. Unten 3 Bereiche (Wand · Spielen & Räume · Mehr), ein Knopf zum Schreiben.
   Alle Funktionen bleiben, wie sie sind: Die neuen Kacheln drücken nur die bisherigen Knöpfe, die versteckt im Hintergrund bleiben. */
(function () {
  if (typeof WALL === "undefined" || !document.querySelector(".plate") || !document.getElementById("composer")) return;
  const T = (de, en) => (typeof tr === "function" ? tr(de, en) : de);
  const $ = id => document.getElementById(id);
  const E = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const root = document.documentElement;
  root.classList.add("ord");

  const ICON = {
    wand: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>',
    play: '<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 11v3M6.5 12.5h3M15 12h.01M17 14h.01"/>',
    more: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/>',
    disco: '<circle cx="12" cy="13" r="7"/><path d="M12 6V2M5 13h14M12 6c-2 2-3 4.5-3 7s1 5 3 7M12 6c2 2 3 4.5 3 7s-1 5-3 7"/>',
    sofa: '<path d="M4 18v-5a3 3 0 013-3h10a3 3 0 013 3v5M2 14h2v4h16v-4h2M7 10V7a2 2 0 012-2h6a2 2 0 012 2v3"/>',
    door: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M15 12h.01"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  const svg = (k, s, c) => `<svg width="${s || 24}" height="${s || 24}" viewBox="0 0 24 24" fill="none" stroke="${c || "currentColor"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  const css = document.createElement("style");
  css.textContent = `
  html.ord{--o-bg:#120c1a;--o-card:#1d1529;--o-line:#2e2440;--o-tx:#f4eefb;--o-mu:#b9adc9;--o-acc:#ff4fa3;--o-hi:#ffd166;--o-nav:#160f20}
  html.ord.famdemo{--o-bg:#fff8f2;--o-card:#fff;--o-line:#f1dcd2;--o-tx:#2a2320;--o-mu:#7a6a60;--o-acc:#d9483b;--o-hi:#d9483b;--o-nav:#fff}
  html.ord .fambar,html.ord .extras,html.ord .mehrbar,html.ord .demobar .dbtns,html.ord .leoclip{display:none!important}
  html.ord .wrap{padding-bottom:calc(170px + env(safe-area-inset-bottom,0px))!important}
  html.ord.th-neon .plate{box-shadow:none;border-color:var(--o-line)}
  html.ord.th-neon .plate h1{text-shadow:none;color:var(--o-hi)}
  html.ord .occ{display:none}
  html.ord .demobar{background:transparent!important;border:none!important;box-shadow:none!important;padding:4px 2px!important;margin:6px 0 0!important;font-size:.95rem!important;color:var(--o-mu)!important}
  html.ord .demobar b{font-weight:600;color:var(--o-mu)}
  html.ord .kfrage{background:var(--o-card);color:var(--o-tx);border:1px solid var(--o-line);box-shadow:none}
  html.ord .kfrage .q{font:700 1.3rem/1.15 var(--f-ui)}
  html.ord .kfrage .o button{background:transparent;color:var(--o-tx);border:1px solid var(--o-line)}
  html.ord .kfrage .o button.me{background:var(--o-tx);color:var(--o-bg)}
  html.ord .kfrage .o button i{background:var(--o-acc)}
  html.ord .chcard{box-shadow:none!important}
  html.ord .osos{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:10px 0 0;min-height:48px;border:none;border-radius:12px;background:#b3261e;color:#fff;font:700 1.1rem var(--f-ui);cursor:pointer}
  /* Schreiben: Leiste erst nach Antippen */
  html.ord #composer{bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateY(calc(100% + 80px));transition:transform .25s ease;visibility:hidden;max-height:calc(100vh - 140px);overflow:auto}
  html.ord.ord-write #composer{transform:none;visibility:visible}
  html.ord .ofab{position:fixed;right:16px;bottom:calc(80px + env(safe-area-inset-bottom,0px));z-index:31;display:flex;align-items:center;gap:8px;min-height:54px;padding:0 22px;border:none;border-radius:999px;background:var(--o-acc);color:#1b0a14;font:700 1.15rem var(--f-ui);box-shadow:0 8px 24px rgba(0,0,0,.4);cursor:pointer}
  html.ord.famdemo .ofab{color:#fff}
  html.ord.ord-write .ofab{display:none}
  html.ord .oclose{position:absolute;right:10px;top:8px;width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,.12);color:inherit;display:grid;place-items:center;cursor:pointer;z-index:2}
  html.ord .songpill{left:12px!important;right:auto!important;bottom:calc(84px + env(safe-area-inset-bottom,0px))!important;min-height:40px!important;padding:0 12px!important;font-size:.9rem!important}
  html.ord.ord-write .songpill{display:none!important}
  html.ord .demobar > span{font-size:0!important}
  html.ord .demobar #demoFree{display:inline-block;font:600 .95rem/1.3 var(--f-ui)!important;color:var(--o-hi);border:1px solid var(--o-line);border-radius:999px;padding:5px 12px}
  /* Unten: 3 Bereiche */
  .onav{position:fixed;left:0;right:0;bottom:0;z-index:32;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));background:var(--o-nav);border-top:1px solid var(--o-line);padding:6px 6px calc(8px + env(safe-area-inset-bottom,0px))}
  .onav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:52px;border:none;background:none;color:var(--o-mu);font:600 .9rem var(--f-ui);cursor:pointer}
  .onav button[aria-current=page]{color:var(--o-hi);font-weight:700}
  /* Seiten Spielen & Räume / Mehr */
  .oview{position:fixed;inset:0;bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:30;background:var(--o-bg);color:var(--o-tx);overflow-y:auto;padding:18px 16px 30px;font-family:var(--f-ui)}
  .oview[hidden]{display:none}
  .oview .in{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
  .oview h1{margin:0 4px;font:400 1.8rem/1 var(--f-marker);color:var(--o-hi)}
  .oview h2{margin:0 4px 8px;font:700 .8rem var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--o-mu)}
  .oview .tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .oview .tiles.t3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .oview .tile{display:flex;flex-direction:column;align-items:flex-start;gap:5px;padding:14px;border-radius:16px;background:var(--o-card);border:1px solid var(--o-line);color:var(--o-tx);text-align:left;cursor:pointer;font:inherit;min-height:44px}
  .oview .tile b{font:700 1.15rem var(--f-ui)}.oview .tile span{font:500 .95rem/1.2 var(--f-ui);color:var(--o-mu)}
  .oview .t3 .tile{align-items:center;text-align:center;padding:12px 6px;gap:4px}.oview .t3 .tile b{font-size:1rem;font-weight:600}
  .oview .tile .em{font-size:1.5rem;line-height:1}
  .oview .list{display:flex;flex-direction:column;border-radius:16px;background:var(--o-card);border:1px solid var(--o-line);overflow:hidden}
  .oview .row{display:flex;align-items:center;gap:12px;min-height:58px;padding:6px 14px;border:none;border-bottom:1px solid var(--o-line);background:none;color:var(--o-tx);text-align:left;cursor:pointer;font:inherit;width:100%}
  .oview .row:last-child{border-bottom:none}
  .oview .row .tx{flex:1;display:flex;flex-direction:column}.oview .row b{font:700 1.1rem var(--f-ui)}.oview .row span{font:500 .95rem/1.2 var(--f-ui);color:var(--o-mu)}
  .oview .row .badge{font:700 .8rem var(--f-ui);background:var(--o-hi);color:#1b0a14;border-radius:999px;padding:3px 9px}
  .oview .row .sw{width:46px;height:28px;border-radius:999px;background:var(--o-line);position:relative;flex:none}
  .oview .row .sw::after{content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .2s}
  .oview .row .sw.on{background:var(--o-acc)}.oview .row .sw.on::after{left:21px}
  .oview .lock{font-size:.9rem;margin-left:4px}
  .oview .prof{display:flex;align-items:center;gap:12px}
  .oview .prof .lv{flex:none;width:46px;height:46px;border-radius:50%;background:var(--o-line);display:grid;place-items:center;font:700 1rem var(--f-ui);color:var(--o-hi)}
  .oview .leoclip,.oview nav.legal{display:block!important;margin:0}
  .oview .leoclip{display:flex!important}

  /* Startbild oben auf der Wand */
  html.ord .wrap > .plate,html.ord .wrap > .demobar{display:none!important}
  .ohero{position:relative;height:clamp(200px,52vw,300px);border-radius:22px;overflow:hidden;margin:2px 0 12px;background:#2a2016;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  .ohero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%}
  .ohero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,12,26,0) 35%,rgba(18,12,26,.88) 100%)}
  .ohero .txt{position:absolute;left:16px;right:16px;bottom:14px;z-index:1;display:flex;flex-direction:column;gap:4px;color:#fff7ea}
  .ohero h1{margin:0;font:400 clamp(1.8rem,8vw,2.6rem)/1 var(--f-marker);color:#ffd166;text-shadow:0 2px 10px rgba(0,0,0,.5)}
  .ohero small{font:600 1rem/1.2 var(--f-ui);color:#f1e7da}
  .ohero .pill{align-self:flex-start;margin-top:6px;font:700 .95rem/1.2 var(--f-ui);color:#1b0a14;background:#ffd166;border-radius:999px;padding:6px 12px;cursor:pointer}
  .ohero .pill.off{background:#fff7ea}
  .ohero .ki{position:absolute;right:12px;top:10px;z-index:1;font:600 .7rem var(--f-ui);letter-spacing:.08em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.4);border-radius:999px;padding:3px 8px}
  .ohero .live{position:absolute;left:12px;top:10px;z-index:1;display:flex;align-items:center;gap:6px;font:700 .8rem var(--f-ui);color:#fff;background:rgba(0,0,0,.45);border-radius:999px;padding:4px 10px}
  .ohero .live i{width:8px;height:8px;border-radius:50%;background:#3ddc84}
  html.ord .tabs button[aria-pressed=true]{background:var(--o-acc)!important;color:#fff!important;border-color:var(--o-acc)!important;opacity:1!important}
  html.ord .tabs button{opacity:1!important}
  html.ord .tabs .hint{display:none}
  html.ord .kfrage,html.ord .chcard{background:var(--o-card)!important;color:var(--o-tx)!important;border:1px solid var(--o-line)!important}
  html.ord .chcard .q{color:var(--o-tx)!important}html.ord .chcard .k{color:var(--o-hi)!important}html.ord .chcard .m{color:var(--o-mu)!important}
  html.ord .chcard button{background:var(--o-acc)!important;color:#fff!important;border:none!important}
  html.ord .kfrage .o button.me{background:var(--o-acc)!important;color:#fff!important}
  @media (min-width:700px){.oview .tiles{grid-template-columns:repeat(4,minmax(0,1fr))}.oview .tiles.t3{grid-template-columns:repeat(6,minmax(0,1fr))}}`;
  document.head.appendChild(css);

  // ---------- Bausteine ----------
  const has = id => { const b = $(id); return b && !b.hidden && b.style.display !== "none"; };
  const locked = id => { const b = $(id); return b && b.classList.contains("locked"); };
  // Knöpfe, die auf eine andere Seite führen (Disco, Chill-Raum, 3D, TV …): nicht zurückblättern, sonst wird der Seitenwechsel abgebrochen
  const NAV = ["famDisco", "kgDisco", "famChill", "o3d", "mTv", "oGetown"];
  const press = sel => { const b = typeof sel === "string" ? ($(sel) || document.querySelector(sel)) : sel; if (!b) return;
    if (NAV.includes(b.id)) { b.click(); return; }
    b.click(); if (cur !== "wand") history.back(); };
  const lockI = id => locked(id) ? `<span class="lock" aria-label="${T("gesperrt", "locked")}">🔒</span>` : "";

  const nav = document.createElement("nav"); nav.className = "onav"; nav.setAttribute("aria-label", T("Hauptmenü", "Main menu"));
  nav.innerHTML = `<button type="button" data-v="wand" aria-current="page">${svg("wand")}${T("Wand", "Wall")}</button>
    <button type="button" data-v="spiel">${svg("play")}${T("Spielen & Räume", "Play & rooms")}</button>
    <button type="button" data-v="mehr">${svg("more")}${T("Mehr", "More")}</button>`;
  document.body.appendChild(nav);
  const fab = document.createElement("button"); fab.type = "button"; fab.className = "ofab"; fab.innerHTML = svg("pen", 20) + T("Schreiben", "Write");
  document.body.appendChild(fab);
  const vSpiel = document.createElement("section"); vSpiel.className = "oview"; vSpiel.hidden = true; vSpiel.setAttribute("aria-label", T("Spielen & Räume", "Play & rooms"));
  const vMehr = document.createElement("section"); vMehr.className = "oview"; vMehr.hidden = true; vMehr.setAttribute("aria-label", T("Mehr", "More"));
  document.body.append(vSpiel, vMehr);

  // Schreiben-Leiste auf- und zuklappen
  const comp = $("composer");
  const cx = document.createElement("button"); cx.type = "button"; cx.className = "oclose"; cx.setAttribute("aria-label", T("Schließen", "Close")); cx.innerHTML = svg("x", 20);
  comp.style.position = "fixed"; comp.prepend(cx);
  const write = on => { root.classList.toggle("ord-write", on); if (on) setTimeout(() => { const m = $("msg"); m && !m.closest("[hidden]") && m.focus(); }, 260); };
  fab.onclick = () => write(true); cx.onclick = () => write(false);
  comp.addEventListener("submit", () => setTimeout(() => { const m = $("msg"); if (m && !m.value.trim() && !document.querySelector("#pad:not([hidden])")) write(false); }, 1200));
  // Antworten, Challenge oder „Glückwunsch schreiben“ öffnen die Leiste
  document.addEventListener("click", e => { if (e.target.closest('[data-a="chgo"], .gebcard button')) setTimeout(() => write(true), 50); }, true);
  const fabSync = () => { fab.hidden = comp.hidden; };
  new MutationObserver(fabSync).observe(comp, { attributes: true, attributeFilter: ["hidden"] }); fabSync();

  // ---------- Seiten aufbauen (jedes Mal frisch, damit Sperren und Musik-Status stimmen) ----------
  function tile(id, em, title, sub, opts) {
    if (!id) return ""; return `<button type="button" class="tile" data-p="${E(id)}">${em}<b>${title}${lockI(id)}</b>${sub ? `<span>${sub}</span>` : ""}</button>`;
  }
  function row(id, title, sub, extra) { if (!id) return ""; return `<button type="button" class="row" data-p="${E(id)}"><span class="tx"><b>${title}${lockI(id)}</b>${sub ? `<span>${sub}</span>` : ""}</span>${extra || svg("chev", 18)}</button>`; }
  const pick = (...ids) => ids.find(id => has(id)) || null;
  const accent = getComputedStyle(root).getPropertyValue("--o-acc").trim() || "#ff4fa3";
  const ic = k => svg(k, 28, accent);

  function buildSpiel() {
    const disco = pick("famDisco", "kgDisco"), chill = pick("famChill"), d3 = document.querySelector(".demobar .d3d");
    if (d3 && !d3.id) d3.id = "o3d";
    const rooms = [tile(disco, ic("disco"), T("Disco", "Disco"), T("Beats, Tanzen, Karaoke", "Beats, dance, karaoke")),
      tile(chill, ic("sofa"), T("Chill-Raum", "Chill room"), T("Quatschen, TV, Dart", "Chat, TV, darts")),
      tile(d3 ? "o3d" : null, ic("door"), T("3D-Kabine", "3D cabin"), T("Geheimtür & Orakel", "Secret door & oracle")),
      tile(pick("mTv"), ic("tv"), T("TV-Modus", "TV mode"), T("Wand auf dem Fernseher", "Wall on the TV"))].join("");
    const games = [row(pick("kgOpen"), T("Klo-Spiele", "Loo games"), T("8 Minispiele mit Rangliste", "8 mini games with leaderboard")),
      row(pick("mQz"), T("Quiz-Abend", "Quiz night"), T("Alle spielen gleichzeitig", "Everyone plays at once"), `<span class="badge">Live</span>${svg("chev", 18)}`),
      row(chill, T("Zusammen spielen", "Play together"), T("Mensch ärgere dich nicht, Macke, 4 gewinnt – im Chill-Raum", "Board games in the chill room")),
      row("oSnooker", T("Snooker 3D", "Snooker 3D"), T("Gegen Bot oder zu zweit online", "Against a bot or online"))].join("");
    vSpiel.innerHTML = `<div class="in"><h1>${T("Spielen &amp; Räume", "Play &amp; rooms")}</h1>
      ${rooms ? `<div><h2>${T("Räume", "Rooms")}</h2><div class="tiles">${rooms}</div></div>` : ""}
      <div><h2>${T("Spielen", "Games")}</h2><div class="list">${games}</div></div></div>`;
  }
  function buildMehr() {
    const music = $("kgMusic"), on = music && music.getAttribute("aria-pressed") === "true";
    const lv = window.kloXP ? kloXP.level() : 1;
    const fam = [row(pick("famPlan"), T("Stundenplan", "Timetable")), row(pick("famFoto"), $("famFoto") ? $("famFoto").textContent.replace(/^\S+\s/, "") : ""),
      (() => { const s = document.querySelector(".fambar .stern"); if (s && !s.id) s.id = "oStern"; return s ? row("oStern", T("Sterne-Aufgaben", "Star chores"), T("Sterne sammeln für eine Belohnung", "Collect stars for a reward")) : ""; })(),
      (() => { const g = document.querySelector(".fambar .geb"); if (g && !g.id) g.id = "oGeb"; return g ? row("oGeb", T("Geburtstage", "Birthdays")) : ""; })(),
      row(pick("famSos"), "🚑 " + T("Notfall – Hilfe!", "Emergency – help!"), T("Erste Hilfe Schritt für Schritt, Notruf 112", "First aid step by step"))].join("");
    const ex = [["xCal", "📅", T("Kalender", "Calendar")], ["xWet", "⛅", T("Wetter", "Weather")], ["xFb", "📖", T("Freundebuch", "Friends book")], ["xEv", "🎉", T("Tipps", "Events")], ["kgEk", "🛒", T("Einkauf", "Shopping")], ["orcOpen", "🔮", T("Orakel", "Oracle")]]
      .filter(x => has(x[0])).map(x => tile(x[0], `<span class="em" aria-hidden="true">${x[1]}</span>`, x[2])).join("");
    const getown = document.querySelector(".getown a, .getown button"); if (getown && !getown.id) getown.id = "oGetown";
    vMehr.innerHTML = `<div class="in"><h1>${T("Mehr", "More")}</h1>
      <div class="list">${has("mXp") ? `<button type="button" class="row prof" data-p="mXp"><span class="lv">Lv ${lv}</span><span class="tx"><b>${T("Mein Profil", "My profile")}</b><span>${T("Abzeichen und Punkte", "Badges and points")}</span></span>${svg("chev", 18)}</button>` : ""}
        ${row(pick("mInv"), T("Freunde einladen", "Invite friends"), T("Jeder Freund = ein Gratis-Tag mehr", "Each friend = one more free day"))}</div>
      ${music ? `<div><h2>${T("Musik", "Music")}</h2><div class="list">
        <button type="button" class="row" data-p="kgMusic"><span class="tx"><b>${T("Musik", "Music")}${lockI("kgMusic")}</b><span>${E(($("kgTrackTxt") && $("kgTrackTxt").textContent) ? T("Lied: ", "Song: ") + $("kgTrackTxt").textContent : "Lo-Fi")}</span></span><span class="sw${on ? " on" : ""}"></span></button>
        ${has("kgTrack") ? row("kgTrack", T("Nächstes Lied", "Next song")) : ""}${row(pick("kgMine"), T("Eigene Lieder & Spotify", "My songs & Spotify"))}${row(pick("mWu"), T("Musikwünsche", "Song requests"))}</div></div>` : ""}
      ${fam ? `<div><h2>${T("Familie", "Family")}</h2><div class="list">${fam}</div></div>` : ""}
      ${ex ? `<div><h2>Extras</h2><div class="tiles t3">${ex}</div></div>` : ""}
      <div><h2>${T("Einstellungen", "Settings")}</h2><div class="list">${row(pick("stilOpen"), T("Hintergrund der Wand", "Wall background"))}${row(pick("demoMore"), $("demoMore") ? $("demoMore").textContent : "")}${getown ? row("oGetown", getown.textContent.trim()) : ""}</div></div>
      <div data-slot="leo"></div><div data-slot="legal"></div></div>`;
    const leo = document.querySelector(".leoclip"); if (leo) vMehr.querySelector('[data-slot="leo"]').appendChild(leo);
    const legal = document.querySelector(".wrap > nav.legal"); if (legal) vMehr.querySelector('[data-slot="legal"]').appendChild(legal);
  }
  [vSpiel, vMehr].forEach(v => v.addEventListener("click", e => {
    const b = e.target.closest("[data-p]"); if (!b) return; const id = b.dataset.p;
    if (id === "oSnooker") { location.href = "snooker.html?wand=" + encodeURIComponent(WALL); return; }
    if (id === "kgMusic" || id === "kgTrack") { const o = $(id); o && o.click(); setTimeout(buildMehr, 400); return; }
    press(id);
  }));

  // ---------- Umschalten ----------
  let cur = "wand";
  function go(v, quiet) {
    cur = v; write(false);
    if (v === "spiel") buildSpiel(); if (v === "mehr") buildMehr();
    vSpiel.hidden = v !== "spiel"; vMehr.hidden = v !== "mehr";
    nav.querySelectorAll("button").forEach(b => b.setAttribute("aria-current", b.dataset.v === v ? "page" : "false"));
    fab.style.display = v === "wand" ? "" : "none";
    if (!quiet) { if (v !== "wand") history.pushState({ ord: v }, ""); (v === "wand" ? window : (v === "spiel" ? vSpiel : vMehr)).scrollTo(0, 0); }
  }
  nav.addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return; if (b.dataset.v === cur) { if (cur === "wand") window.scrollTo({ top: 0, behavior: "smooth" }); return; } if (cur !== "wand" && b.dataset.v === "wand") { history.back(); return; } go(b.dataset.v); });
  addEventListener("popstate", () => { if (cur !== "wand") go("wand", true); if (root.classList.contains("ord-write")) write(false); });

  // Notfall-Hilfe bleibt auf Familien-Wänden direkt auf der Wand sichtbar
  function sos() {
    const s = $("famSos"); if (!s || document.querySelector(".osos") || !(typeof FAM_DEVICE !== "undefined" && FAM_DEVICE)) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "osos"; b.innerHTML = s.innerHTML; b.onclick = () => s.click();
    const at = document.querySelector(".demobar") || document.querySelector(".plate"); at.after(b);
  }
  let tries = 0; (function wait() { sos(); if (!document.querySelector(".osos") && ++tries < 15) setTimeout(wait, 200); })();
  addEventListener("pageshow", e => { if (e.persisted && history.state && history.state.ord) go(history.state.ord, true); });

  // ---------- Startbild mit Name der Wand ----------
  (function hero() {
    const plate = document.querySelector(".wrap > .plate"); if (!plate) return;
    const h = document.createElement("header"); h.className = "ohero";
    h.innerHTML = `<img src="assets/hero-geist.jpg" alt="${T("Ein Gespenst und ein junger Mann sitzen auf dem Klo und schauen aufs Handy", "A ghost and a young man on the loo looking at their phones")}"><span class="live"><i></i>Live</span><span class="ki">${T("Bild KI-generiert", "AI-generated image")}</span>
      <div class="txt"><h1></h1><small></small><button type="button" class="pill" hidden></button></div>`;
    plate.before(h);
    const sync = () => {
      h.querySelector("h1").textContent = ($("venue") || {}).textContent || "Klo-Wand";
      h.querySelector("small").textContent = ((($("venueSub") || {}).textContent) || "").split(" · ")[0];
      const f = $("demoFree"), p = h.querySelector(".pill");
      if (f && f.textContent.trim()) { const short = f.textContent.trim().split(":")[0]; p.hidden = false; p.textContent = short; p.classList.toggle("off", !/gratis|free/i.test(short));
        p.onclick = () => { const m = $("demoMore"); m && m.click(); }; }
      else p.hidden = true;
    };
    sync(); new MutationObserver(sync).observe(plate, { subtree: true, childList: true, characterData: true });
    window.addEventListener("klo-demo", () => setTimeout(sync, 50));
    let n = 0; (function w() { sync(); if (++n < 10) setTimeout(w, 300); })();
  })();
  window.kloOrdnung = { go, write };
})();
