// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/postprocessing/EffectComposer");
require("three/examples/js/postprocessing/RenderPass");
require("three/examples/js/postprocessing/SavePass");
require("three/examples/js/postprocessing/ShaderPass");
require("three/examples/js/shaders/CopyShader");
require("three/examples/js/shaders/BlendShader");

const canvasSketch = require("canvas-sketch");

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import { gsap } from "gsap";
import { SoftGlitchPass } from "./passes/SoftGlitch.js";

class Visualizer {
  constructor(mesh, path, frequencyUniformName) {
    this.mesh = mesh;
    this.frequencyUniformName = frequencyUniformName;
    this.mesh.material.uniforms[this.frequencyUniformName] = { value: 0 };

    // audio listener
    this.listener = new THREE.AudioListener();
    this.mesh.add(this.listener);

    // global audio source
    this.sound = new THREE.Audio(this.listener);
    this.loader = new THREE.AudioLoader();

    // analyser
    this.analyser = new THREE.AudioAnalyser(this.sound, 32);

    // loading the music
    this.loader.load(path, (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setVolume(0.5);
      console.log("audio loaded");
    });
  }

  play() {
    this.sound.play();
    console.log("playing!");
  }

  pause() {
    this.sound.pause();
    console.log("paused!");
  }

  stop() {
    this.sound.stop();
    console.log("stopped!");
  }

  getFrequency() {
    return this.analyser.getAverageFrequency();
  }

  update() {
    const freq = Math.max(this.getFrequency() - 100, 0) / 50;
    const freqUniform = this.mesh.material.uniforms[this.frequencyUniformName];
    gsap.to(freqUniform, {
      duration: 2,
      ease: "Slow.easeOut",
      value: freq,
    });

    return freq;
  }
}

const settings = {
  // Make the loop animated
  animate: true,
  dimensions: [2048, 1920],
  // Get a WebGL canvas rather than 2D
  context: "webgl2",
  fps: 60,
  recording: true,
  exporting: true,
};

const sketch = ({ context }) => {
  window.document.body.style.background = "#000129";

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  console.log(context.getParameter(context.VERSION));

  // WebGL background color
  renderer.setClearColor("#000129", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Lighting
  const dirLight = new THREE.DirectionalLight("#ffffff", 1);
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
  scene.add(dirLight, ambientLight);

  const ROTATION_SPEED = 0.02;
  const MOTION_BLUR_AMOUNT = 0.725;

  const geometry = new THREE.TorusGeometry(1, 3, 16, 100);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  const ico = new THREE.Mesh(geometry, material);
  const wireframe = new THREE.LineSegments(geometry, material);
  const WIREFRAME_DELTA = 0.015;
  wireframe.scale.setScalar(1 + WIREFRAME_DELTA);

  ico.add(wireframe);

  const visualizer = new Visualizer(
    ico,
    "/assets/sounds/fire.mp3",
    "uAudioFrequency"
  );
  scene.add(ico);

  window.addEventListener("click", () => {
    if (visualizer.sound.isPlaying) visualizer.pause();
    else visualizer.play();
  });

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  };

  // save pass
  const savePass = new THREE.SavePass(
    new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      renderTargetParameters
    )
  );

  // blend pass
  const blendPass = new THREE.ShaderPass(THREE.BlendShader, "tDiffuse1");
  blendPass.uniforms["tDiffuse2"].value = savePass.renderTarget.texture;
  blendPass.uniforms["mixRatio"].value = MOTION_BLUR_AMOUNT;

  // output pass
  const outputPass = new THREE.ShaderPass(THREE.CopyShader);
  outputPass.renderToScreen = true;

  // adding passes to composer
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  composer.addPass(blendPass);
  composer.addPass(savePass);
  composer.addPass(outputPass);

  const softGlitch = new SoftGlitchPass();
  composer.addPass(softGlitch);

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
      material.uniforms.uTime.value = time;
      const freq = visualizer.update();
      softGlitch.factor = freq > 0.6 ? 0.7 : 0.1;

      const displacement = freq > 0.4 ? freq * 2 : -freq * 2;
      const zPosition = Math.abs(displacement + camera.position.z);
      camera.position.z = Math.max(Math.min(zPosition, 40), 4);
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
