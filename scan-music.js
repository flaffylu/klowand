/* Musik beim Scannen: Wer über den Flyer-QR-Code kommt, hört gleich das Klo-Wand-Lied.
   Handys erlauben Ton oft erst nach der ersten Berührung, dann startet es beim ersten Tippen. */
window.kloScanSong = function (opt) {
  opt = opt || {};
  if (window.__kloSong) return;
  const a = new Audio("assets/scan-song.mp3"); a.loop = true; a.volume = 0.7; a.preload = "auto";
  window.__kloSong = a;
  const css = document.createElement("style");
  css.textContent = `.songpill{position:fixed;right:12px;bottom:calc(200px + env(safe-area-inset-bottom,0px));z-index:28;display:flex;align-items:center;gap:8px;min-height:46px;padding:0 16px;border-radius:999px;
    border:2px solid #ff3ea5;background:rgba(11,7,22,.88);color:#fff;font:700 1rem "Barlow Condensed",system-ui,sans-serif;box-shadow:0 0 18px rgba(255,62,165,.55);cursor:pointer}
  .songpill.off{border-color:rgba(255,255,255,.3);box-shadow:none;opacity:.85}
  .songpill .eq{display:inline-flex;gap:2px;align-items:flex-end;height:14px}
  .songpill .eq i{width:3px;background:#ff3ea5;animation:sp .9s ease-in-out infinite}
  .songpill .eq i:nth-child(2){animation-delay:.2s}.songpill .eq i:nth-child(3){animation-delay:.4s}
  .songpill.off .eq i{animation:none;height:4px}
  @keyframes sp{0%,100%{height:4px}50%{height:14px}}
  @media (prefers-reduced-motion:reduce){.songpill .eq i{animation:none;height:8px}}`;
  document.head.appendChild(css);
  const pill = document.createElement("button"); pill.type = "button"; pill.className = "songpill off";
  pill.innerHTML = `<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="t">🔊 Tippen für Musik</span>`;
  if (opt.bottom != null) pill.style.bottom = `calc(${opt.bottom}px + env(safe-area-inset-bottom,0px))`;
  document.body.appendChild(pill);
  const show = () => { const on = !a.paused; pill.classList.toggle("off", !on); pill.querySelector(".t").textContent = on ? "Musik aus" : (started ? "🔊 Musik an" : "🔊 Tippen für Musik"); pill.setAttribute("aria-pressed", on); };
  let started = false;
  const go = () => a.play().then(() => { started = true; show(); }).catch(() => show());
  a.addEventListener("play", show); a.addEventListener("pause", show);
  // Handys erlauben Ton erst nach einer Berührung. Klappt der Sofortstart nicht, kommt ein großer Start-Knopf.
  const EV = ["pointerup", "touchend", "click", "keydown"];
  let splash = null;
  const done = () => { EV.forEach(t => document.removeEventListener(t, first, true)); if (splash) { splash.remove(); splash = null; } };
  const first = e => {
    if (e && e.target && e.target.closest && e.target.closest(".songpill")) { done(); return; }
    if (started || !a.paused) { done(); return; }
    a.play().then(() => { started = true; show(); done(); }).catch(() => {});
  };
  EV.forEach(t => document.addEventListener(t, first, true));
  a.play().then(() => { started = true; show(); done(); }).catch(() => {
    if (opt.splash === false) return;
    const st = document.createElement("style");
    st.textContent = `.songsplash{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;
      background:radial-gradient(circle at 50% 42%,rgba(70,12,52,.97),rgba(6,3,13,.98) 65%);color:#fff;font-family:"Barlow Condensed",system-ui,sans-serif;cursor:pointer}
      .songsplash b{font:400 2.4rem/1.05 "Permanent Marker",cursive;color:#ffd166;text-shadow:0 0 18px rgba(255,209,102,.5)}
      .songsplash span{display:inline-flex;align-items:center;gap:10px;min-height:64px;padding:0 30px;border-radius:999px;background:#ff3ea5;color:#14060f;font:800 1.4rem "Barlow Condensed",system-ui,sans-serif;box-shadow:0 0 30px rgba(255,62,165,.6);animation:spp 1.4s ease-in-out infinite}
      .songsplash small{font:600 1rem "Barlow Condensed",system-ui,sans-serif;opacity:.8}
      @keyframes spp{50%{transform:scale(1.06)}} @media (prefers-reduced-motion:reduce){.songsplash span{animation:none}}`;
    document.head.appendChild(st);
    splash = document.createElement("button"); splash.type = "button"; splash.className = "songsplash"; splash.setAttribute("aria-label", "Antippen: Musik an und los geht's");
    splash.innerHTML = `<b>Willkommen an der Klo-Wand!</b><span>🔊 Tippen – Musik an &amp; los</span><small>Ohne Ton? Einfach unten rechts „Musik aus“ tippen.</small>`;
    splash.addEventListener("click", () => { a.play().then(() => { started = true; show(); }).catch(() => {}); done(); });
    document.body.appendChild(splash);
  });
  pill.onclick = () => { if (a.paused) { go(); } else a.pause(); };
  // Andere Musik startet: Lied pausieren
  window.addEventListener("klo-othermusic", () => a.pause());
};
