import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Scene
const scene = new THREE.Scene();

// Cameras
const aspect = window.innerWidth / window.innerHeight;
const perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
perspectiveCamera.position.set(0, 20, 120);
perspectiveCamera.lookAt(0, 0, 0);

const frustumSize = 110;
const orthoCamera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);
orthoCamera.position.set(0, 20, 120);
orthoCamera.lookAt(0, 0, 0);

let camera = perspectiveCamera;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Stats
const stats = Stats();
document.body.appendChild(stats.dom);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1.2);
scene.add(pointLight);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Sun
// const sunTexture = textureLoader.load('Sun.jpg');
const sunMaterial = new THREE.MeshStandardMaterial({
  emissive: 0xffff00,
  emissiveIntensity: 1,
  roughness: 1,
  metalness: 0.5,
});
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

// Planet definitions
const planetParams = [
  { name: 'Mercury', radius: 1.5, distance: 20, texture: 'Mercury.jpg', rotationSpeed: 0.02, orbitSpeed: 0.02 },
  { name: 'Venus', radius: 3, distance: 35, texture: 'Venus.jpg', rotationSpeed: 0.015, orbitSpeed: 0.015 },
  { name: 'Earth', radius: 3.5, distance: 50, texture: 'Earth.jpg', rotationSpeed: 0.01, orbitSpeed: 0.01 },
  { name: 'Mars', radius: 2.5, distance: 65, texture: 'Mars.jpg', rotationSpeed: 0.008, orbitSpeed: 0.008 }
];

// Create planets
const planets = [];
planetParams.forEach(param => {
  const pivot = new THREE.Object3D();
  scene.add(pivot);
  const texture = textureLoader.load(param.texture);
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.2 });
  const geometry = new THREE.SphereGeometry(param.radius, 32, 32);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(param.distance, 0, 0);
  pivot.add(mesh);
  planets.push({ ...param, pivot, mesh });
});

// GUI
const gui = new GUI();

// Camera controls folder
const cameraFolder = gui.addFolder('Camera');
const cameraControls = {
  current: 'Perspective',
  switch: () => {
    cameraControls.current = cameraControls.current === 'Perspective' ? 'Orthographic' : 'Perspective';
    camera = cameraControls.current === 'Perspective' ? perspectiveCamera : orthoCamera;
    controls.dispose();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
  }
};
cameraFolder.add(cameraControls, 'switch').name('Switch Camera Type');
cameraFolder.add(cameraControls, 'current').name('Current Camera').listen();
cameraFolder.open();

// Planet controls
planets.forEach(planet => {
  const f = gui.addFolder(planet.name);
  f.add(planet, 'rotationSpeed', 0, 0.1).name('Rotation Speed');
  f.add(planet, 'orbitSpeed', 0, 0.1).name('Orbit Speed');
  f.open();
});

gui.open();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Planet rotations and orbits
  planets.forEach(p => {
    p.mesh.rotateY(p.rotationSpeed);
    p.pivot.rotateY(p.orbitSpeed);
  });

  controls.update();
  stats.update();
  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  perspectiveCamera.aspect = aspect;
  perspectiveCamera.updateProjectionMatrix();

  orthoCamera.left = (-frustumSize * aspect) / 2;
  orthoCamera.right = (frustumSize * aspect) / 2;
  orthoCamera.top = frustumSize / 2;
  orthoCamera.bottom = -frustumSize / 2;
  orthoCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
