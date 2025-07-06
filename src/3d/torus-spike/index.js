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
const dat = require("dat.gui");

const canvasSketch = require("canvas-sketch");

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const settings = {
  // Make the loop animated
  animate: true,
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
  scene.add(dirLight, ambientLight);

  // Audio setup
  let analyser, dataArray, audioContext, source, audioElement;
  const fftSize = 512;

  // Create audio setup function
  const setupAudio = () => {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create audio element to load the MP3
    audioElement = document.createElement("audio");
    audioElement.src = "/assets/sounds/sunflower.mp3";
    audioElement.loop = true;
    audioElement.crossOrigin = "anonymous";

    // Create analyzer
    analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Create audio source from the audio element
    source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);

    // Connect analyzer to destination so we can hear the audio
    analyser.connect(audioContext.destination);

    // Play the audio
    audioElement
      .play()
      .then(() => {
        console.log("Audio playing successfully!");
      })
      .catch((err) => {
        console.error("Error playing audio:", err);
        // Create fallback audio source for testing if playback fails
        createFallbackAudioSource();
      });
  };

  // Create fallback audio source (oscillator) for testing
  const createFallbackAudioSource = () => {
    console.log("Creating fallback audio source");
    if (source) {
      source.disconnect();
    }

    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    oscillator.start();

    source = oscillator; // Store reference to disconnect later

    // Optional: connect to destination if you want to hear the test tone
    // gainNode.connect(audioContext.destination);
  };

  // Initialize audio on user interaction to comply with autoplay policies
  const initAudioOnUserInteraction = () => {
    window.addEventListener(
      "click",
      () => {
        if (!audioContext) {
          setTimeout(() => {
            setupAudio();
            document.getElementById("audio-message")?.remove();
          }, 5000);
        }
      },
      { once: true }
    );

    // Create a message to inform users to click
    const message = document.createElement("div");
    message.id = "audio-message";
    message.style.position = "fixed";
    message.style.top = "10px";
    message.style.left = "50%";
    message.style.transform = "translateX(-50%)";
    message.style.background = "rgba(0, 0, 0, 0.7)";
    message.style.color = "white";
    message.style.padding = "10px 20px";
    message.style.borderRadius = "5px";
    message.style.zIndex = "1000";
    message.textContent = "Click anywhere to start audio visualization";
    document.body.appendChild(message);
  };

  // Initialize audio interaction prompt
  initAudioOnUserInteraction();

  // GUI Controls
  const gui = new dat.GUI();
  const params = {
    displace: 0.9,
    spread: 3,
    noise: 2,
    bloomStrength: 0.25,
    bloomRadius: 1,
    bloomThreshold: 0.0001,
    bassInfluence: 0,
    midsInfluence: 0.2,
    highsInfluence: 1.7,
    rotationSpeed: 0.01,
  };

  gui
    .add(params, "displace", 0, 5, 0.1)
    .onChange((value) => (material.uniforms.uDisplace.value = value));
  gui
    .add(params, "spread", 0, 3, 0.1)
    .onChange((value) => (material.uniforms.uSpread.value = value));
  gui
    .add(params, "noise", 0, 20, 0.1)
    .onChange((value) => (material.uniforms.uNoise.value = value));
  gui
    .add(params, "bloomStrength", 0, 2, 0.25)
    .onChange((value) => (bloomPass.strength = value));
  gui
    .add(params, "bloomRadius", 0, 1, 0.01)
    .onChange((value) => (bloomPass.radius = value));
  gui
    .add(params, "bloomThreshold", 0, 1, 0.0001)
    .onChange((value) => (bloomPass.threshold = value));
  gui.add(params, "bassInfluence", 0, 3, 0.1);
  gui.add(params, "midsInfluence", 0, 3, 0.1);
  gui.add(params, "highsInfluence", 0, 3, 0.1);
  gui.add(params, "rotationSpeed", 0, 1, 0.01);

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
      uDisplace: { value: params.displace },
      uSpread: { value: params.spread },
      uNoise: { value: params.noise },
      uBassFr: { value: 0 },
      uMidsFr: { value: 0 },
      uTrebleFr: { value: 0 },
      uAudioAvg: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.z = 5;

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.bloomStrength,
    params.bloomThreshold,
    params.bloomRadius
  );
  composer.addPass(bloomPass);

  // Function to analyze audio data and update visualizer
  function analyzeAudio() {
    if (!analyser) return { bass: 0, mids: 0, treble: 0, average: 0 };

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Split the frequency data into ranges (bass, mids, treble)
    const bass = dataArray.slice(0, 15); // Bass frequencies
    const mids = dataArray.slice(15, 40); // Mid-range frequencies
    const treble = dataArray.slice(40, 100); // Treble frequencies

    // Calculate average levels
    const getAvg = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

    const bassAvg = getAvg(bass) / 255;
    const midsAvg = getAvg(mids) / 255;
    const trebleAvg = getAvg(treble) / 255;
    const average = getAvg(dataArray) / 255;

    return { bass: bassAvg, mids: midsAvg, treble: trebleAvg, average };
  }

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
      composer.setSize(viewportWidth, viewportHeight);
    },
    // Update & render your scene here
    render({ time, deltaTime }) {
      // Analyze audio and update visualizations
      const audioData = analyzeAudio();

      // Update uniforms based on audio data
      material.uniforms.uBassFr.value = audioData.bass * params.bassInfluence;
      material.uniforms.uMidsFr.value = audioData.mids * params.midsInfluence;
      material.uniforms.uTrebleFr.value =
        audioData.treble * params.highsInfluence;
      material.uniforms.uAudioAvg.value = audioData.average;

      // Base animation
      material.uniforms.uTime.value += deltaTime / 1.5;

      // Rotate mesh based on audio
      mesh.rotation.z +=
        deltaTime * params.rotationSpeed * (1 + audioData.bass);

      controls.update();
      composer.render(); // Use composer instead of renderer
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
      gui.destroy();

      // Clean up audio resources
      if (source) {
        source.disconnect();
      }
      if (analyser) {
        analyser.disconnect();
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    },
  };
};

canvasSketch(sketch, settings);
