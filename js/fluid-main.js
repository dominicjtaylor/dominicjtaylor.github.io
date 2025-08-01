// Setup scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Transparent background
document.body.appendChild(renderer.domElement);

// Vertex shader (pass UV coords)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader (animated RGB waves)
const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float wave = sin(vUv.x * 20.0 + uTime) * 0.1;
    float r = 0.3 + 0.6 * sin(uTime + vUv.x * 10.0);
    float g = 0.3 + 0.6 * sin(uTime + vUv.y * 10.0);
    float b = 0.5 + 0.4 * sin(uTime + vUv.x * vUv.y * 20.0);
    gl_FragColor = vec4(r + wave, g + wave, b + wave, 1.0);
  }
`;

// Create geometry and shader material
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0.0 }
  }
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Animation loop
function animate(time) {
  material.uniforms.uTime.value = time * 0.001; // seconds
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
