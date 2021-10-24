uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform bool enableGrayMode;
varying vec2 vUv;

void main() {
  vec4 bloomColor = vec4(1.0) * texture2D(bloomTexture, vUv);
  vec4 baseColor = texture2D(baseTexture, vUv);
  if (baseColor.a > 0.5) {
    bloomColor = 0.5 * bloomColor;
  }
  vec4 blendColor = baseColor + bloomColor;

  float grayColor = dot(blendColor.rgb, vec3(0.22, 0.707, 0.071));

  if (enableGrayMode) {
    blendColor.r = grayColor;
    blendColor.g = grayColor;
    blendColor.b = grayColor;
    blendColor.a = 1.0;
  }

  gl_FragColor = blendColor;
}
