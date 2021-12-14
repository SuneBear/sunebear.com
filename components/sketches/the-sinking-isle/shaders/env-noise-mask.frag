varying vec2 vUv;
varying vec2 vTextureUv;
uniform sampler2D grainNoiseMap;

void main () {
  vec4 grainColor = texture2D(grainNoiseMap, vUv * 300.0);
  gl_FragColor = grainColor;
  gl_FragColor.a = 0.2;
}
