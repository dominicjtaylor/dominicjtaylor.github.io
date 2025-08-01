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
