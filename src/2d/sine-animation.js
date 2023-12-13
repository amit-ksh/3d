const canvasSketch = require("canvas-sketch");

// Grab P5.js from npm
const p5 = require("p5");

// Attach p5.js it to global scope
new p5();

const settings = {
  // Tell canvas-sketch we're using p5.js
  p5: true,
  // Turn on a render loop (it's off by default in canvas-sketch)
  animate: true,
  dimensions: [1080 / 1.4, 1080 / 1.4],
};

window.preload = () => {
  // Preload
};

canvasSketch(() => {
  // Setup
  angleMode(DEGREES);
  rectMode(CENTER);

  return () => {
    // Draw
    background(10, 20, 30);
    noFill();
    stroke(255);

    translate(width / 2, height / 2);

    for (let i = 0; i < 200; i++) {
      push();

      rotate(sin(frameCount + i * 2) * 100);
      // rotate(sin(frameCount + i * 2) * 100 + cos(frameCount + i * 2) * 100);
      // rotate(sin(frameCount + i * 2) * 100 + tan(frameCount + i / 2) * 10);

      const r = map(sin(frameCount), -1, 1, 50, 255);
      const g = map(sin(frameCount / 2), -1, 1, 50, 255);
      const b = map(sin(frameCount / 4), -1, 1, 50, 255);

      stroke(r, g, b);

      rect(0, 0, 600 - i * 3, 600 - i * 3, 200 - i);

      pop();
    }

    frameRate(60);
  };
}, settings);
