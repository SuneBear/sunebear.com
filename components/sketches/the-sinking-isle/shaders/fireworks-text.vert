precision highp float;

attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float angle;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float music;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;
uniform sampler2D uTouch;
uniform float enterProgress;

varying vec2 vPUv;
varying vec2 vUv;

#define patternScale 1.2;

#pragma glslify: snoise2 = require('glsl-noise/simplex/2d')

float random(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main() {
	vUv = uv;

	// particle uv
	vec2 puv = offset.xy / uTextureSize;
  puv.y = 1.0 - puv.y;
	vPUv = puv;

  // pixel color
  vec4 colA = texture2D(uTexture, puv);
  float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;

	// displacement
	vec3 displaced = offset * patternScale;
	// randomise
	displaced.xy += vec2(random(pindex) - 0.25, random(offset.x + pindex) - 0.25) * uRandom * (music * 0.2);
	float rndz = (random(pindex) + snoise2(vec2(pindex * 0.1, music * 0.1)));
	float singal = mod(pindex, 2.0) > 0.0 ? 0.0 : rndz > 0.5 ? 1.0 : -1.0;
	displaced.z += rndz * (random(pindex) * uDepth) * (music * 6.0);
	// center
	displaced.xy -= uTextureSize * 0.5 * patternScale;
  displaced.xy = mix(vec2(0.0, 0.0), displaced.xy, enterProgress);

	// touch
	float t = max(0.05, texture2D(uTouch, puv).r);
	displaced.z += t * 50.0 * rndz;
	displaced.x += cos(uTime * singal * 2.0 + angle) * t * 20.0 * rndz;
	displaced.y += sin(uTime * singal * 2.0 + angle) * t * 20.0 * rndz;

	// particle size
	float psize = (snoise2(vec2(uTime * music, pindex) * 0.5) + 2.0) * music * 0.5;
  psize *= max(grey, 0.4);
	psize *= uSize;

	// final position
	vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	mvPosition.xyz += position * psize;
	vec4 finalPosition = projectionMatrix * mvPosition;

	gl_Position = finalPosition;
}
