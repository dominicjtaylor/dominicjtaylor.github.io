uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float d = distance(vUv, uMouse);
  vec3 color = vec3(0.5 + 0.5 * cos(uTime + d * 10.0), d, 1.0 - d);
  gl_FragColor = vec4(color, 1.0);
}
