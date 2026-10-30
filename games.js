/* Klo-Wand: Musik-Knopf, Mini-Spiele und Ranglisten pro Wand.
   Braucht aus index.html: fs, WALL, info, esc, firebase. Und KloMusik aus music.js. */
(function () {
  const GAMES = {
    fang:   { title: "Klorollen-Fang", short: "Fang", desc: "30 Sekunden Rollen fangen. Gold zählt 5, der Pümpel kostet 3.", unit: "Rollen", better: "desc" },
    reflex: { title: "Spül-Reflex",    short: "Reflex", desc: "Tipp, sobald die Kabine frei wird. 3 Runden, der Schnitt zählt.", unit: "ms", better: "asc" },
  };
  const BAD = ["hure", "fotze", "schwuchtel", "spast", "missgeburt", "nazi", "hurensohn", "nutte", "wichser", "fick"];
  const C = { door: "#b9c7bf", ink: "#1d2321", red: "#b3261e", gold: "#e0a92e", paper: "#fbfbf7", core: "#c9cfc9", green: "#2f6b3a", wood: "#8a5a2b", muted: "#46524b" };
  const $ = id => document.getElementById(id);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const scores = g => fs.collection("walls").doc(WALL).collection("games").doc(g).collection("scores");
  const fmt = (g, s) => g === "reflex" ? `${s} ms` : `${s} ${s === 1 ? "Rolle" : "Rollen"}`;
  const sortRows = (g, rows) => rows.sort((a, b) => GAMES[g].better === "desc" ? b.score - a.score : a.score - b.score);
  let myName = ""; try { myName = localStorage.getItem("klowand-name") || ""; } catch (e) {}
  let lastId = null, stopGame = () => {};

  /* ---------- Styles ---------- */
  const css = document.createElement("style");
  css.textContent = `
  .extras{display:flex;gap:8px;margin:12px 0 0;flex-wrap:wrap}
  .extras button{display:inline-flex;align-items:center;gap:8px;font:700 .95rem var(--f-ui);letter-spacing:.05em;text-transform:uppercase;
    border-radius:6px;border:1.5px solid var(--ink);background:var(--plate);color:var(--ink);padding:7px 12px;min-height:40px;cursor:pointer}
  .extras button.games{background:var(--ink);color:var(--door)}
  .extras button[aria-pressed="true"]{background:var(--green);border-color:var(--green);color:#fff}
  .extras .eq{display:inline-flex;gap:2px;align-items:flex-end;height:14px}
  .extras .eq i{display:block;width:3px;height:5px;background:currentColor;border-radius:1px}
  .extras button[aria-pressed="true"] .eq i{animation:kgEq 1s ease-in-out infinite}
  .extras button[aria-pressed="true"] .eq i:nth-child(2){animation-delay:.2s}.extras button[aria-pressed="true"] .eq i:nth-child(3){animation-delay:.4s}
  @keyframes kgEq{0%,100%{height:4px}50%{height:14px}}
  .kg{position:fixed;inset:0;z-index:30;background:var(--door);overflow-y:auto;overscroll-behavior:contain;
    padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
  .kg .gw{max-width:460px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:14px 32px}
  .kg header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .kg header b{font:400 1.6rem/1 var(--f-marker)}
  .kg header small{display:block;font:600 .8rem var(--f-ui);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:4px}
  .kg .x{font:700 .9rem var(--f-ui);letter-spacing:.06em;text-transform:uppercase;background:var(--ink);color:var(--door);border:none;border-radius:6px;padding:8px 12px;min-height:40px;cursor:pointer}
  .kg .card{background:var(--plate);border:1.5px solid var(--ink);border-radius:8px;padding:14px 16px;margin-top:12px}
  .kg .card h3{margin:0;font:400 1.5rem var(--f-marker)}
  .kg .card p{margin:4px 0 0;font:500 1rem/1.35 var(--f-ui);color:var(--muted)}
  .kg .lead{font:700 1.25rem var(--f-scrawl);color:var(--blue);margin-top:8px;min-height:1.4em}
  .kg .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .kg .btn{font:700 1rem var(--f-ui);letter-spacing:.06em;text-transform:uppercase;border-radius:6px;padding:10px 16px;min-height:44px;cursor:pointer;border:1.5px solid var(--ink);background:transparent;color:var(--ink)}
  .kg .btn.go{background:var(--red);border-color:var(--red);color:#fff}
  .kg .ghost{display:block;margin:12px auto 0;background:none;border:none;font:600 .95rem var(--f-ui);color:var(--muted);text-decoration:underline;cursor:pointer;min-height:40px}
  .kg canvas{display:block;width:100%;max-width:380px;aspect-ratio:360/520;margin:0 auto;border-radius:10px;border:3px solid var(--ink);touch-action:none;background:var(--door)}
  .kg .hint{text-align:center;font:600 .95rem var(--f-ui);color:var(--muted);margin:10px 0 0}
  .kg .pad{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;height:min(88vw,56vh);border-radius:14px;border:3px solid var(--ink);
    background:var(--plate);color:var(--ink);cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none}
  .kg .pad big{font:400 clamp(2.4rem,12vw,3.6rem)/1 var(--f-marker)}
  .kg .pad small{font:600 1.1rem var(--f-ui);letter-spacing:.04em}
  .kg .pad.busy{background:var(--red);color:#fff;border-color:var(--red)}
  .kg .pad.free{background:var(--green);color:#fff;border-color:var(--green)}
  .kg .pad.early{background:var(--ink);color:var(--door)}
  .kg .score{text-align:center;margin-top:18px}
  .kg .score big{display:block;font:400 3.4rem/1 var(--f-marker);color:var(--red)}
  .kg .score span{font:600 1rem var(--f-ui);color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
  .kg label{display:block;font:700 .85rem var(--f-ui);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:18px}
  .kg input{box-sizing:border-box;width:100%;margin-top:6px;font:1.4rem var(--f-hand);padding:10px 12px;border-radius:6px;border:1.5px solid var(--ink);background:#fff;color:var(--ink)}
  .kg .msg{font:600 .95rem var(--f-ui);color:var(--red);min-height:1.3em;margin-top:6px}
  .kg .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .kg .chip{font:700 .85rem var(--f-ui);letter-spacing:.05em;text-transform:uppercase;border-radius:999px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);padding:6px 12px;min-height:36px;cursor:pointer}
  .kg .chip[aria-pressed="true"]{background:var(--ink);color:var(--door)}
  .kg ol{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
  .kg li{display:grid;grid-template-columns:2.2em minmax(0,1fr) auto;gap:8px;align-items:baseline;background:var(--plate);border-radius:6px;padding:8px 12px;border:1px solid #8b958f}
  .kg li .p{font:700 1.1rem var(--f-ui);color:var(--muted);font-variant-numeric:tabular-nums}
  .kg li .n{font:1.35rem/1.1 var(--f-hand);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .kg li .s{font:700 1.1rem var(--f-ui);font-variant-numeric:tabular-nums}
  .kg li.top1{border-color:var(--gold, #e0a92e);border-width:2px}
  .kg li.top1 .p{color:#a8761a}
  .kg li.me{background:#fff;border-color:var(--red);border-width:2px}
  .kg .gap{text-align:center;color:var(--muted);font:700 1.2rem var(--f-ui)}
  .kg .empty{text-align:center;padding:24px 0;font:1.3rem var(--f-hand);color:var(--muted)}
  @media (prefers-reduced-motion:reduce){.extras button .eq i{animation:none!important}}
  `;
  document.head.appendChild(css);

  /* ---------- Knöpfe an der Wand ---------- */
  const extras = document.createElement("div");
  extras.className = "extras";
  extras.innerHTML = `<button type="button" class="games" id="kgOpen">Klo-Spiele &amp; Rangliste</button>
    <button type="button" id="kgMusic" aria-pressed="false"><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span id="kgMusicTxt">Musik an</span></button>`;
  document.querySelector(".tabs").before(extras);
  $("kgMusic").onclick = async () => {
    await KloMusik.toggle();
    const on = KloMusik.isOn();
    $("kgMusic").setAttribute("aria-pressed", on);
    $("kgMusicTxt").textContent = on ? "Musik aus" : "Musik an";
  };

  /* ---------- Spiele-Fenster ---------- */
  const kg = document.createElement("div");
  kg.className = "kg"; kg.hidden = true; kg.setAttribute("role", "dialog"); kg.setAttribute("aria-label", "Klo-Spiele");
  kg.innerHTML = `<div class="gw"><header><div><b>Klo-Spiele</b><small id="kgWhere"></small></div><button type="button" class="x" id="kgClose">Zur Wand</button></header><div id="kgBody"></div></div>`;
  document.body.appendChild(kg);
  $("kgWhere").textContent = "Rangliste " + info.name;
  const body = $("kgBody");
  function view(html) { stopGame(); stopGame = () => {}; body.innerHTML = html; kg.scrollTop = 0; }
  function open() { kg.hidden = false; document.body.style.overflow = "hidden"; menu(); }
  function close() { stopGame(); stopGame = () => {}; kg.hidden = true; document.body.style.overflow = ""; }
  $("kgOpen").onclick = open;
  $("kgClose").onclick = close;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !kg.hidden) close(); });
  if (new URLSearchParams(location.search).get("spiele") !== null) setTimeout(open, 300);

  body.addEventListener("click", e => {
    const b = e.target.closest("[data-go]"); if (!b) return;
    const [what, g, tab] = b.dataset.go.split(":");
    if (what === "menu") menu();
    if (what === "play") g === "fang" ? playFang() : playReflex();
    if (what === "board") board(g, tab || "heute");
  });

  /* ---------- Menü ---------- */
  function menu() {
    view(Object.entries(GAMES).map(([g, x]) => `<div class="card"><h3>${x.title}</h3><p>${x.desc}</p>
      <div class="lead" id="lead-${g}">&nbsp;</div>
      <div class="row"><button type="button" class="btn go" data-go="play:${g}">Spielen</button><button type="button" class="btn" data-go="board:${g}:heute">Rangliste</button></div></div>`).join("")
      + `<p class="hint">Die Tages-Rangliste startet jeden Tag um Mitternacht neu.</p>`);
    Object.keys(GAMES).forEach(async g => {
      try {
        const rows = sortRows(g, (await scores(g).where("day", "==", today()).limit(500).get()).docs.map(d => d.data()).filter(r => typeof r.name === "string" && typeof r.score === "number"));
        const el = $("lead-" + g); if (!el) return;
        el.textContent = rows.length ? `Heute vorne: ${rows[0].name} mit ${fmt(g, rows[0].score)}` : "Heute noch kein Eintrag. Hol dir Platz 1!";
      } catch (e) { const el = $("lead-" + g); if (el) el.textContent = "Rangliste gerade nicht erreichbar."; }
    });
  }

  /* ---------- Spiel 1: Klorollen-Fang ---------- */
  function playFang() {
    view(`<canvas id="kgCanvas" aria-label="Spielfeld: Eimer mit dem Finger nach links und rechts ziehen"></canvas>
      <p class="hint">Zieh den Eimer mit dem Finger hin und her.</p><button type="button" class="ghost" data-go="menu">Abbrechen</button>`);
    const cv = $("kgCanvas"), W = 360, H = 520, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext("2d"); c.scale(dpr, dpr);
    const BUCKET_Y = H - 64, DUR = 30;
    let px = W / 2, items = [], score = 0, pops = [], flash = 0, running = true, started = false, t0 = 0, last = 0, acc = 0, raf = 0;
    const toX = e => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    const begin = () => { if (!started) { started = true; t0 = last = performance.now(); } };
    cv.addEventListener("pointerdown", e => { px = toX(e); begin(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener("pointermove", e => { if (e.pointerType === "mouse" || e.buttons) px = toX(e); });
    const onKey = e => { if (e.key === "ArrowLeft") { px -= 28; begin(); } if (e.key === "ArrowRight") { px += 28; begin(); } };
    document.addEventListener("keydown", onKey);
    stopGame = () => { running = false; cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey); };

    function roll(x, y, gold) {
      c.save(); c.translate(x, y);
      c.fillStyle = gold ? C.gold : C.paper; c.strokeStyle = C.ink; c.lineWidth = 2;
      c.fillRect(-4, 6, 22, 16); c.strokeRect(-4, 6, 22, 16);            // abgerolltes Blatt
      c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = gold ? "#a8761a" : C.core; c.beginPath(); c.arc(0, 0, 5.5, 0, Math.PI * 2); c.fill(); c.stroke();
      if (gold) { c.fillStyle = "#fff6"; c.beginPath(); c.arc(-6, -6, 3, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    function plunger(x, y) {
      c.save(); c.translate(x, y); c.strokeStyle = C.ink; c.lineWidth = 2;
      c.fillStyle = C.wood; c.fillRect(-3, -26, 6, 26); c.strokeRect(-3, -26, 6, 26);
      c.fillStyle = C.red; c.beginPath(); c.moveTo(-17, 14); c.quadraticCurveTo(-17, -4, 0, -4); c.quadraticCurveTo(17, -4, 17, 14); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    function bucket(x) {
      c.save(); c.translate(x, BUCKET_Y); c.fillStyle = C.ink;
      c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(32, 46); c.lineTo(-32, 46); c.closePath(); c.fill();
      c.fillStyle = "#3a4440"; c.fillRect(-40, -4, 80, 8);
      c.fillStyle = C.door; c.font = "700 16px 'Barlow Condensed', sans-serif"; c.textAlign = "center"; c.fillText("KLO", 0, 30);
      c.restore();
    }
    function draw(bx, left) {
      c.fillStyle = flash > 0 ? "#d9a29d" : C.door; c.fillRect(0, 0, W, H);
      c.fillStyle = "rgba(0,0,0,.035)"; for (let x = 0; x < W; x += 7) c.fillRect(x, 0, 2, H);
      items.forEach(it => it.k === "plunger" ? plunger(it.x, it.y) : roll(it.x, it.y, it.k === "gold"));
      bucket(bx);
      pops.forEach(p => { c.globalAlpha = Math.max(0, p.t / 0.7); c.fillStyle = p.col; c.font = "400 26px 'Permanent Marker', cursive"; c.textAlign = "center"; c.fillText(p.txt, p.x, p.y); c.globalAlpha = 1; });
      c.fillStyle = C.ink; c.font = "700 26px 'Barlow Condensed', sans-serif";
      c.textAlign = "left"; c.fillText(`${score} ${score === 1 ? "Rolle" : "Rollen"}`, 14, 34);
      c.textAlign = "right"; c.fillStyle = left <= 5 ? C.red : C.ink; c.fillText(`${Math.ceil(left)} s`, W - 14, 34);
      if (!started) {
        c.fillStyle = "rgba(29,35,33,.82)"; c.fillRect(30, 170, W - 60, 150);
        c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "400 30px 'Permanent Marker', cursive"; c.fillText("Antippen zum Start", W / 2, 230);
        c.font = "600 18px 'Barlow Condensed', sans-serif"; c.fillText("Rolle +1 · Gold +5 · Pümpel −3", W / 2, 272);
      }
    }
    function loop(now) {
      if (!running) return;
      if (!started) { draw(Math.max(40, Math.min(W - 40, px)), DUR); raf = requestAnimationFrame(loop); return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const el = (now - t0) / 1000, left = Math.max(0, DUR - el), prog = Math.min(1, el / DUR);
      acc += dt; const every = 0.68 - 0.36 * prog;
      while (acc > every) { acc -= every; const r = Math.random(); items.push({ x: 26 + Math.random() * (W - 52), y: -30, v: 150 + 180 * prog + Math.random() * 50, k: r < 0.08 ? "gold" : r < 0.25 ? "plunger" : "roll" }); }
      const bx = Math.max(40, Math.min(W - 40, px));
      items.forEach(it => it.y += it.v * dt);
      items = items.filter(it => {
        if (it.y > BUCKET_Y - 16 && it.y < BUCKET_Y + 18 && Math.abs(it.x - bx) < 46) {
          if (it.k === "plunger") { score = Math.max(0, score - 3); flash = 0.25; KloMusik.blip("bad"); pops.push({ x: it.x, y: BUCKET_Y - 20, txt: "−3", col: C.red, t: 0.7 }); }
          else { const g = it.k === "gold"; score += g ? 5 : 1; KloMusik.blip(g ? "gold" : "good"); pops.push({ x: it.x, y: BUCKET_Y - 20, txt: g ? "+5" : "+1", col: g ? "#a8761a" : C.green, t: 0.7 }); }
          return false;
        }
        return it.y < H + 40;
      });
      pops.forEach(p => { p.t -= dt; p.y -= 40 * dt; }); pops = pops.filter(p => p.t > 0);
      flash = Math.max(0, flash - dt);
      draw(bx, left);
      if (left <= 0) { running = false; document.removeEventListener("keydown", onKey); KloMusik.blip("flush"); setTimeout(() => result("fang", score), 500); return; }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  /* ---------- Spiel 2: Spül-Reflex ---------- */
  function playReflex() {
    view(`<button type="button" class="pad" id="kgPad"><big id="kgBig">Bereit?</big><small id="kgSmall">Tippen zum Starten</small></button>
      <p class="hint" id="kgRound">Runde 1 von 3</p><button type="button" class="ghost" data-go="menu">Abbrechen</button>`);
    const pad = $("kgPad"), big = $("kgBig"), small = $("kgSmall"), round = $("kgRound");
    let state = "idle", times = [], timer = 0, tGo = 0, alive = true;
    const set = (cls, b, s) => { pad.className = "pad " + cls; big.textContent = b; small.textContent = s; };
    stopGame = () => { alive = false; clearTimeout(timer); document.removeEventListener("keydown", onKey); };
    function wait() {
      state = "wait"; set("busy", "Besetzt", "Warte, bis die Kabine frei ist …");
      timer = setTimeout(() => { if (!alive) return; state = "go"; tGo = performance.now(); set("free", "FREI!", "Jetzt tippen!"); }, 1300 + Math.random() * 2700);
    }
    function hit(ts) {
      if (state === "idle" || state === "early" || state === "shown") { wait(); return; }
      if (state === "wait") { clearTimeout(timer); state = "early"; KloMusik.blip("bad"); set("early", "Zu früh!", "Tippen und nochmal versuchen"); return; }
      if (state === "go") {
        const ms = Math.round(ts - tGo);
        if (ms < 100) { state = "early"; KloMusik.blip("bad"); set("early", "Zu früh!", "Tippen und nochmal versuchen"); return; }
        times.push(Math.min(ms, 3000)); KloMusik.blip("flush"); state = "shown";
        if (times.length < 3) { set("", `${ms} ms`, "Tippen für die nächste Runde"); round.textContent = `Runde ${times.length + 1} von 3`; }
        else { set("", `${ms} ms`, "Geschafft!"); state = "done"; const avg = Math.round(times.reduce((a, b) => a + b, 0) / 3); setTimeout(() => alive && result("reflex", avg), 900); }
      }
    }
    pad.addEventListener("pointerdown", e => { e.preventDefault(); hit(performance.now()); });
    const onKey = e => { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); hit(performance.now()); } };
    document.addEventListener("keydown", onKey);
  }

  /* ---------- Ergebnis und Eintragen ---------- */
  function checkName(n) {
    if (n.length < 2) return "Mindestens 2 Zeichen, bitte.";
    if (n.length > 12) return "Höchstens 12 Zeichen.";
    if (!/^[A-Za-zÄÖÜäöüß0-9 ._-]+$/.test(n)) return "Nur Buchstaben, Zahlen, Leerzeichen, Punkt und Strich.";
    if (BAD.some(w => n.toLowerCase().includes(w))) return "Such dir einen netteren Namen aus.";
    return null;
  }
  function result(g, score) {
    view(`<div class="score"><span>${GAMES[g].title}</span><big>${fmt(g, score)}</big>
        <span>${g === "reflex" ? "Schnitt aus 3 Runden" : "gefangen"}</span></div>
      <form id="kgForm" autocomplete="off">
        <label for="kgName">Dein Name für die Rangliste</label>
        <input id="kgName" maxlength="12" placeholder="z. B. Klokönig" value="${esc(myName)}">
        <div class="msg" id="kgMsg"></div>
        <div class="row"><button class="btn go" type="submit">Eintragen</button><button type="button" class="btn" data-go="play:${g}">Nochmal</button></div>
      </form><button type="button" class="ghost" data-go="menu">Ohne Eintrag zurück</button>`);
    $("kgForm").addEventListener("submit", async e => {
      e.preventDefault();
      const name = $("kgName").value.trim().replace(/\s+/g, " "), err = checkName(name);
      if (err) { $("kgMsg").textContent = err; return; }
      const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
      try {
        const ref = await scores(g).add({ name, score, day: today(), ts: firebase.firestore.FieldValue.serverTimestamp() });
        lastId = ref.id; myName = name; try { localStorage.setItem("klowand-name", name); } catch (_) {}
        board(g, "heute");
      } catch (x) {
        btn.disabled = false;
        $("kgMsg").textContent = x && x.code === "permission-denied" ? "Die Rangliste hat das abgelehnt. Anderer Name?" : "Eintragen hat nicht geklappt. Versuch es nochmal.";
      }
    });
  }

  /* ---------- Rangliste ---------- */
  async function board(g, tab) {
    const chip = (go, label, on) => `<button type="button" class="chip" data-go="${go}" aria-pressed="${on}">${label}</button>`;
    view(`<div class="chips">${Object.entries(GAMES).map(([k, x]) => chip(`board:${k}:${tab}`, x.title, k === g)).join("")}</div>
      <div class="chips">${chip(`board:${g}:heute`, "Heute", tab === "heute")}${chip(`board:${g}:rekord`, "Bar-Rekorde", tab === "rekord")}</div>
      <div id="kgList"><p class="empty">Rangliste lädt …</p></div>
      <div class="row" style="justify-content:center"><button type="button" class="btn go" data-go="play:${g}">${GAMES[g].title} spielen</button></div>
      <button type="button" class="ghost" data-go="menu">Zu den Spielen</button>`);
    try {
      const q = tab === "heute" ? scores(g).where("day", "==", today()).limit(500) : scores(g).orderBy("score", GAMES[g].better).limit(10);
      const rows = sortRows(g, (await q.get()).docs.map(d => ({ id: d.id, ...d.data() })).filter(r => typeof r.name === "string" && typeof r.score === "number"));
      const list = $("kgList"); if (!list) return;
      if (!rows.length) { list.innerHTML = `<p class="empty">${tab === "heute" ? "Heute noch niemand. Platz 1 ist frei!" : "Noch keine Rekorde."}</p>`; return; }
      const meIdx = lastId ? rows.findIndex(r => r.id === lastId) : -1;
      const li = (r, i) => `<li class="${i === 0 ? "top1" : ""}${r.id === lastId ? " me" : ""}"><span class="p">${i + 1}.</span><span class="n">${esc(r.name)}</span><span class="s">${fmt(g, r.score)}</span></li>`;
      let html = rows.slice(0, 10).map(li).join("");
      if (meIdx >= 10) html += `<li class="gap" aria-hidden="true">…</li>` + li(rows[meIdx], meIdx);
      list.innerHTML = (meIdx >= 0 ? `<p class="hint">Du bist auf Platz ${meIdx + 1} von ${rows.length}${tab === "heute" ? " heute" : ""}.</p>` : "") + `<ol>${html}</ol>`;
    } catch (e) {
      const list = $("kgList"); if (list) list.innerHTML = `<p class="empty">Rangliste gerade nicht erreichbar.</p>`;
    }
  }
})();
