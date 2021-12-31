uniform float uTime;
uniform vec3 uColor;
uniform vec3 uOriginPosition;
uniform float uLimitDistance;
uniform float uFluctuationFrequency;
uniform float uFluctuationAmplitude;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;

void main(){
  vUv = uv;
  // Position
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  #ifdef USE_INSTANCING
  worldPosition = instanceMatrix * vec4(position, 1.0);
  #endif
  vec4 cameraPosition = viewMatrix * worldPosition;
  // Depth
  float depthDistance = abs(worldPosition.y - uOriginPosition.y);
  // Fluctuation
  float alphaFluctuation =
      sin(uTime * uFluctuationFrequency + worldPosition.x * uFluctuationAmplitude * 1.0) * 0.5 + 0.5 +
      sin(uTime * uFluctuationFrequency + worldPosition.y * uFluctuationAmplitude * 1.754) * 0.5 + 0.5 +
      sin(uTime * uFluctuationFrequency + worldPosition.z * uFluctuationAmplitude * 0.679) * 0.5 + 0.5
  ;
  alphaFluctuation /= 3.0;
  alphaFluctuation = alphaFluctuation * 0.9 + 0.1;
  // Alpha
  vAlpha = (1.0 - depthDistance / uLimitDistance) * alphaFluctuation;
  // Color
  vColor = uColor;
  // vColor = vec3(depthDistance / uLimitDistance);
  // Return
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
