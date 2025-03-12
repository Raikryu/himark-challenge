---
theme: dashboard
title: radar
toc: false
---

# Earthquake Reports

```js

const reports = await FileAttachment("data/damage_std.csv").csv({typed: true});

const damage = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity"
];

```
