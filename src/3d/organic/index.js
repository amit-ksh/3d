// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

import vertexShaderPars from "./shaders/vertex_pars.glsl";
import vertexShaderMain from "./shaders/vertex_main.glsl";

import fragmentShaderPars from "./shaders/fragment_pars.glsl";
import fragmentShaderMain from "./shaders/fragment_main.glsl";

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
  camera.position.set(0, 0, 2);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // LIGHTS
  const palette = random.pick(palettes);
  const color = random.pick(palette)
  console.log(color);
  
  const dirLight = new THREE.DirectionalLight(color, 0.4);
  dirLight.position.set(5, 5, 5);

  const backLight = dirLight.clone()
  backLight.position.z = -dirLight.position.z
  backLight.position.y = -dirLight.position.y
  backLight.position.x = -dirLight.position.x

  const ambientLight = new THREE.AmbientLight(color, 0.5);
  scene.add(dirLight,backLight, ambientLight);

  const geometry = new THREE.IcosahedronGeometry(0.5, 300);
  const material = new THREE.MeshStandardMaterial({
    roughness: 1,
    onBeforeCompile: (shader) => {
      material.userData.shader = shader;

      shader.uniforms.uTime = { value: 0 };

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`;
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        `
          ${parsVertexString}
          ${vertexShaderPars}
        `
      );

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        `
          ${mainVertexString}
          ${vertexShaderMain}
        `
      );

      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        `
          ${parsFragmentString}
          ${fragmentShaderPars}
        `
      );

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        `
          ${mainFragmentString}
          ${fragmentShaderMain}
        `
      );

    },
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
      if (material.userData.shader) {
        material.userData.shader.uniforms.uTime.value = time / 6;
      }

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
