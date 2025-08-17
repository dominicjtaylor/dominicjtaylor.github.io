import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export function initCube() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // Track mouse position
  let mouseX = 0;

  window.addEventListener('mousemove', (event) => {
    // Normalize horizontal mouse position to [-1, 1]
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  });

  function animate() {
    requestAnimationFrame(animate);

    // Rotate cube based on mouseX
    cube.rotation.y = mouseX * Math.PI; // adjust multiplier for sensitivity

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

initCube();

