/* Sensitivity explorer, used by Session 6's reading page and its presentation.
   EvSensitivity(element) builds three sliders, each changing one input of the electric-vehicle models by up to 20%,
   and shows the answer of each of Session 5's three models for the end of 2030 with its change from the baseline.

   Inputs: the share of electric vehicles in October 2023 (7.7%) and in September 2026 (20.1%), and how much the
   total number of vehicles changes by the end of 2030 (the models assume it does not change). */
function EvSensitivity(root) {
  var T23 = 2023 + 10 / 12, T26 = 2026.75, END = 2031.0;      /* END is the end of 2030 */
  var INPUTS = [
    { key: "a", label: "Share in October 2023", base: 7.7, unit: "%" },
    { key: "b", label: "Share in September 2026", base: 20.1, unit: "%" },
    { key: "n", label: "Total vehicles by the end of 2030", base: 100, unit: "% of today's" }
  ];
  var MODELS = ["Straight line", "Compound growth", "Growth with a ceiling"];

  function answers(a, b, n) {           /* a, b: the two shares in %; n: total vehicles as % of today's */
    var d = T26 - T23, t = END - T26;
    var ratio = function (p) { return p / (100 - p); };
    var r = ratio(b) * Math.pow(ratio(b) / ratio(a), t / d);
    return [b + (b - a) / d * t, b * Math.pow(b / a, t / d), 100 * r / (1 + r)].map(function (v) { return v * 100 / n; });
  }
  var BASE = answers(7.7, 20.1, 100);
  /* Self-check against Session 5's figures: 38.2, 81.4 and 55.7. */
  console.assert(BASE.map(function (v) { return v.toFixed(1); }).join() === "38.2,81.4,55.7", "EvSensitivity: baseline changed");

  root.innerHTML = '<div data-el="sliders"></div><div data-el="rows" style="margin-top:.8em"></div>' +
    '<p data-el="say" style="font-weight:500;margin:.6em 0 0"></p>' +
    '<p style="margin:.4em 0 0"><button type="button" data-el="reset" style="font:inherit;padding:.1em .8em;border:1px solid #004898;background:#fff;color:#004898;cursor:pointer">Reset</button></p>';
  function part(name) { return root.querySelector('[data-el="' + name + '"]'); }

  var sliders = INPUTS.map(function (inp) {
    var lab = document.createElement("label"), out = document.createElement("strong"), el = document.createElement("input");
    lab.style.cssText = "display:grid;grid-template-columns:15em 9em 1fr;gap:.6em;align-items:center;margin:.2em 0";
    el.type = "range"; el.min = -20; el.max = 20; el.step = 1; el.value = 0; el.style.width = "100%"; el.style.accentColor = "#004898";
    el.addEventListener("input", draw);
    lab.appendChild(document.createTextNode(inp.label)); lab.appendChild(out); lab.appendChild(el);
    part("sliders").appendChild(lab);
    return { el: el, out: out, inp: inp };
  });
  var rows = MODELS.map(function (name) {
    var row = document.createElement("div"), n = document.createElement("span"), track = document.createElement("div"), fill = document.createElement("i"), val = document.createElement("strong");
    row.style.cssText = "display:grid;grid-template-columns:12em 1fr 11em;gap:.6em;align-items:center;margin:.25em 0";
    track.style.cssText = "height:1.4em;border-left:1px solid #a7a9ac;border-right:2px solid #231f20";       /* the right edge is 100% */
    fill.style.cssText = "display:block;height:100%;background:#004898;transition:width .2s";
    val.style.cssText = "text-align:right;font-variant-numeric:tabular-nums";
    n.textContent = name; track.appendChild(fill);
    [n, track, val].forEach(function (x) { row.appendChild(x); });
    part("rows").appendChild(row);
    return { fill: fill, val: val };
  });
  part("reset").addEventListener("click", function () { sliders.forEach(function (s) { s.el.value = 0; }); draw(); });

  function draw() {
    var v = sliders.map(function (s) {
      var pct = +s.el.value, value = s.inp.base * (1 + pct / 100);
      s.out.textContent = (pct > 0 ? "+" : pct < 0 ? "−" : "") + Math.abs(pct) + "%  (" + value.toFixed(s.inp.key === "n" ? 0 : 1) + ")";
      return value;
    });
    var now = answers(v[0], v[1], v[2]), biggest = 0;
    rows.forEach(function (row, i) {
      var diff = now[i] - BASE[i];
      biggest = Math.max(biggest, Math.abs(diff));
      row.fill.style.width = Math.min(100, Math.max(0, now[i])) + "%";
      row.fill.style.background = now[i] > 100 ? "#d7000f" : "#004898";
      row.val.textContent = now[i].toFixed(1) + "%  (" + (diff >= 0.05 ? "+" : diff <= -0.05 ? "−" : "") + Math.abs(diff).toFixed(1) + ")";
    });
    part("say").textContent = biggest < 0.05
      ? "Baseline. The three models already differ by " + (BASE[1] - BASE[0]).toFixed(0) + " points."
      : "Largest change from the baseline: " + biggest.toFixed(1) + " points.";
  }
  draw();
}
