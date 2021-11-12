varying vec2 vUv;
varying vec3 vWorldPosition;
uniform sampler2D map;
uniform float time;
uniform bool useMapDiscard;
uniform vec3 color;
uniform float aspect;
uniform float spriteHeight;
uniform bool silhouette;
uniform vec3 tintColor;
uniform vec3 shadowColor;

void main () {
  gl_FragColor = texture2D(map, vUv);
  gl_FragColor.rgb *= tintColor;
  float alphaMap = gl_FragColor.a;
  if (alphaMap < 0.5) discard;

  if (silhouette) {
    float falloff = 1.0 - clamp(pow(vWorldPosition.y / 1.0, 1.0), 0.0, 1.0);
    float shadowOpacity = 0.25;
    gl_FragColor.rgb = mix(shadowColor, vec3(1.0), alphaMap * falloff * shadowOpacity);
    gl_FragColor.a = 1.0;
  }
}
