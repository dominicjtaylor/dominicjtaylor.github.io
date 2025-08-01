uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float dist = distance(vUv, uMouse);
  float pulse = sin(uTime + dist * 10.0);
  vec3 color = vec3(dist, pulse, 1.0 - dist);
  gl_FragColor = vec4(color, 1.0);
}
