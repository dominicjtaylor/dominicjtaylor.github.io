uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  float dist = distance(vUv, uMouse);

  // Create a ripple wave that expands outward from the mouse position
  float ripple = sin(20.0 * dist - uTime * 5.0);

  // Make the ripple effect stronger near the mouse and fade with distance
  float rippleEffect = ripple * smoothstep(0.5, 0.0, dist);

  // Base colors oscillate over time
  float r = 0.4 + 0.6 * sin(uTime + vUv.x * 10.0);
  float g = 0.3 + 0.7 * sin(uTime + vUv.y * 10.0);
  float b = 0.5 + 0.5 * sin(uTime + vUv.x * vUv.y * 20.0);

  // Add ripple effect to colors
  r += rippleEffect * 0.3;
  g += rippleEffect * 0.3;
  b += rippleEffect * 0.3;

  gl_FragColor = vec4(r, g, b, 1.0);
}
