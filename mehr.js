/* Klo-Wand: Klo-Frage des Tages, Spruch des Monats, Teilen-Bild, Abzeichen, Musikwünsche, Quiz-Abend, TV-Modus, Freunde einladen.
   Braucht index.html (WALL, base, famBase, device, posts, likes, render, postHtml, check, tr) und mehr-daten.js, xp.js. */
(function () {
  if (typeof WALL === "undefined" || typeof base === "undefined" || !document.getElementById("wall")) return;
  const T = (de, en) => (typeof tr === "function" ? tr(de, en) : de);
  const E = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const TS = () => firebase.firestore.FieldValue.serverTimestamp();
  const PRIV = !!famBase;                       // privates Familien-Handy: keine öffentlichen Listen
  const COL = PRIV ? famBase : base;
  const ME = String(device || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  const lsg = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const lss = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  const css = document.createElement("style");
  css.textContent = `
  .kfrage{margin:12px 0 0;border-radius:14px;padding:12px 14px;background:linear-gradient(135deg,#ffe36b,#ffb3d1);color:#1b1424;border:2px solid #1b1424;box-shadow:0 4px 0 #1b1424}
  .kfrage .k{display:block;font:800 .75rem var(--f-ui);letter-spacing:.12em;text-transform:uppercase;opacity:.75}
  .kfrage .q{display:block;font:400 1.45rem/1.15 var(--f-marker,"Permanent Marker",cursive);margin:4px 0 10px}
  .kfrage .o{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .kfrage .o button{position:relative;overflow:hidden;min-height:48px;border-radius:12px;border:2px solid #1b1424;background:#fff;color:#1b1424;font:800 1rem var(--f-ui);cursor:pointer;padding:6px 8px}
  .kfrage .o button i{position:absolute;left:0;top:0;bottom:0;background:#ff4fa3;opacity:.35;transition:width .6s;font-style:normal}
  .kfrage .o button span{position:relative}
  .kfrage .o button.me{background:#1b1424;color:#ffd166}
  .kfrage small{display:block;margin-top:6px;font:600 .8rem var(--f-ui);opacity:.8}
  .mehrbar{margin:12px 0 0;padding:10px 12px;border-radius:8px;background:#1b1424;color:#fff;border:1.5px solid #1b1424}
  .mehrbar b{display:block;font:700 .8rem var(--f-ui);letter-spacing:.1em;text-transform:uppercase;color:#ffd166;margin-bottom:8px}
  .mehrbar .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:6px}
  .mehrbar button{min-height:62px;border-radius:12px;border:none;color:#fff;font:700 .85rem/1.1 var(--f-ui);cursor:pointer;padding:6px 4px}
  .mehrbar button span{display:block;font-size:1.45rem;margin-bottom:3px}
  .mehrbar .xp{background:#b0377e}.mehrbar .wu{background:#1f7a8c}.mehrbar .qz{background:#6a3fc9}.mehrbar .tv{background:#c76a12}.mehrbar .inv{background:#2f8f4f}
  .post .meta button[data-a="share"]{font-weight:700}
  .champ.monat .crown{background:#6a3fc9!important;color:#fff!important}
  .fam-ov .wl{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
  .fam-ov .wl li{display:flex;align-items:center;gap:10px;background:#f4f7f5;border-radius:12px;padding:8px 8px 8px 12px;font:700 1.05rem var(--f-ui)}
  .fam-ov .wl li .n{min-width:34px;font:800 1.1rem var(--f-ui);color:#1f7a8c;text-align:center}
  .fam-ov .wl li .tx{flex:1;min-width:0;overflow-wrap:anywhere}
  .fam-ov .wl li button{min-width:64px;min-height:40px;border-radius:10px;border:1.5px solid #1f7a8c;background:#fff;color:#1f7a8c;font:800 .9rem var(--f-ui);cursor:pointer}
  .fam-ov .wl li button:disabled{background:#1f7a8c;color:#fff}
  .fam-ov .xin{display:flex;gap:6px;margin-top:8px}
  .fam-ov .xin input{flex:1;min-width:0;font:600 1.05rem var(--f-ui);padding:9px 11px;border:1.5px solid #c3cec7;border-radius:10px;min-height:44px}
  .fam-ov .qzq{font:800 1.35rem/1.2 var(--f-ui);margin:10px 0}
  .fam-ov .qzo{display:grid;gap:8px}
  .fam-ov .qzo button{min-height:54px;border-radius:12px;border:2px solid #6a3fc9;background:#fff;color:#1b1424;font:800 1.1rem var(--f-ui);cursor:pointer}
  .fam-ov .qzo button.ok{background:#2f8f4f;border-color:#2f8f4f;color:#fff}.fam-ov .qzo button.no{background:#c0392b;border-color:#c0392b;color:#fff}
  .fam-ov .qzbar{height:8px;border-radius:4px;background:#eee;overflow:hidden;margin-top:6px}.fam-ov .qzbar i{display:block;height:100%;background:#6a3fc9}
  .fam-ov .rk{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:4px}
  .fam-ov .rk li{display:flex;justify-content:space-between;background:#f3effc;border-radius:10px;padding:8px 12px;font:700 1rem var(--f-ui)}
  .fam-ov .rk li.me{background:#6a3fc9;color:#fff}
  .fam-ov .shareimg{width:100%;border-radius:12px;display:block;margin-top:8px}`;
  document.head.appendChild(css);

  function box(title, inner, foot) {
    const el = document.createElement("div"); el.className = "fam-ov"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", title);
    el.innerHTML = `<div class="box"><div class="head"><h2>${title}</h2><button type="button" class="x" aria-label="${T("Schließen", "Close")}">✕</button></div>${inner}<div class="row">${foot || ""}<button type="button" class="btn" data-x>${T("Schließen", "Close")}</button></div></div>`;
    document.body.appendChild(el);
    el.close = () => { if (el.onclose) el.onclose(); el.remove(); };
    el.querySelector(".x").onclick = el.close; el.querySelector("[data-x]").onclick = el.close;
    el.addEventListener("click", e => { if (e.target === el) el.close(); });
    return el;
  }
  const nick = () => lsg("klowand-chillname", "");
  const okNick = n => /^[A-Za-zÄÖÜäöüß0-9 ._-]{2,12}$/.test(n) && !(window.KloFilter && KloFilter.reason(n, true));

  /* ---------- 🚽 Klo-Frage des Tages ---------- */
  (function frage() {
    const day = kloDay(), F = kloFrage(), col = COL.collection("umfrage");
    const el = document.createElement("div"); el.className = "kfrage";
    el.innerHTML = `<span class="k">🚽 ${T("Klo-Frage des Tages", "Loo question of the day")}</span><span class="q">${E(F[0])}</span>
      <div class="o"><button type="button" data-v="0"><i style="width:0"></i><span>${E(F[1])}</span></button><button type="button" data-v="1"><i style="width:0"></i><span>${E(F[2])}</span></button></div><small>${T("Tippe deine Antwort – danach siehst du, wie alle abgestimmt haben.", "Tap your answer to see how everyone voted.")}</small>`;
    const wallEl = document.getElementById("wall"); wallEl.parentNode.insertBefore(el, wallEl);
    let mine = lsg("klowand-frage-" + WALL + "-" + day, null), cnt = [0, 0];
    const draw = () => {
      const sum = cnt[0] + cnt[1];
      el.querySelectorAll("button").forEach(b => { const v = +b.dataset.v; b.classList.toggle("me", mine === String(v));
        b.querySelector("i").style.width = mine != null && sum ? Math.round(cnt[v] / sum * 100) + "%" : "0";
        b.querySelector("span").textContent = F[v + 1] + (mine != null && sum ? ` · ${Math.round(cnt[v] / sum * 100)}%` : ""); });
      el.querySelector("small").textContent = mine != null ? T(`${sum} ${sum === 1 ? "Stimme" : "Stimmen"} heute · morgen gibt's eine neue Frage`, `${sum} votes today · new question tomorrow`) : T("Tippe deine Antwort – danach siehst du, wie alle abgestimmt haben.", "Tap your answer to see how everyone voted.");
    };
    col.where("d", "==", day).limit(5000).onSnapshot(s => { cnt = [0, 0]; s.docs.forEach(d => { const a = d.data().a; if (a === 0 || a === 1) cnt[a]++; if (d.id === day + "_" + ME) mine = String(d.data().a); }); draw(); }, () => {});
    el.addEventListener("click", e => {
      const b = e.target.closest("button[data-v]"); if (!b || mine != null || !ME) return;
      mine = b.dataset.v; lss("klowand-frage-" + WALL + "-" + day, mine); cnt[+mine]++; draw();
      col.doc(day + "_" + ME).set({ d: day, a: +mine, ts: TS() }).catch(() => {});
    });
    draw();
  })();

  /* ---------- 🏆 Spruch des Monats + 📣 Teilen-Knopf an jedem Spruch ---------- */
  const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function monthBest() {
    const d = new Date(), a = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), b = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const list = posts.filter(p => (reports[p.id] || 0) < 3).map(p => ({ ...p, n: (likes[p.id] || new Set()).size }));
    const pick = (x, y) => { let best = null; list.forEach(p => { if (p.ts >= x && p.ts < y && p.n > 0 && (!best || p.n > best.n)) best = p; }); return best; };
    const last = pick(a, b); if (last) return { p: last, label: T(`Spruch des Monats · ${MON[new Date(a).getMonth()]}`, "Post of the month") };
    const cur = pick(b, Date.now() + 1); return cur ? { p: cur, label: T(`Auf dem Weg zum Spruch des Monats · ${MON[d.getMonth()]}`, "Leading post of the month") } : null;
  }
  const origRender = render;
  render = function () {
    origRender.apply(this, arguments);
    if (!loaded) return;
    const wallEl = document.getElementById("wall");
    const mb = monthBest();
    if (mb && !wallEl.querySelector(".champ.monat")) {
      const w = document.createElement("div"); w.className = "champ monat";
      w.innerHTML = `<span class="crown">🏆 ${mb.label}</span>${postHtml(mb.p, true)}`;
      const firstPost = wallEl.querySelector(":scope > .post"); firstPost ? wallEl.insertBefore(w, firstPost) : wallEl.appendChild(w);
    }
    wallEl.querySelectorAll(".post .meta").forEach(m => {
      if (m.querySelector('[data-a="share"]')) return; const l = m.querySelector('[data-a="like"]'); if (!l) return;
      const s = document.createElement("button"); s.type = "button"; s.dataset.a = "share"; s.dataset.id = l.dataset.id; s.textContent = "📣 " + T("Teilen", "Share");
      l.after(s);
    });
  };
  document.getElementById("wall").addEventListener("click", e => {
    const b = e.target.closest('[data-a="share"]'); if (!b) return; e.stopPropagation();
    const p = posts.find(x => x.id === b.dataset.id) || (typeof FAMILIEN_BEISPIELE !== "undefined" && b.dataset.id.startsWith("bsp") ? FAMILIEN_BEISPIELE[+b.dataset.id.slice(3) - 1] : null);
    if (p) shareImage(p);
  }, true);

  function qrDraw(c, text, x, y, size) {
    if (typeof qrcode !== "function") return;
    const q = qrcode(0, "M"); q.addData(text); q.make(); const n = q.getModuleCount(), m = size / (n + 4);
    c.fillStyle = "#fff"; c.fillRect(x, y, size, size); c.fillStyle = "#1b1424";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) c.fillRect(x + (k + 2) * m, y + (r + 2) * m, Math.ceil(m), Math.ceil(m));
  }
  async function shareImage(p) {
    const W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d");
    try { await document.fonts.load('80px "Permanent Marker"'); } catch (e) {}
    c.fillStyle = "#1b1424"; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 90) for (let x = (y / 90) % 2 ? -45 : 0; x < W; x += 90) { c.fillStyle = (x + y) % 180 ? "#241a31" : "#2b1f3b"; c.fillRect(x + 3, y + 3, 84, 84); }
    c.fillStyle = "#ff4fa3"; c.beginPath(); c.roundRect(60, 60, 330, 92, 46); c.fill();
    c.fillStyle = "#fff"; c.font = '400 54px "Permanent Marker", cursive'; c.textBaseline = "middle"; c.fillText("Klo-Wand", 92, 108);
    c.fillStyle = "#fff7ea"; c.beginPath(); c.roundRect(80, 220, W - 160, 760, 40); c.fill();
    c.beginPath(); c.moveTo(250, 978); c.lineTo(250, 1080); c.lineTo(360, 978); c.fill();
    if (p.img) { const im = new Image(); im.src = p.img; await new Promise(r => { im.onload = r; im.onerror = r; }); const s = Math.min((W - 260) / im.width, 640 / im.height); c.drawImage(im, (W - im.width * s) / 2, 600 - im.height * s / 2, im.width * s, im.height * s); }
    else {
      const words = String(p.t || "").split(/\s+/); let fs = 92, lines;
      for (; fs > 40; fs -= 6) { c.font = `400 ${fs}px "Permanent Marker", cursive`; lines = []; let l = ""; words.forEach(w => { const t = (l + " " + w).trim(); if (c.measureText(t).width > W - 280) { lines.push(l); l = w; } else l = t; }); lines.push(l); if (lines.length * fs * 1.2 < 660) break; }
      c.fillStyle = "#1b1424"; c.textAlign = "center"; const y0 = 600 - (lines.length - 1) * fs * .6; lines.forEach((l, i) => c.fillText(l, W / 2, y0 + i * fs * 1.2)); c.textAlign = "left";
    }
    const n = (likes[p.id] || new Set()).size + (p.n && !likes[p.id] ? p.n : 0);
    c.fillStyle = "#ffd166"; c.font = '700 44px system-ui, sans-serif'; c.fillText(n ? `${"|".repeat(Math.min(n, 12))}  ${n} ${n === 1 ? "Strich" : "Striche"}` : T("Frisch von der Wand", "Fresh off the wall"), 420, 1040);
    const url = "https://flaffylu.github.io/klowand/?wand=" + (PRIV ? "demo" : encodeURIComponent(WALL));
    qrDraw(c, url, W - 330, H - 330, 250);
    c.fillStyle = "#fff"; c.font = '700 46px system-ui, sans-serif'; c.fillText(T("Scannen & mitschreiben", "Scan & write along"), 80, H - 230);
    c.fillStyle = "#cbbfd9"; c.font = '600 34px system-ui, sans-serif'; c.fillText((typeof info !== "undefined" ? info.name : "Klo-Wand"), 80, H - 170); c.fillText("flaffylu.github.io/klowand", 80, H - 120);
    const blob = await new Promise(r => cv.toBlob(r, "image/png"));
    const el = box("📣 " + T("Spruch teilen", "Share post"), `<p class="note">${T("Dein Bild für TikTok, Instagram oder WhatsApp:", "Your picture for TikTok, Instagram or WhatsApp:")}</p><img class="shareimg" alt="" src="${URL.createObjectURL(blob)}">`,
      `<button type="button" class="btn primary" data-s>📤 ${T("Teilen", "Share")}</button><button type="button" class="btn dark" data-d>⬇️ ${T("Speichern", "Save")}</button>`);
    const file = new File([blob], "klo-wand-spruch.png", { type: "image/png" });
    el.querySelector("[data-s]").onclick = async () => {
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: T("Gefunden an der Klo-Wand 😂 ", "Found on the Klo-Wand 😂 ") + url }); kloXP.add("share"); return; } } catch (e) { return; }
      el.querySelector("[data-d]").click();
    };
    el.querySelector("[data-d]").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "klo-wand-spruch.png"; a.click(); kloXP.add("share"); };
  }

  /* ---------- 🏅 Abzeichen ---------- */
  function openXP() { const el = box("🏅 " + T("Deine Abzeichen", "Your badges"), kloXP.panelHtml()); }

  /* ---------- 🎵 Musikwünsche ---------- */
  function openWunsch() {
    const since = firebase.firestore.Timestamp.fromMillis(Date.now() - 12 * 36e5);
    const el = box("🎵 " + T("Musikwünsche", "Song requests"), `<p class="note">${T("Wünsch dir ein Lied und stimm für die anderen ab. Die Top 5 sieht der DJ oder Wirt auf dem TV.", "Request a song and vote for others. The top 5 show on the TV.")}</p>
      <form class="xin"><input maxlength="60" placeholder="${T("Lied – Interpret", "Song – artist")}" aria-label="${T("Liedwunsch", "Song request")}"><button class="btn primary">${T("Wünschen", "Request")}</button></form><p class="note" data-m></p><ul class="wl"><li>${T("Lädt …", "Loading …")}</li></ul>`);
    let ws = [], vs = {};
    const draw = () => {
      const list = ws.map(w => ({ ...w, n: (vs[w.id] || new Set()).size })).sort((a, b) => b.n - a.n || b.ts - a.ts);
      el.querySelector(".wl").innerHTML = list.length ? list.slice(0, 30).map(w => { const mine = vs[w.id] && vs[w.id].has(ME);
        return `<li><span class="n">${w.n}</span><span class="tx">${E(w.t)}</span><button type="button" data-v="${w.id}" ${mine ? "disabled" : ""}>${mine ? "✓" : "+1"}</button></li>`; }).join("") : `<li>${T("Noch keine Wünsche. Fang an!", "No requests yet. Go first!")}</li>`;
    };
    const u1 = base.collection("wunsch").where("ts", ">", since).orderBy("ts", "desc").limit(100).onSnapshot(s => { ws = s.docs.map(d => ({ id: d.id, t: d.data().t, ts: d.data().ts ? d.data().ts.toMillis() : Date.now() })); draw(); }, () => { el.querySelector(".wl").innerHTML = `<li>${T("Gerade nicht erreichbar.", "Not reachable right now.")}</li>`; });
    const u2 = base.collection("wunschja").where("ts", ">", since).limit(3000).onSnapshot(s => { vs = {}; s.docs.forEach(d => { const p = d.data().p; (vs[p] ||= new Set()).add(d.id.slice(p.length + 1)); }); draw(); }, () => {});
    el.onclose = () => { u1(); u2(); };
    el.querySelector("form").onsubmit = e => {
      e.preventDefault(); const i = el.querySelector("input"), t = i.value.trim(), err = typeof check === "function" ? check(t) : null, m = el.querySelector("[data-m]");
      if (err) { m.textContent = err; return; } m.textContent = ""; i.value = "";
      base.collection("wunsch").add({ t, ts: TS() }).catch(() => { m.textContent = T("Hat nicht geklappt. Sind die neuen Firebase-Regeln schon drin?", "That didn't work."); });
    };
    el.querySelector(".wl").onclick = e => { const b = e.target.closest("[data-v]"); if (!b || !ME) return; b.disabled = true;
      base.collection("wunschja").doc(b.dataset.v + "_" + ME).set({ p: b.dataset.v, ts: TS() }).catch(() => {}); };
  }

  /* ---------- 🧠 Quiz-Abend ---------- */
  function openQuiz() {
    const day = kloDay(), KP = "klowand-quiz-" + WALL + "-" + day;
    let st = (() => { try { return JSON.parse(lsg(KP, "")) || { p: 0, a: {} }; } catch (e) { return { p: 0, a: {} }; } })();
    const el = box("🧠 " + T("Quiz-Abend", "Quiz night"), `<p class="note">${T("Alle spielen gleichzeitig: Alle 25 Sekunden kommt eine neue Frage – auf jedem Handy und auf dem TV. Schnell sein gibt Extrapunkte!", "Everyone plays at once: a new question every 25 seconds.")}</p>
      <div data-name></div><div data-q></div><h3>${T("Rangliste heute", "Today's ranking")}</h3><ol class="rk"><li>…</li></ol>`);
    const nameBox = el.querySelector("[data-name]");
    let me = nick();
    const askName = () => { nameBox.innerHTML = `<form class="xin"><input maxlength="12" placeholder="${T("Dein Spitzname", "Your nickname")}" value="${E(me)}"><button class="btn primary">OK</button></form><p class="note">${T("Nimm nicht deinen echten Namen – alle sehen ihn in der Rangliste.", "Don't use your real name.")}</p>`;
      nameBox.querySelector("form").onsubmit = e => { e.preventDefault(); const n = nameBox.querySelector("input").value.trim(); if (!okNick(n)) { nameBox.querySelector("input").value = ""; nameBox.querySelector("input").placeholder = "2–12 Buchstaben, bitte nett"; return; } me = n; lss("klowand-chillname", n); nameBox.innerHTML = ""; tick(); }; };
    if (!okNick(me)) askName();
    let lastI = -1;
    const Q = el.querySelector("[data-q]");
    function tick() {
      if (!okNick(me)) { Q.innerHTML = ""; return; }
      const q = KLO_QZ.at(Date.now()), ans = st.a[q.i];
      if (q.i !== lastI) { lastI = q.i;
        Q.innerHTML = `<div class="qzq">${E(q.q)}</div><div class="qzo">${q.o.map((o, k) => `<button type="button" data-k="${k}">${E(o)}</button>`).join("")}</div><div class="qzbar"><i></i></div><p class="note" data-info></p>`;
      }
      const bs = Q.querySelectorAll("[data-k]");
      bs.forEach(b => { const k = +b.dataset.k; b.disabled = ans != null || !q.open; b.classList.toggle("ok", (!q.open || ans != null) && k === q.right && (ans != null || !q.open)); b.classList.toggle("no", ans === k && k !== q.right); });
      Q.querySelector(".qzbar i").style.width = (q.open ? q.left / KLO_QZ.ASK * 100 : 0) + "%";
      Q.querySelector("[data-info]").textContent = q.open ? (ans != null ? T("Gespeichert! Warte auf die Auflösung …", "Saved! Waiting …") : T(`Noch ${Math.ceil(q.left / 1000)} Sekunden`, `${Math.ceil(q.left / 1000)} s left`))
        : (ans === q.right ? T("Richtig! 🎉", "Correct! 🎉") : ans != null ? T("Leider falsch.", "Wrong.") : T("Zu spät – gleich kommt die nächste Frage.", "Too late – next question soon.")) + " · " + T(`Deine Punkte heute: ${st.p}`, `Your points today: ${st.p}`);
    }
    Q.addEventListener("click", e => {
      const b = e.target.closest("[data-k]"); if (!b) return; const q = KLO_QZ.at(Date.now()); if (!q.open || st.a[q.i] != null) return;
      const k = +b.dataset.k; st.a[q.i] = k; if (k === q.right) st.p += 100 + Math.round(100 * q.left / KLO_QZ.ASK);
      lss(KP, JSON.stringify(st)); kloXP.add("quiz"); tick();
      if (ME) base.collection("quiz").doc(day + "_" + ME).set({ n: me, p: Math.min(5000, st.p), d: day, ts: TS() }).catch(() => {});
    });
    const iv = setInterval(tick, 250); tick();
    const un = base.collection("quiz").where("d", "==", day).limit(500).onSnapshot(s => {
      const rows = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => typeof r.p === "number").sort((a, b) => b.p - a.p).slice(0, 10);
      el.querySelector(".rk").innerHTML = rows.length ? rows.map((r, i) => `<li class="${r.id === day + "_" + ME ? "me" : ""}"><span>${["🥇", "🥈", "🥉"][i] || i + 1 + "."} ${E(r.n)}</span><span>${r.p}</span></li>`).join("") : `<li>${T("Noch niemand – sei die Erste oder der Erste!", "No one yet!")}</li>`;
    }, () => {});
    el.onclose = () => { clearInterval(iv); un(); };
  }

  /* ---------- 🤝 Freunde einladen (Demo): jeder Freund schenkt dir einen Gratis-Tag ---------- */
  const REF = ME.slice(0, 10);
  (function arrived() {
    const r = (typeof params !== "undefined" ? params : new URLSearchParams(location.search)).get("ref");
    if (!r || !/^[a-zA-Z0-9]{8,12}$/.test(r) || r === REF || lsg("klowand-ref-done", "") || !ME) return;
    lss("klowand-ref-done", r);
    fs.collection("einladung").doc(r + "_" + ME).set({ r, ts: TS() }).catch(() => {});
  })();
  async function inviteCount() {
    if (!REF || REF.length < 8 || !window.KloTrial) return 0;
    try { const s = await fs.collection("einladung").where("r", "==", REF).limit(50).get(); const n = s.size;
      const seen = +lsg("klowand-ref-seen", "0") || 0; if (n > seen) { kloXP.add("invite", n - seen); lss("klowand-ref-seen", String(n)); }
      KloTrial.setBonus(n); return n; } catch (e) { return 0; }
  }
  if (DEMO) setTimeout(inviteCount, 2500);
  async function openInvite() {
    const url = "https://flaffylu.github.io/klowand/?wand=" + (FAM_DEMO ? "familie-demo" : "demo") + "&ref=" + REF;
    const el = box("🤝 " + T("Freunde einladen", "Invite friends"), `<p class="note">${T("Schick deinen Link an Freunde. Für jeden, der über deinen Link kommt, bekommst du <b>einen Tag länger alles gratis</b> (bis zu 7 Tage).", "Send your link. Every friend who joins gives you one extra free day (up to 7).")}</p>
      <div class="xin"><input readonly value="${E(url)}" aria-label="Link"></div><p class="note" data-n>…</p>`,
      `<button type="button" class="btn primary" data-s>📤 ${T("Link teilen", "Share link")}</button>`);
    el.querySelector("[data-s]").onclick = async () => {
      try { if (navigator.share) { await navigator.share({ title: "Klo-Wand", text: T("Komm an die Klo-Wand – schreiben, spielen, Disco! 🚽🎉", "Join me on the Klo-Wand! 🚽🎉"), url }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(url); el.querySelector("[data-n]").textContent = T("Link kopiert!", "Link copied!"); } catch (e) { el.querySelector("input").select(); }
    };
    const n = await inviteCount();
    el.querySelector("[data-n]").textContent = T(`Schon ${n} ${n === 1 ? "Freund" : "Freunde"} eingeladen · +${Math.min(7, n)} ${Math.min(7, n) === 1 ? "Tag" : "Tage"} gratis`, `${n} friends invited`);
  }

  /* ---------- Knöpfe ---------- */
  const bar = document.createElement("div"); bar.className = "mehrbar";
  const lvTxt = () => `Lv ${kloXP.level()}`;
  bar.innerHTML = `<b>🎉 ${T("Mitmachen", "Join in")}</b><div class="g">
    <button type="button" class="xp" id="mXp"><span>🏅</span>${T("Abzeichen", "Badges")} · <em id="mLv" style="font-style:normal">${lvTxt()}</em></button>
    ${PRIV ? "" : `<button type="button" class="wu" id="mWu"><span>🎵</span>${T("Musikwünsche", "Requests")}</button>
    <button type="button" class="qz" id="mQz"><span>🧠</span>${T("Quiz-Abend", "Quiz night")}</button>
    <button type="button" class="tv" id="mTv"><span>📺</span>${T("TV-Modus", "TV mode")}</button>`}
    ${DEMO ? `<button type="button" class="inv" id="mInv"><span>🤝</span>${T("Freunde einladen", "Invite")}</button>` : ""}</div>`;
  const fr = document.querySelector(".kfrage"); fr.after(bar);
  window.addEventListener("klo-xp", () => { const l = document.getElementById("mLv"); if (l) l.textContent = lvTxt(); });
  const on = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = fn; };
  on("mXp", openXP); on("mWu", openWunsch); on("mQz", openQuiz); on("mInv", openInvite);
  on("mTv", () => { location.href = "tv.html?wand=" + encodeURIComponent(WALL); });
  window.kloMehr = { openXP, openWunsch, openQuiz, openInvite, shareImage };
})();
