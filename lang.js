/* Klo-Wand: Sprache. Deutsch für deutschsprachige Handys, sonst Englisch.
   ?lang=en oder ?lang=de in der Adresse gilt nur für diesen Besuch (zum Testen).
   Der Knopf „English / Deutsch“ unten auf der Seite merkt sich die Wahl dauerhaft. */
const LANG = (() => {
  try {
    localStorage.removeItem("klowand-lang");   // alte Einstellung, die ein Test-Link dauerhaft gesetzt hatte
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "de" || p === "en") { sessionStorage.setItem("klowand-lang", p); return p; }
    const s = sessionStorage.getItem("klowand-lang") || localStorage.getItem("klowand-sprache");
    if (s === "de" || s === "en") return s;
  } catch (e) {}
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "de"]);
  // Deutsch, sobald Deutsch irgendwo in den Spracheinstellungen des Handys steht
  return langs.some(l => /^de\b/i.test(l || "")) ? "de" : "en";
})();
const EN = LANG === "en";
/* tr("Deutsch", "English") gibt den Text in der passenden Sprache zurück */
const tr = (de, en) => (EN ? en : de);
document.documentElement.lang = LANG;
/* Feste Texte im HTML übersetzen: [CSS-Selektor, Eigenschaft, englischer Text] */
function translateStatic(list) {
  if (!EN) return;
  list.forEach(([sel, prop, val]) => document.querySelectorAll(sel).forEach(el => {
    if (prop === "text") el.textContent = val; else el.setAttribute(prop, val);
  }));
}
/* Sprache umschalten und merken */
function switchLang() {
  const next = EN ? "de" : "en";
  try { localStorage.setItem("klowand-sprache", next); sessionStorage.removeItem("klowand-lang"); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete("lang"); location.replace(u.href);
}
/* Knopf zum Umschalten, z. B. in der Fußzeile */
const langButton = () => `<a href="#" onclick="switchLang();return false" lang="${EN ? "de" : "en"}">${EN ? "Deutsch" : "English"}</a>`;
