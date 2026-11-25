/* Model explorer: one speed for every distance. Used by Session 1's reading page and its presentation.
   SpeedExplorer(element, { table: true }) builds:
     - the average speeds of five world records as dots, with the model "every race at one speed" as a red line;
     - a slider for that speed;
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
    '<svg data-el="chart" viewBox="0 0 680 320" role="img" aria-label="Average speed of world records by distance, with the constant-speed model as a horizontal line" style="width:100%;height:auto;display:block"></svg>' +
    '<label style="display:block;font-weight:400;margin-top:8px">Model speed: <span data-el="out" style="font-weight:500;color:' + BLUE + ';font-variant-numeric:tabular-nums"></span>' +
    '<input type="range" data-el="speed" min="' + SMIN + '" max="' + SMAX + '" step="0.01" value="10.44" style="width:100%;accent-color:' + BLUE + '"></label>' +
    (opts.table ? '<div class="table-wrap"><table><thead><tr><th>Event</th><th>Real record</th><th>Model predicts</th><th>Error</th></tr></thead><tbody data-el="rows"></tbody></table></div>' : "") +
    '<p data-el="verdict" style="font-weight:500;margin:.4em 0"></p>' +
    '<svg data-el="worst" viewBox="0 0 680 200" role="img" aria-label="The largest of the five errors for every model speed, with a dot at the speed chosen" style="width:100%;height:auto;display:block"></svg>';
  function part(name) { return root.querySelector('[data-el="' + name + '"]'); }
  var svg = part("chart"), slider = part("speed"), out = part("out"), rows = part("rows"), verdict = part("verdict"), wsvg = part("worst");

  /* ---------- Chart 1: the records' average speeds and the model line ---------- */
  var L = 56, R = 660, T = 20, B = 270, VMIN = 6.5, VMAX = 11;
  function x(i) { return L + 50 + i * (R - L - 100) / (records.length - 1); }
  function y(v) { return B - (v - VMIN) / (VMAX - VMIN) * (B - T); }
  for (var v = 7; v <= 11; v++) {
    svg.appendChild(el("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: FRAME, "stroke-width": 0.67 }));
    svg.appendChild(el("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end", "font-size": 12, "font-family": FONT, fill: MUTED }, v));
  }
  svg.appendChild(el("text", { x: 14, y: (T + B) / 2, "font-size": 12, "font-family": FONT, fill: MUTED, transform: "rotate(-90 14 " + (T + B) / 2 + ")", "text-anchor": "middle" }, "Average speed (m/s)"));
  var gaps = records.map(function (r, i) {
    var g = el("line", { x1: x(i), x2: x(i), stroke: MUTED, "stroke-width": 1, "stroke-dasharray": "3 3" });
    svg.appendChild(g); return g;
  });
  var modelLine = el("line", { x1: L, x2: R, stroke: RED, "stroke-width": 2 });
  svg.appendChild(modelLine);
  records.forEach(function (r, i) {
    svg.appendChild(el("circle", { cx: x(i), cy: y(r.d / r.t), r: 6, fill: BLUE }));
    svg.appendChild(el("text", { x: x(i), y: B + 22, "text-anchor": "middle", "font-size": 13, "font-family": FONT, fill: INK }, r.name));
    svg.appendChild(el("text", { x: x(i), y: y(r.d / r.t) + 22, "text-anchor": "middle", "font-size": 12, "font-family": FONT, fill: BLUE }, (r.d / r.t).toFixed(2)));
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
  wsvg.appendChild(el("text", { x: (WL + WR) / 2, y: WB + 36, "text-anchor": "middle", "font-size": 12, "font-family": FONT, fill: MUTED }, "Model speed (m/s) · the line is the largest of the five errors"));
  var pts = [];
  for (var k = 0; k <= 180; k++) { var sk = SMIN + (SMAX - SMIN) * k / 180; pts.push(wx(sk).toFixed(1) + "," + wy(Math.abs(worstAt(sk).err)).toFixed(1)); }
  wsvg.appendChild(el("polyline", { points: pts.join(" "), fill: "none", stroke: RED, "stroke-width": 2 }));
  var dot = el("circle", { r: 7, fill: BLUE });
  var dotText = el("text", { "text-anchor": "middle", "font-size": 13, "font-family": FONT, fill: BLUE, "font-weight": 500 });
  wsvg.appendChild(dot); wsvg.appendChild(dotText);

  function update() {
    var sp = parseFloat(slider.value), w = worstAt(sp);
    out.textContent = sp.toFixed(2) + " m/s";
    modelLine.setAttribute("y1", y(sp)); modelLine.setAttribute("y2", y(sp));
    records.forEach(function (r, i) { gaps[i].setAttribute("y1", y(sp)); gaps[i].setAttribute("y2", y(r.d / r.t)); });
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
