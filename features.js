/* Klo-Wand: Klo-Orakel und Links zu Impressum und Datenschutz.
   Braucht: KloMusik (music.js) und die Knopfleiste aus games.js. */
(function () {
  const SPRUECHE = [
    "Heute gibt’s noch ein Bier für dich.",
    "Die nächste Runde geht auf jemanden an deinem Tisch.",
    "Dein Handy-Akku hält länger als dein Vorsatz, heute früh heimzugehen.",
    "Die Kabine sagt: Du bist schön. Die Kabine lügt nie.",
    "Wer jetzt spült, hat für heute alles richtig gemacht.",
    "Heute ist ein guter Abend für Pommes.",
    "Jemand in dieser Bar findet dich heimlich gut.",
    "Trink ein Glas Wasser. Das Orakel macht sich Sorgen.",
    "Deine Tanzmoves sind besser, als alle sagen.",
    "Das Klopapier reicht. Diesmal.",
    "Bestell was, das du noch nie probiert hast.",
    "Morgen wirst du über heute lachen. Vielleicht mit Kopfweh.",
    "Der Barkeeper hat einen Lieblingsgast. Frag ihn mal, wer.",
    "Du bist heute der Grund, warum jemand gute Laune hat.",
    "Schreib was Nettes an die Wand. Karma ist ein Klopapier.",
    "Die Zukunft ist ungewiss. Die Schlange vor dem Damenklo nicht.",
    "Heute triffst du jemanden, der denselben Song mag.",
    "Ein Taxi nach Hause ist günstiger als ein schlechter Morgen.",
    "Das Orakel sieht: Pizza. Sehr bald.",
    "Du hast heute den besten Platz an der Bar verdient.",
    "Sag deinen Freunden, dass sie toll sind. Jetzt gleich.",
    "Die Sterne stehen günstig für einen Klo-Spiele-Rekord.",
    "Wer sich die Hände wäscht, gewinnt. Immer.",
    "Heute kein Drama. Nur gute Musik.",
    "Dein nächster Witz zündet. Trau dich.",
    "Die Kabine merkt sich alles. Keine Sorge, sie schweigt.",
    "Du wirst heute noch lachen, bis dir der Bauch wehtut.",
    "Ein Fremder wird dir heute ein Lächeln schenken.",
    "Das Orakel empfiehlt: noch einmal tief durchatmen. Okay, nicht hier.",
    "Bleib so, wie du bist. Nur mit frisch gewaschenen Händen.",
    "Heute ist Prosecco-Wetter. Egal, wie das Wetter ist.",
    "Jemand wird heute deinen Spruch an der Wand lieben.",
    "Die beste Idee des Abends kommt dir auf dem Heimweg.",
    "Du hast Glück: Die Kabine nebenan ist besetzt, nicht deine.",
    "Das Orakel sagt Ja. Was war die Frage?",
    "Ruf morgen deine Oma an. Sie freut sich.",
    "Heute Nacht wird legendär. Oder wenigstens lustig.",
    "Gib dem Barkeeper ein Trinkgeld. Das Orakel sieht alles.",
    "Deine Playlist hat heute Hitpotenzial.",
    "Der Abend ist jung. Du auch.",
  ];
  const SAYINGS_EN = [
    "There's one more drink in your future tonight.",
    "The next round is on someone at your table.",
    "Your phone battery will outlast your plan to go home early.",
    "The stall says: you look great. The stall never lies.",
    "Whoever flushes now has done everything right today.",
    "Tonight is a good night for fries.",
    "Someone here secretly thinks you're great.",
    "Drink a glass of water. The oracle is worried.",
    "Your dance moves are better than everyone says.",
    "There's enough toilet paper. This time.",
    "Order something you've never tried.",
    "Tomorrow you'll laugh about today. Maybe with a headache.",
    "The bartender has a favourite guest. Ask who.",
    "You're the reason someone is in a good mood today.",
    "Write something nice on the wall. Karma is a toilet roll.",
    "The future is uncertain. The queue for the ladies' room is not.",
    "Today you'll meet someone who loves the same song.",
    "A taxi home is cheaper than a bad morning.",
    "The oracle sees: pizza. Very soon.",
    "You deserve the best seat in the house tonight.",
    "Tell your friends they're awesome. Right now.",
    "The stars are aligned for a Loo Games record.",
    "Whoever washes their hands wins. Always.",
    "No drama today. Only good music.",
    "Your next joke will land. Go for it.",
    "The stall remembers everything. Don't worry, it keeps quiet.",
    "You'll laugh until your stomach hurts tonight.",
    "A stranger will give you a smile today.",
    "The oracle recommends a deep breath. Okay, not in here.",
    "Stay as you are. Just with freshly washed hands.",
    "It's prosecco weather. Whatever the weather.",
    "Someone will love what you write on the wall today.",
    "The best idea of the night comes on the way home.",
    "Lucky you: the stall next door is occupied, not yours.",
    "The oracle says yes. What was the question?",
    "Call your grandma tomorrow. She'll be happy.",
    "Tonight will be legendary. Or at least funny.",
    "Tip the bartender. The oracle sees everything.",
    "Your playlist has hit potential today.",
    "The night is young. So are you.",
  ];
  const POOL = (JA && typeof SAYINGS_JA !== "undefined") ? SAYINGS_JA : EN ? SAYINGS_EN : SPRUECHE;
  const $ = id => document.getElementById(id);
  let last = -1;

  const css = document.createElement("style");
  css.textContent = `
  .extras button.oracle{background:#f2c34d;border-color:#f2c34d;color:var(--ink)}
  .orc{position:fixed;inset:0;z-index:31;background:rgba(20,24,22,.78);display:flex;align-items:center;justify-content:center;
    padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px}
  .orc .box{width:min(420px,100%);background:var(--plate);border:3px solid var(--ink);border-radius:14px;padding:22px 20px 18px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.4)}
  .orc .k{font:700 .85rem var(--f-ui);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .orc .ball{width:120px;height:120px;margin:12px auto 14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 8%,#4b5652 9% 30%,#1d2321 70%);
    display:flex;align-items:center;justify-content:center;box-shadow:inset -8px -10px 20px rgba(0,0,0,.5)}
  .orc .ball span{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#1f3b74;color:#fff;font:400 1.6rem var(--f-marker)}
  .orc .ball.shake{animation:orcShake .7s ease-in-out}
  @keyframes orcShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-8px,2px) rotate(-8deg)}40%{transform:translate(8px,-2px) rotate(7deg)}60%{transform:translate(-6px,1px) rotate(-5deg)}80%{transform:translate(4px,0) rotate(3deg)}}
  .orc .say{font:700 1.75rem/1.2 var(--f-scrawl);color:var(--ink);min-height:4.2em;display:flex;align-items:center;justify-content:center;transition:opacity .25s}
  .orc .say.hide{opacity:0}
  .orc .row{display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap}
  .orc .row button{font:700 1rem var(--f-ui);letter-spacing:.06em;text-transform:uppercase;border-radius:6px;padding:10px 16px;min-height:44px;cursor:pointer;border:1.5px solid var(--ink);background:transparent;color:var(--ink)}
  .orc .row button.go{background:var(--ink);color:var(--door)}
  .getown{margin:34px auto 0;max-width:420px;background:var(--plate);border:1.5px solid var(--ink);border-radius:10px;padding:12px 14px;text-align:center;font:600 1rem var(--f-ui)}
  .getown b{display:block;font:400 1.25rem var(--f-marker);margin-bottom:8px}
  .getown span{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .getown a{display:inline-block;background:var(--red);color:#fff;text-decoration:none;font:700 .9rem var(--f-ui);letter-spacing:.06em;text-transform:uppercase;padding:8px 14px;border-radius:6px}
  .getown a+a{background:var(--ink)}
  .legal{display:flex;gap:14px;justify-content:center;margin:18px 0 0;font:600 .85rem var(--f-ui);letter-spacing:.06em}
  .legal a{color:var(--muted)}
  @media (prefers-reduced-motion:reduce){.orc .ball.shake{animation:none}}
  `;
  document.head.appendChild(css);

  /* Knopf in der Leiste neben Spiele und Musik */
  const extras = document.querySelector(".extras");
  if (extras) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "oracle"; b.id = "orcOpen"; b.textContent = tr("Klo-Orakel", "Loo Oracle");
    extras.appendChild(b);
    b.onclick = open;
  }

  /* Orakel-Fenster */
  const orc = document.createElement("div");
  orc.className = "orc"; orc.hidden = true; orc.setAttribute("role", "dialog"); orc.setAttribute("aria-label", tr("Klo-Orakel", "Loo Oracle"));
  orc.innerHTML = `<div class="box"><div class="k">${tr("Das Klo-Orakel spricht", "The Loo Oracle speaks")}</div>
    <div class="ball" id="orcBall"><span>?</span></div>
    <div class="say" id="orcSay" aria-live="polite"></div>
    <div class="row"><button type="button" class="go" id="orcAgain">${tr("Nochmal fragen", "Ask again")}</button><button type="button" id="orcClose">${tr("Zur Wand", "Back to wall")}</button></div></div>`;
  document.body.appendChild(orc);
  orc.addEventListener("click", e => { if (e.target === orc) close(); });
  $("orcAgain").onclick = ask;
  $("orcClose").onclick = close;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !orc.hidden) close(); });

  function open() { orc.hidden = false; ask(); $("orcAgain").focus(); }
  function close() { orc.hidden = true; }
  function ask() {
    let i; do { i = Math.floor(Math.random() * POOL.length); } while (i === last && POOL.length > 1);
    last = i;
    const ball = $("orcBall"), say = $("orcSay");
    say.classList.add("hide"); ball.classList.remove("shake"); void ball.offsetWidth; ball.classList.add("shake");
    try { KloMusik.blip("flush"); } catch (e) {}
    setTimeout(() => { say.textContent = POOL[i]; say.classList.remove("hide"); try { KloMusik.blip("gold"); } catch (e) {} }, 700);
  }

  /* Impressum und Datenschutz unter der Wand und in den Spielen */
  const legal = `<a href="impressum.html">${tr("Impressum", "Imprint")}</a><a href="datenschutz.html">${tr("Datenschutz", "Privacy")}</a>${langButton()}`;
  const wrap = document.querySelector(".wrap");
  if (wrap) {
    /* Hinweis für Gäste: eigene Klo-Wand holen */
    const ad = document.createElement("div"); ad.className = "getown";
    ad.innerHTML = `<b>${tr("Auch so eine Klo-Wand haben?", "Want a Klo-Wand of your own?")}</b>
      <span><a href="familie.html">${tr("Für zu Hause", "For your home")}</a><a href="wirte.html">${tr("Für deine Bar", "For your bar")}</a></span>`;
    wrap.appendChild(ad);
    const f = document.createElement("nav"); f.className = "legal"; f.setAttribute("aria-label", tr("Rechtliches", "Legal")); f.innerHTML = legal; wrap.appendChild(f);
  }
  const gw = document.querySelector(".kg .gw");
  if (gw) { const f = document.createElement("nav"); f.className = "legal"; f.setAttribute("aria-label", tr("Rechtliches", "Legal")); f.innerHTML = legal; gw.appendChild(f); }
})();

