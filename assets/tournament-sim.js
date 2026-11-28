/* Tournament machine, used by Skills Lab 3.
   TournamentSim(element) plays many tournaments between four teams rated 1800, 1700, 1650 and 1550, in three formats,
   and shows how often the strongest team, A, is champion: the estimate, and its margin, 2 × √(p(1 − p) ÷ n).

   The rules are the lab's: every match has a winner; A beats B with chance 1 ÷ (1 + 10^((RB − RA) ÷ k)), k = 400 or 200;
   knockout is A v D and B v C, then the final; in a round robin the most wins is champion, and a tie for most wins is
   settled by lot. The exact answers are found by listing every possible set of results. */
function TournamentSim(root) {
  var R = [1800, 1700, 1650, 1550], NAMES = ["A", "B", "C", "D"];
  var PAIRS = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  var FORMATS = [
    { key: "ko", label: "Knockout", games: 3 },
    { key: "rr", label: "Round robin", games: 6 },
    { key: "drr", label: "Double round robin", games: 12 }
  ];
  var k = 400;

  function chance(a, b) { return 1 / (1 + Math.pow(10, (R[b] - R[a]) / k)); }

  /* One tournament: returns the champion's index. */
  function playKo() {
    var s1 = Math.random() < chance(0, 3) ? 0 : 3, s2 = Math.random() < chance(1, 2) ? 1 : 2;
    return Math.random() < chance(s1, s2) ? s1 : s2;
  }
  function playRr(legs) {
    var wins = [0, 0, 0, 0];
    for (var leg = 0; leg < legs; leg++) {
      PAIRS.forEach(function (p) { wins[Math.random() < chance(p[0], p[1]) ? p[0] : p[1]] += 1; });
    }
    return champion(wins, Math.random());
  }
  /* Most wins; a tie is settled by lot, using u, a random number from 0 to 1. */
  function champion(wins, u) {
    var top = Math.max.apply(null, wins), tied = [];
    wins.forEach(function (w, i) { if (w === top) tied.push(i); });
    return tied[Math.floor(u * tied.length)];
  }

  /* Exact chance that A is champion. */
  function exactKo() {
    return chance(0, 3) * (chance(1, 2) * chance(0, 1) + (1 - chance(1, 2)) * chance(0, 2));
  }
  function exactRr(legs) {
    var games = [], total = 0;
    for (var leg = 0; leg < legs; leg++) games = games.concat(PAIRS);
    for (var mask = 0; mask < (1 << games.length); mask++) {
      var wins = [0, 0, 0, 0], pr = 1;
      games.forEach(function (g, i) {
        var q = chance(g[0], g[1]);
        if (mask & (1 << i)) { wins[g[1]] += 1; pr *= 1 - q; } else { wins[g[0]] += 1; pr *= q; }
      });
      var top = Math.max.apply(null, wins), tied = wins.filter(function (w) { return w === top; }).length;
      if (wins[0] === top) total += pr / tied;
    }
    return total;
  }
  function exactAll() { return [exactKo(), exactRr(1), exactRr(2)]; }

  /* Self-check against the lab's figures. */
  var check = exactAll().map(function (v) { return v.toFixed(3); }).join();
  console.assert(check === "0.539,0.500,0.599", "TournamentSim: exact answers changed: " + check);

  var BTN = "font:inherit;padding:.1em .8em;margin:0 .4em .4em 0;border:1px solid #004898;background:#fff;color:#004898;cursor:pointer";
  root.innerHTML =
    '<p style="margin:.2em 0">Elo constant: ' +
    '<label style="display:inline-block;margin-right:1em"><input type="radio" name="tsk" value="400" checked> 400, as the football paper</label>' +
    '<label style="display:inline-block"><input type="radio" name="tsk" value="200"> 200, as the volleyball paper</label></p>' +
    '<p style="margin:.4em 0"><button type="button" data-n="10" style="' + BTN + '">Play 10</button>' +
    '<button type="button" data-n="100" style="' + BTN + '">Play 100</button>' +
    '<button type="button" data-n="1000" style="' + BTN + '">Play 1,000</button>' +
    '<button type="button" data-el="reset" style="' + BTN + '">Start again</button></p>' +
    '<div data-el="rows"></div>' +
    '<p style="margin:.4em 0 0"><label style="display:inline"><input type="checkbox" data-el="exact"> Show the exact answers (the red marks)</label></p>' +
    '<p data-el="say" style="font-weight:500;margin:.6em 0 0"></p>';
  function part(name) { return root.querySelector('[data-el="' + name + '"]'); }

  /* Each format: its name and readout on one line, the track under it. The track runs from LO to HI. */
  var LO = 0.3, HI = 0.9, GRID = [0.3, 0.5, 0.7, 0.9];
  function x(v) { return ((Math.min(HI, Math.max(LO, v)) - LO) / (HI - LO) * 100) + "%"; }
  var lines = GRID.map(function (g) { return "linear-gradient(#a7a9ac,#a7a9ac) " + x(g) + " 0/1px 100% no-repeat"; }).join(",");
  var rows = FORMATS.map(function (f) {
    var box = document.createElement("div"), head = document.createElement("div"), name = document.createElement("span"),
        val = document.createElement("strong"), track = document.createElement("div"),
        bar = document.createElement("i"), dot = document.createElement("b"), tick = document.createElement("u");
    box.style.cssText = "margin:.5em 0";
    head.style.cssText = "display:flex;justify-content:space-between;gap:.6em;flex-wrap:wrap";
    track.style.cssText = "position:relative;height:1.4em;margin-top:.15em;background:" + lines;
    bar.style.cssText = "position:absolute;top:45%;height:10%;background:#004898";
    dot.style.cssText = "position:absolute;top:20%;width:.6em;height:60%;margin-left:-.3em;background:#004898";
    tick.style.cssText = "position:absolute;top:0;width:2px;height:100%;margin-left:-1px;background:#d7000f;display:none";
    val.style.cssText = "font-variant-numeric:tabular-nums;font-weight:400";
    name.textContent = f.label + " (" + f.games + " games)";
    [bar, dot, tick].forEach(function (el) { track.appendChild(el); });
    head.appendChild(name); head.appendChild(val);
    box.appendChild(head); box.appendChild(track);
    part("rows").appendChild(box);
    return { bar: bar, dot: dot, tick: tick, val: val, wins: 0, n: 0 };
  });
  var scale = document.createElement("div");
  scale.style.cssText = "position:relative;height:1.3em;font-size:.8em;color:#6d6e71";
  GRID.forEach(function (g, i) {
    var lab = document.createElement("span");
    lab.textContent = Math.round(g * 100) + "%";
    lab.style.cssText = "position:absolute;left:" + x(g) + ";transform:translateX(" + (i === 0 ? "0" : i === GRID.length - 1 ? "-100%" : "-50%") + ")";
    scale.appendChild(lab);
  });
  part("rows").appendChild(scale);

  function play(n) {
    for (var t = 0; t < n; t++) {
      if (playKo() === 0) rows[0].wins += 1;
      if (playRr(1) === 0) rows[1].wins += 1;
      if (playRr(2) === 0) rows[2].wins += 1;
    }
    rows.forEach(function (r) { r.n += n; });
    draw();
  }
  function reset() { rows.forEach(function (r) { r.wins = 0; r.n = 0; }); draw(); }

  function draw() {
    var exact = exactAll(), show = part("exact").checked, ranges = [];
    rows.forEach(function (r, i) {
      r.tick.style.left = x(exact[i]);
      r.tick.style.display = show ? "block" : "none";
      if (!r.n) {
        r.bar.style.display = r.dot.style.display = "none";
        r.val.textContent = "not played yet";
        ranges.push(null);
        return;
      }
      var p = r.wins / r.n, m = 2 * Math.sqrt(p * (1 - p) / r.n), lo = Math.max(0, p - m), hi = Math.min(1, p + m);
      r.bar.style.display = r.dot.style.display = "block";
      r.bar.style.left = x(lo); r.bar.style.width = "calc(" + x(hi) + " - " + x(lo) + ")";
      r.dot.style.left = x(p);
      r.val.textContent = (p * 100).toFixed(1) + "% ± " + (m * 100).toFixed(1) + (show ? "  (exact " + (exact[i] * 100).toFixed(1) + "%)" : "");
      ranges.push([lo, hi]);
    });
    var n = rows[0].n, say;
    if (!n) say = "Press a button to play. Each press plays the same number of tournaments in all three formats.";
    else {
      var a = ranges[0], b = ranges[1], overlap = a[0] <= b[1] && b[0] <= a[1];
      say = n.toLocaleString("en-GB") + " tournaments of each. " + (overlap
        ? "The knockout and round-robin ranges overlap: these runs cannot yet say which format gives A the better chance."
        : "The knockout and round-robin ranges no longer overlap.");
    }
    part("say").textContent = say;
  }

  root.querySelectorAll("button[data-n]").forEach(function (b) { b.addEventListener("click", function () { play(+b.getAttribute("data-n")); }); });
  part("reset").addEventListener("click", reset);
  part("exact").addEventListener("change", draw);
  root.querySelectorAll('input[name="tsk"]').forEach(function (el) {
    el.addEventListener("change", function () { k = +el.value; reset(); });
  });
  draw();
}
