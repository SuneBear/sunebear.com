varying vec2 vUv;
varying vec2 vTextureUv;
varying vec2 vTraceUv;
varying float vDataScale;

uniform vec3 waterColor;
uniform float waterOpacity;
uniform sampler2D causticsMap;
uniform sampler2D distortMap;
uniform sampler2D envTraceMap;
uniform float time;
uniform bool isMask;

#define waveDistortScale 0.2
#define waveFlowScale 0.02
#define waterScale 0.05
#define wakeDistortScale 0.3

void main () {
  vec3 wakeData = texture2D(envTraceMap, vTraceUv).rgb;
  vec3 worldColor = waterColor;

  // Distort
  vec2 uvDistort = vec2(0.0);
  // Wake Distort
  float wakeStrength = wakeData.r;
  vec2 wakeDirection = wakeData.gb * 0.02 * wakeStrength;
  uvDistort -= wakeDirection;
  // Wave Distort
  float timeOff = time;
  vec2 uvDistortOff = vec2(timeOff * 0.05 * waveDistortScale, timeOff * -0.05 * waveDistortScale);
  vec2 distortion = texture2D(distortMap, uvDistortOff + vTextureUv).rg * 2.0 - 1.0;
    // - Repeat Disotry
    uvDistort += distortion.rg * 0.05;
    // - Single direction flow
    uvDistort.y += timeOff * 0.04 * waveFlowScale;

  // Caustics
  vec3 causticsColor = texture2D(causticsMap, vTextureUv * waterScale + uvDistort).rgb;
  float foam = causticsColor.r;
  if (foam >= 0.4) {
    foam *= 0.5;
  }
  worldColor += foam * 0.05 + foam * wakeDistortScale * wakeStrength;
  gl_FragColor.rgb = worldColor;
  gl_FragColor.a = waterOpacity;

  if(isMask){
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
