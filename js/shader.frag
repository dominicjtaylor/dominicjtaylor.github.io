uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float dist = distance(vUv, uMouse);
  float wave = sin(vUv.x * 30.0 + uTime + dist * 15.0) * 0.15;

  float r = 0.2 + 0.6 * sin(uTime * 1.2 + vUv.x * 12.0 + dist * 8.0);
  float g = 0.3 + 0.5 * sin(uTime * 1.5 + vUv.y * 14.0 + dist * 10.0);
  float b = 0.6 + 0.8 * sin(uTime * 1.3 + vUv.x * vUv.y * 25.0 + dist * 12.0);

  // Increase saturation and contrast
  r = clamp(r + wave, 0.0, 1.0);
  g = clamp(g + wave * 1.1, 0.0, 1.0);
  b = clamp(b + wave * 1.3, 0.0, 1.0);

  gl_FragColor = vec4(r, g, b, 1.0);
}
