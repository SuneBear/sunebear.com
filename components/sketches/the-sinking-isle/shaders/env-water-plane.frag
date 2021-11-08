varying vec2 vUv;
varying vec2 vTextureUv;
varying vec2 vSurfUv;
varying vec3 vWorldPosition;
uniform sampler2D envTraceMap;
uniform vec3 centroidPosition;
uniform sampler2D distortMap;
uniform sampler2D causticsMap;
uniform sampler2D dataMapColor;
uniform sampler2D lakeDataMap;
uniform sampler2D lakeBlurDataMap;
uniform sampler2D groundMap;
uniform vec3 waterColor;
uniform vec3 colorA;
uniform vec3 colorB;
uniform float waterOpacity;
uniform float lakeSize;
uniform float time;
uniform bool isMask;
varying float vAngle;
varying vec2 vTraceUv;
varying vec2 vGroundUv;
// Scale for UV
#define distortionScale 3.0
#define centerStaticCausticsStrength 0.04
#define causticsScale 4.0
// #define WATER 1
void main2 () {
    float lake = 1.0-texture2D(lakeDataMap, vUv).r;
  float lakeBlur = 1.0-texture2D(lakeBlurDataMap, vUv).r;
  vec3 groundColor = texture2D(dataMapColor, vUv).rgb;
  vec4 wakeData = texture2D(envTraceMap, vTraceUv).rgba;
  vec4 tex = texture2D(causticsMap, vTextureUv * causticsScale).rgba;
  gl_FragColor = vec4(vec3(colorB.rgb), 1.0);
}
void main () {
    // float lake = texture2D(lakeDataMap, vUv).r;
  float lake = 1.0-texture2D(lakeDataMap, vUv).r;
  float lakeBlur = 1.0-texture2D(lakeBlurDataMap, vUv).r;
  // vec3 groundColor = texture2D(dataMapColor, vUv).rgb;
  vec3 groundColor = texture2D(groundMap, vGroundUv).rgb;
  vec4 wakeData = texture2D(envTraceMap, vTraceUv).rgba;
  // float foam = smoothstep(1.0, 0.85, lake);
  // float ld = 0.2 + sin(time + vAngle) * 0.1;
  // float foam = smoothstep(1.0, ld, lake);
  // gl_FragColor = vec4(color + vec3(foam), 1.0);
  float dst = smoothstep(0.0, 0.5, lake);
  // float off = 0.0;
  // // float off = sin(vAngle + time) * (1.0 / steps) * 0.1;
  // dst = abs(fract((dst + 0.05 * time + off) * steps) - 0.5)*2.0;
  // dst *= smoothstep(0.1, 0.75, lake);
  vec2 uvDistort = vec2(0.0);
  float wakeStrength = wakeData.r / 4.0;

  #ifdef WATER
  vec2 wakeDirection = wakeData.gb * 0.2 * wakeStrength;
  uvDistort -= wakeDirection;
  float timeOff = time;
  #else
  vec2 wakeDirection = vec2(0.0);
  float timeOff = 0.0;
  #endif
  vec2 uvDistortOff = vec2(timeOff * 0.1, timeOff * -0.1);
  vec2 distortion = texture2D(distortMap, uvDistortOff + vTextureUv * distortionScale).rg * 2.0 - 1.0;
  uvDistort += distortion.rg * 0.05;
  vec4 waterColorMap = texture2D(causticsMap, vTextureUv * causticsScale + uvDistort);
  float foam = waterColorMap.r;
  float lakeCentroidDepth = distance(centroidPosition, vWorldPosition)/lakeSize;
  lakeCentroidDepth = smoothstep(0.0, 1.0, lakeCentroidDepth);
  float lakeBlurDepth = lakeBlur * 2.0;
  // float lakeBlurDepth = smoothstep(0.0, 1.0, lakeBlur);
  float depth = smoothstep(0.0, 0.75, lake);
  vec3 col = mix(colorA, colorB, lakeBlurDepth);
  vec2 edgeOff2D = texture2D(distortMap, vec2(0.0, 0.0) + vTextureUv * distortionScale + distortion.rg * 0.02 - wakeDirection).rg * 2.0 - 1.0;
  float edgeOff = edgeOff2D.r;
  float strongEdge = smoothstep(0.4, 0.55, lake + edgeOff2D.g * 0.05);
  float ft0 = 0.4;
  float ftf = 0.3;
  // float edgeFalloff = 1.0 - smoothstep(0.8, 0.0, lake);
  float edgeFalloff = smoothstep(ft0-ftf, ft0+ftf, lake + edgeOff2D.r * 0.05);
  #ifdef WATER
  col += foam * 0.1 * lakeBlurDepth + foam * 0.2 * (wakeStrength + centerStaticCausticsStrength);
  col = mix(col, groundColor, edgeFalloff);
  #else
  col += foam * mix(0.0, 0.1, lakeBlurDepth) + foam * 0.2 * wakeStrength;
  col = mix(col, groundColor, edgeFalloff);
  #endif
  col *= (1.0 - wakeStrength * 0.05);
  // col = mix(col, groundColor, strongEdge);
  // col = mix(col, col + 0.1, strongEdge);

  float steps = 4.0 + edgeOff2D.g * 0.2;
  // float waves = sin(distortion.r * 0.25 + edgeOff2D. + timeOff * -0.05);
  float worldOff = 0.0;
  float waves = fract(edgeOff2D.r * 0.1 + edgeOff2D.g * 0.1 + timeOff * 0.1 + worldOff);
  // waves -= sin(length(vUv - 0.5) * 10.0 + timeOff);
  float movingDst = smoothstep(0.0, 0.7, lake + edgeOff2D.r * 0.05);
  movingDst = smoothstep(0.5, 0.0, abs(fract((movingDst + waves) * steps) - 0.5) * 2.0);
  movingDst *= depth;
  // movingDst *= sin(length(vUv - 0.5) * 10.0 + timeOff);
  // movingDst = mix(movingDst, 1.0, strongEdge);
  // movingDst = mix(movingDst, 1.0, smoothstep(0.5, 0.55, lake + edgeOff2D.g * 0.05));
  float et = 0.4;
  float ef = 0.05;
  float sharpFoam = smoothstep(et-ef,et+ef, movingDst + edgeOff2D.r * 0.6) * smoothstep(et-ef,et+ef, movingDst + edgeOff2D.g * 0.6);
  sharpFoam = clamp(sharpFoam, 0.0, 1.0);
  // sharpFoam *= smoothstep(-0.2, -0.0, edgeOff2D.r);
  // sharpFoam *= smoothstep(-0.3, -0.2, edgeOff2D.g);
  #ifdef WATER
  float et0 = 0.4;
  float ef0 = 0.05;
  col = mix(col, vec3(col + 0.4 *(edgeOff2D.r*0.5+0.5)), (1.0-strongEdge) * sharpFoam);
  #else
  float et0 = 0.4;
  float ef0 = 0.05;
  col += 1.0 * mix(col, vec3(col + 0.4 *(edgeOff2D.r*0.5+0.5)), (1.0-strongEdge) * sharpFoam) * foam;
  #endif
  // col = mix(col, mix(col, vec3(0.8), smoothstep(et0+ef0, et0-ef0, lake)), sharpFoam);

  float strongEdge2 = smoothstep(0.4, 0.55, lake +edgeOff2D.r * 0.1);
  // col = mix(col, groundColor, strongEdge2);

  // col += sharpFoam * 0.5 * (smoothstep(0.5, 0.3, lake));
  // col += step(0.4, lake + edgeOff2D.r * 0.6) * step(0.4, lake + edgeOff2D.g * 0.6);
  // col += smoothstep(et-ef, et+ef, edgeOff2D.g) * movingDst * depth;
  // col = vec3(movingDst);
  // col += step(0.6, lake + edgeOff);
  // float edgeFoam01 = step(0.5, lake + distortion.r);
  // float edgeFoam02 = step(0.5, lake + distortion.g);
  // col += edgeFoam01 * edgeFoam02;
  // col = vec3(smoothstep(0.0, 0.7, lake));
  // col += smoothstep(0.1, 0.5, lake);
  // col = vec3(lakeBlurDepth);

  #ifdef WATER
  ft0 = 0.5;
  ftf = 0.1;
  float edgeAlpha = smoothstep(ft0+ftf, ft0-ftf, lake + edgeOff2D.r * 0.05);
  gl_FragColor = vec4(mix(groundColor, col, edgeAlpha), 1.0);
  if (edgeAlpha > 0.5) {
    gl_FragColor.a = waterOpacity;
  }
  #else
  ftf = 0.4;
  ft0 = 0.1;
  float edgeAlpha = smoothstep(ftf+ft0, ftf-ft0, lake + (waterColorMap.g*2.0-1.0) * 0.25);
  // gl_FragColor = vec4(vec3(step(0.25, lake)), 1.0);
  gl_FragColor = vec4(col, edgeAlpha);
  // gl_FragColor = vec4(mix(groundColor, col, edgeAlpha), 1.0);
  #endif

  // gl_FragColor = vec4(vec3(col), edgeAlpha);
  gl_FragColor = clamp(gl_FragColor.rgba, 0.0, 1.0);
  // vec3 distortion = texture2D(mapWaterNormal, vTextureUv * distortionScale).rgb * 2.0 - 1.0;
  // gl_FragColor = vec4(vec3(wakeData.r), 1.0);
  // dst *= sin(vTextureUv.x * 4.0 + timeOff);
  // gl_FragColor = vec4(vec3(distortion.r), 1.0);
  // gl_FragColor = vec4(vec3(1.0-lake), 1.0);

  if (isMask) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
