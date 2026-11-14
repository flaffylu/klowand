/* Klo-Wand: Leiste für die Spiele (Poker, Roulette, Snooker …): Chat mit allen am Tisch, Geschenke und Hintergrundmusik.
   Nachrichten und Geschenke laufen über den Chill-Raum-Chat der Gruppe (dieselben Regeln und Filter), also sieht sie
   jeder am Tisch und im Chill-Raum – es gibt keinen privaten 1:1-Chat.
   KloSpielChat.mount({ host, grp, me, demo, names, ownToasts }) -> { show(bool) } */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const COLORS = ["#ff6fb5", "#7df9ff", "#c6ff6a", "#ffc867", "#b78cff", "#ff8a5c", "#5cffc8"];
  const colorOf = n => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; };
  const GIFT_RE = /^🎁 (\S+) ([A-Za-zÄÖ]+) für (.{2,12})$/;
  const FIL = () => (typeof KloFilter !== "undefined" ? KloFilter : null), MUS = () => (typeof KloMusik !== "undefined" ? KloMusik : null);
  const okName = n => typeof n === "string" && /^[A-Za-zÄÖÜäöüß0-9 ._-]{2,12}$/.test(n);

  let css = false;
  function style() { if (css) return; css = true; const s = document.createElement("style");
    s.textContent = `
    .sc{font-family:"Barlow Condensed",system-ui,sans-serif;color:#f6f0ff;display:flex;flex-direction:column;gap:6px}
    .sc[hidden]{display:none}
    .sc .bar{display:flex;gap:6px;align-items:center}
    .sc .bar button{flex:none;min-width:46px;height:44px;padding:0 12px;border-radius:999px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#f6f0ff;font:700 1rem "Barlow Condensed",sans-serif;cursor:pointer;position:relative;white-space:nowrap}
    .sc .bar button[aria-pressed=true]{background:#7df9ff;color:#0b0716;border-color:#7df9ff}
    .sc .bar .badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#ff3ea5;color:#fff;font:700 .75rem/18px "Barlow Condensed";text-align:center;padding:0 4px}
    .sc .tick{flex:1;min-width:0;font:600 .98rem/1.2 "Barlow Condensed",sans-serif;color:#d9d0f5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sc .tick b{margin-right:5px}
    .sc .box{background:rgba(16,9,30,.95);border:1.5px solid rgba(255,255,255,.16);border-radius:16px;padding:8px}
    .sc .log{max-height:min(28vh,190px);overflow-y:auto;display:flex;flex-direction:column;gap:3px;margin-bottom:6px;overscroll-behavior:contain}
    .sc .log p{margin:0;font:600 1rem/1.25 "Barlow Condensed",sans-serif;overflow-wrap:anywhere}
    .sc .log p b{margin-right:6px}
    .sc .log p.g{color:#ffc867}
    .sc .log .ex{color:#b3a8d6}
    .sc form{display:flex;gap:6px}
    .sc input{flex:1;min-width:0;min-height:44px;border-radius:12px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#f6f0ff;padding:0 12px;font:600 1rem "Barlow Condensed",sans-serif;user-select:text}
    .sc form button{min-height:44px;padding:0 14px;border-radius:12px;border:none;background:#c6ff6a;color:#0b0716;font:800 1rem "Barlow Condensed",sans-serif;cursor:pointer}
    .sc .err{min-height:0;font:600 .9rem/1.2 "Barlow Condensed",sans-serif;color:#ff9db0;margin-top:4px}
    .sc .err:empty{display:none}
    .sc .lbl{margin:2px 2px 6px;font:700 .9rem "Barlow Condensed",sans-serif;color:#b3a8d6}
    .sc .to{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
    .sc .to button{min-height:38px;padding:0 12px;border-radius:999px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#f6f0ff;font:700 .95rem "Barlow Condensed",sans-serif;cursor:pointer}
    .sc .to button[aria-pressed=true]{background:#7df9ff;color:#0b0716;border-color:#7df9ff}
    .sc .gl{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
    .sc .gl button{aspect-ratio:1;border-radius:14px;border:1.5px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#f6f0ff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 .72rem "Barlow Condensed",sans-serif;padding:0}
    .sc .gl button b{font-size:1.6rem;line-height:1}
    .scpop{position:fixed;left:50%;top:42%;z-index:30;pointer-events:none;transform:translate(-50%,-50%);text-align:center;animation:scpop 2.6s ease-out forwards}
    .scpop b{display:block;font-size:6rem;line-height:1;filter:drop-shadow(0 8px 24px rgba(255,200,103,.6))}
    .scpop span{display:inline-block;margin-top:8px;padding:6px 14px;border-radius:999px;background:rgba(16,9,30,.92);border:1.5px solid #ffc867;color:#ffc867;font:700 1.1rem "Barlow Condensed",sans-serif;white-space:nowrap}
    @keyframes scpop{0%{opacity:0;transform:translate(-50%,-10%) scale(.3)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}25%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-90%) scale(.9)}}
    @media (prefers-reduced-motion:reduce){.scpop{animation-duration:2.6s;animation-name:scfade}@keyframes scfade{0%,80%{opacity:1}100%{opacity:0}}}`;
    document.head.appendChild(s); }

  function mount(o) {
    style();
    const host = o.host, demo = !!o.demo, grp = o.grp || null;
    let me = okName(o.me) ? o.me : "";
    const GIFTS = [["🌹", "Rose"], ["🍀", "Glück"], ["🏆", "Pokal"], ["👏", "Applaus"], ["🔥", "Feuer"], ["⭐", "Stern"], ["🥤", "Cola"], ["☕", "Kaffee"], ["🍕", "Pizza"], ["🍿", "Popcorn"], ["🍫", "Schoki"], ["🍩", "Donut"], ["🍦", "Eis"], ["🧸", "Teddy"], ["🎈", "Ballon"], ["💐", "Blumen"], ["🍺", "Bier"], ["🧃", "Saft"]]
      .filter(([e]) => !(e === "🍺" && (o.wall === "familie-demo")));
    const box = document.createElement("div"); box.className = "sc";
    box.innerHTML = `<div class="box chatbox" hidden><div class="log" aria-live="polite"></div>
        <form autocomplete="off"><label style="position:absolute;left:-9999px">Nachricht</label><input maxlength="${demo ? 120 : 200}" enterkeyhint="send"><button type="submit">Senden</button></form><div class="err"></div></div>
      <div class="box giftbox" hidden><p class="lbl">🎁 An wen?</p><div class="to"></div><p class="lbl">Was?</p><div class="gl">${GIFTS.map(([e, l]) => `<button type="button" data-e="${e}" data-l="${l}" aria-label="${l}"><b>${e}</b>${l}</button>`).join("")}</div></div>
      <div class="bar"><button type="button" class="bC" aria-pressed="false" aria-label="Chat">💬<span class="badge" hidden></span></button><button type="button" class="bG" aria-pressed="false" aria-label="Geschenk senden">🎁</button>
        <button type="button" class="bM" aria-pressed="false" aria-label="Hintergrundmusik">🎵</button><button type="button" class="bN" aria-label="Nächstes Lied" hidden>⏭</button><span class="tick" aria-live="polite"></span></div>`;
    host.appendChild(box);
    const $ = s => box.querySelector(s), log = $(".log"), inp = $("input"), err = $(".err"), tick = $(".tick"), badge = $(".badge");
    inp.placeholder = me ? "Schreib was an alle am Tisch …" : "Erst deinen Spitznamen eingeben …";

    // Geschenke-Format wie im Chill-Raum, damit beide Seiten sie gleich zeigen
    const parseGift = t => { const m = GIFT_RE.exec(t || ""); if (!m) return null; const g = GIFTS.find(([e, l]) => e === m[1] && l === m[2]) || [m[1], m[2]]; return { e: g[0], l: g[1], to: m[3] }; };
    const line = m => { const g = parseGift(m.t); return g ? `<p class="g"><b style="color:${colorOf(m.n)}">${esc(m.n)}</b>🎁 schenkt ${g.to === "alle" ? "allen" : esc(g.to)} ${g.e} ${esc(g.l)}</p>` : `<p><b style="color:${colorOf(m.n)}">${esc(m.n)}</b>${esc(m.t)}</p>`; };
    let msgs = [], unread = 0;
    function draw() { log.innerHTML = msgs.length ? msgs.slice(-30).map(line).join("") : `<p class="ex">Noch ruhig hier. Sag Hallo! 👋</p>`; log.scrollTop = log.scrollHeight;
      const l = msgs[msgs.length - 1]; if (l) { const g = parseGift(l.t); tick.innerHTML = `<b style="color:${colorOf(l.n)}">${esc(l.n)}</b>${g ? `🎁 ${g.e} für ${g.to === "alle" ? "alle" : esc(g.to)}` : esc(l.t)}`; } else tick.textContent = "";
      badge.hidden = !unread || !$(".chatbox").hidden; badge.textContent = unread > 9 ? "9+" : unread; }
    function pop(g, from) { const el = document.createElement("div"); el.className = "scpop"; el.innerHTML = `<b>${g.e}</b><span>${esc(from)} → ${g.to === "alle" ? "alle" : esc(g.to)}: ${esc(g.l)}</span>`; document.body.appendChild(el); setTimeout(() => el.remove(), 2700);
      try { MUS() && MUS().blip("gold"); } catch (e) {} try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} }
    function incoming(m, fresh) { msgs.push(m); if (msgs.length > 60) msgs = msgs.slice(-60);
      if (fresh) { const g = parseGift(m.t); if (g && shown()) pop(g, m.n); window.__scPops = (window.__scPops || 0) + (g && shown() ? 1 : 0); if (m.n !== me && $(".chatbox").hidden) unread++; }
      draw(); }
    const shown = () => !box.hidden && host.offsetParent !== null;

    if (grp) { let first = true;
      grp.collection("chill").where("ts", ">", firebase.firestore.Timestamp.fromMillis(Date.now() - 24 * 3600e3)).orderBy("ts", "desc").limit(30).onSnapshot(sn => {
        if (first) { msgs = sn.docs.map(d => d.data()).filter(x => x && typeof x.n === "string" && typeof x.t === "string").map(x => ({ n: x.n, t: x.t })).reverse(); first = false; draw(); return; }
        sn.docChanges().filter(c => c.type === "added").reverse().forEach(c => { const x = c.doc.data(); if (x && typeof x.n === "string" && typeof x.t === "string") incoming({ n: x.n, t: x.t }, true); });
      }, () => { err.textContent = "Chat gerade nicht erreichbar."; });
    } else draw();

    function check(t) {
      if (t.length < 3) return "Bisschen mehr als das, bitte.";
      if (/[0-9][0-9 /-]{6,}[0-9]/.test(t)) return "Keine Telefonnummern hier.";
      if (/(https?:\/\/|www\.|@)/i.test(t)) return "Keine Links oder @Namen hier.";
      const why = FIL() ? FIL().reason(t, demo) : null;
      if (demo && why === "kontakt") return "Hier wird nichts Privates ausgetauscht: keine Nummern, Profile, Treffen oder Fragen nach Alter und Wohnort.";
      if (demo && why === "politik") return "Keine Politik hier. Hier wird gespielt.";
      if (why === "sorge") return "Wenn es dir nicht gut geht: Sprich mit einem Erwachsenen, dem du vertraust, oder ruf kostenlos an: Nummer gegen Kummer 116 111 · Im Notfall 112.";
      if (why) return "Das geht hier so nicht. Bleib nett 🙂";
      return ""; }
    let lastSend = 0, lastGift = 0;
    async function post(t) {
      if (!grp) { incoming({ n: me || "Du", t }, true); return true; }
      try { await grp.collection("chill").add({ n: me, t, ts: firebase.firestore.FieldValue.serverTimestamp() }); return true; }
      catch (e) { err.textContent = e && e.code === "permission-denied" ? "Hat nicht geklappt – der Filter hat es abgelehnt." : "Hat nicht geklappt. Versuch es gleich nochmal."; return false; } }
    $("form").addEventListener("submit", async e => { e.preventDefault(); err.textContent = ""; const t = inp.value.trim();
      if (!me) { if (!okName(t) || (FIL() && FIL().reason(t, demo))) { err.textContent = "Spitzname: 2–12 Buchstaben oder Zahlen, nicht dein echter Name."; return; }
        me = t; try { localStorage.setItem("klowand-chillname", me); } catch (er) {} inp.value = ""; inp.placeholder = "Schreib was an alle am Tisch …"; return; }
      const why = check(t); if (why) { err.textContent = why; return; }
      if (Date.now() - lastSend < 1500) { err.textContent = "Nicht so schnell 🙂"; return; }
      lastSend = Date.now(); inp.value = ""; if (!(await post(t.slice(0, demo ? 120 : 200)))) inp.value = t; });

    // Geschenke
    let giftTo = "alle";
    function drawTo() { const list = [...new Set((o.names ? o.names() : []).concat(msgs.slice(-20).map(m => m.n)).filter(n => okName(n) && n !== me))].slice(0, 8);
      if (giftTo !== "alle" && !list.includes(giftTo)) giftTo = "alle";
      $(".to").innerHTML = ["alle", ...list].map(n => `<button type="button" data-n="${esc(n)}" aria-pressed="${n === giftTo}">${n === "alle" ? "Alle" : esc(n)}</button>`).join(""); }
    $(".to").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; giftTo = b.dataset.n; drawTo(); });
    $(".gl").addEventListener("click", async e => { const b = e.target.closest("button"); if (!b) return;
      if (!me) { open("chat"); err.textContent = "Gib zuerst deinen Spitznamen ein."; return; }
      if (Date.now() - lastGift < 4000) { err.textContent = ""; tick.textContent = "Kurz warten – gleich kannst du wieder was schenken"; return; }
      lastGift = Date.now(); open(null); await post(`🎁 ${b.dataset.e} ${b.dataset.l} für ${giftTo}`); });

    // Auf/zu
    function open(which) { const c = which === "chat", g = which === "gift";
      $(".chatbox").hidden = !c; $(".giftbox").hidden = !g; $(".bC").setAttribute("aria-pressed", c); $(".bG").setAttribute("aria-pressed", g);
      if (c) { unread = 0; draw(); setTimeout(() => { log.scrollTop = log.scrollHeight; }, 0); } if (g) drawTo(); }
    $(".bC").onclick = () => open($(".chatbox").hidden ? "chat" : null);
    $(".bG").onclick = () => open($(".giftbox").hidden ? "gift" : null);
    tick.onclick = () => open("chat");

    // Musik (KloMusik aus music.js: Lo-Fi aus dem Browser und eigene Lieder aus config.js)
    const M = MUS();
    function drawM() { const on = !!(M && M.isOn()); $(".bM").setAttribute("aria-pressed", on); $(".bM").textContent = on ? `🎵 ${M.trackName()}` : "🎵";
      $(".bN").hidden = !on || !(M && M.trackCount > 1); }
    if (!M) $(".bM").hidden = true;
    if (o.musicOnly) { $(".bC").hidden = $(".bG").hidden = tick.hidden = true; }
    $(".bM").onclick = async () => { if (o.onMusic) o.onMusic(); await M.toggle(); drawM(); };
    $(".bN").onclick = async () => { await M.next(); drawM(); };
    drawM(); setInterval(drawM, 3000);

    return { show(v) { box.hidden = !v; if (!v) open(null); drawM(); }, setName(n) { if (okName(n)) { me = n; inp.placeholder = "Schreib was an alle am Tisch …"; } }, el: box };
  }
  window.KloSpielChat = { mount };
})();
