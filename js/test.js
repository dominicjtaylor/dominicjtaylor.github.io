// js/mountain.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js";

function initMountain() {
  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 40);
  camera.lookAt(0, 0, 0);

  // Renderer
  const container = document.getElementById("webgl-container");
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Geometry (mountain plane)
  const geometry = new THREE.PlaneGeometry(60, 60, 200, 200);
  geometry.rotateX(-Math.PI / 2);

  // Simple material to test rendering
  const material = new THREE.MeshNormalMaterial();
  const mountainMesh = new THREE.Mesh(geometry, material);
  scene.add(mountainMesh);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    mountainMesh.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  // Handle resizing
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

initMountain();

