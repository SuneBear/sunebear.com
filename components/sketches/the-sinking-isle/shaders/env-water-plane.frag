varying vec2 vUv;
varying vec2 vTraceUv;
varying float vDataScale;

uniform sampler2D envTraceMap;
uniform float time;

void main () {
  vec3 dataColor = texture2D(envTraceMap, vTraceUv).rgb;
  vec3 worldColor = vec3(vUv.xy, 1.0);
  worldColor += dataColor;
  gl_FragColor.rgb = worldColor;
  gl_FragColor.a = 1.0;
}
