uniform sampler2D map;
uniform float opacity;
uniform vec3 color;
varying vec2 vUv;

void main () {
  gl_FragColor = texture2D(map, vUv) * vec4(color, opacity);
}
