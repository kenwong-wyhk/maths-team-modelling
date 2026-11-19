/* Line-fitting explorer, used by Session 4's reading page and its presentation.
   LineFit(element, { reveal: true }) draws Hong Kong's highest temperature of each year from 1990 to 2024,
   a straight line set by two sliders, the gap between the line and every point, and the sum of the squared gaps.
   With reveal, a button moves the line to the least-squares line.

   The temperatures are those printed in the worksheet "Heating Up? Predicting Hong Kong's Future Temperature". */
function LineFit(root, options) {
  var T = [36.1, 34.3, 34.5, 34.2, 34.6, 33.7, 34.3, 33.2, 34.4, 35.1, 34.2, 34.0, 34.3, 34.5, 34.6, 35.4, 34.2, 34.7,
           34.6, 34.9, 34.6, 35.0, 34.5, 34.9, 34.6, 36.3, 35.6, 36.6, 35.4, 35.1, 35.3, 36.1, 36.1, 36.1, 35.7];
  var BEST = { m: 0.0492, c: 34.070 };            /* least squares, with x = years since 1990 */
  var BLUE = "#004898", RED = "#d7000f", INK = "#231f20", MUTED = "#6d6e71", FRAME = "#a7a9ac";
  var NS = "http://www.w3.org/2000/svg";
  var L = 56, R = 664, TOP = 14, BOT = 286, X0 = 1988, X1 = 2038, Y0 = 33, Y1 = 38;

  function sse(m, c) { return T.reduce(function (s, y, x) { var d = y - (m * x + c); return s + d * d; }, 0); }
  /* Self-check against the hand calculation in the coach notes: the smallest possible sum of squares is 12.76. */
  console.assert(Math.abs(sse(BEST.m, BEST.c) - 12.76) < 0.01, "LineFit: least-squares numbers changed");

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (tag === "text" && attrs.fill) e.style.fill = attrs.fill;      /* a stylesheet may set a default text colour */
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function px(year) { return L + (R - L) * (year - X0) / (X1 - X0); }
  function py(t) { return BOT - (BOT - TOP) * (t - Y0) / (Y1 - Y0); }

  root.innerHTML =
    '<svg viewBox="0 0 680 320" role="img" aria-label="Highest temperature of each year in Hong Kong, 1990 to 2024, with a straight line you can move" style="width:100%;height:auto;display:block"></svg>' +
    '<p style="margin:.3em 0"><label>Height of the line at 1990: <strong data-out="a"></strong><br><input type="range" min="32" max="37" step="0.01" value="34.9" data-in="a" style="width:100%;accent-color:#004898"></label></p>' +
    '<p style="margin:.3em 0"><label>Height of the line at 2036: <strong data-out="b"></strong><br><input type="range" min="33" max="39" step="0.01" value="34.9" data-in="b" style="width:100%;accent-color:#004898"></label></p>' +
    '<p data-out="say" style="font-weight:500;margin:.5em 0 0"></p>' +
    (options && options.reveal ? '<p style="margin:.4em 0 0"><button type="button" data-in="best" style="font:inherit;padding:.1em .8em;border:1px solid #004898;background:#fff;color:#004898;cursor:pointer">Show the least-squares line</button></p>' : "");
  var svg = root.querySelector("svg");
  function part(kind, name) { return root.querySelector("[data-" + kind + '="' + name + '"]'); }
  var inA = part("in", "a"), inB = part("in", "b");

  for (var t = 33; t <= 38; t++) {
    svg.appendChild(el("line", { x1: L, x2: R, y1: py(t), y2: py(t), stroke: FRAME, "stroke-width": 0.7 }));
    svg.appendChild(el("text", { x: L - 8, y: py(t) + 5, "text-anchor": "end", "font-size": 14, fill: MUTED }, t + "°"));
  }
  for (var yr = 1990; yr <= 2030; yr += 10) svg.appendChild(el("text", { x: px(yr), y: BOT + 24, "text-anchor": "middle", "font-size": 14, fill: MUTED }, yr));
  svg.appendChild(el("line", { x1: px(2036), x2: px(2036), y1: TOP, y2: BOT, stroke: FRAME, "stroke-width": 1, "stroke-dasharray": "4 4" }));
  svg.appendChild(el("text", { x: px(2036), y: BOT + 24, "text-anchor": "middle", "font-size": 14, "font-weight": 500, fill: INK }, "2036"));
  var gaps = T.map(function (y, x) {
    var g = el("line", { x1: px(1990 + x), x2: px(1990 + x), y1: py(y), stroke: MUTED, "stroke-width": 1.2 });
    svg.appendChild(g); return g;
  });
  var line = el("line", { x1: px(1990), x2: px(2036), stroke: RED, "stroke-width": 2.5 });
  svg.appendChild(line);
  T.forEach(function (y, x) { svg.appendChild(el("circle", { cx: px(1990 + x), cy: py(y), r: 4.5, fill: BLUE })); });
  var end = el("circle", { cx: px(2036), r: 6, fill: "#fff", stroke: RED, "stroke-width": 2.5 });
  svg.appendChild(end);

  function draw() {
    var a = +inA.value, b = +inB.value, m = (b - a) / 46;
    part("out", "a").textContent = a.toFixed(2) + " °C";
    part("out", "b").textContent = b.toFixed(2) + " °C";
    line.setAttribute("y1", py(a)); line.setAttribute("y2", py(b)); end.setAttribute("cy", py(b));
    gaps.forEach(function (g, x) { g.setAttribute("y2", py(m * x + a)); });
    part("out", "say").textContent = "Slope " + (m < 0 ? "−" : "") + Math.abs(m).toFixed(3) + " °C a year. Prediction for 2036: " + b.toFixed(1) + " °C. Sum of the squared gaps: " + sse(m, a).toFixed(2) + ".";
  }
  inA.addEventListener("input", draw); inB.addEventListener("input", draw);
  if (part("in", "best")) part("in", "best").addEventListener("click", function () {
    inA.value = BEST.c.toFixed(2); inB.value = (BEST.c + BEST.m * 46).toFixed(2); draw();
  });
  draw();
}
