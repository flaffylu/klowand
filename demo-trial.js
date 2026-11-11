/* Demo-Probezeit: Wer die Demo scannt, hat 4 Tage lang alles frei.
   Danach bleiben kostenlos: Schreiben (150 Sätze), Malen und der Chill-Raum. Alles andere gibt's mit eigener Wand.
   Gezählt wird nur auf diesem Handy. */
window.KloTrial = (function () {
  const DAY = 864e5, DAYS = 4, MSG = 150, KS = "klowand-trial-start", KN = "klowand-trial-n";
  const g = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const s = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let mem = 0;
  function start() { let t = parseInt(g(KS) || "0", 10) || mem; if (!t) { t = Date.now(); s(KS, String(t)); } mem = t; return t; }
  // Bonus-Tage für eingeladene Freunde (höchstens 7)
  const bonus = () => Math.min(7, Math.max(0, parseInt(g("klowand-trial-bonus") || "0", 10) || 0));
  const all = () => DAYS + bonus();
  const T = {
    DAYS, MSG, start, bonus,
    setBonus(n) { s("klowand-trial-bonus", String(Math.min(7, Math.max(bonus(), n | 0)))); window.dispatchEvent(new Event("klo-demo")); },
    over() { return Date.now() - start() >= all() * DAY; },
    daysLeft() { return Math.max(0, Math.ceil((start() + all() * DAY - Date.now()) / DAY)); },
    used() { return Math.max(0, parseInt(g(KN) || "0", 10) || 0); },
    left() { return Math.max(0, MSG - T.used()); },
    canWrite() { return !T.over() || T.left() > 0; },
    use() { if (T.over()) s(KN, String(T.used() + 1)); window.dispatchEvent(new Event("klo-demo")); },
    // Was bleibt nach der Probezeit frei?
    free(feature) { return !T.over() || ["write", "draw", "chill"].includes(feature); }
  };
  return T;
})();
