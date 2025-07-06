import * as THREE from "three";

class MusicVisualizer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.cylinders = [];
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;

    this.init();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.z = 50;

    // Create cylinders in a shell pattern
    this.createCylinders();

    // Setup audio context
    this.setupAudio();

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    // Start animation
    this.animate();

    // Handle window resize
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  createCylinders() {
    const numCylinders = 64; // Number of frequency bands we'll visualize
    const radius = 20; // Radius of the shell
    const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

    for (let i = 0; i < numCylinders; i++) {
      const cylinder = new THREE.Mesh(
        cylinderGeometry,
        cylinderMaterial.clone()
      );

      // Position cylinders in a shell pattern
      const phi = (Math.PI * 2 * i) / numCylinders;
      const theta = (Math.PI * i) / numCylinders;

      cylinder.position.x = radius * Math.cos(phi) * Math.sin(theta);
      cylinder.position.y = radius * Math.sin(phi) * Math.sin(theta);
      cylinder.position.z = radius * Math.cos(theta);

      // Rotate cylinder to point outward
      cylinder.lookAt(new THREE.Vector3(0, 0, 0));
      cylinder.rotateX(Math.PI / 2);

      this.cylinders.push(cylinder);
      this.scene.add(cylinder);
    }
  }

  setupAudio() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 128;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Get audio input
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
      })
      .catch((err) => console.error("Error accessing microphone:", err));
  }

  updateVisualization() {
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    this.cylinders.forEach((cylinder, i) => {
      const value = this.dataArray[i];
      const scale = (value / 255) * 10 + 1; // Scale based on audio intensity

      cylinder.scale.y = scale;

      // Update color based on frequency intensity
      const hue = (value / 255) * 0.3; // Keep it in the blue-green range
      cylinder.material.color.setHSL(hue, 0.8, 0.5);
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Rotate the entire visualization
    this.scene.rotation.y += 0.002;

    this.updateVisualization();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default MusicVisualizer;
