/* Klo-Wand: Sprache. Deutsch für deutschsprachige Handys, sonst Englisch.
   ?lang=en oder ?lang=de in der Adresse gilt nur für diesen Besuch (zum Testen).
   Der Knopf „English / Deutsch“ unten auf der Seite merkt sich die Wahl dauerhaft. */
const LANG = (() => {
  try {
    localStorage.removeItem("klowand-lang");   // alte Einstellung, die ein Test-Link dauerhaft gesetzt hatte
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "de" || p === "en" || p === "ja") { sessionStorage.setItem("klowand-lang", p); return p; }
    const s = sessionStorage.getItem("klowand-lang") || localStorage.getItem("klowand-sprache");
    if (s === "de" || s === "en" || s === "ja") return s;
  } catch (e) {}
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "de"]);
  // Deutsch, sobald Deutsch irgendwo in den Spracheinstellungen des Handys steht, dann Japanisch, sonst Englisch
  if (langs.some(l => /^de\b/i.test(l || ""))) return "de";
  if (langs.some(l => /^ja\b/i.test(l || ""))) return "ja";
  return "en";
})();
const JA = LANG === "ja";
const EN = LANG !== "de";   // Englisch ist die Grundlage für alle Sprachen außer Deutsch
/* tr("Deutsch", "English", "日本語") gibt den Text in der passenden Sprache zurück.
   Ohne japanischen Text wird er aus JA_TEXT (lang-ja.js) gesucht, sonst Englisch. */
const tr = (de, en, ja) => !EN ? de : !JA ? en : (ja !== undefined ? ja : ((typeof JA_TEXT !== "undefined" && JA_TEXT[en]) || en));
document.documentElement.lang = LANG;
/* Feste Texte im HTML übersetzen: [CSS-Selektor, Eigenschaft, englischer Text] */
function translateStatic(list) {
  if (!EN) return;
  list.forEach(([sel, prop, val]) => document.querySelectorAll(sel).forEach(el => {
    const v = JA && typeof JA_TEXT !== "undefined" && JA_TEXT[val] ? JA_TEXT[val] : val;
    if (prop === "text") el.textContent = v; else el.setAttribute(prop, v);
  }));
}
/* Sprache umschalten und merken */
function switchLang(next) {
  try { localStorage.setItem("klowand-sprache", next); sessionStorage.removeItem("klowand-lang"); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete("lang"); location.replace(u.href);
}
/* Knöpfe zum Umschalten in die anderen Sprachen, z. B. in der Fußzeile */
const LANG_NAMES = { de: "Deutsch", en: "English", ja: "日本語" };
const langButton = () => Object.keys(LANG_NAMES).filter(k => k !== LANG)
  .map(k => `<a href="#" onclick="switchLang('${k}');return false" lang="${k}">${LANG_NAMES[k]}</a>`).join(" ");
