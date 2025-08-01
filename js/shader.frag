uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float dist = distance(vUv, uMouse);
  float ripple = 0.5 + 0.5 * sin(40.0 * dist - uTime * 5.0);
  gl_FragColor = vec4(vec3(ripple), 1.0);
}
