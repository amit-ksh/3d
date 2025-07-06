// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/postprocessing/EffectComposer");
require("three/examples/js/postprocessing/RenderPass");
require("three/examples/js/postprocessing/UnrealBloomPass");
require("three/examples/js/postprocessing/ShaderPass");
require("three/examples/js/shaders/CopyShader");
require("three/examples/js/shaders/LuminosityHighPassShader");

const canvasSketch = require("canvas-sketch");

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

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
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // LIGHTS
  const dirLight = new THREE.DirectionalLight("#ffffff", 0.4);
  dirLight.position.set(5, 5, 5);

  const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
  // scene.add(dirLight, ambientLight);

  // TORUS
  const geometry = new THREE.TorusGeometry(1, 0.3, 1000, 1000);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    // wireframe: true,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uDisplace: { value: 2 },
      uSpread: { value: 1 },
      uNoise: { value: 12 },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.z = 5;

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.4,
    0.0001,
    0.01
  );
  composer.addPass(bloomPass);

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
      // mesh.rotation.z += deltaTime / 1.5;
      material.uniforms.uTime.value += deltaTime / 1.5;

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
