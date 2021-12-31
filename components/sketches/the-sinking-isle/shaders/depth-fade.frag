uniform sampler2D map;
uniform bool enableMap;
uniform float uAlpha;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;

void main()
{
  vec3 color = vColor;
  if (enableMap) {
    color = texture2D(map, vUv).rgb;
  }
  gl_FragColor = vec4(color, vAlpha * uAlpha);
}
