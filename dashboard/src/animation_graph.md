theme: dashboard
title: animated_bar
toc: false
---

# Animated Playback of Damage Over Time ⏱️

<div class="section">
  <label for="step-select"><strong>Step Size (hours):</strong></label>
  <select id="step-select">
    <option value="1">1</option>
    <option value="3">3</option>
    <option value="6">6</option>
    <option value="12" selected>12</option>
    <option value="24">24</option>
  </select>
</div>

<div class="section">
  <button id="play-button">▶️ Play</button>
  <button id="pause-button">⏸️ Pause</button>
</div>

<div class="section">
  <div id="animated-bar-container" class="chart-box"></div>
</div>



```js


FileAttachment("data/cleaned_mc1-reports-data.csv").text().then(text => {
  const data = d3.csvParse(text.replace(/\r\n/g, "\n").trim(), d3.autoType);
  const parse = d3.timeParse("%d/%m/%Y %H:%M");

  data.forEach(d => {
    d.time = parse(d.time);
    d.combined_damage = (
      d.sewer_and_water +
      d.power +
      d.roads_and_bridges +
      d.medical +
      d.buildings +
      d.shake_intensity
    ) / 6;
  });

  const valid = data.filter(d => d.time);
  const grouped = d3.group(valid, d => d3.timeHour(d.time));
  const timestamps = Array.from(grouped.keys()).sort((a, b) => a - b);

  let current = 0;
  let step = 12;

  function render(ts) {
    const points = grouped.get(ts) || [];
    const avg = Array.from(
      d3.rollup(points, v => d3.mean(v, d => d.combined_damage), d => d.location),
      ([location, combined_damage]) => ({ location, combined_damage })
    );

    const chart = Plot.plot({
      title: `Damage at ${ts.toLocaleString()}`,
      height: 500,
      marginLeft: 80,
      x: { label: "Combined Damage (0–10)", domain: [0, 10] },
      y: {
        label: "Neighborhood",
        reverse: true,
        tickFormat: d => `Neighborhood ${d}`
      },
      marks: [
        Plot.barX(avg, {
          x: "combined_damage",
          y: "location",
          fill: "combined_damage",
          tip: true
        })
      ],
      color: { scheme: "reds" }
    });

    const container = document.getElementById("animated-bar-container");
    container.innerHTML = "";
    container.appendChild(chart);
  }

  function next() {
    if (current >= timestamps.length) current = 0;
    render(timestamps[current]);
    const now = timestamps[current];
    const later = new Date(now.getTime() + step * 60 * 60 * 1000);
    const nextIndex = timestamps.findIndex(t => t.getTime() >= later.getTime());
    current = nextIndex === -1 ? 0 : nextIndex;
  }

  setTimeout(() => {
    const play = document.getElementById("play-button");
    const pause = document.getElementById("pause-button");
    const stepInput = document.getElementById("step-select");

    if (!play || !pause || !stepInput) return;

    play.addEventListener("click", () => {
      if (window.animInterval) clearInterval(window.animInterval);
      window.animInterval = setInterval(next, 1000);
    });

    pause.addEventListener("click", () => {
      clearInterval(window.animInterval);
    });

    stepInput.addEventListener("change", e => {
      step = parseInt(e.target.value);
    });

    render(timestamps[0]);
  }, 100);
});
