import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor("#CFE6FA", 0.3);
renderer.setClearColor("#1C1C1F", 0.1);
document.getElementById("webgl-container").appendChild(renderer.domElement);

const horizontalScroll = document.getElementById("horizontal-scroll");
const panels = document.querySelectorAll(".panel");

let verticalOffset = 0;

// Listen to vertical scroll on panels
let isVerticalScrolling = false;
panels.forEach(panel => {
  panel.addEventListener('scroll', () => {
    if (panel.scrollTop > 0) {
      isVerticalScrolling = true;
      horizontalScroll.style.overflowX = "hidden"; // disable horizontal
    } else {
      isVerticalScrolling = false;
      horizontalScroll.style.overflowX = "scroll"; // enable horizontal
    }
    const scrollFraction = panel.scrollTop / (panel.scrollHeight - panel.clientHeight);
    verticalOffset = scrollFraction * 40; // tweak 20 to control how much the camera moves
  });
});

// Horizontal scroll for sections (existing)
horizontalScroll.addEventListener('scroll', () => {
  if (!isVerticalScrolling) {
    const sectionIndex = horizontalScroll.scrollLeft / window.innerWidth;
    const clampedIndex = Math.min(cameraStates.length - 1, Math.max(0, sectionIndex));
    currentSection = clampedIndex;
  }
});

//Move the webgl container up when scrolling down to content
panels.forEach(panel => {
  const header = panel.querySelector('.panel-header');
  const content = panel.querySelector('.panel-content');
	const wrapper = panel.querySelector('.panel-content-wrapper');

  panel.addEventListener('scroll', () => {
    const scrollTop = panel.scrollTop;
    const headerHeight = header.offsetHeight;
	const maxScroll = panel.scrollHeight - panel.clientHeight;
	const scrollFraction = Math.min(scrollTop / maxScroll, 1);

    // Fraction scrolled past header
    const fraction = Math.min(scrollTop / headerHeight, 1);

    // Move and shrink WebGL canvas
    const webgl = document.getElementById("webgl-container");
    webgl.style.top = `${-fraction * 0}vh`; // move up to top 30%
    webgl.style.height = `${100 - fraction * 0}vh`; // shrink to 30%
    webgl.style.opacity = `${1 - fraction}`; // fade out

    // Fade content in
    if (content) {
      if (fraction > 0.1) content.classList.add('visible');
      else content.classList.remove('visible');
    }

// Fade in background color
    const opacity = Math.min(1, scrollFraction); // max opacity 0.9
    wrapper.style.backgroundColor = `rgba(28, 28, 31, ${opacity})`;

  });
});

const container = document.getElementById("webgl-container");
container.appendChild(renderer.domElement); //append to the container

// Postprocessing (Bloom)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.3, 0.8);
composer.addPass(bloomPass);

// --- Network Globe ---
function createNetworkGlobe(radius = 22, nodeCount = 300) {
  const group = new THREE.Group();

  // Atmosphere glow sphere
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.05, 64, 64),
    new THREE.MeshPhongMaterial({ color: "#CFE6FA", transparent: true, opacity: 0.01, emissive: "#CFE6FA" })
  );

//Arc around the sphere
const arcAngle = Math.PI * 2; // 60% of a circle
const innerRadius = radius * 1.0;
const outerRadius = radius * 1.03;
const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 124,0,0, arcAngle);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8
});

const orbitalArc = new THREE.Mesh(ringGeo, ringMat);
orbitalArc.rotation.x = Math.PI / 4; // tilt 45 degrees
group.add(orbitalArc)

  // Nodes
  const nodeMaterial = new THREE.MeshStandardMaterial({ color: "#CFE6FA", emissive: "#CFE6FA"});
  const nodeGeometry = new THREE.SphereGeometry(0.15, 6, 6);

// --- helpers (drop these near the top of your file) ---
function randomUnitVector() {
  // Uniform direction on the unit sphere
  const z = 2 * Math.random() - 1;                 // cos(phi) uniform in [-1,1]
  const t = 2 * Math.PI * Math.random();           // theta uniform in [0, 2π)
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(t), r * Math.sin(t), z);
}

function randomOnSphere(radius = 1) {
  return randomUnitVector().multiplyScalar(radius);
}

const clusters = [];
const nodes = [];
const numClusters = 80;
const nodesPerCluster = 50;       // total ~300 nodes like before
// const jitterRatio = 0.13;         // ~12% of radius; tweak to tighten/loosen clusters

