uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

// Inferno colormap approximation function
vec3 inferno_colormap(float t) {
  t = clamp(t, 0.0, 1.0);

  float r = 0.000218 * pow(t, 5.0) - 0.0019 * pow(t, 4.0) + 0.0353 * pow(t, 3.0) - 0.144 * pow(t, 2.0) + 0.537 * t + 0.270;
  float g = 0.00206 * pow(t, 5.0) - 0.025 * pow(t, 4.0) + 0.155 * pow(t, 3.0) - 0.372 * pow(t, 2.0) + 0.742 * t + 0.022;
  float b = 0.0131 * pow(t, 5.0) - 0.106 * pow(t, 4.0) + 0.328 * pow(t, 3.0) - 0.483 * pow(t, 2.0) + 0.519 * t + 0.103;

  return vec3(r, g, b);
}

void main() {
  float dist = distance(vUv, uMouse);
  float wave = sin(vUv.x * 30.0 + uTime + dist * 15.0) * 0.15;

  float t = fract(vUv.y + wave + uTime * 0.05);

  vec3 color = inferno_colormap(t);

  gl_FragColor = vec4(color, 1.0);
}
