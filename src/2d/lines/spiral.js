const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [2048, 2048],
  animate: true,
  fps: 60,
};

const bgColor = "rgb(0, 0, 0)";
const cellSize = 75;
const lineWidth = 0.4;
let radius = 2;
const sketch = ({ context, width, height }) => {
  window.document.body.style.background = bgColor;

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop("0.1", "#ff5c33");
  gradient.addColorStop("0.2", "#ff66b3");
  gradient.addColorStop("0.4", "#ccccff");
  gradient.addColorStop("0.6", "#b3ffff");
  gradient.addColorStop("0.8", "#80ff80");
  gradient.addColorStop("0.9", "#ffff33");

  context.lineWidth = lineWidth;

  let timestamp = 0;
  const interval = 1000 / 60;
  let vr = 0.009;

  return ({ context, width, height, deltaTime }) => {
    if (true || timestamp < interval) {
      context.fillStyle = "black";
      // context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      radius += vr;
      if (radius > 5 || radius < -5) vr *= -1;

      for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
          const angle =
            (Math.cos((x - 1000) * 0.003) + Math.sin((y - 400) * 0.003)) *
            radius;

          context.save();
          context.beginPath();
          // context.strokeStyle = gradient;
          context.strokeStyle = "white";
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
          context.stroke();
          context.restore();
        }
      }
      timestamp = 0;
    } else {
      timestamp += deltaTime;
    }
  };
};

canvasSketch(sketch, settings);
