const canvasSketch = require("canvas-sketch");

// Grab P5.js from npm
const p5 = require("p5");

let months;
const preload = (p5) => {
  // Can p5.loadImage() here and so forth
  table = p5.loadTable("src/resources/giss-data.csv", "csv", "header");
};

const settings = {
  // Use p5 in instance mode, passing the preloader
  // Can also just pass { p5 } setting if you don't need preloader
  p5: { p5, preload },
  // Turn on a render loop
  animate: true,
  playing: false,
};

const bgColor = "rgb(32, 30, 27)";

const minusOneRadius = 70;
const zeroRadius = 140;
const oneRadius = 250;
let currentRow = 1;
let currentMonth = 1;
let previousAnomaly = 0;

canvasSketch(({ play }) => {
  window.document.body.style.background = bgColor;

  months = table.columns.slice(1, 13);

  let lineColor;
  let finished = false;

  window.addEventListener("click", () => play());

  // Return a renderer, which is like p5.js 'draw' function
  return ({ p5, width, height }) => {
    if (finished) return;

    // Draw with p5.js things
    p5.background(32, 30, 27);
    p5.translate(width / 2, height / 2);
    p5.textAlign(p5.CENTER, p5.CENTER);

    p5.noFill();
    let isFirstValue = true;
    for (let j = 0; j < currentRow; j++) {
      let row = table.getRow(j);

      let totalMonths = months.length;
      if (j == currentRow - 1) {
        totalMonths = currentMonth;
      }
      for (let i = 0; i < totalMonths; i++) {
        let anomaly = row.get(months[i]);

        if (anomaly !== "***") {
          anomaly = Number.parseFloat(anomaly);
          let angle = p5.map(i, 0, months.length, 0, p5.TWO_PI) - p5.PI / 3;
          let pr = p5.map(previousAnomaly, 0, 1, zeroRadius, oneRadius);
          let r = p5.map(anomaly, 0, 1, zeroRadius, oneRadius);

          const x1 = r * p5.cos(angle);
          const y1 = r * p5.sin(angle);
          const x2 = pr * p5.cos(angle - p5.PI / 6);
          const y2 = pr * p5.sin(angle - p5.PI / 6);

          if (!isFirstValue) {
            let avg = (anomaly + previousAnomaly) * 0.5;
            let cold = p5.color(0, 0, 255);
            let warm = p5.color(255, 0, 0);
            let zero = p5.color(255);
            lineColor = zero;
            if (avg < 0) {
              lineColor = p5.lerpColor(zero, cold, p5.abs(avg));
            } else {
              lineColor = p5.lerpColor(zero, warm, p5.abs(avg));
            }

            p5.stroke(lineColor);
            p5.line(x1, y1, x2, y2);
          }
          isFirstValue = false;
          previousAnomaly = anomaly;
        }
      }
    }

    // DRAW -1 degree CIRCLE
    drawCircle(p5, "-1°", minusOneRadius, 20, p5.color(0, 255, 255));
    // DRAW 0 degree CIRCLE
    drawCircle(p5, "0°", zeroRadius, 20, p5.color(0, 255, 0));

    // DRAW 1 Degree CIRCLE
    drawCircle(p5, "1°", oneRadius, 20, p5.color(255, 150, 0));

    // DRAW MONTHS NAMES
    p5.noFill();
    p5.stroke(p5.color(255, 215, 0));
    p5.strokeWeight(2);
    p5.circle(0, 0, 600);
    for (let i = 0; i < months.length; i++) {
      p5.noStroke();
      p5.fill(p5.color(255, 215, 0));
      p5.textSize(28);
      const angle = p5.map(i, 0, months.length, 0, p5.TWO_PI) - p5.PI / 3;
      const x = (oneRadius + 65) * p5.cos(angle);
      const y = (oneRadius + 65) * p5.sin(angle);
      p5.push();
      p5.translate(x, y);
      p5.rotate(angle + p5.PI / 2);
      p5.text(months[i], 0, 0);
      p5.pop();
    }

    // WRITE YEAR
    let year = table.getRow(currentRow).get("Year");
    p5.textSize(32);
    p5.fill(lineColor ?? 255);
    p5.text(year, 0, 0);

    currentMonth = currentMonth + 1;
    if (currentMonth === months.length) {
      currentMonth = 0;
      currentRow = currentRow + 1;
      if (currentRow === table.getRowCount()) {
        finished = true;
        p5.noLoop();
      }
    }
  };
}, settings);

function drawCircle(p5, text, radius, textOffset, color) {
  p5.noFill();
  p5.stroke(color);
  p5.strokeWeight(2);
  p5.circle(0, 0, radius * 2);
  p5.fill(color);
  p5.noStroke();
  p5.text(text, radius + textOffset, 0);
}
