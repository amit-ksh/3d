global.THREE = require("three");
import { noise2D } from "canvas-sketch-util/random";
import { Line2, LineGeometry, LineMaterial } from "three-fatline";

const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const res = 800;
const settings = {
  animate: true,
  dimensions: [res, res],
  context: "webgl",
};

const bgColor = "rgb(32, 30, 27)";

const sketch = ({ context }) => {
  window.document.body.style.background = bgColor;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bgColor);

  const camera = new THREE.OrthographicCamera(
    -res * 0.5,
    res * 0.5,
    res * 0.5,
    -res * 0.5,
    0,
    1000
  );
  camera.position.z = 0;

  const renderer = new THREE.WebGLRenderer({
    context,
    antialias: true,
  });
  renderer.setSize(res, res);

  const lines = createLines();
  lines.forEach((line) => scene.add(line));

  return () => {
    renderer.render(scene, camera);
  };
};

canvasSketch(sketch, settings);

// -------------------------------------
function createLines() {
  const lines = [];
  const palette = random.pick(palettes);
  for (let r = -20; r < 20; r++) {
    let wnoise = noise2D(0, r * 0.125) * 1.0;
    const lineWidth = 0.25 + Math.pow(wnoise * 0.5 + 1, 2);
    const dashSize = Math.pow(Math.random(), 2) * 15 + 4;
    const dashScale = random.range(0.5, 1);
    const color1 = new THREE.Color(random.pick(palette));
    const color2 = new THREE.Color(random.pick(palette));
    const color = new THREE.Color();
    color.lerpColors(color1, color2, Math.random());

    const material = new LineMaterial({
      // color: "rgb(241, 231, 222)",
      color,
      linewidth: lineWidth,
      resolution: new THREE.Vector2(res, res),
      dashed: Math.random() > 0.5,
      dithering: true,
      dashScale,
      dashSize,
      gapSize: dashSize * (0.2 + Math.random() * 1),
    });

    const vertices = [];
    for (let i = 0; i < 100; i++) {
      let height = 0;
      height += noise2D(i * 0.0189 * 1, r * 0.125) * 2.0;
      height += noise2D(i * 0.0189 * 2, r * 0.125) * 1.0;
      height += noise2D(i * 0.0189 * 4, r * 0.125) * 0.5;
      height += noise2D(i * 0.0189 * 8, r * 0.125) * 0.25;
      height += noise2D(i * 0.0189 * 16, r * 0.125) * 0.125;

      vertices.push(-330 + 660 * (i / 100), height * 20 + r * 16, 0);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(vertices);

    const line = new Line2(geometry, material);
    line.computeLineDistances();

    lines.push(line);
  }

  return lines;
}
