/* Klo-Wand: anonymer Besucherzähler für die Infoseiten.
   Zählt pro Seite und Tag nur eine Zahl hoch, einmal pro Besuch. Keine Cookies, keine personenbezogenen Daten. */
(function () {
  try {
    const page = document.documentElement.dataset.stat;
    if (!page || typeof firebase === "undefined" || typeof firebaseConfig === "undefined") return;
    const key = "klowand-stat-" + page;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    firebase.firestore().collection("stats").doc(page + "_" + day)
      .set({ n: firebase.firestore.FieldValue.increment(1) }, { merge: true }).catch(() => {});
  } catch (e) {}
})();