/* Begrüßung beim Öffnen der Wand: lustiger Spruch, auf Tipp laut vorgelesen (Sprachausgabe des Handys). */
(function () {
  const ONCE_KEY = "klowand-hallo";
  try { if (sessionStorage.getItem(ONCE_KEY)) return; } catch (e) {}
  if (!document.querySelector(".wrap") || !document.getElementById("composer")) return;
  const bar = (typeof info !== "undefined" && info.name) || "Klo-Wand";
  const h = new Date().getHours();
  const zeit = h < 5 ? "Na, du Nachteule" : h < 11 ? "Guten Morgen" : h < 17 ? "Hallo" : h < 22 ? "Guten Abend" : "Na, du Nachtschwärmer";
  const LINES = JA ? [
    `注意、注意！玉座に新しいお客様です。こんばんは、ようこそ！`,
  ] : EN ? [
    `Attention, attention! A new guest on the throne. Good evening and a warm welcome!`,
  ] : [
    `Achtung, Achtung! Ein neuer Gast auf dem Thron. Guten Abend und herzlich willkommen!`,
  ];
  const line = LINES[Math.floor(Math.random() * LINES.length)];

  const css = document.createElement("style");
  css.textContent = `
  .hallo{position:fixed;inset:0;z-index:40;background:rgba(20,24,22,.82);display:flex;align-items:center;justify-content:center;
    padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px}
  .hallo .box{width:min(420px,100%);background:var(--plate);border:3px solid var(--ink);border-radius:14px;padding:22px 20px 18px;text-align:center;
    box-shadow:0 18px 40px rgba(0,0,0,.45);animation:halloIn .5s cubic-bezier(.2,1.4,.4,1)}
  @keyframes halloIn{from{transform:scale(.8) rotate(-4deg);opacity:0}to{transform:none;opacity:1}}
  .hallo .sign{display:inline-block;background:var(--red);color:#fff;font:700 .85rem var(--f-ui);letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border-radius:3px}
  .hallo h2{margin:12px 0 6px;font:400 2rem/1.05 var(--f-marker);color:var(--ink);text-wrap:balance}
  .hallo p{margin:0;font:700 1.45rem/1.2 var(--f-scrawl);color:var(--blue)}
  .hallo .row{display:flex;gap:8px;justify-content:center;margin-top:18px;flex-wrap:wrap}
  .hallo button{font:700 1rem var(--f-ui);letter-spacing:.06em;text-transform:uppercase;border-radius:6px;padding:12px 20px;min-height:48px;cursor:pointer;border:1.5px solid var(--ink);background:transparent;color:var(--ink)}
  .hallo button.go{background:var(--red);border-color:var(--red);color:#fff;font-size:1.1rem}
  @media (prefers-reduced-motion:reduce){.hallo .box{animation:none}}
  `;
  document.head.appendChild(css);

  const el = document.createElement("div");
  el.className = "hallo"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", tr("Begrüßung", "Welcome"));
  el.innerHTML = `<div class="box"><span class="sign">${tr("Besetzt · von dir", "Occupied · by you")}</span>
    <h2>${tr("Herzlich willkommen!", "Welcome!")}</h2>
    <p id="halloLine"></p>
    <div class="row"><button type="button" class="go" id="halloGo">${tr("Hallo!", "Hello!")}</button><button type="button" id="halloQuiet">${tr("Leise rein", "Sneak in quietly")}</button></div></div>`;
  document.body.appendChild(el);
  document.getElementById("halloLine").textContent = line;

  function close() { el.remove(); try { sessionStorage.setItem(ONCE_KEY, "1"); } catch (e) {} }
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const lc = JA ? "ja" : EN ? "en" : "de";
      u.lang = JA ? "ja-JP" : EN ? "en-US" : "de-DE"; u.rate = 1.02; u.pitch = 1.15; u.volume = 1;
      const voices = speechSynthesis.getVoices(), re = new RegExp("^" + lc, "i");
      const v = voices.find(x => re.test(x.lang) && /google/i.test(x.name)) || voices.find(x => re.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  // Echte Sprachaufnahme aus dem Ordner „stimme“, sonst die Sprachausgabe des Handys
  const file = "abend";   // weitere Aufnahmen: "morgen", "hallo", "nacht" in den Ordner „stimme“ legen und hier nach Uhrzeit wählen
  function sayIt() {
    let done = false;
    const fallback = () => { if (!done) { done = true; speak(line); } };
    if (EN) { fallback(); return; }   // die Aufnahme ist deutsch
    try {
      const a = new Audio(`stimme/${file}.mp3`);
      a.onerror = fallback;
      a.onplaying = () => { done = true; };
      const p = a.play(); if (p && p.catch) p.catch(fallback);
    } catch (e) { fallback(); }
  }
  document.getElementById("halloGo").onclick = () => { sayIt(); close(); };
  document.getElementById("halloQuiet").onclick = close;
  el.addEventListener("click", e => { if (e.target === el) close(); });
  document.getElementById("halloGo").focus();
})();
