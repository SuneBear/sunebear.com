varying vec2 vUv;
varying vec3 vWorldPosition;
uniform sampler2D map;
uniform sampler2D maskMap;
uniform float time;
uniform float randomOffset;
uniform bool useMapDiscard;
uniform vec3 color;
uniform float aspect;
uniform float spriteHeight;
uniform float animateProgress;
uniform bool silhouette;
uniform vec3 tintColor;
uniform vec3 shadowColor;

#pragma glslify: noise = require('glsl-noise/classic/3d');
#pragma glslify: aastep = require('./utils/glsl-aastep');

vec3 linearToneMapping(vec3 color, float exposure)
{
  color *= exposure;
  return color;
}

void main () {
  gl_FragColor = texture2D(map, vUv);

  gl_FragColor.rgb *= tintColor;

  float alphaMap = gl_FragColor.a;
  if (alphaMap < 0.5) discard;

  // Tone Mapping
  #if defined(TONE_MAPPING)
    gl_FragColor.rgb = linearToneMapping(gl_FragColor.rgb, toneMappingExposure / 4.5);
  #endif

  // Shadow
  if (silhouette) {
    float falloff = 1.0 - clamp(pow(vWorldPosition.y / 1.0, 1.0), 0.0, 1.0);
    float shadowOpacity = 0.25;
    gl_FragColor.rgb = mix(shadowColor, vec3(1.0), alphaMap * falloff * shadowOpacity);
    gl_FragColor.a = 1.0;
  }

  // Mask Transition
  if (animateProgress < 1.0) {
    float progress = animateProgress;
    vec2 maskUVPos = vWorldPosition.xy;
    vec2 maskUV = maskUVPos * 1.25;
    maskUV.y += time * -0.1 * randomOffset;
    maskUV.x += time * -0.05;
    float n = 0.0;
    n += noise(vec3(vUv * mix(1.0, 2.0, progress), randomOffset));
    n = n * 0.5 + 0.5;
    float sdf = texture2D(maskMap, maskUV).a * n;
    float d = aastep(0.5 * (1.0 - progress), sdf);
    gl_FragColor.a *= d;
  }
}
