/* Weights explorer, used by Session 3's reading page and its presentation.
   SportWeights(element) builds, inside the element: a choice of sport, five weight sliders for that
   sport, a choice between adding up and averaging, and one bar for each sport's suitability score.

   The student's five scores are already on a 0 to 10 scale (see the Session 3 team card).
   For gymnastics a shorter gymnast is better, so height is scored the other way round: 10 minus the score.
   The measurements and ranges behind these scores are made up for the exercise, not real fitness norms. */
function SportWeights(root) {
  var TRAITS = ["Height", "Vertical jump", "Reaction time", "Flexibility", "1 km run"];
  var SCORE = [6.6, 5.1, 6.5, 7.1, 5.7];
  var SPORTS = [
    { name: "Basketball", w: [10, 8, 6, 3, 5] },
    { name: "Gymnastics", w: [6, 7, 5, 10, 2], shortIsBetter: true },
    { name: "Distance running", w: [2, 2, 1, 3, 10] }
  ];
  var START = SPORTS.map(function (s) { return s.w.slice(); });
  var chosen = 0, average = true;

  function score(sport, avg) {
    var sum = 0, total = 0;
    sport.w.forEach(function (k, i) {
      var x = i === 0 && sport.shortIsBetter ? 10 - SCORE[0] : SCORE[i];
      sum += k * x; total += k;
    });
    return avg ? (total ? sum / total : 0) : sum;
  }
  /* Self-check against the hand calculation in the coach notes: 6.11, 5.70 and 6.01 as averages. */
  console.assert(SPORTS.map(function (s) { return score(s, true).toFixed(2); }).join() === "6.11,5.70,6.01", "SportWeights: preset scores changed");

  root.innerHTML =
    '<p style="margin:0 0 .5em"><span data-el="sports"></span></p>' +
    '<div data-el="sliders"></div>' +
    '<p style="margin:.8em 0 .4em"><label style="display:inline"><input type="checkbox" data-el="avg" checked> Divide by the total of the weights (a weighted average)</label></p>' +
    '<div data-el="bars"></div>' +
    '<p data-el="say" style="font-weight:500;margin:.6em 0 0"></p>' +
    '<p style="margin:.4em 0 0"><button type="button" data-el="reset" style="font:inherit;padding:.1em .8em;border:1px solid #004898;background:#fff;color:#004898;cursor:pointer">Reset the weights</button></p>';
  function part(name) { return root.querySelector('[data-el="' + name + '"]'); }

  SPORTS.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = s.name;
    b.style.cssText = "font:inherit;padding:.1em .8em;margin-right:.4em;border:1px solid #004898;cursor:pointer";
    b.addEventListener("click", function () { chosen = i; draw(); });
    part("sports").appendChild(b); s.button = b;
  });
  var sliders = TRAITS.map(function (t, i) {
    var lab = document.createElement("label"), out = document.createElement("strong"), inp = document.createElement("input");
    lab.style.cssText = "display:grid;grid-template-columns:11em 2.2em 1fr;gap:.6em;align-items:center;margin:.15em 0";
    inp.type = "range"; inp.min = 0; inp.max = 10; inp.step = 1; inp.style.width = "100%"; inp.style.accentColor = "#004898";
    inp.addEventListener("input", function () { SPORTS[chosen].w[i] = +inp.value; draw(); });
    lab.appendChild(document.createTextNode(t + " (" + SCORE[i].toFixed(1) + ")")); lab.appendChild(out); lab.appendChild(inp);
    part("sliders").appendChild(lab);
    return { inp: inp, out: out, lab: lab };
  });
  var bars = SPORTS.map(function (s) {
    var row = document.createElement("div"), name = document.createElement("span"), track = document.createElement("div"), fill = document.createElement("i"), val = document.createElement("strong");
    row.style.cssText = "display:grid;grid-template-columns:11em 1fr 4.5em;gap:.6em;align-items:center;margin:.25em 0";
    track.style.cssText = "height:1.5em;border-left:1px solid #a7a9ac";
    fill.style.cssText = "display:block;height:100%;transition:width .25s";
    val.style.cssText = "text-align:right;font-variant-numeric:tabular-nums";
    name.textContent = s.name; track.appendChild(fill);
    [name, track, val].forEach(function (n) { row.appendChild(n); });
    part("bars").appendChild(row);
    return { fill: fill, val: val };
  });
  part("avg").addEventListener("change", function () { average = part("avg").checked; draw(); });
  part("reset").addEventListener("click", function () { SPORTS.forEach(function (s, i) { s.w = START[i].slice(); }); draw(); });

  function draw() {
    var sport = SPORTS[chosen];
    SPORTS.forEach(function (s, i) {
      s.button.style.background = i === chosen ? "#004898" : "#fff";
      s.button.style.color = i === chosen ? "#fff" : "#004898";
    });
    sliders.forEach(function (sl, i) {
      sl.inp.value = sport.w[i]; sl.out.textContent = sport.w[i];
      sl.lab.firstChild.textContent = TRAITS[i] + " (" + (i === 0 && sport.shortIsBetter ? (10 - SCORE[0]).toFixed(1) + ", short is better" : SCORE[i].toFixed(1)) + ")";
    });
    var scores = SPORTS.map(function (s) { return score(s, average); });
    var top = Math.max.apply(null, scores), scale = average ? 10 : Math.max(top, 1);
    var order = SPORTS.map(function (s, i) { return i; }).sort(function (a, b) { return scores[b] - scores[a]; });
    bars.forEach(function (b, i) {
      b.fill.style.width = Math.max(0, scores[i] / scale * 100) + "%";
      b.fill.style.background = i === order[0] ? "#004898" : "#a7a9ac";
      b.val.textContent = scores[i].toFixed(average ? 2 : 1);
    });
    var gap = scores[order[0]] - scores[order[1]];
    part("say").textContent = "Best fit: " + SPORTS[order[0]].name + ", ahead of " + SPORTS[order[1]].name + " by " + gap.toFixed(average ? 2 : 1) + ". " +
      (average ? "" : "Adding up favours the sport whose weights are largest in total.");
  }
  draw();
}
