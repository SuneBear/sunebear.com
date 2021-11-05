varying vec2 vUv;
varying vec2 vTextureUv;
varying vec2 vTraceUv;
varying float vDataScale;

uniform float time;
uniform float overlayOpacity;
uniform vec3 floorColor;
uniform vec3 originColor;
uniform vec3 clearColor;

uniform sampler2D envTraceMap;
uniform sampler2D colorDataMap;
uniform sampler2D lakeDataMap;
uniform sampler2D biomeDataMap;
uniform sampler2D floorMap;
uniform sampler2D floorPathMap;
uniform sampler2D floorOverlayMap;

float blendSoftLight(float base, float blend) {
  return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}
vec3 blendSoftLight(vec3 base, vec3 blend) {
  return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}
vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
  return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}

void main () {
  vec3 worldColor = texture2D(colorDataMap, vUv).rgb;
  vec3 biome = texture2D(biomeDataMap, vUv).rgb;
  vec3 dataColor = texture2D(envTraceMap, vTraceUv).rgb;

  vec3 overlay = texture2D(floorOverlayMap, vTextureUv).rgb;
  vec3 groundTex = texture2D(floorMap, vTextureUv).rgb;
  vec3 pathTex = texture2D(floorPathMap, vTextureUv * 2.0).rgb;
  float wdist = 0.04;
  float wd = distance(vUv, vec2(0.5, 0.5)) / wdist;
  float wt = 0.5 + ((groundTex.x*2.0-1.0) * 0.5) + ((pathTex.x*2.0-1.0) * 0.5);
  float wg = 0.45;
  wd = smoothstep(wt - wg, wt + wg, wd);
  float distFromCenter = 1.0 - clamp(wd, 0.0, 1.0);
  worldColor = mix(worldColor, vec3(originColor), distFromCenter);

  float edgeThreshold = 0.5;
  float edgeGlow = 0.025;
  float edge0 = smoothstep(edgeThreshold, edgeThreshold-edgeGlow, abs(vUv.x - 0.5));
  float edge1 = smoothstep(edgeThreshold, edgeThreshold-edgeGlow, abs(vUv.y - 0.5));
  float lake = texture2D(lakeDataMap, vUv).r;
  float pathEdge = smoothstep(0.4, 0.75, biome.b + (biome.r * 2.0 - 1.0) * 0.1);
  pathEdge = clamp(pathEdge, 0.0, 1.0);
  vec3 tex = mix(groundTex, pathTex, pathEdge);
  vec3 col = worldColor;
  float darken = 0.45; //0.66;
  col = blendSoftLight(col, col + overlay, overlayOpacity * 0.3 * biome.b * (1.0 - darken * dataColor.r));
  col = mix(col, col * (1.0 - overlay), 0.075 * (biome.b));
  col = blendSoftLight(col, tex, 1.0 - darken * dataColor.r);

  gl_FragColor = vec4(vec3(col), 1.0);
  gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
  gl_FragColor.rgb = mix(clearColor, gl_FragColor.rgb, edge0 * edge1);
  // gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), lake);
}
