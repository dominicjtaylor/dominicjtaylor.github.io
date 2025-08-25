import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,100);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x000000, 0);
renderer.setClearColor(0x000000, 0.3);
document.getElementById("webgl-container").appendChild(renderer.domElement);

const horizontalScroll = document.getElementById("horizontal-scroll"); //grab the container element
horizontalScroll.addEventListener('scroll', () => {
  const sectionIndex = horizontalScroll.scrollLeft / window.innerWidth;
  const clampedIndex = Math.min(cameraStates.length - 1, Math.max(0, sectionIndex));
  currentSection = clampedIndex;
});
const container = document.getElementById("webgl-container");
container.appendChild(renderer.domElement); //append to the container

// Postprocessing (Bloom)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.4);
composer.addPass(bloomPass);

function createNetworkGlobe(radius = 5, nodeCount = 100) {
  const group = new THREE.Group();

  // Base sphere (semi-transparent, optional)
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({
      color: "#CFE6FA",
      transparent: true,
      opacity: 0.15,
      wireframe: true
    })
  );
  group.add(sphere);

  // Node material
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: "#CFE6FA"});
  const nodeGeometry = new THREE.SphereGeometry(0.15, 8, 8);

  const nodes = [];
  const edges = new THREE.Group();

  // Place nodes randomly on sphere surface
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(x, y, z);
    nodes.push(node);
    group.add(node);
  }

  // Connect random pairs with lines
  const edgeMaterial = new THREE.LineBasicMaterial({ color: "#CFE6FA", transparent: true, opacity: 0.4});
  const edgeGeom = new THREE.BufferGeometry();

  for (let i = 0; i < nodeCount * 2; i++) {
    const a = nodes[Math.floor(Math.random() * nodeCount)];
    const b = nodes[Math.floor(Math.random() * nodeCount)];
    if (a === b) continue;

    const points = [a.position, b.position];
    const geom = edgeGeom.clone().setFromPoints(points);
    const line = new THREE.Line(geom, edgeMaterial);
    edges.add(line);
  }

  // group.add(edges);

  return group;
}

const globe = createNetworkGlobe(17, 100);
scene.add(globe);

  // const mountainMesh = new THREE.Mesh(geometry, mountainMaterial);
  // mountainMesh.rotation.x = -Math.PI / 2;
  // scene.add(mountainMesh);

	// Load the cloud texture
	const cloudTexture = new THREE.TextureLoader().load('js/textures/Cloud/08.png');

	// Create the cloud material
	const cloudMaterial = new THREE.MeshLambertMaterial({
	    map: cloudTexture,
	    transparent: true,   // important for blending
	    opacity: 0.9,
	    depthWrite: false,
		side: THREE.DoubleSide
	});

	const clouds = [];
	const cloudPivots = [];

	const cloudPositions = [
	    { x: 0, y: 16, z: -30},
	    { x: -15, y: 4, z: -15},
	    { x: -30, y: 8, z: -1 },
	    { x: 20, y: 10, z: 4 },
	    { x: -10, y: 6, z: 5 },
	    { x: 2, y: 8, z: 7},
	    { x: 15, y: 2, z: 2},
	    { x: 5, y: 5, z: -35},
	    { x: 20, y: 10, z: -20},
	    { x: 25, y: 5, z: 10},
	];

	// for (let i = 0; i < 3; i++) {
	cloudPositions.forEach(pos => {
	    const cloudGeo = new THREE.PlaneGeometry(30, 20);
	    const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);

	    const pivot = new THREE.Object3D();

	    scene.add(pivot);

		cloud.position.set(pos.x,pos.y,pos.z);

	    pivot.add(cloud);
	    clouds.push(cloud);
	    cloudPivots.push(pivot);
	});
	
	// Animate subtle drift
	function animateClouds(deltaTime) {
	    // clouds.forEach(c => {
		// c.position.x += deltaTime * 0.3; // slower than camera movement
	    // });
	}

	// Lighting
	const light = new THREE.DirectionalLight(0xFFFFFF,1.5);
	light.position.set(-5, 1000, 50);
	scene.add(light);

	const ambient = new THREE.AmbientLight(0xFFFFFF,10);
	scene.add(ambient);

	//Pivoting and camera movement
	const cameraStates = [
	  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(0, 12, 30) }, // section 4
	  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(30, 5, 10) }, // section 1
	  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(20, 5, -25) }, // section 2
	  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(-5, 8, -35) }, // section 2
	  { pivot: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(-30, 5, 5) }, // section 4
	];

	let currentSection = 0;
	window.addEventListener('scroll', () => {
	  const sectionIndex = Math.round(window.scrollY / window.innerHeight);
	  currentSection = Math.min(cameraStates.length - 1, Math.max(0, sectionIndex));
	});
	
	const clock = new THREE.Clock();
	const pivot = new THREE.Vector3(-1,8,-10);

	camera.position.set(pivot.x+10,pivot.y+5,pivot.z+30);
	camera.lookAt(pivot);

	let dx = camera.position.x - pivot.x;
	let dz = camera.position.z - pivot.z;
	let radius = Math.sqrt(dx*dx + dz*dz);   // distance from pivot in x–z
	let angle = Math.atan2(dz, dx);

	let targetRotation = angle;

	// // Touch
	// window.addEventListener('touchmove', (event) => {
	//   event.preventDefault(); // stop page from scrolling
	//   const touch = event.touches[0];
	//   targetRotation = ((touch.clientX / window.innerWidth) - 0) * Math.PI / 1;
	// }, { passive: false });
	
let touchStartX = 0;

horizontalScroll.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
}, { passive: true });

horizontalScroll.addEventListener('touchmove', (event) => {
	event.preventDefault();
  const touchX = event.touches[0].clientX;
  const deltaX = touchStartX - touchX;

  // move the scroll container by the delta
	const sensitivity = 0.2;
	const fractionDrag = (deltaX / window.innerWidth) / sensitivity;

	currentSection += fractionDrag;
	currentSection = Math.max(0,Math.min(cameraStates.length - 1, currentSection));

  touchStartX = touchX;
}, { passive: false });

function animate() {
  requestAnimationFrame(animate);

const delta = clock.getDelta();
  const lerpFactor = 0.05;
  const prevSection = Math.floor(currentSection);
  const nextSection = Math.ceil(currentSection);
  const t = currentSection % 1; // interpolation factor between sections

  const prevState = cameraStates[prevSection];
  const nextState = cameraStates[nextSection];

  const desiredPos = new THREE.Vector3().lerpVectors(prevState.offset.clone().add(prevState.pivot), 
                                                     nextState.offset.clone().add(nextState.pivot), 
                                                     t);
  camera.position.lerp(desiredPos, lerpFactor);

  const lookTarget = new THREE.Vector3().lerpVectors(prevState.pivot, nextState.pivot, t);
  camera.lookAt(lookTarget);

clouds.forEach(cloud => {             
        cloud.lookAt(camera.position);
});
// animateClouds(delta);


  renderer.render(scene, camera);
}
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
	// camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setSize(container.clientWidth,container.clientHeight);
  });
// }

// initMountain();

