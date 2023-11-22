global.THREE = require("three");
import { noise2D } from "canvas-sketch-util/random";
import { Vector2, Vector3 } from "three";
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

  const redCubeXP = Math.floor(Math.random() * 5 - 2);
  const redCubeYP = Math.floor(Math.random() * 5 - 2);
  const hugeNoise = Math.random() > 0.75 ? 4 : 1;

  for (let i = -2; i < 3; i++) {
    for (let j = -2; j < 3; j++) {
      const scale = 30 + noise2D(i * 0.1789, j * 0.1789) * 10;
      const noiseScale =
        noise2D(i * 0.1789 + 39.789, j * 0.1789 + 39.789) * 2.5 * hugeNoise;

      addCube({
        scene,
        isRed: i == redCubeXP && j == redCubeYP,
        randAxis: new Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize(),
        randAngle: Math.random() * Math.PI * 2,
        position: new Vector3(i * 145, j * 145, -100),
        scale,
        subdivisions: Math.floor((j + 2 + i + 2) / 3) + 1,
        noiseScale: (j + 2 + i + 2) * 0.1 * noiseScale,
      });
    }
  }

  return () => {
    renderer.render(scene, camera);
  };
};

canvasSketch(sketch, settings);

// ADD CUBE
function addCube({
  scene,
  position,
  scale,
  subdivisions,
  noiseScale,
  randAxis,
  randAngle,
  isRed,
}) {
  const palette = random.pick(palettes);
  const frontCubeColor = random.pick(palette);
  //   const frontCubeColor = "rgb(241, 231, 222)";
  const frontRedCubeColor = "rgb(255, 120, 85)";

  const xV = new Vector3(1, 0, 0);
  const yV = new Vector3(0, 1, 0);
  const zV = new Vector3(0, 0, 1);
  const frontMaterial = new LineMaterial({
    color: frontCubeColor,
    linewidth: 2,
    resolution: new Vector2(res, res),
  });
  const frontRedMaterial = new LineMaterial({
    color: frontRedCubeColor,
    linewidth: 2,
    resolution: new Vector2(res, res),
  });
  const backMaterial = new LineMaterial({
    color: new THREE.Color(frontCubeColor).multiplyScalar(0.175),
    linewidth: 1.5,
    resolution: new Vector2(res, res),
    dashed: true,
    dashScale: 1,
    dashSize: 5,
    gapSize: 5,
  });

  for (let face = 0; face < 6; face++) {
    for (let sx = 0; sx < subdivisions; sx++) {
      for (let sy = 0; sy < subdivisions; sy++) {
        const cellSize = 1 / subdivisions;
        const cellOffset = new Vector3(sx * cellSize, sy * cellSize, 0);

        const vertices = [
          new Vector3(-1, -1, +1),
          new Vector3(+1, -1, +1),
          new Vector3(+1, +1, +1),
          new Vector3(-1, +1, +1),
        ];

        const noisePositionX =
          position.x +
          cellOffset.x * 17.18 +
          cellOffset.y * 81.91 +
          face * 0.178;
        const noisePositionY =
          position.x +
          cellOffset.x * 17.18 +
          cellOffset.y * 81.91 +
          face * 0.178;

        vertices.forEach((v) => {
          // go from -1...1 to 0...1
          v.multiplyScalar(0.5).addScalar(0.5);
          v.multiply(new Vector3(cellSize, cellSize, 1));
          v.add(cellOffset);

          // add noise
          v.add(
            new Vector3(
              noiseScale * noise2D(noisePositionX, noisePositionY),
              noiseScale *
                noise2D(noisePositionX + 17.898, noisePositionY + 17.898),
              0
            )
          );

          // go back to -1...1 from 0...1
          v.multiplyScalar(2).addScalar(-1);
        });

        const normal = new Vector3(0, 0, 1);

        let rotAxis = xV,
          rotAngle = 0;

        if (face == 0) {
          // front face, no change to apply
        } else if (face == 1) {
          // right face
          rotAxis = yV;
          rotAngle = Math.PI * 0.5;
        } else if (face == 2) {
          // back face
          rotAxis = yV;
          rotAngle = Math.PI * 1.0;
        } else if (face == 3) {
          // left face
          rotAxis = yV;
          rotAngle = Math.PI * 1.5;
        } else if (face == 4) {
          // bottom face
          rotAxis = xV;
          rotAngle = Math.PI * 0.5;
        } else if (face == 5) {
          // top face
          rotAxis = xV;
          rotAngle = Math.PI * -0.5;
        }

        vertices.forEach((v) => {
          v.applyAxisAngle(rotAxis, rotAngle);
        });
        normal.applyAxisAngle(rotAxis, rotAngle);

        vertices.forEach((v) => v.applyAxisAngle(randAxis, randAngle));
        normal.applyAxisAngle(randAxis, randAngle);
        vertices.forEach((v) => {
          v.multiplyScalar(scale);
          v.add(position);
        });

        const backFace = normal.dot(zV) < 0;

        const geoVertices = [
          vertices[0].x,
          vertices[0].y,
          vertices[0].z,
          vertices[1].x,
          vertices[1].y,
          vertices[1].z,
          vertices[2].x,
          vertices[2].y,
          vertices[2].z,
          vertices[3].x,
          vertices[3].y,
          vertices[3].z,
          vertices[0].x,
          vertices[0].y,
          vertices[0].z,
        ];

        if (!backFace) {
          const geometry = new LineGeometry();
          geometry.setPositions(geoVertices);

          const myLine = new Line2(
            geometry,
            isRed ? frontRedMaterial : frontMaterial
          );
          myLine.computeLineDistances();
          myLine.renderOrder = 2;

          scene.add(myLine);
        } else {
          const geometry = new LineGeometry();
          geometry.setPositions(geoVertices);

          const myLine = new Line2(geometry, backMaterial);
          myLine.computeLineDistances();
          myLine.renderOrder = 1;

          scene.add(myLine);
        }
      }
    }
  }
}
