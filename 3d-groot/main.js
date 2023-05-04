import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { gsap } from "gsap";

const backgroundColor = 0x000000;

const renderCalls = [];
function render() {
  requestAnimationFrame(render);
  renderCalls.forEach((callback) => {
    callback();
  });
}
render();

const scene = new THREE.Scene();
// scene.add(new THREE.AxesHelper(100))

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0.09, 0.11);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(backgroundColor); //0x );

renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = Math.pow(0.94, 5.0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Adjusting screen resize
window.addEventListener(
  "resize",
  function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

document.body.appendChild(renderer.domElement);

function renderScene() {
  renderer.render(scene, camera);
}
renderCalls.push(renderScene);

/* OrbitControl */
const controls = new OrbitControls(camera, renderer.domElement);

renderCalls.push(function () {
  controls.update();
});

/* /////////////////////////////// */
// LIGHTS

const ambientLight = new THREE.AmbientLight(0x404040, 4); // Ambient light to give some general illumination
scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 2, 100);
frontLight.position.set(5, 5, 5);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xffffff, 2, 100);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

/* /////////////////////////////// */
// TEXTURE
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/assets/matcap/bluegreen-512.png')
/* /////////////////////////////// */

/* /////////////////////////////// */
// FONTS

const fontLoader = new FontLoader();
const font = fontLoader.load(
  // resource URL
  "node_modules/three/examples/fonts/helvetiker_bold.typeface.json",
  (font) => {
    const textGeometry = new TextGeometry( "I'm Groot!", {
      font,
      size: 0.06,
      height: 0.02,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.001,
      bevelSize: 0.002,
      bevelSegments: 5,
    });
    textGeometry.center()
    const textMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
    const text = new THREE.Mesh(textGeometry, textMaterial)

    text.position.z = -0.2
    text.rotation.x = -Math.PI / 10
    scene.add(text)
  }
);

/* /////////////////////////////// */

/* /////////////////////////////// */
// STARS

const nStars = 4000;
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});
const starVertices = [];
for (let i = 0; i < nStars; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);

scene.add(stars);

/* /////////////////////////////// */
/* PEDASTAL */

const radius = 0.025;
const height = 0.015;
const pedestalGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
const pedestMalaterial = new THREE.MeshStandardMaterial({
  color: 0xfff0f0,
  metalness: 1,
  roughness: 0.5,
});
const pedestal = new THREE.Mesh(pedestalGeometry, pedestMalaterial);
pedestal.position.set(0, 0, 0);
pedestal.rotation.set(0, 0, 0);
scene.add(pedestal);

/* /////////////////////////////// */

/* /////////////////////////////// */
// GROOT

let groot = null;
const loader = new GLTFLoader();
loader.load("./assets/models/groot/scene.gltf", function (model) {
  groot = model.scene;
  groot.position.set(0.002, 0.011, 0);
  gsap.fromTo(camera.position, {z: 20}, {z: 0.11, duration: 3, ease: 'circ'})

  groot.scale.x = 5;
  groot.scale.y = 5;
  groot.scale.z = 5;
  scene.add(groot);
});

/* /////////////////////////////// */

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  stars.rotation.x += 0.0005;
  stars.rotation.y += 0.0002;

  pedestal.rotation.y += 0.005;
  if (groot) groot.rotation.y += 0.008;

  renderer.render(scene, camera);
}

animate();


window.addEventListener('click', () => {
  gsap.fromTo(camera.position, {z: 20}, {z: 0.11, duration: 3, ease: 'circ'})
})