/* Spotify-Musik über den offiziellen Spotify-Player (Einbettung). Es wird nichts heruntergeladen:
   Man fügt einen Spotify-Link ein (Lied, Album, Playlist, Podcast), der Spotify-Player spielt ihn ab.
   Ohne Spotify-Anmeldung im Browser spielt Spotify oft nur 30 Sekunden Vorschau.
   Gemerkte Links bleiben nur auf diesem Gerät (localStorage). Der Player wird erst geladen, wenn man auf Abspielen tippt. */
window.KloSpotify = (function () {
  const KEY = "klowand-spotify", TYPES = { track: "Lied", album: "Album", playlist: "Playlist", episode: "Folge", show: "Podcast", artist: "Künstler" };
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  function parse(t) {
    t = String(t || "").trim();
    let m = /^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]{10,40})$/.exec(t);
    if (!m) m = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]{10,40})/.exec(t);
    return m ? { type: m[1], id: m[2] } : null;
  }
  const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a.filter(x => x && TYPES[x.type] && /^[A-Za-z0-9]{10,40}$/.test(x.id)).slice(0, 12) : []; } catch (e) { return []; } };
  const save = a => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 12))); } catch (e) {} };

  // Mini-Player, der offen bleibt, auch wenn man das Fenster schließt
  let dock = null;
  function css() {
    if (document.getElementById("kspCss")) return;
    const s = document.createElement("style"); s.id = "kspCss";
    s.textContent = `.kspdock{position:fixed;left:10px;right:10px;z-index:45;display:flex;gap:6px;align-items:stretch;max-width:520px;margin:0 auto}
.kspdock iframe{flex:1;min-width:0;height:80px;border:0;border-radius:12px;background:#121212}
.kspdock button{flex:none;width:40px;border-radius:12px;border:1.5px solid rgba(255,255,255,.2);background:rgba(18,10,31,.92);color:#fff;font:700 1rem system-ui;cursor:pointer}
.ksp{margin-top:14px;padding-top:12px;border-top:1.5px dashed rgba(127,127,127,.4)}
.ksp h4{margin:0 0 4px;font:700 1.05rem var(--f-ui,system-ui);display:flex;align-items:center;gap:6px}
.ksp h4 i{display:inline-block;width:18px;height:18px;border-radius:50%;background:#1db954}
.ksp p{margin:0 0 8px;font:600 .88rem/1.3 var(--f-ui,system-ui);opacity:.8}
.ksp form{display:flex;gap:6px}
.ksp input{flex:1;min-width:0;min-height:44px;border-radius:12px;border:1.5px solid rgba(127,127,127,.45);background:rgba(127,127,127,.12);color:inherit;padding:0 10px;font:600 .95rem var(--f-ui,system-ui)}
.ksp form button{min-height:44px;padding:0 14px;border-radius:12px;border:none;background:#1db954;color:#06140b;font:800 .95rem var(--f-ui,system-ui);cursor:pointer}
.ksp .err{color:#ff8f8f;font:600 .85rem var(--f-ui,system-ui);margin-top:6px}
.ksp ul{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.ksp li{display:flex;align-items:center;gap:6px;padding:4px 4px 4px 10px;border-radius:12px;background:rgba(127,127,127,.12)}
.ksp li span{flex:1;font:700 .95rem var(--f-ui,system-ui);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ksp li button{min-width:38px;min-height:38px;border-radius:50%;border:1.5px solid rgba(127,127,127,.45);background:transparent;color:inherit;cursor:pointer}`;
    document.head.appendChild(s);
  }
  function play(it, opt) {
    css(); opt = opt || {};
    if (opt.onPlay) try { opt.onPlay(); } catch (e) {}
    if (!dock) { dock = document.createElement("div"); dock.className = "kspdock"; document.body.appendChild(dock); }
    dock.style.top = opt.top || "calc(8px + env(safe-area-inset-top,0px))";
    dock.innerHTML = `<iframe title="Spotify-Player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
      src="https://open.spotify.com/embed/${it.type}/${it.id}?utm_source=generator&theme=0"></iframe><button type="button" aria-label="Spotify schließen">✕</button>`;
    dock.querySelector("button").onclick = stop;
  }
  function stop() { if (dock) { dock.remove(); dock = null; } }
  function panel(el, opt) {
    css(); opt = opt || {};
    const box = document.createElement("div"); box.className = "ksp";
    box.innerHTML = `<h4><i aria-hidden="true"></i>Musik von Spotify</h4>
      <p>In Spotify bei einem Lied oder einer Playlist auf „Teilen“ → „Link kopieren“ tippen und hier einfügen. Ohne Spotify-Anmeldung spielt Spotify oft nur 30 Sekunden.</p>
      <form><label style="position:absolute;left:-9999px" for="kspIn">Spotify-Link</label><input id="kspIn" inputmode="url" autocomplete="off" placeholder="https://open.spotify.com/…"><button type="submit">▶ Abspielen</button></form>
      <div class="err" hidden></div><ul></ul>`;
    el.appendChild(box);
    const list = box.querySelector("ul"), err = box.querySelector(".err");
    const draw = () => { const a = load(); list.innerHTML = a.map((x, i) => `<li><span data-i="${i}">🎵 ${esc(x.name || TYPES[x.type])}</span><button type="button" data-d="${i}" aria-label="Entfernen">✕</button></li>`).join(""); };
    box.querySelector("form").addEventListener("submit", e => {
      e.preventDefault(); const inp = box.querySelector("input"), it = parse(inp.value);
      if (!it) { err.hidden = false; err.textContent = "Das ist kein Spotify-Link. Er fängt mit https://open.spotify.com/ an."; return; }
      err.hidden = true; inp.value = "";
      const a = load().filter(x => !(x.type === it.type && x.id === it.id));
      const n = a.filter(x => x.type === it.type).length + 1;
      a.unshift({ type: it.type, id: it.id, name: `${TYPES[it.type]} ${n}` }); save(a); draw(); play(it, opt);
      // Titel beim Spotify-Dienst nachschlagen (wie beim Player selbst)
      fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${it.type}/${it.id}`)}`).then(r => r.ok ? r.json() : null).then(j => {
        if (!j || typeof j.title !== "string") return; const b = load(), x = b.find(y => y.type === it.type && y.id === it.id); if (x) { x.name = j.title.slice(0, 60); save(b); draw(); } }).catch(() => {});
    });
    list.addEventListener("click", e => {
      const p = e.target.closest("[data-i]"), d = e.target.closest("[data-d]"), a = load();
      if (p && a[+p.dataset.i]) play(a[+p.dataset.i], opt);
      if (d) { a.splice(+d.dataset.d, 1); save(a); draw(); }
    });
    draw(); return box;
  }
  return { parse, play, stop, panel, playing: () => !!dock };
})();
