import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 1. Configuração da Cena
const container = document.getElementById("3d-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1d24); // Cor de fundo do container

// 2. Câmera
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  10000  // Aumentado de 100 para 10000 para ver objetos de longe
);
// Posição inicial mais "de frente" e levemente abaixo do centro
camera.position.set(0, 1, 8);
camera.lookAt(0, 1, 0);

// 3. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 4. Iluminação aprimorada para melhor visualização
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Luz principal (frontal)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);

// Luz de preenchimento (lateral)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// Luz de destaque (de trás/cima)
const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
rimLight.position.set(0, 10, -5);
scene.add(rimLight);

// 5. Controles de Órbita (Mouse)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 500;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;

// 6. Carregar Modelo GLB
const loader = new GLTFLoader();

// --- CAMINHO DO ARQUIVO .GLB ---
// Certifique-se de que o arquivo 'bomba.glb' esteja em uma pasta 'assets'
// relativa a este arquivo HTML.
loader.load(
  "assets/bomba.glb",
  function (gltf) {
    const model = gltf.scene;
    // Centralizar e ajustar escala se necessário
    model.scale.set(1.5, 1.5, 1.5);  // Aumentado para 1.5x

    // Calcular bounding box para centralizar
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center); // Centraliza o modelo na origem

    // Ajusta o modelo para que a base fique no "chão"
    const size = new THREE.Vector3();
    box.getSize(size);
    model.position.y -= box.min.y; // Garante que a base fique em y=0

    scene.add(model);

    // Recalcular bounding box DEPOIS de reposicionar o modelo
    box.setFromObject(model);
    box.getSize(size);
    box.getCenter(center);

    // Atualiza o target do OrbitControls para o centro do modelo
    controls.target.copy(center);

    // Posiciona a câmera para melhor visualização
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5;

    // Ângulo frontal-lateral otimizado (3/4 view)
    camera.position.set(
      distance * 0.8,  // Lado direito
      center.y + maxDim * 0.5,  // Levemente acima
      distance * 0.8  // Frontal
    );
    camera.lookAt(center);
    controls.update();

    // Remove texto de carregamento
    document.getElementById("loading-text").style.display = "none";
  },
  function (xhr) {
    // Progresso
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("Erro ao carregar o modelo:", error);
    document.getElementById("loading-text").innerText =
      "Erro ao carregar o modelo 3D (Verifique o console).";

    // FALLBACK: Adiciona um cubo se o modelo falhar (para teste)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x0054a6 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  }
);

// 7. Loop de Animação
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Responsividade ao redimensionar janela
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

animate();

// ==========================================
// LIGHTBOX GALLERY FUNCTIONALITY
// ==========================================

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.querySelector(".lightbox-caption");
const closeBtn = document.querySelector(".lightbox-close");
const prevBtn = document.querySelector(".lightbox-prev");
const nextBtn = document.querySelector(".lightbox-next");

// Get all gallery images
const galleryItems = document.querySelectorAll(".gallery-item img");
let currentIndex = 0;

// Open lightbox on image click
galleryItems.forEach((img, index) => {
  img.addEventListener("click", () => {
    openLightbox(index);
  });
  // Add pointer cursor
  img.style.cursor = "pointer";
});

function openLightbox(index) {
  currentIndex = index;
  const img = galleryItems[index];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent scrolling
}

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  openLightbox(currentIndex);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
}

// Event listeners
closeBtn.addEventListener("click", closeLightbox);
nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);

// Close on background click
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});
