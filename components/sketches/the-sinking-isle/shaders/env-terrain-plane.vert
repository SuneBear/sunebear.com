varying vec2 vUv;
varying vec2 vTextureUv;

#ifdef HAS_TRACE_MAP
varying vec2 vTraceUv;
varying float vDataScale;
uniform sampler2D envTraceMap;
uniform mat4 envTraceProjection;
uniform mat4 envTraceView;
uniform vec2 environmentSize;
#endif
varying vec3 vWorldPosition;
uniform mat3 uvTransform;
uniform vec2 uvScale;
uniform float uvRepeatScale;
uniform float time;

void main () {
  vec4 worldPos = modelMatrix * vec4(position.xyz, 1.0);
  #ifdef HAS_TRACE_MAP
  vec2 worldPosUV = uv;
  worldPosUV.y = 1.0 - worldPosUV.y;
  vec2 dataWorldPos = (worldPosUV * 2.0 - 1.0) * environmentSize / 2.0;
  vec4 vDataUvPos4 = envTraceProjection * envTraceView * vec4(dataWorldPos.xy, 0.0, 1.0);
  vec2 vDataScreen = vDataUvPos4.xy / vDataUvPos4.w;
  vTraceUv = vDataScreen.xy * 0.5 + 0.5;
  vec3 dCol = texture2D(envTraceMap, vTraceUv).rgb;
  float dirAngle = (dCol.g * 2.0 - 1.0) * 3.14;
  vec2 curDirection2D = vec2(dCol.gb) * 2.0 - 1.0;
  vec3 curDirection = vec3(curDirection2D.x, 0.0, curDirection2D.y);
  float dScale = dCol.r;
  float dataScale = 1.0 + dScale * 0.0;
  vDataScale = dScale;
  #endif
  vUv = uv;
  vTextureUv = uv * uvScale * uvRepeatScale;
  vTextureUv = (uvTransform * vec3(vTextureUv, 1.0)).xy;
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
