uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

// Function to convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float dist = distance(vUv, uMouse);
    float wave = sin(vUv.x * 20.0 + uTime + dist * 10.0) * 0.1;

    // Hue cycles over time and position
    float hue = mod(uTime * 0.1 + vUv.x + vUv.y * 0.5 + wave, 1.0);
    float sat = 1.0;
    float val = 1.0 - dist * 1.5;  // fade toward edges from cursor

    vec3 color = hsv2rgb(vec3(hue, sat, val));
    gl_FragColor = vec4(color, 1.0);
}
