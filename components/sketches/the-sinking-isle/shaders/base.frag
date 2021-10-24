varying vec2 vUv;
varying vec3 vWorldPos;

void main () {
  gl_FragColor = vec4(vUv.xy, 0, 1.0);
}
