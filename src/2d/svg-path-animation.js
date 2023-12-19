const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

import gsap from "gsap";

const settings = {
  animate: true,
  fps: 24,
  playing: false,
};

const palette = random.pick(palettes);

const sketch = () => {
  init();
  const svg = document.querySelector("svg");
  const group = svg.querySelector("#group");
  const paths = svg.querySelectorAll("path");

  let delay = 0;

  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
  });

  paths.forEach((path, idx) => {
    path.style.opacity = 0;
    const totalLength = path.getTotalLength();
    const color = palette[idx] ?? random.pick(palette);

    for (let i = 0; i < totalLength; i += 1) {
      const pointLength = Math.random() * totalLength;
      const point = path.getPointAtLength(pointLength);
      const circle = createCircleWithAnimation(point);
      group.appendChild(circle);

      // Animating the circle
      tl.to(
        circle,
        {
          cx: point.x + (Math.random() - 0.5) * 10,
          cy: point.y + (Math.random() - 0.5) * 10,
          fill: color,
          duration: "random(0.5, 2)",
          ease: "power2.out",
          delay: (delay + pointLength) * 0.0025,
        },
        0
      );
    }
    delay += totalLength;
  });
};

canvasSketch(sketch, settings);

function createCircleWithAnimation(point) {
  // Create the circle
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  // Set the circle attributes
  circle.setAttribute("cx", point.x);
  circle.setAttribute("cy", point.y);
  circle.setAttribute("r", Math.random() * 3 + 0.5);
  // circle.setAttribute("fill", "rgb(10, 20, 30)");

  return circle;
}

function init() {
  const document = window.document;
  document.body.style.background = "rgba(10, 20, 30, 10)";
  document.body.style.margin = 0;
  const canvas = document.body.querySelector("canvas");
  canvas.style.background = "black";
  canvas.style.width = window.innerWidth;
  canvas.style.height = window.innerHeight;
  document.body.style.overflow = "hidden";

  document.body.innerHTML = randomSvgText;

  const svg = document.body.querySelector("svg");
  svg.style.height = "100vh";
  svg.style.width = "100%";
}

const randomSvgText = `
<svg viewBox="0 0 476.5 103.1">
    <path d="M47.2,90.8V19.4h23.9l5.8,1.8l6.3,3.2l4.6,7.1v6.1l-1,6.8l-4.3,6l-5.3,3.3l-8.6,2H47.5h20.4
  l20.7,35" />
    <path d="M111.5,44.5l7.5-4.3l6.3-1.8l6.5-0.7l5,1.8l4.3,3.9l2.8,5.8l0.3,7.8v23.9v9.6l-0.3-9.6l-4.6,3.2
  l-5,3.6l-5.7,2.5l-6.5,1.1l-5.3-1.8l-4.3-2.9l-3.2-4.6v-6.8l2.5-5.3l5.7-4.6l5.7-2.2l6.8-2.2l6.5-1l4-0.3h3.2" />
    <path d="M171.5,91.2V38.3v12.8l5-5l4.6-4.2l3.6-2.2l5.3-1.5l3.5-0.3l5.4,1.5l3.2,2l2.5,3.6l2.2,5v41" />
    <path d="M270.1,11.9v78.5V79.7l-5,5.1l-6.8,4.6l-6.8,1.8l-5.7-1.1l-5.8-2.5l-5.7-6.1l-3.6-8.2l-0.7-10
  l2.5-11.8l6.1-9l8.5-4.3l6.8-0.7l7.1,2.5l4.6,2.8l4.6,4.3" />
    <path d="M317.2,90.8h0.3l7.1-1.8l6.8-4.6l4.2-7.2l1.8-7.8l0.3-7.5l-1-6.8l-2.5-6l-3.6-4.6l-5-4.3
  l-5.3-1.8l-5-0.3l-5.8,1l-5.3,3.3l-4.6,5.3l-2.5,5l-2.1,7.5v5.8l0.7,6.7l1.7,6.1l4.3,5.7l5,3.9l5.4,2.1L317.2,90.8" />
    <path d="M362.2,91.2V38.7v11.8l5-4.3l4.6-3.9l4.3-2.8l5.3-1.5l4.6,0.7l3.2,1.5l3.6,3.5l2.5,6.1l0.7,7.5
  v33.9V51.6l1.5-2.9l7.5-6.7l5.7-2.9l4.6-1.4l5,1.4l3.3,1.8l3.9,4.6l1.8,9.3v36.1" />
    <g id="group"></g>
</svg>
`;
