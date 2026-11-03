/* Füllt Impressum und Datenschutz mit den Angaben aus config.js. Fehlende Angaben werden gelb markiert. */
(function () {
  const PH = { name: "[Dein Name]", strasse: "[Straße und Hausnummer]", ort: "[PLZ Ort]", email: "[E-Mail-Adresse]", telefon: "[Telefonnummer]" };
  const data = (typeof IMPRESSUM !== "undefined" && IMPRESSUM) || {};
  document.querySelectorAll("[data-k]").forEach(el => {
    const k = el.dataset.k, v = (data[k] || "").trim();
    el.textContent = v || PH[k] || "";
    if (!v) el.classList.add("ph");
  });
  // Telefon ist freiwillig, wenn eine E-Mail-Adresse da ist
  const tel = document.getElementById("telZeile");
  if (tel && !(data.telefon || "").trim() && (data.email || "").trim()) tel.hidden = true;
})();
