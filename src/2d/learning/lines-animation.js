const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [16 * 200, 9 * 200],
  animate: true,
  fps: 60,
};

const bgColor = "rgb(0, 0, 0)";
const cellSize = 25;
const lineWidth = 0.4;
let radius = 5;
const sketch = ({ context, width, height }) => {
  window.document.body.style.background = bgColor;

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop("0.1", "#ff5c3311");
  gradient.addColorStop("0.2", "#ff66b311");
  gradient.addColorStop("0.4", "#ccccff11");
  gradient.addColorStop("0.6", "#b3ffff11");
  gradient.addColorStop("0.8", "#80ff8011");
  gradient.addColorStop("0.9", "#ffff3311");

  context.lineWidth = lineWidth;

  let timestamp = 0;
  const interval = 1000 / 60;
  let vr = 0.01;
  return ({ context, width, height, deltaTime }) => {
    if (timestamp < interval) {
      // context.fillStyle = "hsl(0,0,25%)";
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      radius += vr;
      if (radius > 5 || radius < -5) vr *= -1;

      for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
          const angle =
            (Math.cos(x * 0.004) + Math.sin(y * 0.004)) * Math.PI * radius;
          context.save();
          context.beginPath();
          // context.strokeStyle = gradients;
          context.strokeStyle = "black";
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
