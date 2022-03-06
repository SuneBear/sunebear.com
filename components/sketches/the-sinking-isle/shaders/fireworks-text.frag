precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec3 uColor;
uniform float opacity;

varying vec2 vPUv;
varying vec2 vUv;

void main() {
	vec4 color = vec4(0.0);
	vec2 uv = vUv;
	vec2 puv = vPUv;

	// pixel color
	vec4 colA = texture2D(uTexture, puv);

	// greyscale
  float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
	vec4 colB = vec4(1.0, 0.85, 0.74, 1.0);

	// circle
	float border = 0.3;
	float radius = 0.5;
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);
  // Scale UV coords to account for rectangular window
	// vec2 uv = vec2(fragCoord.x - 0.25 * iResolution.x, fragCoord.y) / iResolution.y;

  uv = 2.0 * uv - 1.0;

  // Change the speed
  float wave = sin(uTime * 1.0);

  // Scale to make the circle bigger so it reaches the far edges
  float circle = (uv.x * uv.x + uv.y * uv.y) * 0.2;
  vec4 color1 = vec4(0.1, 0.2, 0.8, 1.0); // Red
  vec4 color2 = vec4(0.2, 0.1, 0.8, 1.0); // Blue

	// final color
	color = mix(colA, colB, (circle + wave) * 0.5);

  if (abs(colA.r - colA.g) < 0.01) {
    // color = colB;
  }

	color.rgb *= 0.5;
	color.a = t * opacity;
	gl_FragColor = color;
}
