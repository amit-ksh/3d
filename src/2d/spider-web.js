const canvasSketch = require("canvas-sketch");
const { random: CanvasRandom } = require("canvas-sketch-util");
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

let paused = false;
const palette = CanvasRandom.pick(palettes);
let t = 0;
let particles = [];
const numParticles = 40; // Increased number of particles
const baseSize = 300; // Increased base size for larger infinity symbol

canvasSketch(() => {
  angleMode(DEGREES);

  // Initialize particles with colors from the palette
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      t: i * (360 / numParticles),
      color: color(CanvasRandom.pick(palette)),
      speed: random(0.5, 0.75), // Variable speed for more dynamic movement
      size: random(200, 300), // Variable pattern size
    });
  }

  window.addEventListener("mousedown", () => {
    paused = !paused;
  });

  return () => {
    background(20);
    translate(width / 2, height / 2);

    // Draw the base infinity shape with increased size
    noFill();
    stroke(50);
    strokeWeight(2);
    drawInfinity(0, baseSize);

    // Add a glow effect to the base shape
    drawInfinity(0, baseSize + 10);
    drawInfinity(0, baseSize + 20);

    // Update and draw particles
    for (let p of particles) {
      if (!paused) {
        p.t += p.speed;
        if (p.t > 360) p.t -= 360;
      }

      // Calculate position on infinity curve
      let pos = getInfinityPoint(p.t, baseSize);

      // Draw particle with dynamic pattern
      stroke(p.color);
      strokeWeight(3);
      let patternSize = p.t;

      // Create dynamic pattern
      push();
      translate(0, 0);
      rotate(tan(p.t * p.speed));

      // Draw more complex pattern
      for (let i = 0; i < 6; i++) {
        // Increased from 4 to 6 points
        rotate(60);
        line(0, 0, patternSize, patternSize);
        // Add extra detail
        line(patternSize / 2, 0, patternSize / 2, patternSize / 2);
      }
      pop();
    }
  };
}, settings);

function drawInfinity(t, size) {
  beginShape();
  for (let angle = 0; angle <= 360; angle += 5) {
    let pos = getInfinityPoint(angle, size);
    vertex(pos.x, pos.y);
  }
  endShape();
}

function getInfinityPoint(t, size) {
  // Convert degrees to radians for calculation
  const rad = radians(t);
  // Parametric equations for infinity symbol (lemniscate)
  let x = (size * cos(rad)) / (1 + sin(rad) * sin(rad));
  let y = (size * sin(rad) * cos(rad)) / (1 + sin(rad) * sin(rad));
  return createVector(x, y);
}
