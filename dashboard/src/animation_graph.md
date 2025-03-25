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
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const rawData = d3.csvParse(cleaned, d3.autoType);

  const parseTime = d3.timeParse("%d/%m/%Y %H:%M");
  rawData.forEach(d => {
    d.time = parseTime(d.time);
    d.combined_damage = (
      d.sewer_and_water +
      d.power +
      d.roads_and_bridges +
      d.medical +
      d.buildings +
      d.shake_intensity
    ) / 6;
  });

  const cleanData = rawData.filter(d => d.time);
  const grouped = d3.group(cleanData, d => d3.timeHour(d.time));
  const sortedTimestamps = Array.from(grouped.keys()).sort((a, b) => a - b);
  let currentIndex = 0;
  let timeStep = 12; // ⏱ Default step in hours

  function renderChart(timestamp) {
    const raw = grouped.get(timestamp) || [];

    const dataset = Array.from(
      d3.rollup(
        raw,
        v => d3.mean(v, d => d.combined_damage),
        d => d.location
      ),
      ([location, combined_damage]) => ({ location, combined_damage })
    );

    const chart = Plot.plot({
      title: `Damage at ${timestamp.toLocaleString()}`,
      height: 500,
      marginLeft: 80,
      x: { label: "Combined Damage (0–10)", domain: [0, 10] },
      y: {
        label: "Neighborhood",
        reverse: true,
        tickFormat: d => `Neighborhood ${d}`
      },
      marks: [
        Plot.barX(dataset, {
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

  function stepForward() {
    if (currentIndex >= sortedTimestamps.length) currentIndex = 0;
    renderChart(sortedTimestamps[currentIndex]);

    // Advance by timeStep hours
    const current = sortedTimestamps[currentIndex];
    const nextIndex = sortedTimestamps.findIndex(t =>
      t.getTime() >= new Date(current.getTime() + timeStep * 60 * 60 * 1000).getTime()
    );
    currentIndex = nextIndex === -1 ? 0 : nextIndex;
  }

  setTimeout(() => {
    const playBtn = document.getElementById("play-button");
    const pauseBtn = document.getElementById("pause-button");
    const stepSelect = document.getElementById("step-select");

    if (!playBtn || !pauseBtn || !stepSelect) {
      console.warn("Buttons or selector not found.");
      return;
    }

    playBtn.addEventListener("click", () => {
      if (window.animInterval) clearInterval(window.animInterval);
      window.animInterval = setInterval(stepForward, 1000);
    });

    pauseBtn.addEventListener("click", () => {
      clearInterval(window.animInterval);
    });

    stepSelect.addEventListener("change", (e) => {
      timeStep = parseInt(e.target.value);
    });

    renderChart(sortedTimestamps[0]);
  }, 100);
});
