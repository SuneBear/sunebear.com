precision highp float;

uniform int octaves;
uniform float uTime;
uniform float uProgress;
uniform float uBrightness;
uniform float uContrast;
uniform float uSize;
uniform float uOpacity;
uniform vec2 uResolution;
uniform vec3 uSpeed;
uniform vec3 uDiffuse0;
uniform vec3 uDiffuse1;
uniform vec3 uDiffuse2;
uniform sampler2D uSampler;

varying vec2 vUv;

// Description : Array and textureless GLSL 2D simplex noise function.
// Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                      -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

#define MAX_OCTAVES 10
float fbm( in vec2 p ){
  float s = 0.0;
  float m = 0.0;
  float a = 0.5;
  for( int i=0; i<=MAX_OCTAVES; i++ ){
    if (i >= octaves){break;}
    s += a * snoise(p + (uTime + uProgress) * uSpeed.z);
    m += a;
    a *= 0.5;
    p *= 2.0;
  }

  return s/m;
}

float pattern ( in vec2 p, in float d, out vec2 q, out vec2 r ) {
  q.x = fbm( p + vec2((-uTime - uProgress) * uSpeed.x, (uTime + uProgress) * uSpeed.y) );
  q.y = fbm( p * (d * 0.8 + 0.8) + vec2(5.2,1.3) );
  r.x = fbm( p + 1.0 * d * q + vec2(1.7 ,9.2) );
  r.y = fbm( p + 1.0 * q + vec2(8.3,2.8) );
  return fbm( p + 1.0 * r );
}

void main () {
  // gl_FragColor = texture2D(uSampler, vUv);
  float uvScale = clamp(uResolution.x / 1440.0, 0.4, 1.0);
  vec2 newUV = (vUv - 0.5) * uvScale + 0.5;
  float d = texture2D(uSampler, vUv).r;
  vec2 q = vec2(0.);
  vec2 r = vec2(0.);
  float n = pattern(vec2(newUV.x, newUV.y) * uSize, d, q, r);
  vec3 finalColor = mix(uDiffuse0, uDiffuse1, n + r.y);
  finalColor = mix(finalColor, uDiffuse2, q.x + r.y);
  gl_FragColor = vec4(finalColor, uOpacity);
  gl_FragColor.rgb += uContrast;
  gl_FragColor.rgb *= uBrightness;
}
