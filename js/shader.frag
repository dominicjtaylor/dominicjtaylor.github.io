uniform float uTime;
varying vec2 vUv;

void main() {
  float wave = sin(vUv.x * 10.0 + uTime) * 0.05;
  float r = 0.3 + 0.5 * sin(uTime + vUv.x * 2.0);
  float g = 0.4 + 0.5 * sin(uTime + vUv.y * 3.0);
  float b = 0.5 + 0.5 * sin(uTime + vUv.x * vUv.y * 10.0);
  gl_FragColor = vec4(r + wave, g + wave, b + wave, 1.0);
}
