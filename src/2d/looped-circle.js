const canvasSketch = require("canvas-sketch");
const { random } = require("canvas-sketch-util");
const palettes = require("nice-color-palettes");

const p5 = require("p5");

new p5();

const settings = {
  p5: true,
  animate: true,
  dimensions: [1080, 1080],
};

window.preload = () => {
  // Preload
};

let paused = true;
const palette = random.pick(palettes);
let position = [];
let velocity = [];
let color = [];
let count = 50;
let spacing = 30;
let angle = 0;

canvasSketch(() => {
  angleMode(DEGREES);

  // Setup
  for (let i = 0; i < count; i++) {
    position[i] = 1;
    velocity[i] = (i + 1) * 0.025;
    color[i] = random.pick(palette);
  }

  window.addEventListener("mousedown", () => {
    paused = !paused;
  });

  return () => {
    background(20);
    if (paused) return;
    // Draw
    noFill();
    translate(width / 2, height / 2);
    for (let i = 0; i < count; i++) {
      position[i] = constrain(position[i], 0, 180);

      //   update position and velocity
      if (position[i] >= 180 || position[i] <= 0) {
        velocity[i] *= -1;
      }
      position[i] += velocity[i];

      strokeWeight(3);
      stroke(color[i]);

      arc(
        0,
        0,
        (i + 1) * spacing,
        (i + 1) * spacing,
        angle + 0,
        angle + position[i]
      );
      arc(
        0,
        0,
        (i + 1) * spacing,
        (i + 1) * spacing,
        angle + 180,
        angle + position[i] - 180
      );
    }

    angle += 0.5;
  };
}, settings);
