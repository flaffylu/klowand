/* Klo-Wand: Benachrichtigung an den Betreiber, wenn jemand die App öffnet.
   Pro Handy höchstens einmal am Tag. Geschickt werden nur Wand, neu/wieder, Web/App, iPhone/Android – keine Namen, keine Inhalte.
   Eigene Handys zählen nicht: einmal index.html?nichtzaehlen=1 öffnen (zurück mit ?nichtzaehlen=0). */
(function () {
  if (typeof NTFY_TOPIC === "undefined" || !NTFY_TOPIC || typeof WALL === "undefined") return;
  const q = new URLSearchParams(location.search), g = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, s = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  if (q.get("nichtzaehlen") === "1") { s("klowand-nichtzaehlen", "1"); return; }
  if (q.get("nichtzaehlen") === "0") { try { localStorage.removeItem("klowand-nichtzaehlen"); } catch (e) {} }
  if (g("klowand-nichtzaehlen") === "1" || navigator.webdriver) return;
  const d = new Date(), day = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  if (g("klowand-besuch-tag") === day) return;
  const neu = !g("klowand-besuch-tag"); s("klowand-besuch-tag", day);
  const ua = navigator.userAgent, os = /iPhone|iPad|iPod|Macintosh.*Mobile/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : "PC";
  const app = typeof KLO_APP !== "undefined" && KLO_APP ? "Play-App" : "Web";
  const name = (typeof info !== "undefined" && info && info.name) ? info.name : WALL;
  const ref = q.get("ref") ? " · über Einladung" : (/scan|qr/i.test(q.get("from") || "") ? " · per QR-Code" : "");
  const msg = `${neu ? "🆕 Neuer Besucher" : "👋 Besucher ist wieder da"} auf „${name}“ · ${os} · ${app}${ref} · ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`;
  const url = "https://ntfy.sh/" + encodeURIComponent(NTFY_TOPIC) + "?title=" + encodeURIComponent("Klo-Wand: Besuch") + "&tags=" + (neu ? "tada" : "eyes");
  setTimeout(() => { try { fetch(url, { method: "POST", body: msg, mode: "no-cors", keepalive: true }).catch(() => {}); } catch (e) {} }, 1500);
})();
