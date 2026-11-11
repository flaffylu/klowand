/* Klo-Wand Extras im Menü: Kalender, Wetter, Freundebuch mit Selfie, Veranstaltungstipps.
   Kalender, Freundebuch und eigene Tipps bleiben nur auf diesem Handy (localStorage / IndexedDB).
   Das Wetter kommt von Open-Meteo (ohne Konto, ohne Schlüssel); dafür wird nur der gewählte Ort gesendet. */
(function () {
  if (typeof WALL === "undefined" || !document.querySelector(".plate")) return;
  const T = (de, en) => (typeof tr === "function" ? tr(de, en) : de);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const ls = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const pad2 = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const css = document.createElement("style");
  css.textContent = `
  .xbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;flex:1 1 100%}
  .xbar button{flex:none!important;min-height:64px!important;padding:6px 2px!important;font:700 .85rem/1.1 var(--f-ui)!important;letter-spacing:.02em!important;border-radius:12px!important;color:#fff!important;position:relative}
  .xbar button span{display:block;font-size:1.5rem;line-height:1;margin-bottom:4px}
  .xbar .cal{background:#1f4fa3!important}.xbar .wet{background:#0e7c86!important}.xbar .fb{background:#b0377e!important}.xbar .ev{background:#c76a12!important}
  .xbar .badge{position:absolute;top:4px;right:6px;min-width:18px;height:18px;border-radius:9px;background:#ffde59;color:#1d2321;font:800 .7rem/18px var(--f-ui);padding:0 4px}
  .fam-ov .cal-h{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:6px 0}
  .fam-ov .cal-h b{font:700 1.2rem var(--f-ui)}
  .fam-ov .cal-h button,.fam-ov .chip{min-width:44px;min-height:44px;border-radius:12px;border:1.5px solid #c3cec7;background:#fff;color:var(--ink);font:700 1rem var(--f-ui);cursor:pointer}
  .fam-ov .cal-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px}
  .fam-ov .cal-g .wd{font:700 .75rem var(--f-ui);color:var(--muted);text-align:center;padding:2px 0}
  .fam-ov .cal-g button{aspect-ratio:1;border:none;border-radius:10px;background:#f1f4f2;color:var(--ink);font:700 1rem var(--f-ui);cursor:pointer;position:relative;padding:0}
  .fam-ov .cal-g button.out{opacity:.35}
  .fam-ov .cal-g button.today{outline:2px solid #d9483b}
  .fam-ov .cal-g button.sel{background:#1f4fa3;color:#fff}
  .fam-ov .cal-g button i{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-style:normal;font-size:.7rem;line-height:1}
  .fam-ov .evl{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
  .fam-ov .evl li{display:flex;align-items:center;gap:10px;background:#f4f7f5;border-radius:12px;padding:8px 8px 8px 12px;font:700 1.05rem var(--f-ui)}
  .fam-ov .evl li .e{font-size:1.4rem}
  .fam-ov .evl li .tx{flex:1;min-width:0}
  .fam-ov .evl li small{display:block;font:600 .85rem var(--f-ui);color:var(--muted)}
  .fam-ov .evl li button{min-width:40px;min-height:40px;border-radius:50%;border:1.5px solid #c3cec7;background:#fff;cursor:pointer;color:var(--ink)}
  .fam-ov .xform{display:grid;gap:6px;margin-top:10px}
  .fam-ov .xform .r{display:flex;gap:6px}
  .fam-ov .xform input,.fam-ov .xform select,.fam-ov .xform textarea{min-width:0;flex:1;font:600 1.05rem var(--f-ui);padding:9px 11px;border:1.5px solid #c3cec7;border-radius:10px;min-height:44px;background:#fff;color:var(--ink);box-sizing:border-box;width:100%}
  .fam-ov .xform textarea{min-height:64px;resize:vertical}
  .fam-ov .xform label{font:700 .85rem var(--f-ui);color:var(--muted);display:grid;gap:3px}
  .fam-ov .emo{display:flex;gap:4px;flex-wrap:wrap}
  .fam-ov .emo button{width:42px;height:42px;border-radius:10px;border:1.5px solid #c3cec7;background:#fff;font-size:1.3rem;cursor:pointer;padding:0}
  .fam-ov .emo button[aria-pressed=true]{background:#1f4fa3;border-color:#1f4fa3}
  .fam-ov .wnow{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#e3f2fb,#c9e6f7);border-radius:16px;padding:14px 16px;margin:8px 0}
  .fam-ov .wnow .ic{font-size:3.4rem;line-height:1}
  .fam-ov .wnow .tp{font:800 2.4rem/1 var(--f-ui)}
  .fam-ov .wnow small{display:block;font:600 .95rem var(--f-ui);color:#3b5562}
  .fam-ov .wtip{background:#fff7d6;border-radius:12px;padding:10px 12px;font:700 1rem var(--f-ui);margin-bottom:8px}
  .fam-ov .wdays{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
  .fam-ov .wdays div{background:#f1f4f2;border-radius:12px;padding:8px 2px;text-align:center;font:700 .9rem var(--f-ui)}
  .fam-ov .wdays div span{display:block;font-size:1.6rem;margin:4px 0}
  .fam-ov .wdays small{display:block;color:var(--muted);font-weight:600}
  .fam-ov .wsr{display:flex;gap:6px;margin-top:10px}
  .fam-ov .wsr input{flex:1;min-width:0;font:600 1.05rem var(--f-ui);padding:9px 11px;border:1.5px solid #c3cec7;border-radius:10px;min-height:44px}
  .fam-ov .wres{display:flex;flex-direction:column;gap:4px;margin-top:6px}
  .fam-ov .wres button{text-align:left;min-height:44px;border-radius:10px;border:1.5px solid #c3cec7;background:#fff;font:600 1rem var(--f-ui);padding:0 12px;cursor:pointer;color:var(--ink)}
  .fam-ov .src{font:600 .75rem var(--f-ui);color:var(--muted);margin-top:8px}
  .fam-ov .src a{color:inherit}
  .fam-ov .fbl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px}
  .fam-ov .fbc{border:none;border-radius:14px;background:#fff6fb;box-shadow:0 2px 0 #f1c6dc;padding:8px;text-align:center;cursor:pointer;color:var(--ink);font:700 1rem var(--f-ui)}
  .fam-ov .fbc img,.fam-ov .fbc .ph{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;display:grid;place-items:center;background:#ffe1ef;font-size:2.6rem;margin-bottom:6px}
  .fam-ov .fbn{border:2px dashed #b0377e;color:#b0377e;background:transparent;box-shadow:none;display:grid;place-items:center;min-height:150px}
  .fam-ov .page{background:#fffaf2;border-radius:14px;padding:14px;box-shadow:inset 0 0 0 2px #f3e3cf;background-image:repeating-linear-gradient(transparent 0 31px,#eadcc8 31px 32px)}
  .fam-ov .page .pic{display:flex;justify-content:center;margin-bottom:10px}
  .fam-ov .page .pic img,.fam-ov .page .pic .ph{width:150px;height:150px;object-fit:cover;border-radius:12px;transform:rotate(-3deg);box-shadow:0 6px 14px rgba(0,0,0,.18);border:6px solid #fff;display:grid;place-items:center;background:#ffe1ef;font-size:3rem}
  .fam-ov .page dl{margin:0;display:grid;gap:2px}
  .fam-ov .page dt{font:700 .8rem var(--f-ui);color:#b0377e;text-transform:uppercase;letter-spacing:.06em;margin-top:6px}
  .fam-ov .page dd{margin:0;font:700 1.4rem/1.15 var(--f-hand,cursive);color:#2b2118}
  .fam-ov .cam{position:relative;border-radius:14px;overflow:hidden;background:#000;aspect-ratio:1;max-width:320px;margin:6px auto}
  .fam-ov .cam video,.fam-ov .cam img{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
  .fam-ov .cam img{transform:none}
  .fam-ov .links{display:flex;flex-direction:column;gap:6px;margin-top:8px}
  .fam-ov .links a{display:flex;align-items:center;gap:10px;min-height:48px;padding:0 14px;border-radius:12px;background:#fff1e2;color:#7a3f06;font:700 1.05rem var(--f-ui);text-decoration:none}
  .fam-ov h3{margin:14px 0 4px;font:700 .85rem var(--f-ui);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}`;
  document.head.appendChild(css);

  // ---------- Fenster ----------
  function box(title, inner, foot) {
    const el = document.createElement("div"); el.className = "fam-ov"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", title);
    el.innerHTML = `<div class="box"><div class="head"><h2>${title}</h2><button type="button" class="x" aria-label="${T("Schließen", "Close")}">✕</button></div>${inner}<div class="row">${foot || ""}<button type="button" class="btn" data-x>${T("Schließen", "Close")}</button></div></div>`;
    document.body.appendChild(el);
    el.close = () => { if (el.onclose) el.onclose(); el.remove(); };
    el.querySelector(".x").onclick = el.close; el.querySelector("[data-x]").onclick = el.close;
    el.addEventListener("click", e => { if (e.target === el) el.close(); });
    return el;
  }

  // ---------- 📅 Kalender ----------
  const CK = "klowand-kalender-" + WALL;
  const EMO = ["📌", "🎂", "🎉", "⚽", "🏫", "🦷", "🍕", "🎄", "🎬", "🍻"];
  const todayCount = () => ls.get(CK, []).filter(e => e.d === ymd(new Date())).length;
  function openCal() {
    let view = new Date(); view.setDate(1); let sel = ymd(new Date()), emo = "📌";
    const el = box(`📅 ${T("Kalender", "Calendar")}`, `<p class="note">${T("Termine, Geburtstage, Feiern – bleibt auf diesem Handy.", "Dates, birthdays, parties – stays on this phone.")}</p>
      <div class="cal-h"><button type="button" data-m="-1" aria-label="${T("Voriger Monat", "Previous month")}">◀</button><b id="xcM"></b><button type="button" data-m="1" aria-label="${T("Nächster Monat", "Next month")}">▶</button></div>
      <div class="cal-g" id="xcG"></div><h3 id="xcD"></h3><ul class="evl" id="xcL"></ul>
      <form class="xform" id="xcF"><div class="emo" id="xcE">${EMO.map((e, i) => `<button type="button" data-e="${e}" aria-pressed="${i === 0}">${e}</button>`).join("")}</div>
        <div class="r"><input id="xcT" maxlength="40" placeholder="${T("Was ist los? z. B. Omas Geburtstag", "What's on? e.g. Grandma's birthday")}" aria-label="${T("Termin", "Event")}"><input id="xcZ" type="time" style="flex:0 0 110px" aria-label="${T("Uhrzeit", "Time")}"></div>
        <button type="submit" class="btn primary">＋ ${T("Eintragen", "Add")}</button></form>`);
    const draw = () => {
      const all = ls.get(CK, []), y = view.getFullYear(), m = view.getMonth();
      el.querySelector("#xcM").textContent = `${MON[m]} ${y}`;
      const first = (new Date(y, m, 1).getDay() + 6) % 7, start = new Date(y, m, 1 - first), today = ymd(new Date());
      let h = WD.map(w => `<span class="wd">${w}</span>`).join("");
      for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = ymd(d), ev = all.filter(e => e.d === k);
        h += `<button type="button" data-d="${k}" class="${d.getMonth() !== m ? "out " : ""}${k === today ? "today " : ""}${k === sel ? "sel" : ""}" aria-label="${d.getDate()}. ${MON[d.getMonth()]}${ev.length ? ", " + ev.length + " " + T("Termine", "events") : ""}">${d.getDate()}${ev.length ? `<i>${ev[0].e}</i>` : ""}</button>`; }
      el.querySelector("#xcG").innerHTML = h;
      const sd = new Date(sel + "T12:00"); el.querySelector("#xcD").textContent = `${WD[(sd.getDay() + 6) % 7]}, ${sd.getDate()}. ${MON[sd.getMonth()]}`;
      const list = all.filter(e => e.d === sel).sort((a, b) => (a.t || "99").localeCompare(b.t || "99"));
      el.querySelector("#xcL").innerHTML = list.length ? list.map(e => `<li><span class="e">${e.e}</span><span class="tx">${esc(e.n)}${e.t ? `<small>${e.t} ${T("Uhr", "")}</small>` : ""}</span><button type="button" data-del="${e.id}" aria-label="${T("Löschen", "Delete")}">✕</button></li>`).join("")
        : `<li style="justify-content:center;color:var(--muted);font-size:.95rem">${T("Noch nichts eingetragen.", "Nothing yet.")}</li>`;
    };
    el.addEventListener("click", e => {
      const m = e.target.closest("[data-m]"), d = e.target.closest("[data-d]"), em = e.target.closest("[data-e]"), del = e.target.closest("[data-del]");
      if (m) { view.setMonth(view.getMonth() + +m.dataset.m); draw(); }
      if (d) { sel = d.dataset.d; const dd = new Date(sel + "T12:00"); if (dd.getMonth() !== view.getMonth()) { view = new Date(dd.getFullYear(), dd.getMonth(), 1); } draw(); }
      if (em) { emo = em.dataset.e; el.querySelectorAll("#xcE button").forEach(b => b.setAttribute("aria-pressed", b === em)); }
      if (del) { ls.set(CK, ls.get(CK, []).filter(x => x.id !== del.dataset.del)); draw(); badge(); }
    });
    el.querySelector("#xcF").addEventListener("submit", e => {
      e.preventDefault(); const n = el.querySelector("#xcT").value.trim().slice(0, 40); if (n.length < 2) { el.querySelector("#xcT").focus(); return; }
      const all = ls.get(CK, []); all.push({ id: Date.now().toString(36), d: sel, t: el.querySelector("#xcZ").value || "", n, e: emo }); ls.set(CK, all);
      el.querySelector("#xcT").value = ""; el.querySelector("#xcZ").value = ""; draw(); badge();
      try { KloMusik.blip("good"); } catch (er) {}
    });
    draw();
  }

  // ---------- ⛅ Wetter ----------
  const WK = "klowand-wetter-ort";
  const WMO = c => c === 0 ? ["☀️", "Sonnig"] : c <= 2 ? ["🌤️", "Leicht bewölkt"] : c === 3 ? ["☁️", "Bewölkt"] : c <= 48 ? ["🌫️", "Nebel"] : c <= 57 ? ["🌦️", "Nieselregen"] : c <= 67 ? ["🌧️", "Regen"] : c <= 77 ? ["❄️", "Schnee"] : c <= 82 ? ["🌧️", "Regenschauer"] : c <= 86 ? ["🌨️", "Schneeschauer"] : ["⛈️", "Gewitter"];
  function openWeather() {
    let ort = ls.get(WK, { name: "Leipzig", lat: 51.34, lon: 12.37 });
    const el = box(`⛅ ${T("Wetter", "Weather")}`, `<div id="xwB"><p class="note">${T("Lädt …", "Loading …")}</p></div>
      <div class="wsr"><input id="xwQ" maxlength="40" placeholder="${T("Anderer Ort …", "Other place …")}" aria-label="${T("Ort suchen", "Search place")}"><button type="button" class="btn dark" id="xwS">🔍</button><button type="button" class="btn" id="xwG" title="${T("Mein Standort", "My location")}">📍</button></div>
      <div class="wres" id="xwR"></div><p class="src">${T("Wetterdaten:", "Weather data:")} <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0)</p>`);
    async function load() {
      const B = el.querySelector("#xwB"); B.innerHTML = `<p class="note">${T("Lädt …", "Loading …")}</p>`;
      try {
        const u = `https://api.open-meteo.com/v1/forecast?latitude=${ort.lat.toFixed(2)}&longitude=${ort.lon.toFixed(2)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
        const w = await (await fetch(u)).json(); if (!w.current) throw 0;
        const [ic, tx] = WMO(w.current.weather_code), t = Math.round(w.current.temperature_2m), rain = (w.daily.precipitation_probability_max || [])[0] || 0;
        const tips = []; if (t <= 3) tips.push(T("🧤 Mütze und Handschuhe nicht vergessen!", "🧤 Don't forget hat and gloves!")); else if (t < 10) tips.push(T("🧥 Jacke an!", "🧥 Wear a jacket!"));
        if (rain >= 50) tips.push(T("☂️ Regenschirm einpacken!", "☂️ Take an umbrella!")); if (w.current.weather_code >= 71 && w.current.weather_code <= 86) tips.push(T("⛄ Schneemann-Wetter!", "⛄ Snowman weather!"));
        if (t >= 25) tips.push(T("🧴 Sonnencreme und viel trinken!", "🧴 Sunscreen and drink lots!")); if (!tips.length) tips.push(T("😎 Perfekt zum Rausgehen!", "😎 Perfect to go outside!"));
        B.innerHTML = `<div class="wnow"><span class="ic">${ic}</span><div><div class="tp">${t}°</div><small>${esc(ort.name)} · ${tx}</small><small>${T("Gefühlt", "Feels like")} ${Math.round(w.current.apparent_temperature)}° · ${T("Wind", "Wind")} ${Math.round(w.current.wind_speed_10m)} km/h</small></div></div>
          <div class="wtip">${tips.join("<br>")}</div>
          <div class="wdays">${w.daily.time.map((d, i) => { const [di] = WMO(w.daily.weather_code[i]); const dd = new Date(d + "T12:00"); return `<div>${i === 0 ? T("Heute", "Today") : WD[(dd.getDay() + 6) % 7]}<span>${di}</span>${Math.round(w.daily.temperature_2m_max[i])}°<small>${Math.round(w.daily.temperature_2m_min[i])}° · 💧${w.daily.precipitation_probability_max[i] ?? 0}%</small></div>`; }).join("")}</div>`;
      } catch (e) { B.innerHTML = `<p class="note">${T("Das Wetter ist gerade nicht erreichbar. Versuch es gleich nochmal.", "Weather isn't available right now. Try again shortly.")}</p>`; }
    }
    const set = o => { ort = o; ls.set(WK, o); el.querySelector("#xwR").innerHTML = ""; load(); };
    el.querySelector("#xwS").onclick = async () => {
      const q = el.querySelector("#xwQ").value.trim(); if (q.length < 2) return;
      const R = el.querySelector("#xwR"); R.innerHTML = `<p class="note">${T("Suche …", "Searching …")}</p>`;
      try { const r = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=de`)).json();
        R.innerHTML = (r.results || []).map((x, i) => `<button type="button" data-i="${i}">📍 ${esc(x.name)}${x.admin1 ? ", " + esc(x.admin1) : ""}${x.country_code ? " (" + esc(x.country_code) + ")" : ""}</button>`).join("") || `<p class="note">${T("Nichts gefunden.", "Nothing found.")}</p>`;
        R.onclick = e => { const b = e.target.closest("[data-i]"); if (!b) return; const x = r.results[+b.dataset.i]; set({ name: x.name, lat: x.latitude, lon: x.longitude }); };
      } catch (e) { R.innerHTML = `<p class="note">${T("Suche geht gerade nicht.", "Search isn't working right now.")}</p>`; }
    };
    el.querySelector("#xwQ").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); el.querySelector("#xwS").click(); } });
    el.querySelector("#xwG").onclick = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(p => set({ name: T("Mein Standort", "My location"), lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 }), () => {}, { maximumAge: 6e5, timeout: 8000 });
    };
    load();
  }

  // ---------- 📖 Freundebuch mit Selfie ----------
  const FB_FIELDS = [["name", "Ich heiße", 30], ["spitz", "Mein Spitzname", 30], ["geb", "Geburtstag", 20], ["essen", "Lieblingsessen", 40], ["farbe", "Lieblingsfarbe", 30], ["tier", "Lieblingstier", 30],
    ["musik", "Lieblingsmusik", 40], ["hobby", "Mein Hobby", 40], ["mag", "Das mag ich", 60], ["magnicht", "Das mag ich gar nicht", 60], ["spaeter", "Später werde ich …", 50], ["spruch", "Mein Spruch für dich", 120]];
  const fdb = () => new Promise((res, rej) => { const r = indexedDB.open("klowand-freundebuch", 1); r.onupgradeneeded = () => r.result.createObjectStore("seiten", { keyPath: "id" }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const fAll = async () => { try { const db = await fdb(); return await new Promise(res => { const q = db.transaction("seiten").objectStore("seiten").getAll(); q.onsuccess = () => res(q.result.filter(s => s.w === WALL).sort((a, b) => a.ts - b.ts)); q.onerror = () => res([]); }); } catch (e) { return []; } };
  const fPut = async s => { const db = await fdb(); await new Promise((res, rej) => { const t = db.transaction("seiten", "readwrite"); t.objectStore("seiten").put(s); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
  const fDel = async id => { const db = await fdb(); await new Promise(res => { const t = db.transaction("seiten", "readwrite"); t.objectStore("seiten").delete(id); t.oncomplete = res; t.onerror = res; }); };
  const clean = v => { const s = String(v || "").trim(); return (typeof KloFilter !== "undefined" && KloFilter.reason(s, false)) ? "" : s; };
  async function openFB() {
    const el = box(`📖 ${T("Freundebuch", "Friendship book")}`, `<p class="note">${T("Jeder schreibt eine Seite – mit Selfie! Bleibt nur auf diesem Handy.", "Everyone fills in a page – with a selfie! Stays on this phone.")}</p><div class="fbl" id="xfL"></div>`);
    const list = async () => {
      const pages = await fAll();
      el.querySelector("#xfL").innerHTML = `<button type="button" class="fbc fbn" data-new>＋<br>${T("Neue Seite", "New page")}</button>` + pages.map(p => `<button type="button" class="fbc" data-p="${p.id}">${p.foto ? `<img src="${p.foto}" alt="">` : `<div class="ph">🙂</div>`}${esc(p.f.name || T("Ohne Namen", "No name"))}</button>`).join("");
      el.querySelector("#xfL").onclick = async e => {
        if (e.target.closest("[data-new]")) { el.close(); editFB(); return; }
        const b = e.target.closest("[data-p]"); if (b) { el.close(); showFB((pages.find(x => x.id === b.dataset.p))); }
      };
    };
    list();
  }
  function showFB(p) {
    if (!p) return;
    const el = box(`📖 ${esc(p.f.name || T("Freundebuch", "Friendship book"))}`, `<div class="page"><div class="pic">${p.foto ? `<img src="${p.foto}" alt="Selfie">` : `<div class="ph">🙂</div>`}</div>
      <dl>${FB_FIELDS.filter(([k]) => p.f[k]).map(([k, l]) => `<dt>${l}</dt><dd>${esc(p.f[k])}</dd>`).join("")}</dl></div>`,
      `<button type="button" class="btn" data-back>◀ ${T("Alle Seiten", "All pages")}</button><button type="button" class="btn" data-del>🗑️</button>`);
    el.querySelector("[data-back]").onclick = () => { el.close(); openFB(); };
    const d = el.querySelector("[data-del]"); let sure = false;
    d.onclick = async () => { if (!sure) { sure = true; d.textContent = T("Wirklich löschen?", "Really delete?"); return; } await fDel(p.id); el.close(); openFB(); };
  }
  function editFB() {
    let foto = null, stream = null;
    const el = box(`📖 ${T("Neue Seite", "New page")}`, `<div class="cam" id="xfC"><div class="ph" style="display:grid;place-items:center;height:100%;font-size:4rem;background:#ffe1ef">🤳</div></div>
      <div class="row" style="justify-content:center"><button type="button" class="btn primary" id="xfCam">📸 ${T("Selfie machen", "Take a selfie")}</button><label class="btn" style="position:relative;overflow:hidden">🖼️ ${T("Foto wählen", "Choose photo")}<input type="file" accept="image/*" capture="user" id="xfFile" style="position:absolute;inset:0;opacity:0"></label></div>
      <form class="xform" id="xfF">${FB_FIELDS.map(([k, l, max]) => `<label>${l}${k === "spruch" ? `<textarea name="${k}" maxlength="${max}"></textarea>` : `<input name="${k}" maxlength="${max}" autocomplete="off">`}</label>`).join("")}
      <p class="note">${T("Bitte keine Adressen oder Telefonnummern eintragen.", "Please don't enter addresses or phone numbers.")}</p>
      <button type="submit" class="btn primary">💾 ${T("Seite speichern", "Save page")}</button></form>`);
    const C = el.querySelector("#xfC");
    const stop = () => { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } };
    el.onclose = stop;
    const shrink = src => new Promise(res => { const im = new Image(); im.onload = () => { const s = Math.min(im.width, im.height), c = document.createElement("canvas"); c.width = c.height = 480; c.getContext("2d").drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 480, 480); res(c.toDataURL("image/jpeg", .82)); }; im.onerror = () => res(null); im.src = src; });
    const showFoto = () => { C.innerHTML = foto ? `<img src="${foto}" alt="Selfie">` : ""; };
    el.querySelector("#xfCam").onclick = async () => {
      const btn = el.querySelector("#xfCam");
      if (stream) {   // Auslösen
        const v = C.querySelector("video"), s = Math.min(v.videoWidth, v.videoHeight), c = document.createElement("canvas"); c.width = c.height = 480;
        const g = c.getContext("2d"); g.translate(480, 0); g.scale(-1, 1); g.drawImage(v, (v.videoWidth - s) / 2, (v.videoHeight - s) / 2, s, s, 0, 0, 480, 480);
        foto = c.toDataURL("image/jpeg", .82); stop(); showFoto(); btn.textContent = "📸 " + T("Nochmal", "Again"); try { KloMusik.blip("good"); } catch (e) {} return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
        C.innerHTML = `<video autoplay playsinline muted></video>`; C.querySelector("video").srcObject = stream; btn.textContent = "⚪ " + T("Auslösen", "Snap");
      } catch (e) { el.querySelector("#xfFile").click(); }
    };
    el.querySelector("#xfFile").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; stop(); const r = new FileReader(); r.onload = async () => { foto = await shrink(r.result); showFoto(); }; r.readAsDataURL(f); });
    el.querySelector("#xfF").addEventListener("submit", async e => {
      e.preventDefault(); const fd = new FormData(e.target), f = {};
      FB_FIELDS.forEach(([k, , max]) => { const v = clean(fd.get(k)).slice(0, max).replace(/[0-9][0-9 /-]{6,}[0-9]/g, "…"); if (v) f[k] = v; });
      if (!f.name) { e.target.querySelector("[name=name]").focus(); return; }
      const p = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), w: WALL, ts: Date.now(), f, foto };
      try { await fPut(p); } catch (er) { alert(T("Speichern ging nicht – ist der Handy-Speicher voll?", "Saving failed – is the phone storage full?")); return; }
      stop(); el.remove(); showFB(p);
    });
  }

  // ---------- 🎉 Veranstaltungstipps ----------
  const EK2 = "klowand-tipps-" + WALL;
  function openEvents() {
    const ort = ls.get(WK, { name: "Leipzig" }).name.replace(/^Mein Standort$|^My location$/, "in meiner Nähe");
    const q = s => "https://www.google.com/search?q=" + encodeURIComponent(s);
    const el = box(`🎉 ${T("Veranstaltungstipps", "Event tips")}`, `<h3>${T("Eure Tipps", "Your tips")}</h3><ul class="evl" id="xeL"></ul>
      <form class="xform" id="xeF"><input id="xeN" maxlength="50" placeholder="${T("Was? z. B. Weihnachtsmarkt", "What? e.g. Christmas market")}" aria-label="${T("Was", "What")}">
        <div class="r"><input id="xeD" type="date" aria-label="${T("Datum", "Date")}"><input id="xeO" maxlength="40" placeholder="${T("Wo?", "Where?")}" aria-label="${T("Wo", "Where")}"></div>
        <button type="submit" class="btn primary">＋ ${T("Tipp eintragen", "Add tip")}</button></form>
      <h3>${T("Was ist los", "What's on")} ${esc(/^in /.test(ort) ? ort : (T("in ", "in ") + ort))}?</h3>
      <div class="links">
        <a href="${q("Veranstaltungen " + ort + " heute")}" target="_blank" rel="noopener">📅 ${T("Heute", "Today")}</a>
        <a href="${q("Veranstaltungen " + ort + " Wochenende")}" target="_blank" rel="noopener">🎈 ${T("Am Wochenende", "This weekend")}</a>
        <a href="${q("Konzerte " + ort)}" target="_blank" rel="noopener">🎸 ${T("Konzerte", "Concerts")}</a>
        <a href="${q("Kinder Veranstaltungen " + ort)}" target="_blank" rel="noopener">🧸 ${T("Für Kinder & Familien", "For kids & families")}</a>
        <a href="${q("Weihnachtsmarkt " + ort)}" target="_blank" rel="noopener">🎄 ${T("Weihnachtsmarkt", "Christmas market")}</a>
      </div><p class="src">${T("Die Links öffnen eine Websuche. Den Ort stellst du beim Wetter ein.", "The links open a web search. Set the place in Weather.")}</p>`);
    const draw = () => {
      const all = ls.get(EK2, []).sort((a, b) => (a.d || "9").localeCompare(b.d || "9")), today = ymd(new Date());
      el.querySelector("#xeL").innerHTML = all.length ? all.map(e => `<li${e.d && e.d < today ? ' style="opacity:.5"' : ""}><span class="e">🎉</span><span class="tx">${esc(e.n)}<small>${e.d ? new Date(e.d + "T12:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }) : ""}${e.o ? " · " + esc(e.o) : ""}</small></span><button type="button" data-del="${e.id}" aria-label="${T("Löschen", "Delete")}">✕</button></li>`).join("")
        : `<li style="justify-content:center;color:var(--muted);font-size:.95rem">${T("Noch keine Tipps. Trag unten euren ersten ein!", "No tips yet. Add your first below!")}</li>`;
    };
    el.addEventListener("click", e => { const d = e.target.closest("[data-del]"); if (d) { ls.set(EK2, ls.get(EK2, []).filter(x => x.id !== d.dataset.del)); draw(); } });
    el.querySelector("#xeF").addEventListener("submit", e => {
      e.preventDefault(); const n = clean(el.querySelector("#xeN").value).slice(0, 50); if (n.length < 2) { el.querySelector("#xeN").focus(); return; }
      const all = ls.get(EK2, []); all.push({ id: Date.now().toString(36), n, d: el.querySelector("#xeD").value || "", o: clean(el.querySelector("#xeO").value).slice(0, 40) }); ls.set(EK2, all);
      e.target.reset(); draw();
      // Gleich in den Kalender übernehmen
      const last = all[all.length - 1]; if (last.d) { const c = ls.get(CK, []); c.push({ id: "t" + last.id, d: last.d, t: "", n: last.n + (last.o ? " (" + last.o + ")" : ""), e: "🎉" }); ls.set(CK, c); badge(); }
    });
    draw();
  }

  // ---------- Knöpfe ins Menü ----------
  function badge() { const b = document.getElementById("xCal"); if (!b) return; const n = todayCount(); let s = b.querySelector(".badge"); if (n) { if (!s) { s = document.createElement("i"); s.className = "badge"; b.appendChild(s); } s.textContent = n; } else if (s) s.remove(); }
  function mount() {
    let fb = document.querySelector(".fambar");
    if (!fb) {   // Wände ohne Familien-Bereich: eigener kleiner Kasten
      fb = document.createElement("div"); fb.className = "fambar"; fb.innerHTML = `<b>${T("Extras", "Extras")}</b>`;
      const after = document.querySelector(".demobar") || document.querySelector(".plate"); after.after(fb);
    }
    if (fb.querySelector(".xbar")) return;
    const x = document.createElement("div"); x.className = "xbar";
    x.innerHTML = `<button type="button" class="cal" id="xCal"><span>📅</span>${T("Kalender", "Calendar")}</button><button type="button" class="wet" id="xWet"><span>⛅</span>${T("Wetter", "Weather")}</button>
      <button type="button" class="fb" id="xFb"><span>📖</span>${T("Freundebuch", "Friends book")}</button><button type="button" class="ev" id="xEv"><span>🎉</span>${T("Tipps", "Events")}</button>`;
    const sos = fb.querySelector(".sos"); sos ? sos.before(x) : fb.appendChild(x);
    const over = () => typeof kloDemo !== "undefined" && kloDemo.over && kloDemo.over();
    const g = fn => () => { if (over()) { window.kloUpsell && kloUpsell("trial"); return; } fn(); };
    document.getElementById("xCal").onclick = g(openCal); document.getElementById("xWet").onclick = g(openWeather);
    document.getElementById("xFb").onclick = g(openFB); document.getElementById("xEv").onclick = g(openEvents);
    if (over()) x.querySelectorAll("button").forEach(b => b.classList.add("locked"));
    badge();
  }
  // familie-app.js baut den Kasten evtl. erst nach dem Laden – kurz warten
  let tries = 0; (function wait() { if (document.querySelector(".fambar") || ++tries > 10) mount(); else setTimeout(wait, 150); })();
})();
