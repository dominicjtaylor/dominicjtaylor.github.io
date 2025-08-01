uniform float uTime;
varying vec2 vUv;

void main() {
  float wave = sin(vUv.x * 30.0 + uTime * 5.0) * 0.1;  // faster and stronger wave
  float r = 0.5 + 0.5 * sin(uTime * 2.0 + vUv.x * 10.0);
  float g = 0.3 + 0.7 * sin(uTime * 3.0 + vUv.y * 10.0);
  float b = 0.4 + 0.6 * sin(uTime * 4.0 + vUv.x * vUv.y * 20.0);
  gl_FragColor = vec4(r + wave, g + wave, b + wave, 1.0);
}
