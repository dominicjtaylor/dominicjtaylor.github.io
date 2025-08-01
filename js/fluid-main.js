// Set up the scene, camera, and renderer
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
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// Track mouse/touch
const mouse = { x: 0.5, y: 0.5 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / window.innerWidth;
  mouse.y = 1.0 - e.clientY / window.innerHeight;
});
window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX / window.innerWidth;
    mouse.y = 1.0 - e.touches[0].clientY / window.innerHeight;
  }
});

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    float dist = distance(vUv, uMouse);
    float wave = sin(vUv.x * 20.0 + uTime + dist * 10.0) * 0.1;

    float r = 0.4 + 0.6 * sin(uTime + vUv.x * 10.0 + dist * 5.0);
    float g = 0.3 + 0.7 * sin(uTime + vUv.y * 10.0 + dist * 5.0);
    float b = 0.5 + 0.5 * sin(uTime + vUv.x * vUv.y * 20.0 + dist * 10.0);

    gl_FragColor = vec4(r + wave, g + wave, b + wave, 1.0);
  }
`;

// Material with uniforms
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) }
  }
});

// Plane and mesh
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Animation loop
function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  material.uniforms.uMouse.value.set(mouse.x, mouse.y);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
