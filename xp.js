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
  function add(kind, n) {
    const s = load(); n = n || 1; s.c[kind] = (s.c[kind] || 0) + n;
    const lv0 = level(s.pts); s.pts += (PTS[kind] || 1) * n; const lv1 = level(s.pts);
    BADGES.forEach(b => { if (!s.b.includes(b[0]) && b[4](s)) { s.b.push(b[0]); setTimeout(() => toast(`${b[1]} Neues Abzeichen: ${b[2]}!`), 300); } });
    save(s); if (lv1 > lv0) toast(`⭐ Level ${lv1} erreicht!`);
    window.dispatchEvent(new Event("klo-xp"));
  }
  function panelHtml() {
    const s = load(), lv = level(s.pts), a = need(lv), b = need(lv + 1), pc = Math.round((s.pts - a) / (b - a) * 100);
    return `<div style="display:flex;align-items:center;gap:12px;margin:8px 0 12px"><div style="font:800 2.2rem/1 system-ui;color:#b0377e">Lv ${lv}</div>
      <div style="flex:1"><div style="height:12px;border-radius:6px;background:#eee;overflow:hidden"><div style="height:100%;width:${pc}%;background:linear-gradient(90deg,#ff4fa3,#ffd166)"></div></div>
      <small style="font:600 .85rem system-ui;color:#666">${s.pts} Punkte · noch ${b - s.pts} bis Level ${lv + 1}</small></div></div>
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
    F.CollectionReference.prototype.add = function (d) { return ok(ca.apply(this, arguments), kindOf(this.path + "/x")); };
    const ds = F.DocumentReference.prototype.set;
    F.DocumentReference.prototype.set = function (d, o) { const k = kindOf(this.path); return ok(ds.apply(this, arguments), (o && o.merge) ? null : k); };
  }
  hook();
  return { add, level: () => level(load().pts), points: () => load().pts, panelHtml, toast, hook };
})();
