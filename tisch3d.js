/* Klo-Wand Chill-Raum: Poker- und Roulette-Tisch in 3D (three.js r128).
   Die Spielregeln bleiben in chill.html – hier wird nur gezeichnet. Das 3D-Bild wird in die Spielfläche (880×880) kopiert,
   Namen und Zahlen kommen scharf als 2D darüber. Ohne WebGL fällt chill.html auf das alte 2D-Bild zurück. */
(function () {
  if (typeof THREE === "undefined") return;
  const Z = 880; let R = null, cv = null;
  try { cv = document.createElement("canvas"); cv.width = cv.height = Z;
    R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, alpha: false });
    R.setPixelRatio(1); R.setSize(Z, Z, false); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;
  } catch (e) { R = null; }
  if (!R) return;
  // Handy schaltet die 3D-Grafik ab (z. B. zu wenig Speicher): auf das flache Bild umschalten und später neu aufbauen
  let lost = false, lastR = 0, lastS = "";
  cv.addEventListener("webglcontextlost", e => { e.preventDefault(); lost = true; }, false);
  cv.addEventListener("webglcontextrestored", () => { lost = false; P = null; Q = null; lastR = 0; lastS = ""; }, false);

  const ctex = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const ease = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
  const now = () => performance.now();

  // Gemeinsames: Holz, Leder, Filz
  const woodTex = ctex(512, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#6b3a1a"); g.addColorStop(.5, "#8a4f24"); g.addColorStop(1, "#5a2f14"); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { x.strokeStyle = `rgba(40,18,6,${.08 + Math.random() * .15})`; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.bezierCurveTo(w * .3, y + Math.random() * 10 - 5, w * .6, y + Math.random() * 10 - 5, w, y + Math.random() * 6 - 3); x.stroke(); } });
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(6, 1);
  const feltTex = (base, logo) => ctex(1024, 1024, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * .62); g.addColorStop(0, base[0]); g.addColorStop(1, base[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const id = x.getImageData(0, 0, w, h), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; } x.putImageData(id, 0, 0);
    if (logo) { x.globalAlpha = .13; x.fillStyle = "#fff"; x.textAlign = "center"; x.font = '400 92px "Permanent Marker", cursive'; x.fillText(logo, w / 2, h * .73); x.globalAlpha = 1; } });
  const woodM = std({ map: woodTex, roughness: .55, metalness: .05 });
  const leatherM = std({ color: "#2a1410", roughness: .45, metalness: .05 });
  const goldM = std({ color: "#d9b44a", roughness: .28, metalness: .85 });

  function stage(bg) { const sc = new THREE.Scene(); sc.background = new THREE.Color(bg); sc.fog = new THREE.Fog(bg, 14, 26);
    sc.add(new THREE.HemisphereLight("#ffe7c2", "#20102a", .55));
    const sp = new THREE.SpotLight("#fff1d6", 1.25, 30, .75, .55, 1.2); sp.position.set(0, 11, 2.5); sp.target.position.set(0, 0, .3); sp.castShadow = true; sp.shadow.mapSize.set(768, 768); sp.shadow.bias = -.0004; sc.add(sp, sp.target);
    const rim = new THREE.PointLight("#ff4fa3", .35, 18, 2); rim.position.set(-6, 3, -4); sc.add(rim); const rim2 = new THREE.PointLight("#4cc9ff", .3, 18, 2); rim2.position.set(6, 3, -4); sc.add(rim2);
    return sc; }

  // Spielchips: Stapel nach Wert (500 lila, 100 schwarz, 25 grün, 5 rot, 1 weiß)
  const DEN = [[500, "#7b3fc4"], [100, "#1b1620"], [25, "#1f9d55"], [5, "#d0253f"], [1, "#f2efe6"]];
  const chipSide = {}, chipTop = {};
  function chipMats(col) { if (!chipSide[col]) { chipSide[col] = std({ map: ctex(256, 32, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.fillStyle = "#fff"; for (let i = 0; i < 8; i++) x.fillRect(i * w / 8 + 6, 0, 12, h); }), roughness: .45 });
      chipTop[col] = std({ map: ctex(128, 128, (x, w) => { x.fillStyle = col; x.fillRect(0, 0, w, w); x.strokeStyle = "#fff"; x.lineWidth = 10; x.setLineDash([16, 14]); x.beginPath(); x.arc(64, 64, 54, 0, 7); x.stroke(); x.setLineDash([]); x.lineWidth = 3; x.beginPath(); x.arc(64, 64, 34, 0, 7); x.stroke(); }), roughness: .4 }); }
    return [chipSide[col], chipTop[col], chipTop[col]]; }
  const chipGeo = new THREE.CylinderGeometry(.2, .2, .055, 28);
  function stackColors(a, max) { const out = []; for (const [v, c] of DEN) while (a >= v && out.length < (max || 14)) { out.push(c); a -= v; } return out.length ? out : [DEN[4][1]]; }
  function makeStack(a, colOverride, max) { const g = new THREE.Group(); const cols = colOverride ? Array(Math.min(max || 10, Math.max(1, Math.round(Math.log2(a / 5 + 1)) + 1))).fill(colOverride) : stackColors(a, max);
    cols.slice().reverse().forEach((c, i) => { const m = new THREE.Mesh(chipGeo, chipMats(c)); m.position.y = .03 + i * .057; m.rotation.y = i * .7; m.castShadow = true; g.add(m); }); return g; }

  // 2D-Schild (scharf, nach dem 3D-Bild)
  function plate(x, cx, cy, t1, t2, on, won, dot) { x.font = '700 30px "Barlow Condensed"'; const w = Math.max(x.measureText(t1).width, x.measureText(t2 || "").width) + (dot ? 56 : 36), h = t2 ? 66 : 42;
    x.fillStyle = won ? "#c6ff6a" : on ? "#fff" : "rgba(14,8,24,.86)"; x.strokeStyle = won ? "#c6ff6a" : on ? "#ffd166" : "rgba(255,255,255,.18)"; x.lineWidth = on ? 4 : 2;
    cx = Math.max(w / 2 + 8, Math.min(Z - w / 2 - 8, cx)); x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, 14); x.fill(); x.stroke();
    if (on || won) { x.shadowColor = won ? "#c6ff6a" : "#ffd166"; x.shadowBlur = 24; x.stroke(); x.shadowBlur = 0; }
    const ox = dot ? 12 : 0; if (dot) { x.fillStyle = dot; x.beginPath(); x.arc(cx - w / 2 + 22, cy, 9, 0, 7); x.fill(); }
    x.textAlign = "center"; x.fillStyle = won || on ? "#14111c" : "#fff"; x.fillText(t1, cx + ox, cy + (t2 ? -4 : 10));
    if (t2) { x.font = '700 25px "Barlow Condensed"'; x.fillStyle = won || on ? "#4a3600" : "#ffc867"; x.fillText(t2, cx + ox, cy + 24); } }
  const v3 = new THREE.Vector3();
  const proj = (cam, x, y, z) => { v3.set(x, y, z).project(cam); return [(v3.x + 1) / 2 * Z, (1 - v3.y) / 2 * Z]; };

  /* ================= POKER ================= */
  let P = null;
  function buildPoker() { const sc = stage("#140b22"), RX = 4.1, RZ = 2.75;
    const oval = (r, h, m, y) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 72), m); o.scale.set(RX, 1, RZ); o.position.y = y; o.receiveShadow = true; o.castShadow = true; sc.add(o); return o; };
    oval(1.05, .5, woodM, -.3); const ft = feltTex(["#1f8a53", "#0d4a2b"], "KLO-WAND"); ft.center.set(.5, .5); ft.rotation = Math.PI / 2; const fm = std({ map: ft, roughness: .95 }); const felt = oval(.95, .06, fm, -.02); felt.material = [std({ color: "#0d4a2b" }), fm, fm];
    const rail = new THREE.Mesh(new THREE.TorusGeometry(1, .075, 18, 96), leatherM); rail.scale.set(RX * 1.0, RZ * 1.0, 1.6); rail.rotation.x = Math.PI / 2; rail.position.y = .06; rail.castShadow = true; sc.add(rail);
    const line = new THREE.Mesh(new THREE.TorusGeometry(1, .006, 6, 96), new THREE.MeshBasicMaterial({ color: "#ffe9a8", transparent: true, opacity: .35 })); line.scale.set(RX * .72, RZ * .66, 1); line.rotation.x = Math.PI / 2; line.position.y = .015; sc.add(line);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.5, .9, 2.4, 24), woodM); leg.position.y = -1.7; sc.add(leg);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 48), std({ color: "#2a1630", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.9; floor.receiveShadow = true; sc.add(floor);
    const cam = new THREE.PerspectiveCamera(40, 1, .1, 60); cam.position.set(0, 7.2, 7.1); cam.lookAt(0, -.2, .35);
    const dyn = new THREE.Group(); sc.add(dyn);
    const dealer = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .07, 28), [std({ color: "#eee" }), std({ map: ctex(128, 128, (x, w) => { x.fillStyle = "#fff"; x.fillRect(0, 0, w, w); x.fillStyle = "#14111c"; x.font = '800 86px "Barlow Condensed"'; x.textAlign = "center"; x.fillText("D", 64, 96); }) }), std({ color: "#ddd" })]);
    dealer.castShadow = true; sc.add(dealer);
    P = { sc, cam, dyn, dealer, RX, RZ, cardT: {}, back: null, seen: {}, key: "" }; }

  const cardGeo = new THREE.BoxGeometry(.62, .016, .88);
  function cardTex(c, RK, SU) { if (P.cardT[c]) return P.cardT[c];
    const red = Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2, col = red ? "#d01c3a" : "#14111c", rk = RK[c % 13], su = SU[Math.floor(c / 13)];
    const t = ctex(176, 248, (x, w, h) => { x.fillStyle = "#fbfaf6"; x.beginPath(); x.roundRect(0, 0, w, h, 18); x.fill(); x.strokeStyle = "#d9d3c4"; x.lineWidth = 3; x.stroke();
      x.fillStyle = col; x.textAlign = "center"; x.font = '800 54px "Barlow Condensed", sans-serif'; x.fillText(rk, 32, 56); x.font = '40px sans-serif'; x.fillText(su, 32, 98);
      x.save(); x.translate(w - 32, h - 56); x.rotate(Math.PI); x.font = '800 54px "Barlow Condensed", sans-serif'; x.fillText(rk, 0, 0); x.font = '40px sans-serif'; x.fillText(su, 0, -42); x.restore();
      x.font = '110px sans-serif'; x.fillText(su, w / 2, h / 2 + 38); });
    return (P.cardT[c] = t); }
  function backTex() { return P.back || (P.back = ctex(176, 248, (x, w, h) => { x.fillStyle = "#7a2340"; x.beginPath(); x.roundRect(0, 0, w, h, 18); x.fill();
    x.strokeStyle = "rgba(255,200,103,.75)"; x.lineWidth = 6; x.strokeRect(16, 16, w - 32, h - 32); x.globalAlpha = .35; for (let i = -h; i < w; i += 18) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); } x.globalAlpha = 1;
    x.fillStyle = "#ffd166"; x.font = '400 40px "Permanent Marker"'; x.textAlign = "center"; x.fillText("Klo", w / 2, h / 2 + 14); })); }
  const edgeM = std({ color: "#f2efe6", roughness: .6 });
  const matC = {};
  const faceM = (key, tex, dim) => matC[key] || (matC[key] = std({ map: tex, roughness: .55, transparent: !!dim, opacity: dim ? .45 : 1 }));
  function card(c, up, RK, SU, dim) { const d = dim ? 1 : 0, key = (up ? c : "b") + "|" + d;
    const mats = matC["set" + key] || (matC["set" + key] = [edgeM, edgeM, faceM(key, up ? cardTex(c, RK, SU) : backTex(), dim), faceM("b|" + d, backTex(), dim), edgeM, edgeM]);
    const m = new THREE.Mesh(cardGeo, mats); m.castShadow = true; return m; }
  const slotGeo = new THREE.PlaneGeometry(.62, .88), slotM = new THREE.MeshBasicMaterial({ color: "#fff", transparent: true, opacity: .09 });
  const puckGeo = new THREE.SphereGeometry(.26, 20, 14);
  const puckM = (col, glow) => matC["pk" + col + glow] || (matC["pk" + col + glow] = std({ color: col, roughness: .35, emissive: col, emissiveIntensity: glow ? .6 : .12 }));
  // Karten fliegen beim ersten Auftauchen vom Geber herein
  function deal(m, key, tx, ty, tz, ry, rx, from) { const t0 = P.seen[key] || (P.seen[key] = now()), k = ease((now() - t0) / 420); if (k < 1) P.moving = now();
    m.position.set(from[0] + (tx - from[0]) * k, ty + Math.sin(k * Math.PI) * .9, from[2] + (tz - from[2]) * k); m.rotation.set(rx || 0, ry || 0, (1 - k) * Math.PI); }

  function poker(x, S, H) { if (lost) return false; if (!P) buildPoker();
    const { device, nm, PC, RK, SU, START } = H, dyn = P.dyn; while (dyn.children.length) dyn.remove(dyn.children[0]);
    const n = S.p.length, mine = S.p.findIndex(p => p.id === device && !p.bot), base = mine >= 0 ? mine : 0, pot = (S.tot || []).reduce((a, c) => a + c, 0);
    const handKey = (S.hn || 0) + ":" + (S.dl || 0); if (P.key !== handKey) { P.key = handKey; P.seen = {}; }
    const seat = i => { const k = (i - base + n) % n, a = Math.PI / 2 + k * Math.PI * 2 / Math.max(n, 2); return [Math.cos(a), Math.sin(a), a]; };
    const dl = S.dl >= 0 && S.p[S.dl] ? seat(S.dl) : [0, -1], from = [dl[0] * P.RX * .8, 0, dl[1] * P.RZ * .8];
    // Tischkarten
    for (let k = 0; k < 5; k++) { const cx = (k - 2) * .74;
      if (S.board && S.board[k] != null) { const m = card(S.board[k], true, RK, SU); deal(m, "b" + k + ":" + S.board[k], cx, .06, -.15, 0, 0, from); dyn.add(m); }
      else { const m = new THREE.Mesh(slotGeo, slotM); m.rotation.x = -Math.PI / 2; m.position.set(cx, .02, -.15); dyn.add(m); } }
    if (S.st === "play" && S.stage < 5 && pot) { const g = makeStack(pot, null, 16); g.position.set(0, 0, .95); dyn.add(g); }
    const labels = [];
    S.p.forEach((p, i) => { const [c, s] = seat(i), me = i === mine;
      const px = c * P.RX * .66, pz = s * P.RZ * .62, h = (S.hole || [])[i] || [], show = me || (S.sd && !S.fold[i]);
      if (h.length && S.st !== "wait") h.forEach((cd, j) => { const m = card(cd, show, RK, SU, S.fold[i]);
        if (me) { deal(m, "h" + i + j + ":" + cd, (j - .5) * .74, .35 + j * .03, P.RZ * .72, (j - .5) * -.14, .5, from); m.scale.setScalar(1.3); }
        else deal(m, "h" + i + j + ":" + cd, px + (j - .5) * .42, .05 + j * .02, pz, -Math.atan2(c, s) + (j - .5) * .22, 0, from);
        dyn.add(m); });
      if (S.bet && S.bet[i]) { const g = makeStack(S.bet[i]); g.position.set(c * P.RX * .43, 0, s * P.RZ * .4); dyn.add(g); }
      if (i === S.dl && S.st === "play") P.dealer.position.set(c * P.RX * .62 + s * .5, .04, s * P.RZ * .62 - c * .4);
      const on = S.st === "play" && S.stage <= 3 && i === S.turn, won = S.stage === 5 && (S.win || []).includes(i);
      // Spieler-Puck mit Farbe hinter der Bande
      const pk = new THREE.Mesh(puckGeo, puckM(PC[p.c], on || won ? 1 : 0));
      pk.position.set(c * P.RX * 1.13, .25 + (on ? Math.sin(now() / 220) * .08 : 0), s * P.RZ * 1.15); pk.castShadow = true; dyn.add(pk);
      labels.push([c * P.RX * 1.13, .3, s * P.RZ * 1.15 + (s > .5 ? -.05 : 0), nm(p).slice(0, 12) + (me ? " (du)" : ""), `${S.chips && S.chips[i] != null ? S.chips[i] : START} 🪙${S.bet && S.bet[i] ? ` · Einsatz ${S.bet[i]}` : ""}`, on, won, PC[p.c], s > .5]); });
    P.dealer.visible = S.st === "play" && S.dl >= 0;
    const t = now(), anim = t - (P.moving || 0) < 120 || S.st === "play" && S.stage <= 3;
    if (t - lastR >= (anim ? 33 : 250) || lastS !== "p") { R.render(P.sc, P.cam); lastR = t; lastS = "p"; }
    x.drawImage(cv, 0, 0, Z, Z);
    labels.forEach(([lx, ly, lz, t1, t2, on, won, col, front]) => { const [sx, sy] = proj(P.cam, lx, ly, lz); plate(x, Math.max(110, Math.min(Z - 110, sx)), Math.min(Z - 40, sy + (front ? 0 : -64)), t1, t2, on, won, col); });
    x.textAlign = "center";
    if (S.st === "play" && S.stage < 5 && pot) { const [sx, sy] = proj(P.cam, .75, .1, .95); x.textAlign = "left"; x.font = '800 34px "Barlow Condensed"'; x.lineWidth = 6; x.strokeStyle = "rgba(0,0,0,.7)"; x.strokeText(`Pot: ${pot} 🪙`, sx, sy + 10); x.fillStyle = "#ffd166"; x.fillText(`Pot: ${pot} 🪙`, sx, sy + 10); x.textAlign = "center"; }
    if (S.st === "wait") { x.font = '400 50px "Permanent Marker"'; x.lineWidth = 8; x.strokeStyle = "rgba(0,0,0,.6)"; x.strokeText("Poker – nur Spielchips", Z / 2, Z * .36); x.fillStyle = "#fff"; x.fillText("Poker – nur Spielchips", Z / 2, Z * .36); }
  }

  /* ================= ROULETTE ================= */
  let Q = null;
  const GX0 = -4.5, GW = 9.0, GZ0 = .55, GD = 3.95; // Spielfeld auf dem Filz
  // Aufteilung des Spielfelds (u 0..1 nach rechts, v 0..1 nach vorne): 3 Zahlenreihen, Dutzende, einfache Chancen
  const NUMV = .6, DOZV = .78, COLW = 1 / 13;
  function cellAt(u, v) { if (u < 0 || u > 1 || v < 0 || v > 1) return null; const col = Math.floor(u / COLW);
    if (v < NUMV) { if (col === 0) return [0, 0]; const row = Math.floor(v / NUMV * 3); return [0, (col - 1) * 3 + (3 - row)]; }
    if (col === 0) return null; const c = (u - COLW) / (1 - COLW);
    if (v < DOZV) return [7, Math.min(2, Math.floor(c * 3))];
    return [[5, 3, 1, 2, 4, 6][Math.min(5, Math.floor(c * 6))], 0]; }
  function cellCenter(t, val) { // -> [u, v]
    if (t === 0) { if (val === 0) return [COLW / 2, NUMV / 2]; const col = Math.floor((val - 1) / 3) + 1, row = 3 - ((val - 1) % 3 + 1); return [(col + .5) * COLW, (row + .5) * NUMV / 3]; }
    if (t === 7) return [COLW + (val + .5) * (1 - COLW) / 3, (NUMV + DOZV) / 2];
    const k = [5, 3, 1, 2, 4, 6].indexOf(t); return [COLW + (k + .5) * (1 - COLW) / 6, (DOZV + 1) / 2]; }
  const uvW = (u, v) => [GX0 + u * GW, GZ0 + v * GD];
  function drawGrid(H, hl) { const { REDS } = H; const c = Q.gridC, x = c.getContext("2d"), w = c.width, h = c.height;
    x.clearRect(0, 0, w, h); x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = 4; x.textAlign = "center";
    const box = (u0, v0, u1, v1, fill, txt, size, glow) => { const X = u0 * w, Y = v0 * h, W2 = (u1 - u0) * w, H2 = (v1 - v0) * h;
      if (fill) { x.fillStyle = fill; x.fillRect(X + 5, Y + 5, W2 - 10, H2 - 10); } x.strokeRect(X + 2, Y + 2, W2 - 4, H2 - 4);
      if (glow) { x.save(); x.strokeStyle = "#ffd166"; x.lineWidth = 12; x.shadowColor = "#ffd166"; x.shadowBlur = 30; x.strokeRect(X + 8, Y + 8, W2 - 16, H2 - 16); x.restore(); }
      x.fillStyle = "#fff"; x.font = `700 ${size}px "Barlow Condensed"`; x.fillText(txt, X + W2 / 2, Y + H2 / 2 + size * .35); };
    box(0, 0, COLW, NUMV, "#16a34a", "0", 70, hl === 0);
    for (let col = 1; col <= 12; col++) for (let row = 0; row < 3; row++) { const n = (col - 1) * 3 + (3 - row); box(col * COLW, row * NUMV / 3, (col + 1) * COLW, (row + 1) * NUMV / 3, REDS.has(n) ? "#c81e3a" : "#16121c", String(n), 58, hl === n); }
    ["1. Dutzend", "2. Dutzend", "3. Dutzend"].forEach((t, i) => box(COLW + i * (1 - COLW) / 3, NUMV, COLW + (i + 1) * (1 - COLW) / 3, DOZV, null, t, 50));
    ["1–18", "Gerade", "◆ Rot", "◆ Schwarz", "Ungerade", "19–36"].forEach((t, i) => box(COLW + i * (1 - COLW) / 6, DOZV, COLW + (i + 1) * (1 - COLW) / 6, 1, i === 2 ? "#c81e3a" : i === 3 ? "#16121c" : null, t.replace("◆ ", ""), 46));
    Q.gridT.needsUpdate = true; }
  function buildRoulette(H) { const { REDS, WHEEL } = H; const sc = stage("#0c1a12");
    const table = new THREE.Mesh(new THREE.BoxGeometry(11, .5, 10.6), [woodM, woodM, std({ map: feltTex(["#1d7a4a", "#0b3d24"], ""), roughness: .95 }), woodM, woodM, woodM]); table.position.set(0, -.25, .1); table.receiveShadow = true; sc.add(table);
    const railM = leatherM; [[0, -5.2, 11.2, .5], [0, 5.4, 11.2, .5]].forEach(([x0, z0, w0, d0]) => { const r = new THREE.Mesh(new THREE.BoxGeometry(w0, .3, d0), railM); r.position.set(x0, .1, z0); r.castShadow = true; sc.add(r); });
    [-5.6, 5.6].forEach(x0 => { const r = new THREE.Mesh(new THREE.BoxGeometry(.5, .3, 11.1), railM); r.position.set(x0, .1, .1); sc.add(r); });
    const gridC = document.createElement("canvas"); gridC.width = 1560; gridC.height = 690; const gridT = new THREE.CanvasTexture(gridC); gridT.anisotropy = 8;
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD), new THREE.MeshStandardMaterial({ map: gridT, transparent: true, roughness: .9 })); grid.rotation.x = -Math.PI / 2; grid.position.set(GX0 + GW / 2, .012, GZ0 + GD / 2); grid.receiveShadow = true; sc.add(grid);
    // Kessel
    const WZ = -2.35, RW = 2.05, wheelC = new THREE.Group(); wheelC.position.set(0, 0, WZ); sc.add(wheelC);
    const bowlPts = [[RW * 1.32, 0], [RW * 1.34, .42], [RW * 1.25, .5], [RW * 1.18, .44], [RW * 1.04, .36], [RW * .98, .3]].map(([r, y]) => new THREE.Vector2(r, y));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlPts, 80), woodM); bowl.castShadow = bowl.receiveShadow = true; wheelC.add(bowl);
    const track = new THREE.Mesh(new THREE.RingGeometry(RW * .98, RW * 1.2, 80), std({ color: "#3a1d0c", roughness: .35, side: THREE.DoubleSide })); track.rotation.x = -Math.PI / 2; track.position.y = .37; wheelC.add(track);
    const spin = new THREE.Group(); spin.position.y = .3; wheelC.add(spin);
    const seg = Math.PI * 2 / 37;
    const pockT = ctex(1024, 1024, (x, w) => { const cx = w / 2, R1 = w / 2, R0 = R1 * .56; WHEEL.forEach((n, i) => { const a0 = i * seg; x.fillStyle = n === 0 ? "#16a34a" : REDS.has(n) ? "#c81e3a" : "#16121c"; x.beginPath(); x.arc(cx, cx, R1, a0, a0 + seg); x.arc(cx, cx, R0, a0 + seg, a0, true); x.fill();
        x.save(); x.translate(cx, cx); x.rotate(a0 + seg / 2); x.fillStyle = "#fff"; x.font = '700 40px "Barlow Condensed"'; x.textAlign = "center"; x.translate(R1 * .9, 0); x.rotate(Math.PI / 2); x.fillText(String(n), 0, 14); x.restore(); });
      x.strokeStyle = "#e9cf7a"; x.lineWidth = 4; WHEEL.forEach((n, i) => { const a = i * seg; x.beginPath(); x.moveTo(cx + Math.cos(a) * R0, cx + Math.sin(a) * R0); x.lineTo(cx + Math.cos(a) * R1 * .8, cx + Math.sin(a) * R1 * .8); x.stroke(); }); });
    const ring = new THREE.Mesh(new THREE.RingGeometry(RW * .56, RW, 111, 1), std({ map: pockT, roughness: .4 })); ring.rotation.x = -Math.PI / 2; ring.receiveShadow = true; spin.add(ring);
    for (let i = 0; i < 37; i++) { const a = i * seg, f = new THREE.Mesh(new THREE.BoxGeometry(RW * .2, .06, .025), goldM); f.position.set(Math.cos(a) * RW * .7, .03, Math.sin(a) * RW * .7); f.rotation.y = -a; spin.add(f); }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(RW * .56, .45, 48, 1, true), std({ map: woodTex, roughness: .4 })); cone.position.y = .2; cone.castShadow = true; spin.add(cone);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, .5, 24), goldM); hub.position.y = .5; spin.add(hub);
    [0, Math.PI / 2].forEach(ry => { const arm = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .95, 10), goldM); arm.rotation.set(0, ry, Math.PI / 2); arm.position.y = .68; spin.add(arm);
      [-1, 1].forEach(sg => { const kn = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 10), goldM); kn.position.set(Math.cos(ry) * .48 * sg, .68, -Math.sin(ry) * .48 * sg); spin.add(kn); }); });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 16), std({ color: "#ffffff", roughness: .15, metalness: .1 })); ball.castShadow = true; wheelC.add(ball);
    const cam = new THREE.PerspectiveCamera(44, 1, .1, 60); cam.position.set(0, 10.6, 8.3); cam.lookAt(0, 0, .55);
    const dyn = new THREE.Group(); sc.add(dyn);
    Q = { sc, cam, dyn, grid, gridC, gridT, spin, ball, RW, seg, wAng: 0, anim: { rn: -1, t0: -1e9, from: 0, to: 0, ball0: 0 }, hk: "x", ray: new THREE.Raycaster() }; drawGrid(H, -1); }

  function roulette(x, S, H) { if (lost) return false; if (!Q) buildRoulette(H);
    const { REDS, WHEEL, device, nm, PC } = H, A = Q.anim, seg = Q.seg;
    if (S.ph === "res" && A.rn !== S.rn) { A.rn = S.rn; A.t0 = now(); A.from = Q.wAng; A.to = Q.wAng + Math.PI * 6 + Math.random() * Math.PI; }
    const k = (now() - A.t0) / 4000, spinning = S.ph === "res" && A.rn === S.rn && k < 1;
    if (spinning) Q.wAng = A.from + (A.to - A.from) * ease(k); else Q.wAng += .004;
    Q.spin.rotation.y = Q.wAng;
    const tgt = WHEEL.indexOf(S.res), pocket = (tgt + .5) * seg, RW = Q.RW;
    let ba, br, by;
    if (S.ph === "res" && A.rn === S.rn && tgt >= 0) { const endA = pocket - (A.from + (A.to - A.from)); // Kugel läuft gegen das Rad und fällt dann ins Fach
      if (k < 1) { const kb = ease(k); ba = endA - (1 - kb) * Math.PI * 9; const drop = Math.max(0, (k - .62) / .38); br = RW * (1.1 - .32 * ease(drop)); by = .45 - .1 * ease(drop) + (drop > 0 && drop < 1 ? Math.abs(Math.sin(drop * 18)) * .07 * (1 - drop) : 0); }
      else { ba = pocket - Q.wAng; br = RW * .78; by = .35; } }
    else { ba = -now() / 900; br = RW * 1.1; by = .45; }
    Q.ball.position.set(Math.cos(ba) * br, by, Math.sin(ba) * br);
    const done = S.ph === "res" && A.rn === S.rn && k >= 1, hk = done ? S.res : -1;
    if (Q.hk !== hk) { Q.hk = hk; drawGrid(H, hk); }
    // Chips der Spieler auf dem Feld
    const dyn = Q.dyn; while (dyn.children.length) dyn.remove(dyn.children[0]);
    (S.bets || []).forEach((b, i) => { const p = S.p[i]; if (!p) return; b.forEach(([t, v, a]) => { const [u, vv] = cellCenter(t, v), [wx, wz] = uvW(u, vv);
      const g = makeStack(a, PC[p.c], 8); g.scale.setScalar(.85); g.position.set(wx + ((i % 3) - 1) * .2, .012, wz + (Math.floor(i / 3) - .5) * .2); dyn.add(g); }); });
    { const t = now(); if (t - lastR >= (spinning ? 33 : 50) || lastS !== "r") { R.render(Q.sc, Q.cam); lastR = t; lastS = "r"; } }
    x.drawImage(cv, 0, 0, Z, Z);
    x.textAlign = "center";
    if (done) { const [sx, sy] = proj(Q.cam, 0, 1.2, -2.35); const col = S.res === 0 ? "#16a34a" : REDS.has(S.res) ? "#c81e3a" : "#16121c";
      x.save(); x.shadowColor = "#ffd166"; x.shadowBlur = 30; x.fillStyle = col; x.strokeStyle = "#ffd166"; x.lineWidth = 6; x.beginPath(); x.arc(sx, sy, 62, 0, 7); x.fill(); x.stroke(); x.restore();
      x.fillStyle = "#fff"; x.font = '800 70px "Barlow Condensed"'; x.fillText(S.res, sx, sy + 24); }
    const mine = S.p.findIndex(p => p.id === device && !p.bot);
    const tl = []; S.p.forEach((p, i) => { const sum = ((S.bets || [])[i] || []).reduce((a, c) => a + c[2], 0); if (sum) tl.push([nm(p) + (i === mine ? " (du)" : ""), sum, PC[p.c]]); });
    x.font = '700 28px "Barlow Condensed"'; x.textAlign = "left"; let lx = 24; const ly = Z - 22;
    x.fillStyle = "rgba(10,6,18,.78)"; x.beginPath(); x.roundRect(10, ly - 32, Z - 20, 44, 12); x.fill();
    if (S.st === "wait" || !tl.length) { x.fillStyle = "#e9f5ee"; x.fillText(S.st === "wait" ? "Roulette – nur Spielchips" : "Noch keine Einsätze – tipp aufs Feld", lx, ly); }
    else tl.forEach(([t, a, c]) => { x.fillStyle = c; x.beginPath(); x.arc(lx + 8, ly - 9, 8, 0, 7); x.fill(); lx += 22; x.fillStyle = "#fff"; const s2 = `${t}: ${a}`; x.fillText(s2, lx, ly); lx += x.measureText(s2).width + 22; });
    if (S.st === "wait") { x.textAlign = "center"; x.font = '400 50px "Permanent Marker"'; x.lineWidth = 8; x.strokeStyle = "rgba(0,0,0,.6)"; x.strokeText("Roulette – nur Spielchips", Z / 2, Z * .5); x.fillStyle = "#fff"; x.fillText("Roulette – nur Spielchips", Z / 2, Z * .5); }
  }
  // Antippen: Punkt auf dem Feld finden -> [Art, Wert]
  function rTap(nx, ny) { if (!Q) return null; Q.ray.setFromCamera(new THREE.Vector2(nx * 2 - 1, -(ny * 2 - 1)), Q.cam); const h = Q.ray.intersectObject(Q.grid)[0]; if (!h || !h.uv) return null; return cellAt(h.uv.x, 1 - h.uv.y); }
  const spinning = () => !!Q && Q.anim && now() < Q.anim.t0 + 4200;
  window.Tisch3D = { ok: true, poker, roulette, rTap, spinning, lost: () => lost, mem: () => R.info.memory };
})();
