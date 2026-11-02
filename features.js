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
  .legal{display:flex;gap:14px;justify-content:center;margin:30px 0 0;font:600 .85rem var(--f-ui);letter-spacing:.06em}
  .legal a{color:var(--muted)}
  @media (prefers-reduced-motion:reduce){.orc .ball.shake{animation:none}}
  `;
  document.head.appendChild(css);

  /* Knopf in der Leiste neben Spiele und Musik */
  const extras = document.querySelector(".extras");
  if (extras) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "oracle"; b.id = "orcOpen"; b.textContent = "Klo-Orakel";
    extras.appendChild(b);
    b.onclick = open;
  }

  /* Orakel-Fenster */
  const orc = document.createElement("div");
  orc.className = "orc"; orc.hidden = true; orc.setAttribute("role", "dialog"); orc.setAttribute("aria-label", "Klo-Orakel");
  orc.innerHTML = `<div class="box"><div class="k">Das Klo-Orakel spricht</div>
    <div class="ball" id="orcBall"><span>?</span></div>
    <div class="say" id="orcSay" aria-live="polite"></div>
    <div class="row"><button type="button" class="go" id="orcAgain">Nochmal fragen</button><button type="button" id="orcClose">Zur Wand</button></div></div>`;
  document.body.appendChild(orc);
  orc.addEventListener("click", e => { if (e.target === orc) close(); });
  $("orcAgain").onclick = ask;
  $("orcClose").onclick = close;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !orc.hidden) close(); });

  function open() { orc.hidden = false; ask(); $("orcAgain").focus(); }
  function close() { orc.hidden = true; }
  function ask() {
    let i; do { i = Math.floor(Math.random() * SPRUECHE.length); } while (i === last && SPRUECHE.length > 1);
    last = i;
    const ball = $("orcBall"), say = $("orcSay");
    say.classList.add("hide"); ball.classList.remove("shake"); void ball.offsetWidth; ball.classList.add("shake");
    try { KloMusik.blip("flush"); } catch (e) {}
    setTimeout(() => { say.textContent = SPRUECHE[i]; say.classList.remove("hide"); try { KloMusik.blip("gold"); } catch (e) {} }, 700);
  }

  /* Impressum und Datenschutz unter der Wand und in den Spielen */
  const legal = '<a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a>';
  const wrap = document.querySelector(".wrap");
  if (wrap) { const f = document.createElement("nav"); f.className = "legal"; f.setAttribute("aria-label", "Rechtliches"); f.innerHTML = legal; wrap.appendChild(f); }
  const gw = document.querySelector(".kg .gw");
  if (gw) { const f = document.createElement("nav"); f.className = "legal"; f.setAttribute("aria-label", "Rechtliches"); f.innerHTML = legal; gw.appendChild(f); }
})();