for (let c = 0; c < numClusters; c++) {
	const clusterNodes = [];
  const clusterCenter = randomOnSphere(radius);
  // optional: per-cluster color/emissive variation
  const clusterMaterial = nodeMaterial.clone();
  clusterMaterial.emissive.setHSL((c / numClusters), 0.6, 0.6); // subtle hue shift

  for (let i = 0; i < nodesPerCluster; i++) {
    // jitter around the cluster center, then re-project to sphere surface
	const jitterRatio = Math.random() * 0.2
    const jitter = randomUnitVector().multiplyScalar(jitterRatio * radius * Math.random());
    const pos = clusterCenter.clone().add(jitter).normalize().multiplyScalar(radius);

    const node = new THREE.Mesh(nodeGeometry, clusterMaterial);
    node.position.copy(pos);
    nodes.push(node);
    group.add(node);
	  clusterNodes.push(node);
  }
	clusters.push({ center: clusterCenter.clone(), nodes: clusterNodes });
}


// Edges + particle flow
const edges = new THREE.Group();
const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x88bbff,
  transparent: true,
  opacity: 0.2
});

const lineCount = Math.floor(nodes.length * 0.05); // 5% of nodes create edges
for (let i = 0; i < lineCount; i++) {
  const a = nodes[Math.floor(Math.random() * nodes.length)];
  const b = nodes[Math.floor(Math.random() * nodes.length)];
  if (a === b) continue;
  const geom = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
	const line = new THREE.Line(geom, edgeMaterial);
  edges.add(line);

    const particleGeom = new THREE.SphereGeometry(0.08, 10, 10);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const particle = new THREE.Mesh(particleGeom, particleMat);
    line.userData = {
      a: a.position.clone(),
      b: b.position.clone(),
      particle,
      progress: Math.random()
    };
    group.add(particle);
}

group.add(edges);

  group.userData = { nodes, edges };
group.userData.clusters = clusters;
  return group;
}

const globe = createNetworkGlobe();
scene.add(globe);



// --- Clouds ---
const cloudTexture = new THREE.TextureLoader().load('js/textures/Cloud/31.png');
const cloudMaterial = new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });
const clouds = [];
for (let i = 0; i < 30; i++) {
  const cloudGeo = new THREE.PlaneGeometry(60, 40);
  const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  cloud.position.set((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200);
  scene.add(cloud);
  clouds.push(cloud);
}

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(50, 100, 100);
scene.add(dirLight);

// --- Camera States ---
const cameraStates = [
  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(-10, 15, -80) }, // section 2
  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(0, 20, 40) }, // section 4
  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(5, 15, 10), subduedParticles: true }, // section 4
  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(20, 10, -40) }, // section 2
  { pivot: new THREE.Vector3(-39, 0, -10), offset: new THREE.Vector3(45, 10, -65) }, // section 2
];
let currentSection = 0;

window.addEventListener('scroll', () => {
  const sectionIndex = Math.round(window.scrollY / window.innerHeight);
  currentSection = Math.min(cameraStates.length - 1, Math.max(0, sectionIndex));
});

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Smooth camera transitions
  const prev = cameraStates[Math.floor(currentSection)];
  const next = cameraStates[Math.ceil(currentSection)];
  const t = currentSection % 1;
  const desiredPos = new THREE.Vector3().lerpVectors(prev.offset.clone().add(prev.pivot), next.offset.clone().add(next.pivot), t);
	//Add vertical camera movement
desiredPos.y += verticalOffset;
camera.position.lerp(desiredPos, 0.05);
  const lookTarget = new THREE.Vector3().lerpVectors(prev.pivot, next.pivot, t);
  camera.lookAt(lookTarget);
  // camera.position.lerp(desiredPos, 0.05);
  // const lookTarget = new THREE.Vector3().lerpVectors(prev.pivot, next.pivot, t);
  // camera.lookAt(lookTarget);

  // Rotate globe slowly
  globe.rotation.y += delta * 0.1;

// Determine particle speed & opacity for current section
  const state = cameraStates[Math.floor(currentSection)];
  const particleSpeed = state.subduedParticles ? 0.01 : 0.05;
  const particleOpacity = state.subduedParticles ? 0.001 : 0.05;

  // Animate edge particles
  globe.userData.edges.children.forEach(line => {
    const { a, b, particle } = line.userData;
    line.userData.progress = (line.userData.progress + delta * particleSpeed) % 1;
    particle.position.lerpVectors(a, b, line.userData.progress);
    particle.material.opacity = particleOpacity;
  });

  // Billboarding clouds
  clouds.forEach(c => c.lookAt(camera.position));

  composer.render();
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

