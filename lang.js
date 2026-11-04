/* Klo-Wand: Sprache. Deutsch für deutschsprachige Handys, sonst Englisch.
   Umschalten per Adresse: ?lang=en oder ?lang=de (wird gemerkt). */
const LANG = (() => {
  try {
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "de" || p === "en") { localStorage.setItem("klowand-lang", p); return p; }
    const s = localStorage.getItem("klowand-lang");
    if (s === "de" || s === "en") return s;
  } catch (e) {}
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "de"]);
  return /^de\b/i.test(langs[0] || "de") ? "de" : "en";
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
