/* Familien-Planner: Sterne-Aufgaben für Kinder (mit Belohnung) und Geburtstage mit Erinnerung und Glückwunsch-Karte.
   Echte Familien: gespeichert unter dem geheimen Familien-Code. Familien-Demo und „zuhause“: nur auf diesem Handy. */
(function () {
  if (typeof WALL === "undefined" || !document.querySelector(".plate")) return;
  const REAL = typeof famBase !== "undefined" && !!famBase;
  const LOCAL = !REAL && ((typeof FAM_DEMO !== "undefined" && FAM_DEMO) || WALL === "zuhause");
  if (!REAL && !LOCAL) return;
  const T = (de, en) => (typeof tr === "function" ? tr(de, en) : de);
  const E = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const pad = n => String(n).padStart(2, "0");
  const today = new Date(), MD = pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  // Speicher: Firestore (echte Familie) oder localStorage (Demo)
  function store(name, seed) {
    if (REAL) { const col = famBase.collection(name), TS = () => firebase.firestore.FieldValue.serverTimestamp();
      return { watch(cb) { return col.limit(300).onSnapshot(s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb(null)); },
        put(id, o) { return col.doc(id).set({ ...o, ts: TS() }); }, del(id) { return col.doc(id).delete(); } }; }
    const K = "klowand-" + name + "-" + WALL; let subs = [];
    const get = () => { try { const v = JSON.parse(localStorage.getItem(K)); if (Array.isArray(v)) return v; } catch (e) {} return seed(); };
    const set = v => { try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) {} subs.forEach(f => f(v)); };
    return { watch(cb) { subs.push(cb); cb(get()); return () => { subs = subs.filter(f => f !== cb); }; },
      put(id, o) { const v = get().filter(x => x.id !== id); v.push({ id, ...o }); set(v); return Promise.resolve(); },
      del(id) { set(get().filter(x => x.id !== id)); return Promise.resolve(); } };
  }
  const add = (n, from) => { const d = new Date(); d.setDate(d.getDate() + n); return pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const A = store("aufgaben", () => [
    { id: "ziel", t: "Kino-Abend mit Popcorn", wer: "", st: 10, ok: false },
    { id: "a1", t: "Zimmer aufräumen", wer: "Mia", st: 3, ok: true }, { id: "a2", t: "Hausaufgaben fertig", wer: "Mia", st: 2, ok: true },
    { id: "a3", t: "Müll rausbringen", wer: "Ben", st: 2, ok: false }, { id: "a4", t: "Zähne putzen ohne Meckern", wer: "Ben", st: 1, ok: true },
    { id: "a5", t: "Tisch decken", wer: "Mia", st: 1, ok: false }, { id: "a6", t: "Hund füttern", wer: "Ben", st: 2, ok: false }]);
  const G = store("geburtstage", () => [{ id: "g1", n: "Oma Gerda", d: MD }, { id: "g2", n: "Mia", d: add(12) }, { id: "g3", n: "Papa", d: add(45) }, { id: "g4", n: "Ben", d: add(120) }]);

  const css = document.createElement("style");
  css.textContent = `
  .fambar button.stern{background:linear-gradient(135deg,#f2a81d,#e2632b)!important}
  .fambar button.geb{background:linear-gradient(135deg,#ff6fa5,#b0377e)!important}
  .fam-ov .ziel{background:#fff4d1;border-radius:14px;padding:10px 12px;margin:8px 0;font:700 1.05rem var(--f-ui)}
  .fam-ov .kid{background:#f4f7f5;border-radius:14px;padding:10px 12px;margin-top:8px}
  .fam-ov .kid .top{display:flex;align-items:center;gap:8px;font:800 1.15rem var(--f-ui)}
  .fam-ov .kid .top span{flex:1}
  .fam-ov .kid .pb{height:12px;border-radius:6px;background:#e3e7e4;overflow:hidden;margin:6px 0}
  .fam-ov .kid .pb i{display:block;height:100%;background:linear-gradient(90deg,#ffd166,#f2a81d)}
  .fam-ov .tl{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:5px}
  .fam-ov .tl li{display:flex;align-items:center;gap:8px;background:#fff;border-radius:10px;padding:6px 6px 6px 10px;font:700 1rem var(--f-ui)}
  .fam-ov .tl li.done{opacity:.6;text-decoration:line-through}
  .fam-ov .tl li .tx{flex:1;min-width:0}
  .fam-ov .tl li button{min-height:38px;min-width:38px;border-radius:10px;border:1.5px solid #c3cec7;background:#fff;cursor:pointer;font:800 .9rem var(--f-ui)}
  .fam-ov .tl li button.ok{background:#2f8f4f;border-color:#2f8f4f;color:#fff}
  .fam-ov .fx{display:grid;gap:6px;margin-top:10px}.fam-ov .fx .r{display:flex;gap:6px}
  .fam-ov .fx input,.fam-ov .fx select{min-width:0;flex:1;font:600 1.05rem var(--f-ui);padding:9px 11px;border:1.5px solid #c3cec7;border-radius:10px;min-height:44px;background:#fff;color:var(--ink)}
  .gebcard{margin:12px 0 0;border-radius:14px;padding:14px;background:linear-gradient(135deg,#ff6fa5,#ffd166);color:#1b1424;border:2px solid #1b1424;position:relative;overflow:hidden;text-align:center}
  .gebcard b{display:block;font:400 1.6rem/1.15 "Permanent Marker",cursive}
  .gebcard p{margin:4px 0 10px;font:700 1rem var(--f-ui)}
  .gebcard button{min-height:46px;border-radius:12px;border:2px solid #1b1424;background:#fff;font:800 1rem var(--f-ui);padding:0 16px;cursor:pointer;color:#1b1424}
  .gebcard i{position:absolute;top:-10px;width:8px;height:14px;animation:gebfall 3s linear infinite;z-index:0}
  .gebcard b,.gebcard p,.gebcard button{position:relative;z-index:1}
  .gebsoon{margin:8px 0 0;border-radius:10px;padding:8px 12px;background:#ffe1ef;color:#7a1f4f;font:700 .95rem var(--f-ui)}
  @keyframes gebfall{to{transform:translateY(220px) rotate(540deg)}}
  @media (prefers-reduced-motion:reduce){.gebcard i{animation:none;display:none}}`;
  document.head.appendChild(css);

  function box(title, inner) {
    const el = document.createElement("div"); el.className = "fam-ov"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", title);
    el.innerHTML = `<div class="box"><div class="head"><h2>${title}</h2><button type="button" class="x" aria-label="${T("Schließen", "Close")}">✕</button></div>${LOCAL && WALL !== "zuhause" ? `<p class="note">${T("Beispiel der Familie Sonnenschein – probier alles aus! Gespeichert wird nur auf diesem Handy.", "Example – try everything! Saved only on this phone.")}</p>` : ""}${inner}<div class="row"><button type="button" class="btn" data-x>${T("Schließen", "Close")}</button></div></div>`;
    document.body.appendChild(el);
    el.close = () => { if (el.onclose) el.onclose(); el.remove(); };
    el.querySelector(".x").onclick = el.close; el.querySelector("[data-x]").onclick = el.close;
    el.addEventListener("click", e => { if (e.target === el) el.close(); });
    return el;
  }
  const fail = el => () => { const n = el.querySelector("[data-m]"); if (n) n.textContent = T("Hat nicht geklappt. Sind die neuen Firebase-Regeln schon drin?", "That didn't work."); };
  const bad = t => window.KloFilter && KloFilter.reason(t, false);

  /* ---------- ⭐ Sterne-Aufgaben ---------- */
  function openSterne() {
    const el = box("⭐ " + T("Sterne-Aufgaben", "Star chores"), `<div data-b></div><form class="fx" data-f><b style="font:700 .85rem var(--f-ui);color:var(--muted);text-transform:uppercase;letter-spacing:.08em">${T("Neue Aufgabe", "New chore")}</b>
      <input name="t" maxlength="60" placeholder="${T("z. B. Zimmer aufräumen", "e.g. tidy room")}" required>
      <div class="r"><input name="wer" maxlength="20" placeholder="${T("Für wen?", "For whom?")}" required><select name="st" aria-label="${T("Sterne", "Stars")}">${[1, 2, 3, 4, 5].map(n => `<option value="${n}"${n === 2 ? " selected" : ""}>${"⭐".repeat(n)}</option>`).join("")}</select></div>
      <button class="btn primary">＋ ${T("Aufgabe hinzufügen", "Add chore")}</button></form>
      <form class="fx" data-z><b style="font:700 .85rem var(--f-ui);color:var(--muted);text-transform:uppercase;letter-spacing:.08em">${T("Belohnung festlegen", "Set reward")}</b>
      <div class="r"><input name="t" maxlength="60" placeholder="${T("Belohnung, z. B. Eis essen", "Reward")}" required><select name="st">${[5, 10, 15, 20, 30, 50].map(n => `<option value="${n}">${n} ⭐</option>`).join("")}</select></div><button class="btn">${T("Speichern", "Save")}</button></form><p class="note" data-m></p>`);
    let list = [];
    const draw = () => {
      if (list === null) { el.querySelector("[data-b]").innerHTML = `<p class="note">${T("Gerade nicht erreichbar.", "Not reachable.")}</p>`; return; }
      const ziel = list.find(x => x.id === "ziel"), goal = ziel ? ziel.st : 10, tasks = list.filter(x => x.id !== "ziel");
      const kids = [...new Set(tasks.map(x => x.wer).filter(Boolean))].sort();
      el.querySelector("[data-b]").innerHTML = `<div class="ziel">🎁 ${T("Belohnung", "Reward")}: <b>${E(ziel ? ziel.t : T("noch keine – unten festlegen", "none yet"))}</b> · ${goal} ⭐</div>` +
        (kids.length ? kids.map(k => { const mine = tasks.filter(x => x.wer === k), have = mine.filter(x => x.ok).reduce((s, x) => s + x.st, 0);
          return `<div class="kid"><div class="top"><span>${E(k)}</span>⭐ ${have} / ${goal}</div><div class="pb"><i style="width:${Math.min(100, have / goal * 100)}%"></i></div>
            ${have >= goal ? `<button type="button" class="btn primary" data-win="${E(k)}">🎉 ${T("Belohnung einlösen", "Redeem reward")}</button>` : ""}
            <ul class="tl">${mine.sort((a, b) => a.ok - b.ok).map(x => `<li class="${x.ok ? "done" : ""}"><span class="tx">${E(x.t)} · ${"⭐".repeat(Math.min(5, x.st))}</span>${x.ok ? "" : `<button type="button" class="ok" data-ok="${x.id}">✓ ${T("Erledigt", "Done")}</button>`}<button type="button" data-del="${x.id}" aria-label="${T("Löschen", "Delete")}">✕</button></li>`).join("")}</ul></div>`; }).join("")
        : `<p class="note">${T("Noch keine Aufgaben. Leg unten die erste an!", "No chores yet.")}</p>`);
    };
    const un = A.watch(v => { list = v; draw(); }); el.onclose = () => un && un();
    el.addEventListener("click", e => {
      const ok = e.target.closest("[data-ok]"), del = e.target.closest("[data-del]"), win = e.target.closest("[data-win]");
      if (ok) { const x = list.find(y => y.id === ok.dataset.ok); if (x) { A.put(x.id, { t: x.t, wer: x.wer, st: x.st, ok: true }).catch(fail(el)); window.kloXP && kloXP.add("spiel"); } }
      if (del) A.del(del.dataset.del).catch(fail(el));
      if (win) { const k = win.dataset.win; if (!confirm(T(`Belohnung für ${k} einlösen? Die erledigten Aufgaben werden dann gelöscht.`, `Redeem for ${k}?`))) return;
        list.filter(x => x.wer === k && x.ok && x.id !== "ziel").forEach(x => A.del(x.id).catch(() => {}));
        const z = list.find(x => x.id === "ziel"); alert("🎉 " + T(`Super, ${k}! Deine Belohnung: ${z ? z.t : "eine Überraschung"}`, `Well done, ${k}!`)); }
    });
    el.querySelector("[data-f]").onsubmit = e => { e.preventDefault(); const f = e.target, t = f.t.value.trim(), wer = f.wer.value.trim();
      if (t.length < 2 || !wer || bad(t) || bad(wer)) { el.querySelector("[data-m]").textContent = T("Bitte einen netten Text und einen Namen eingeben.", "Please enter a chore and a name."); return; }
      A.put("a" + nid(), { t, wer, st: +f.st.value, ok: false }).then(() => { f.t.value = ""; el.querySelector("[data-m]").textContent = ""; }).catch(fail(el)); };
    el.querySelector("[data-z]").onsubmit = e => { e.preventDefault(); const f = e.target, t = f.t.value.trim(); if (t.length < 2 || bad(t)) return;
      A.put("ziel", { t, wer: "", st: +f.st.value, ok: false }).then(() => f.t.value = "").catch(fail(el)); };
  }

  /* ---------- 🎂 Geburtstage ---------- */
  const daysUntil = md => { const [m, d] = md.split("-").map(Number), y = today.getFullYear(); let t = new Date(y, m - 1, d); const n0 = new Date(y, today.getMonth(), today.getDate());
    if (t < n0) t = new Date(y + 1, m - 1, d); return Math.round((t - n0) / 864e5); };
  function openGeb() {
    const el = box("🎂 " + T("Geburtstage", "Birthdays"), `<ul class="tl" data-l></ul><form class="fx" data-f><div class="r"><input name="n" maxlength="20" placeholder="${T("Name", "Name")}" required><input name="d" type="date" required aria-label="${T("Geburtstag", "Birthday")}"></div>
      <button class="btn primary">＋ ${T("Geburtstag eintragen", "Add birthday")}</button></form><p class="note" data-m>${T("Das Jahr wird nicht gespeichert – nur Tag und Monat.", "Only day and month are saved.")}</p>`);
    let list = [];
    const draw = () => { el.querySelector("[data-l]").innerHTML = (list || []).length ? list.slice().sort((a, b) => daysUntil(a.d) - daysUntil(b.d)).map(x => { const n = daysUntil(x.d), [m, d] = x.d.split("-");
      return `<li><span class="tx">${n === 0 ? "🎉" : "🎂"} <b>${E(x.n)}</b> · ${+d}.${+m}. · ${n === 0 ? T("Heute!", "Today!") : n === 1 ? T("morgen", "tomorrow") : T(`in ${n} Tagen`, `in ${n} days`)}</span><button type="button" data-del="${x.id}" aria-label="${T("Löschen", "Delete")}">✕</button></li>`; }).join("") : `<li><span class="tx">${T("Noch keine Geburtstage eingetragen.", "No birthdays yet.")}</span></li>`; };
    const un = G.watch(v => { list = v || []; draw(); }); el.onclose = () => un && un();
    el.addEventListener("click", e => { const d = e.target.closest("[data-del]"); if (d) G.del(d.dataset.del).catch(fail(el)); });
    el.querySelector("[data-f]").onsubmit = e => { e.preventDefault(); const f = e.target, n = f.n.value.trim(), v = f.d.value;
      if (!n || bad(n) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
      G.put("g" + nid(), { n, d: v.slice(5) }).then(() => { f.n.value = ""; f.d.value = ""; }).catch(fail(el)); };
  }
  // Heute Geburtstag? Karte mit Konfetti oben auf der Wand, bald Geburtstag: kleiner Hinweis
  let shown = false;
  G.watch(list => {
    if (shown || !list) return; shown = true;
    const at = document.querySelector(".kfrage") || document.getElementById("wall");
    const now = list.filter(x => x.d === MD), soon = list.filter(x => { const n = daysUntil(x.d); return n > 0 && n <= 3; });
    if (now.length) {
      const names = now.map(x => x.n).join(" & "), c = document.createElement("div"); c.className = "gebcard";
      c.innerHTML = `${Array.from({ length: 18 }, (_, i) => `<i style="left:${i * 5.6}%;background:${["#fff", "#1f4fa3", "#2f8f4f", "#7b2cff"][i % 4]};animation-delay:${(i * .17) % 3}s"></i>`).join("")}
        <b>🎉 ${T(`Heute hat ${E(names)} Geburtstag!`, `It's ${E(names)}'s birthday!`)}</b><p>${T("Schreibt eine Glückwunsch-Karte an die Familienwand.", "Write a birthday card on the wall.")}</p><button type="button">🎂 ${T("Glückwunsch schreiben", "Write a card")}</button>`;
      at.parentNode.insertBefore(c, at);
      c.querySelector("button").onclick = () => { const m = document.getElementById("msg"); if (m) { m.value = T(`🎂 Alles Liebe zum Geburtstag, ${now[0].n}! 🎉`, `🎂 Happy birthday, ${now[0].n}! 🎉`); m.focus(); m.scrollIntoView({ block: "center", behavior: "smooth" }); m.dispatchEvent(new Event("input", { bubbles: true })); } };
    }
    if (soon.length) { const s = document.createElement("div"); s.className = "gebsoon"; const x = soon[0], n = daysUntil(x.d);
      s.textContent = "🎈 " + T(`${n === 1 ? "Morgen" : `In ${n} Tagen`} hat ${x.n} Geburtstag – Geschenk schon da?`, `${x.n}'s birthday in ${n} days`); at.parentNode.insertBefore(s, at); }
  });

  // Knöpfe in den Familien-Kasten
  let tries = 0;
  (function mount() {
    const fb = document.querySelector(".fambar"); if (!fb) { if (++tries < 20) setTimeout(mount, 150); return; }
    if (fb.querySelector(".stern")) return;
    const s = document.createElement("button"); s.type = "button"; s.className = "stern"; s.innerHTML = "⭐ " + T("Sterne-Aufgaben", "Star chores"); s.onclick = openSterne;
    const g = document.createElement("button"); g.type = "button"; g.className = "geb"; g.innerHTML = "🎂 " + T("Geburtstage", "Birthdays"); g.onclick = openGeb;
    const sos = fb.querySelector(".sos"); if (sos) { sos.before(s); sos.before(g); } else { fb.appendChild(s); fb.appendChild(g); }
  })();
})();
