/* Relay model explorer, used by Session 2's reading page and its presentation.
   RelayExplorer(element) builds two sliders, a time line and a table inside the element.

   The model: every runner runs like Bolt in his 9.58 s race.
   - Runner 1 starts from the blocks and carries the baton to the handover point.
   - Runners 2, 3 and 4 start at the beginning of the acceleration zone (80 m into the leg),
     so each has already covered some distance when the baton reaches him.
   - A runner reaches top speed after 50 m of his own run and then holds it. */
function RelayExplorer(root) {
  var SPLITS = [0, 1.89, 2.88, 3.78, 4.64, 5.47, 6.29, 7.10, 7.92, 8.75, 9.58];   /* Bolt, every 10 m */
  var TOP = 50 / (9.58 - 5.47);                                                    /* top speed, m/s */
  var FIRST = 38.32, RECORD = 36.84;
  var BLUE = "#004898", RED = "#d7000f", INK = "#231f20", MUTED = "#6d6e71", FRAME = "#a7a9ac";
  var NS = "http://www.w3.org/2000/svg";

  function timeAt(d) {                      /* Bolt's time to cover d metres from the blocks */
    if (d >= 100) return 9.58 + (d - 100) / TOP;
    var i = Math.floor(d / 10);
    return SPLITS[i] + (SPLITS[i + 1] - SPLITS[i]) * (d - 10 * i) / 10;
  }
  function legs(x) {                        /* seconds each runner carries the baton, handing over at x metres */
    var run = x - 80, speedUp = timeAt(50) - timeAt(run);
    var middle = speedUp + (50 + run) / TOP;
    return [timeAt(x), middle, middle, speedUp + 70 / TOP];
  }
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (tag === "text" && attrs.fill) e.style.fill = attrs.fill;      /* a stylesheet may set a default text colour */
    if (text !== undefined) e.textContent = text;
    return e;
  }

  root.innerHTML =
    '<svg viewBox="0 0 680 150" role="img" aria-label="The model\'s relay time on a line from 34 to 39 seconds, beside the first model and the real record"></svg>' +
    '<p style="margin:.4em 0"><label>Handover point: <strong data-out="x"></strong><br><input type="range" min="90" max="110" step="1" value="90" data-in="x" style="width:100%"></label></p>' +
    '<p style="margin:.4em 0"><label>Each runner\'s speed, compared with Bolt: <strong data-out="p"></strong><br><input type="range" min="90" max="100" step="0.5" value="100" data-in="p" style="width:100%"></label></p>' +
    '<div class="table-wrap"><table><thead><tr><th>Runner</th><th>Carries the baton</th><th>Time</th></tr></thead><tbody></tbody></table></div>' +
    '<p data-out="say" style="font-weight:500"></p>';
  var svg = root.querySelector("svg"), tbody = root.querySelector("tbody");
  var inX = root.querySelector('[data-in="x"]'), inP = root.querySelector('[data-in="p"]');
  function out(name) { return root.querySelector('[data-out="' + name + '"]'); }

  var L = 30, R = 650, Y = 86;
  function px(t) { return L + (R - L) * (t - 34) / 5; }
  svg.appendChild(el("line", { x1: L, x2: R, y1: Y, y2: Y, stroke: FRAME, "stroke-width": 1.5 }));
  for (var s = 34; s <= 39; s++) {
    svg.appendChild(el("line", { x1: px(s), x2: px(s), y1: Y - 6, y2: Y + 6, stroke: FRAME, "stroke-width": 1.2 }));
    svg.appendChild(el("text", { x: px(s), y: Y + 26, "text-anchor": "middle", "font-size": 13, fill: MUTED }, s + " s"));
  }
  function fixed(t, label, colour, up) {
    svg.appendChild(el("line", { x1: px(t), x2: px(t), y1: Y - 18, y2: Y + 12, stroke: colour, "stroke-width": 2.5 }));
    svg.appendChild(el("text", { x: px(t), y: up, "text-anchor": "middle", "font-size": 13, fill: INK }, label));
  }
  fixed(FIRST, "First model 38.32", BLUE, Y - 26);
  fixed(RECORD, "Real record 36.84", RED, Y - 26);
  var mark = el("circle", { cy: Y, r: 9, fill: BLUE });
  var markText = el("text", { y: Y + 50, "text-anchor": "middle", "font-size": 15, "font-weight": 500, fill: BLUE });
  svg.appendChild(mark); svg.appendChild(markText);

  function update() {
    var x = +inX.value, p = +inP.value / 100;
    var each = legs(x).map(function (t) { return t / p; });
    var total = each.reduce(function (a, b) { return a + b; }, 0);
    var carried = [x, 100, 100, 200 - x];
    out("x").textContent = x + " m";
    out("p").textContent = (+inP.value).toFixed(1) + "%";
    tbody.innerHTML = "";
    each.forEach(function (t, i) {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + carried[i] + " m</td><td>" + t.toFixed(2) + " s</td>";
      tbody.appendChild(tr);
    });
    var last = document.createElement("tr");
    last.innerHTML = "<td><strong>Total</strong></td><td>400 m</td><td><strong>" + total.toFixed(2) + " s</strong></td>";
    tbody.appendChild(last);
    var shown = Math.max(34, Math.min(39, total));
    mark.setAttribute("cx", px(shown)); markText.setAttribute("x", Math.max(70, Math.min(610, px(shown))));
    markText.textContent = "This model " + total.toFixed(2);
    var gap = total - RECORD;
    out("say").textContent = Math.abs(gap) < 0.05 ? "The model matches the real record."
      : "The model is " + Math.abs(gap).toFixed(2) + " s " + (gap < 0 ? "faster" : "slower") + " than the real record.";
  }
  inX.addEventListener("input", update); inP.addEventListener("input", update);
  update();
}
