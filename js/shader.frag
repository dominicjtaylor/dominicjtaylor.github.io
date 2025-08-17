// shader.frag

precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float dist = distance(vUv, uMouse);
    float ripple = sin(40.0 * dist - uTime * 4.0); // tight ripple
    float intensity = 0.5 + 0.5 * ripple;

    float hue = mod(uTime * 0.1 + vUv.x + ripple * 0.1, 1.0);
    float saturation = 1.0;
    float value = 1.0;

    vec3 rgb = hsv2rgb(vec3(hue, saturation, value));
    gl_FragColor = vec4(rgb * intensity, 1.0);
}
