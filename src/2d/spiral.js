const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const palette = random.pick(palettes);

const settings = {
  // name: "spiral",
  dimensions: [512, 512],
  animate: true,
};

const bgColor = "rgb(0, 0, 0)";
const cellSize = 10;
const lineWidth = 1;
const padding = 20;
let radius = 0.2;
const sketch = ({ context, width, height }) => {
  window.document.body.style.background = bgColor;

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop("0.1", random.pick(palette));
  gradient.addColorStop("0.2", random.pick(palette));
  gradient.addColorStop("0.4", random.pick(palette));
  gradient.addColorStop("0.6", random.pick(palette));
  gradient.addColorStop("0.8", random.pick(palette));
  gradient.addColorStop("0.9", random.pick(palette));

  context.lineWidth = lineWidth;

  let timestamp = 0;
  const interval = 1000 / 60;
  let vr = 0.01;

  return ({ context, width, height, deltaTime }) => {
    if (true || timestamp < interval) {
      context.fillStyle = "black";
      // context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      if (radius > 5 || radius < 0) vr *= -1;
      radius += vr;

      for (let y = padding; y < height - padding; y += cellSize) {
        for (let x = padding; x < width - padding; x += cellSize) {
          const angle =
            (Math.cos((x - width / 2 + 10) * 0.01) +
              Math.sin((y - height / 2 - 480) * 0.01)) *
            radius;

          context.save();
          context.beginPath();
          context.strokeStyle = gradient;
          // context.strokeStyle = "white";
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
          // context.arc(
          //   x + Math.tan(angle) * Math.cos(random.noise1D(1)),
          //   y + Math.tan(angle) * Math.cos(random.noise1D(1)),
          //   radius,
          //   random.gaussian(180, 100),
          //   random.gaussian(180, 300),
          //   true
          // );
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
