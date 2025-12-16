import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ===============================
// GLOBAL ROTATION PIVOT
// ===============================
let rotatingPivot = null;

// 1. Scene
const container = document.getElementById("3d-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1d24);

// 2. Camera
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  10000
);
camera.position.set(0, 1, 8);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 4. Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
rimLight.position.set(0, 10, -5);
scene.add(rimLight);

// 5. Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 6. Load GLB
const loader = new GLTFLoader();

loader.load(
  "assets/bomba.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);

    // ----------------------------------
    // COMPUTE CENTER
    // ----------------------------------
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // ----------------------------------
    // CREATE CENTERED PIVOT
    // ----------------------------------
    const pivot = new THREE.Group();
    scene.add(pivot);

    // Move model so center sits at pivot origin
    model.position.sub(center);

    // ❌ DO NOT ground the model — keeps rotation centered
    // model.position.y -= box.min.y;

    pivot.add(model);
    rotatingPivot = pivot;

    // Controls target
    controls.target.set(0, 0, 0);
    controls.update();

    // Camera framing
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.6;

    camera.position.set(distance, maxDim * 0.6, distance);
    camera.lookAt(0, 0, 0);

    document.getElementById("loading-text").style.display = "none";
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Erro ao carregar o modelo:", error);
  }
);

// 7. Animation loop
function animate() {
  requestAnimationFrame(animate);

  // ✅ PERFECT CENTER ROTATION
  if (rotatingPivot) {
    rotatingPivot.rotation.y += 0.005;
  }

  controls.update();
  renderer.render(scene, camera);
}

// Resize
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

animate();
