import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { gsap } from 'https://cdn.skypack.dev/gsap@3.12.2';
import { ScrollTrigger } from 'https://cdn.skypack.dev/gsap@3.12.2/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float wave = sin(vUv.x * 10.0 + uTime) * 0.05;
    float r = 0.3 + 0.5 * sin(uTime + vUv.x * 2.0);
    float g = 0.4 + 0.5 * sin(uTime + vUv.y * 3.0);
    float b = 0.5 + 0.5 * sin(uTime + vUv.x * vUv.y * 10.0);
    gl_FragColor = vec4(r + wave, g + wave, b + wave, 1.0);
  }
`;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // transparent background
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 }
  }
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

function animate(time) {
  requestAnimationFrame(animate);
  material.uniforms.uTime.value = time * 0.001;
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
