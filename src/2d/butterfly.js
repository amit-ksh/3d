const canvasSketch = require("canvas-sketch");
const { random } = require("canvas-sketch-util");
const palattes = require("nice-color-palettes");

// Grab P5.js from npm
const p5 = require("p5");

// Attach p5.js it to global scope
new p5();

const settings = {
  // Tell canvas-sketch we're using p5.js
  p5: true,
  // Turn on a render loop (it's off by default in canvas-sketch)
  animate: true,
  dimensions: [1080, 1080],
};

window.preload = () => {
  // Preload
};

const palatte = random.pick(palattes);

canvasSketch(() => {
  // Setup
  const nLines = 10;
  const distance = 8;

  angleMode(DEGREES);
  const colors = Array(nLines)
    .fill(undefined)
    .map(() => random.pick(palatte));

  return () => {
    // Draw
    background(10, 20, 30);
    noFill();
    strokeWeight(3);

    translate(width / 2, height / 2);

    for (let j = 0; j < nLines; j++) {
      beginShape();
      stroke(colors[j]);
      for (let i = 0; i < 359; i++) {
        const r1Min = map(
          sin(frameCount),
          -1,
          1,
          30 + j * distance,
          180 + j * distance
        );
        const r1Max = map(
          sin(frameCount),
          -1,
          1,
          180 + j * distance,
          0 + j * distance
        );

        const r2Min = map(
          sin(frameCount),
          -1,
          1,
          30 + j * distance,
          180 + j * distance
        );
        const r2Max = map(
          sin(frameCount),
          -1,
          1,
          180 + j * distance,
          0 + j * distance
        );

        // If n is even -> 2n petal
        // if n is odd -> n petal
        const n1 = 6;
        const n2 = 3;
        const rotation = 90;
        const r1 = map(sin(i * n1 + rotation), -1, 1, r1Min, r1Max);
        const r2 = map(sin(i * n2), -1, 1, r2Min, r2Max);
        const r = r1 + r2;
        const x = r * cos(i);
        const y = r * sin(i);

        vertex(x, y);
        // rect(x, y, 10, 10);
      }
      endShape(CLOSE);
    }
  };
}, settings);
