uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float dist = distance(vUv, uMouse);
  float ripple = sin(40.0 * dist - uTime * 5.0);

  float intensity = 1.0 - smoothstep(0.0, 0.5, dist);
  float brightness = ripple * intensity;

  vec3 baseColor = vec3(0.2, 0.4, 0.8);  // bluish
  vec3 color = baseColor + brightness;

  gl_FragColor = vec4(color, 1.0);
}
