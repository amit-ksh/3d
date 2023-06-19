// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";


const settings = {
  // Make the loop animated
  animate: true,
  dimensions: [2048, 1920],
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  // WebGL background color
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 0.9);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();
  const palette = random.pick(palettes);
  const color = random.pick(palette)
  console.log(color);

  // LIGHTS
  const dirLight = new THREE.DirectionalLight("#ffffff", 0.75);
  dirLight.position.set(5, 5, 5);

  const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);
  scene.add(dirLight, ambientLight);


  const uniforms = {
    uTime: {value: 0},
    uTexture: { value: new THREE.TextureLoader().load('/assets/images/ac-logo.jpg') }
}

  const geometry = new THREE.PlaneGeometry(0.8, 0.6, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader,
    fragmentShader,
  });


  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, deltaTime }) {
      // console.log(time);
    material.uniforms.uTime.value = time / 2;

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
