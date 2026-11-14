/* Klo-Wand: Punkte, Level und Abzeichen. Alles bleibt nur auf diesem Handy (localStorage).
   Punkte gibt es automatisch fürs Schreiben, Striche, Antworten, Spiele, Abstimmen, Quiz, Teilen, Tanzen und Chillen. */
window.kloXP = (function () {
  const K = "klowand-xp";
  const PTS = { post: 10, like: 2, reply: 4, game: 5, vote: 3, quiz: 2, wunsch: 4, share: 15, dance: 8, chill: 2, spiel: 5, karaoke: 10, dart: 6, invite: 25 };
  const BADGES = [
    ["first", "✍️", "Erster Spruch", "Den ersten Spruch an die Wand geschrieben", s => s.c.post >= 1],
    ["poet", "📜", "Klo-Poet", "10 Sprüche geschrieben", s => s.c.post >= 10],
    ["fan", "👍", "Strich-Fan", "25 Striche verteilt", s => s.c.like >= 25],
    ["talk", "💬", "Quasselstrippe", "10 Antworten gekritzelt", s => s.c.reply >= 10],
    ["gamer", "🎮", "Spielkind", "10 Klo-Spiele gespielt", s => (s.c.game || 0) + (s.c.spiel || 0) >= 10],
    ["voter", "🗳️", "Meinungsmacher", "5 Klo-Fragen beantwortet", s => s.c.vote >= 5],
    ["brain", "🧠", "Quiz-Kopf", "25 Quizfragen beantwortet", s => s.c.quiz >= 25],
    ["dj", "🎧", "Musikwunsch", "3 Lieder gewünscht", s => s.c.wunsch >= 3],
    ["disco", "🪩", "Disco-König", "5 Tanz-Runden getanzt", s => s.c.dance >= 5],
    ["star", "🎤", "Karaoke-Star", "Einmal Karaoke gesungen", s => s.c.karaoke >= 1],
    ["dart", "🎯", "Dart-Profi", "5 Dart-Partien gespielt", s => s.c.dart >= 5],
    ["chill", "🛋️", "Chill-Meister", "20-mal im Chill-Raum geschrieben", s => s.c.chill >= 20],
    ["share", "📣", "Werbe-Profi", "3 Sprüche geteilt", s => s.c.share >= 3],
    ["friend", "🤝", "Freundeskreis", "Einen Freund eingeladen", s => s.c.invite >= 1],
    ["st3", "🔥", "Feuer gefangen", "3 Tage am Stück geschrieben", s => (s.st && s.st.best || 0) >= 3],
    ["st7", "🔥", "Wochen-Streak", "7 Tage am Stück geschrieben", s => (s.st && s.st.best || 0) >= 7],
    ["st30", "☄️", "Monats-Streak", "30 Tage am Stück geschrieben", s => (s.st && s.st.best || 0) >= 30],
    ["st100", "🌋", "Unaufhaltsam", "100 Tage am Stück geschrieben", s => (s.st && s.st.best || 0) >= 100],
    ["shop", "🛍️", "Shopping-Queen", "Das erste Teil im Avatar-Shop gekauft", s => (s.own || []).length >= 1],
    ["lvl5", "⭐", "Stammgast", "Level 5 erreicht", s => level(s.pts) >= 5],
    ["lvl10", "👑", "Klo-Legende", "Level 10 erreicht", s => level(s.pts) >= 10]
  ];
  const load = () => { try { const v = JSON.parse(localStorage.getItem(K)); if (v && v.c) return v; } catch (e) {} return { pts: 0, c: {}, b: [] }; };
  const save = s => { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} };
  function level(p) { return Math.floor(Math.sqrt(p / 25)) + 1; }
  const need = l => (l - 1) * (l - 1) * 25;
  function toast(t) {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:99;background:#1b1424;color:#ffd166;border:2px solid #ffd166;border-radius:14px;padding:10px 16px;font:700 1rem system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:90vw;text-align:center";
    el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 3600);
  }
  // Tage im Format JJJJ-MM-TT (Ortszeit)
  const dkey = d => { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const yday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dkey(d); };
  // 🔥 Streak: jeden Tag mindestens einen Spruch, eine Kritzelei oder Antwort schreiben
  function streakTick(s) {
    const t = dkey(); s.st = s.st || { last: "", n: 0, best: 0 };
    if (s.st.last === t) return 0;
    s.st.n = s.st.last === yday() ? s.st.n + 1 : 1; s.st.last = t; s.st.best = Math.max(s.st.best || 0, s.st.n);
    return s.st.n;
  }
  const streakNow = s => { const st = s.st; if (!st || !st.n) return { n: 0, today: false, risk: false, best: (st && st.best) || 0 };
    const t = dkey(); if (st.last === t) return { n: st.n, today: true, risk: false, best: st.best };
    if (st.last === yday()) return { n: st.n, today: false, risk: true, best: st.best };
    return { n: 0, today: false, risk: false, best: st.best }; };
  function add(kind, n) {
    const s = load(); n = n || 1; s.c[kind] = (s.c[kind] || 0) + n;
    // Tagesbuch für den Wochenrückblick (14 Tage)
    s.d = s.d || {}; const dk = dkey(); s.d[dk] = s.d[dk] || {}; s.d[dk][kind] = (s.d[dk][kind] || 0) + n;
    Object.keys(s.d).sort().slice(0, -14).forEach(k => delete s.d[k]);
    if (kind === "post" || kind === "reply") { const sn = streakTick(s);
      if (sn) { const ms = { 3: "🔥 3 Tage Streak!", 7: "🔥 7 Tage Streak – eine ganze Woche!", 14: "🔥 14 Tage Streak!", 30: "☄️ 30 Tage Streak – Wahnsinn!", 50: "☄️ 50 Tage Streak!", 100: "🌋 100 Tage Streak – Legende!" }[sn];
        setTimeout(() => toast(ms || (sn > 1 ? `🔥 ${sn} Tage Streak` : "🔥 Streak gestartet! Schreib morgen wieder.")), 900);
        if (ms) { s.pts += sn * 2; } } }
    const lv0 = level(s.pts); s.pts += (PTS[kind] || 1) * n; const lv1 = level(s.pts);
    BADGES.forEach(b => { if (!s.b.includes(b[0]) && b[4](s)) { s.b.push(b[0]); setTimeout(() => toast(`${b[1]} Neues Abzeichen: ${b[2]}!`), 300); } });
    save(s); if (lv1 > lv0) toast(`⭐ Level ${lv1} erreicht!`);
    window.dispatchEvent(new Event("klo-xp"));
  }
  // 🪙 Klo-Münzen: jeder Punkt ist eine Münze; im Avatar-Shop ausgeben (nur Spielgeld, kein echtes Geld)
  const coins = () => { const s = load(); return Math.max(0, s.pts - (s.spent || 0)); };
  // Shop-Teile: [id, Teil (f Fell, h Kopf, g Brille), Wert im Avatar-Code, Name, Emoji, Preis]
  const SHOP = [
    ["h4", "h", 4, "Zylinder", "🎩", 80], ["h6", "h", 6, "Partyhut", "🥳", 60], ["h8", "h", 8, "Hasenohren", "🐰", 120], ["h5", "h", 5, "Cowboyhut", "🤠", 150],
    ["h9", "h", 9, "Kopfhörer", "🎧", 200], ["h7", "h", 7, "Heiligenschein", "😇", 350],
    ["g2", "g", 2, "Nerd-Brille", "🤓", 70], ["g3", "g", 3, "Herzbrille", "😍", 160],
    ["f4", "f", 4, "Pinkes Fell", "🩷", 100], ["f5", "f", 5, "Blaues Fell", "💙", 100], ["f6", "f", 6, "Goldfell", "✨", 400]];
  const owns = id => (load().own || []).includes(id);
  function buy(id) { const it = SHOP.find(x => x[0] === id); if (!it) return false; const s = load(); s.own = s.own || [];
    if (s.own.includes(id)) return true; if (Math.max(0, s.pts - (s.spent || 0)) < it[5]) return false;
    s.spent = (s.spent || 0) + it[5]; s.own.push(id);
    BADGES.forEach(b => { if (!s.b.includes(b[0]) && b[4](s)) { s.b.push(b[0]); setTimeout(() => toast(`${b[1]} Neues Abzeichen: ${b[2]}!`), 300); } });
    save(s); window.dispatchEvent(new Event("klo-xp")); return true; }
  const locked = (part, v) => { const it = SHOP.find(x => x[1] === part && x[2] === v); return it && !owns(it[0]) ? it : null; };
  function shopHtml() { const c = coins();
    return `<p style="margin:4px 0 12px;font:800 1.5rem system-ui;color:#b0377e">🪙 ${c} Klo-Münzen</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">${SHOP.map(x => { const o = owns(x[0]);
        return `<button type="button" data-buy="${x[0]}" ${o ? "disabled" : ""} style="min-height:96px;border-radius:14px;border:2px solid ${o ? "#3ddc84" : c >= x[5] ? "#ffd166" : "#ddd"};background:${o ? "#eafff1" : "#fff"};color:#1b1424;cursor:${o ? "default" : "pointer"};padding:8px 6px;font:700 .95rem system-ui">
          <div style="font-size:2rem">${x[4]}</div>${x[3]}<div style="font:800 .9rem system-ui;color:${o ? "#1f8a4c" : c >= x[5] ? "#b0377e" : "#999"}">${o ? "✓ Gehört dir" : "🪙 " + x[5]}</div></button>`; }).join("")}</div>
      <p style="font:500 .8rem system-ui;color:#777;margin-top:10px">Münzen bekommst du fürs Schreiben, Striche, Spielen, Quiz und Streaks. Nur Spielgeld – kein echtes Geld. Anziehen kannst du die Sachen im Chill-Raum unter „🐻 Mein Avatar“.</p>`; }
  function panelHtml() {
    const s = load(), lv = level(s.pts), a = need(lv), b = need(lv + 1), pc = Math.round((s.pts - a) / (b - a) * 100);
    return `<div style="display:flex;align-items:center;gap:12px;margin:8px 0 12px"><div style="font:800 2.2rem/1 system-ui;color:#b0377e">Lv ${lv}</div>
      <div style="flex:1"><div style="height:12px;border-radius:6px;background:#eee;overflow:hidden"><div style="height:100%;width:${pc}%;background:linear-gradient(90deg,#ff4fa3,#ffd166)"></div></div>
      <small style="font:600 .85rem system-ui;color:#666">${s.pts} Punkte · noch ${b - s.pts} bis Level ${lv + 1}</small></div></div>
      <p style="margin:0 0 12px;font:700 1rem system-ui;color:#1b1424">🔥 Streak: ${streakNow(s).n} ${streakNow(s).n === 1 ? "Tag" : "Tage"} · Rekord ${streakNow(s).best} · 🪙 ${Math.max(0, s.pts - (s.spent || 0))} Münzen</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">${BADGES.map(x => { const on = s.b.includes(x[0]);
        return `<div style="border-radius:12px;padding:10px 8px;text-align:center;background:${on ? "#fff4d1" : "#f2f2f2"};opacity:${on ? 1 : .55}"><div style="font-size:1.9rem;filter:${on ? "none" : "grayscale(1)"}">${on ? x[1] : "🔒"}</div><b style="display:block;font:700 .95rem system-ui">${x[2]}</b><small style="font:500 .75rem system-ui;color:#666">${x[3]}</small></div>`; }).join("")}</div>
      <p style="font:500 .8rem system-ui;color:#777;margin-top:10px">Punkte und Abzeichen bleiben nur auf diesem Handy.</p>`;
  }
  // Firestore-Schreibvorgänge erkennen und Punkte vergeben
  function hook() {
    const F = window.firebase && firebase.firestore;
    if (!F || !F.CollectionReference || hook.done) return; hook.done = true;
    const kindOf = path => {
      const seg = String(path || "").split("/"); const col = seg[seg.length - (seg.length % 2 ? 1 : 2)];
      return { posts: "post", likes: "like", replies: "reply", scores: "game", umfrage: "vote", wunsch: "wunsch", chill: "chill", einladung: null }[col];
    };
    const ok = (p, kind) => p && p.then ? p.then(r => { if (kind) add(kind); return r; }) : p;
    const ca = F.CollectionReference.prototype.add;
    F.CollectionReference.prototype.add = function (d) { const k = kindOf(this.path + "/x"), pr = ok(ca.apply(this, arguments), k);
      if (k === "post" && d && pr && pr.then) pr.then(r => { try { const s = load(); s.my = (s.my || []).concat([{ id: r.id, t: typeof d.t === "string" ? d.t.slice(0, 120) : "", img: !!d.img, at: Date.now() }]).slice(-30); save(s); } catch (e) {} });
      return pr; };
    const ds = F.DocumentReference.prototype.set;
    F.DocumentReference.prototype.set = function (d, o) { const k = kindOf(this.path); return ok(ds.apply(this, arguments), (o && o.merge) ? null : k); };
  }
  hook();
  return { add, level: () => level(load().pts), points: () => load().pts, panelHtml, toast, hook,
    streak: () => streakNow(load()), coins, SHOP, owns, buy, locked, shopHtml, days: () => load().d || {}, mine: () => load().my || [], dkey, counts: () => load().c };
})();
