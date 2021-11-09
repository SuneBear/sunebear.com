uniform vec3 color;
uniform float opacity;
uniform float time;
uniform float totalDistance;
uniform float dottedFill;
uniform bool dotted;
varying vec2 vDist;
varying float vToken;

float aastep(float threshold, float value) {
  #ifdef GL_OES_standard_derivatives
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
  #else
    return step(threshold, value);
  #endif
}

void main() {
  float d = vDist.y / totalDistance;
  gl_FragColor = vec4(color, opacity);
  if (dotted) {
    // float dotted = vToken > 0.5 ? 1.0 : step(0.5, fract(-time * 0.2 + vDist.y / 1.0));
    float dotted = fract(-time * 0.2 + vDist.y / 0.5);
    dotted = mix(dotted, 1.0, step(vDist.x, dottedFill));
    gl_FragColor.a *= aastep(0.5, dotted);
  }
  // if (gl_FragColor.a < 0.5) discard;
  // gl_FragColor = vec4(mix(vec3(1.0), vec3(1.0,0.0,0.0), vToken) * vec3(d), opacity);
}
