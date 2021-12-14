uniform sampler2D map;
uniform sampler2D bloomMap;
uniform sampler2D blueNoiseMap;
uniform sampler2D shadowMap;
uniform sampler2D outlineMap;
uniform sampler2D lutMap;
uniform float exposure;
uniform vec2 resolution;
uniform bool enableShadow;
uniform bool enableBloom;
uniform bool enableOutline;
uniform bool enableVignette;
uniform bool enableLut;
uniform bool enableMono;
uniform float fadeToClearProgress;
uniform vec3 fadeToClearColor;
varying vec2 vUv;

// Blend Functions
float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}
vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}
vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
  return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}
float blendSoftLight(float base, float blend) {
  return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}
vec3 blendSoftLight(vec3 base, vec3 blend) {
  return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}
vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
  return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}

// Tone Mapping
#define gamma 2.2
vec3 simpleReinhardToneMapping(vec3 color, float exposure)
{
  color *= exposure/(1. + color / exposure);
  color = pow(color, vec3(1. / gamma));
  return color;
}
vec3 linearToneMapping(vec3 color, float exposure)
{
  color = clamp(exposure * color, 0., 1.);
  color = pow(color, vec3(1. / gamma));
  return color;
}

// Effect Functions
vec3 vignetteEffect(vec3 base, vec4 noise, float d) {
  float vignetteStrength = 1.0;
  float vignetteDarken = 0.2;
  base = blendSoftLight(base, (noise.rgb*2.0-1.0), 0.05);
  base = mix(base, base * smoothstep(1.0, 0.35, d), vignetteStrength * vignetteDarken);
  base = blendOverlay(base, base * 1.0, smoothstep(0.3, 1.0, d) * vignetteStrength);
  base = blendOverlay(base, base * 0.5, smoothstep(0.4, 0.9, d) * vignetteStrength);
  return base;
}

highp vec3 colorLUT(in highp vec3 textureColor, in highp sampler2D lookupTable) {
  textureColor = clamp(textureColor, 0.0, 1.0);
  highp float blueColor = textureColor.b * 63.0;
  highp vec2 quad1;
  quad1.y = floor(floor(blueColor) / 8.0);
  quad1.x = floor(blueColor) - (quad1.y * 8.0);
  highp vec2 quad2;
  quad2.y = floor(ceil(blueColor) / 8.0);
  quad2.x = ceil(blueColor) - (quad2.y * 8.0);
  highp vec2 texPos1;
  texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  // #ifdef LUT_FLIP_Y
  texPos1.y = 1.0-texPos1.y;
  // #endif
  highp vec2 texPos2;
  texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  // #ifdef LUT_FLIP_Y
  texPos2.y = 1.0-texPos2.y;
  // #endif
  highp vec3 newColor1 = texture2D(lookupTable, texPos1).rgb;
  highp vec3 newColor2 = texture2D(lookupTable, texPos2).rgb;
  highp vec3 newColor = mix(newColor1, newColor2, fract(blueColor));
  return newColor;
}

void main() {
  vec4 baseColor = texture2D(map, vUv);

  // Style: Outline
  if (enableOutline) {
    vec4 outlineColor = texture2D(outlineMap, vUv);
    if (outlineColor.r > 0.2 && outlineColor.a > 0.5) {
      baseColor.rgb = blendOverlay(baseColor.rgb, outlineColor.rgb, 0.5) * 0.9;
    }
    // baseColor.rgb = outlineColor.rgb;
  }

  // Style: Shadow
  if (enableShadow) {
    baseColor -= texture2D(shadowMap, vUv) * 0.2;
    // baseColor.rgb = blendSoftLight(baseColor.rgb, texture2D(shadowMap, vUv).rgb);
  }

  // Effect: Bloom
  // @FIXME: Switch a better way to blend bloom, and mix with ToneMapping
  vec4 bloomColor = vec4(1.0) * texture2D(bloomMap, vUv);
  vec4 mixedBloomColor = (1.0 - ((1.0 - baseColor) * (1.0 - bloomColor)));
  float bloomAmount = 0.8;
  vec4 blendColor = enableBloom ? mixedBloomColor * bloomAmount + baseColor * (1. - bloomAmount) : baseColor;

  // Color: ToneMapping
  // blendColor.rgb = linearToneMapping(blendColor.rgb, 1.0);

  // Color: Luma
  blendColor.rgb += exposure / 45.0;

  // Effect: Vignitte
  vec2 nq = vUv / (20.0 / resolution.xy);
  vec2 q = vUv - 0.5;
  float d = length(q);
  vec4 noise = texture2D(blueNoiseMap, nq);
  if (enableVignette) {
    blendColor.rgb = vignetteEffect(blendColor.rgb, noise, d);
  }

  // Effect: Lut
  if (enableLut) {
    blendColor.rgb = colorLUT(blendColor.rgb, lutMap);
  }

  // Effect: Mono
  float grayColor = dot(blendColor.rgb, vec3(0.22, 0.707, 0.071));
  if (enableMono) {
    blendColor.r = grayColor;
    blendColor.g = grayColor;
    blendColor.b = grayColor;
    blendColor.a = 1.0;
  }

  gl_FragColor = blendColor;

  // Transition: FadeToClear
  // @TODO: Support ink mask transition
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(fadeToClearColor), fadeToClearProgress);
  gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 1.0);
}
