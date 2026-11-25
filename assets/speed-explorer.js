/* Model explorer: one speed for every distance. Used by Session 1's reading page and its presentation.
   SpeedExplorer(element, { table: true }) builds:
     - a slider for the model's one speed for every race;
     - five bars: the error in each predicted time (distance ÷ speed) against the real record, the largest outlined;
     - a table of each record, the model's time and its percentage error (only when table is true);
     - the largest of the five errors, and a chart of that largest error for every speed, with a dot at the slider's speed.
   The lowest point of the second chart answers the challenge: about 8.86 m/s, with a largest error of about 18%. */
function SpeedExplorer(root, opts) {
  opts = opts || {};
  var records = [
    { name: "100 m", d: 100, t: 9.58 },
    { name: "200 m", d: 200, t: 19.19 },
    { name: "400 m", d: 400, t: 43.03 },
    { name: "800 m", d: 800, t: 100.91 },
    { name: "1500 m", d: 1500, t: 206.00 }
  ];
  var SMIN = 7, SMAX = 10.6;
  function worstAt(s) {                 /* the largest percentage error, and which record gives it */
    var worst = 0, name = "";
    records.forEach(function (r) {
      var err = (r.d / s - r.t) / r.t * 100;
      if (Math.abs(err) > Math.abs(worst)) { worst = err; name = r.name; }
    });
    return { err: worst, name: name };
  }
  /* Self-check: the largest error is smallest halfway between the fastest and slowest average speeds. */
  var vFast = 100 / 9.58, vSlow = 1500 / 206, best = (vFast + vSlow) / 2;
  console.assert(best.toFixed(2) === "8.86" && Math.abs(worstAt(best).err).toFixed(0) === "18", "SpeedExplorer: the best speed changed");

  var NS = "http://www.w3.org/2000/svg", FONT = '"Noto Sans HK", sans-serif';
  var BLUE = "#004898", RED = "#d7000f", INK = "#231f20", MUTED = "#6d6e71", FRAME = "#a7a9ac";
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function fmt(t) {
    if (t < 60) return t.toFixed(2) + " s";
    var m = Math.floor(t / 60), s = t - m * 60;
    return m + ":" + (s < 10 ? "0" : "") + s.toFixed(2);
  }

  root.innerHTML =
    '<label style="display:block;font-weight:400">Model speed: <span data-el="out" style="font-weight:500;color:' + BLUE + ';font-variant-numeric:tabular-nums"></span>' +
    '<input type="range" data-el="speed" min="' + SMIN + '" max="' + SMAX + '" step="0.01" value="10.44" style="width:100%;accent-color:' + BLUE + '"></label>' +
    '<svg data-el="chart" viewBox="0 0 680 280" role="img" aria-label="The error in each predicted time, one bar for each race" style="width:100%;height:auto;display:block;margin-top:6px"></svg>' +
    (opts.table ? '<div class="table-wrap"><table><thead><tr><th>Event</th><th>Real record</th><th>Model predicts</th><th>Error</th></tr></thead><tbody data-el="rows"></tbody></table></div>' : "") +
    '<p data-el="verdict" style="font-weight:500;margin:.4em 0"></p>' +
    '<svg data-el="worst" viewBox="0 0 680 200" role="img" aria-label="The largest of the five errors for every model speed, with a dot at the speed chosen" style="width:100%;height:auto;display:block"></svg>';
  function part(name) { return root.querySelector('[data-el="' + name + '"]'); }
  var svg = part("chart"), slider = part("speed"), out = part("out"), rows = part("rows"), verdict = part("verdict"), wsvg = part("worst");

  /* ---------- Chart 1: the error in each predicted time ---------- */
  var BL = 150, BR = 650, BT = 10, ROW = 44, XMIN = -45, XMAX = 60, BH = 26;
  function bx(e) { return BL + (Math.max(XMIN, Math.min(XMAX, e)) - XMIN) / (XMAX - XMIN) * (BR - BL); }
  var BB = BT + records.length * ROW;
  for (var g = -40; g <= 50; g += 10) {
    svg.appendChild(el("line", { x1: bx(g), x2: bx(g), y1: BT, y2: BB, stroke: g === 0 ? INK : FRAME, "stroke-width": g === 0 ? 1.5 : 0.67 }));
    svg.appendChild(el("text", { x: bx(g), y: BB + 18, "text-anchor": "middle", "font-size": 12, "font-family": FONT, fill: MUTED }, (g > 0 ? "+" : "") + g + "%"));
  }
  svg.appendChild(el("text", { x: (BL + BR) / 2, y: BB + 38, "text-anchor": "middle", "font-size": 12, "font-family": FONT, fill: MUTED }, "Error in the predicted time:  − too fast,  + too slow"));
  var bars = records.map(function (r, i) {
    var cy = BT + i * ROW + ROW / 2;
    svg.appendChild(el("text", { x: BL - 12, y: cy + 5, "text-anchor": "end", "font-size": 14, "font-family": FONT, fill: INK }, r.name));
    var rect = el("rect", { y: cy - BH / 2, height: BH, fill: BLUE });
    var label = el("text", { y: cy + 5, "font-size": 13, "font-family": FONT, fill: BLUE, "font-weight": 500 });
    svg.appendChild(rect); svg.appendChild(label);
    return { rect: rect, label: label };
  });

  /* ---------- Chart 2: the largest error for every speed ---------- */
  var WL = 56, WR = 660, WT = 14, WB = 160, EMAX = 50;
  function wx(s) { return WL + (s - SMIN) / (SMAX - SMIN) * (WR - WL); }
  function wy(e) { return WB - e / EMAX * (WB - WT); }
  for (var e = 0; e <= EMAX; e += 10) {
    wsvg.appendChild(el("line", { x1: WL, x2: WR, y1: wy(e), y2: wy(e), stroke: FRAME, "stroke-width": 0.67 }));
    wsvg.appendChild(el("text", { x: WL - 8, y: wy(e) + 4, "text-anchor": "end", "font-size": 12, "font-family": FONT, fill: MUTED }, e + "%"));
  }
  for (var s = 7; s <= 10.5; s += 0.5) {
    wsvg.appendChild(el("text", { x: wx(s), y: WB + 18, "text-anchor": "middle", "font-size": 12, "font-family": FONT, fill: MUTED }, s));
  }
  wsvg.appendChild(el("text", { x: (WL + WR) / 2, y: WB + 36, "text-anchor": "middle", "font-size": 12, "font-family": FONT, fill: MUTED }, "Model speed (m/s) · the line is the largest of the five time errors"));
  var pts = [];
  for (var k = 0; k <= 180; k++) { var sk = SMIN + (SMAX - SMIN) * k / 180; pts.push(wx(sk).toFixed(1) + "," + wy(Math.abs(worstAt(sk).err)).toFixed(1)); }
  wsvg.appendChild(el("polyline", { points: pts.join(" "), fill: "none", stroke: RED, "stroke-width": 2 }));
  var dot = el("circle", { r: 7, fill: BLUE });
  var dotText = el("text", { "text-anchor": "middle", "font-size": 13, "font-family": FONT, fill: BLUE, "font-weight": 500 });
  wsvg.appendChild(dot); wsvg.appendChild(dotText);

  function update() {
    var sp = parseFloat(slider.value), w = worstAt(sp);
    out.textContent = sp.toFixed(2) + " m/s";
    records.forEach(function (r, i) {
      var err = (r.d / sp - r.t) / r.t * 100, x0 = bx(0), x1 = bx(err), b = bars[i];
      b.rect.setAttribute("x", Math.min(x0, x1)); b.rect.setAttribute("width", Math.max(1, Math.abs(x1 - x0)));
      var isWorst = r.name === w.name;
      b.rect.setAttribute("stroke", isWorst ? RED : "none"); b.rect.setAttribute("stroke-width", isWorst ? 3 : 0);
      b.label.setAttribute("x", err >= 0 ? x1 + 6 : x1 - 6); b.label.setAttribute("text-anchor", err >= 0 ? "start" : "end");
      b.label.textContent = (Math.abs(err) < 0.05 ? "0.0" : (err > 0 ? "+" : "−") + Math.abs(err).toFixed(1)) + "%";
    });
    if (rows) {
      rows.innerHTML = "";
      records.forEach(function (r) {
        var pred = r.d / sp, err = (pred - r.t) / r.t * 100;
        var tr = document.createElement("tr");
        var cls = Math.abs(err) < 1 ? "near" : (Math.abs(err) > 10 ? "far" : "");
        tr.innerHTML = "<td>" + r.name + "</td><td>" + fmt(r.t) + "</td><td>" + fmt(pred) + "</td><td class='" + cls + "'>" + (Math.abs(err) < 0.05 ? "0.0" : (err > 0 ? "+" : "") + err.toFixed(1)) + "%</td>";
        rows.appendChild(tr);
      });
    }
    verdict.textContent = "Largest error: " + Math.abs(w.err).toFixed(1) + "% at " + w.name + " (the model is " + (w.err < 0 ? "too fast" : "too slow") + ").";
    var ey = wy(Math.abs(w.err));
    dot.setAttribute("cx", wx(sp)); dot.setAttribute("cy", ey);
    dotText.setAttribute("x", wx(sp)); dotText.setAttribute("y", ey - 12); dotText.textContent = Math.abs(w.err).toFixed(1) + "%";
  }
  slider.addEventListener("input", update);
  update();
}
