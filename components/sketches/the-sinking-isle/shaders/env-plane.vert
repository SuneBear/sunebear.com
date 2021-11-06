varying vec2 vUv;
varying vec2 vTextureUv;
#ifdef HAS_ANGLE
attribute float angle;
varying float vAngle;
#endif
#ifdef HAS_GROUND_MAP
varying vec2 vGroundUv;
#endif
#ifdef HAS_SURF_UV
attribute vec2 surfUv;
varying vec2 vSurfUv;
#endif
varying vec3 vWorldPosition;
#ifdef HAS_TRACE_MAP
varying vec2 vTraceUv;
uniform sampler2D envTraceMap;
uniform mat4 envTraceProjection;
uniform mat4 envTraceView;
uniform vec2 environmentSize;
#endif
#ifdef HAS_SHADOW_MAP
varying vec2 vShadowUv;
varying vec3 vShadowClipPos;
uniform mat4 shadowProjection;
#endif
uniform mat3 uvTransform;
uniform vec2 uvScale;
uniform float uvRepeatScale;
void main () {
    vec4 worldPos = modelMatrix * vec4(position.xyz, 1.0);
    #ifdef HAS_ANGLE
    vAngle = angle;
    #endif
    #ifdef HAS_SURF_UV
    vSurfUv = surfUv;
    #endif
    #ifdef HAS_SHADOW_MAP
    // vec4 vShadowPos = shadowProjection * vec4(position.xyz, 1.0);
    // vec2 vShadowScreen = vShadowPos.xy / vShadowPos.w;
    // vShadowUv = vShadowScreen.xy * 0.5 + 0.5;
    vec4 baseClipPos = shadowProjection * vec4(worldPos.xyz, 1.0);
    vShadowClipPos = vec3(baseClipPos.xy, baseClipPos.w);
    // vShadowUv = (baseClipPos.xy / baseClipPos.w) * 0.5 + 0.5;
    #endif
    #ifdef HAS_TRACE_MAP
    vec2 worldPosUV = uv;
    worldPosUV.y = 1.0 - worldPosUV.y;
    vec2 dataWorldPos = (worldPosUV * 2.0 - 1.0) * environmentSize / 2.0;
    vec4 vTraceUvPos4 = envTraceProjection * envTraceView * vec4(dataWorldPos.xy, 0.0, 1.0);
    vec2 vDataScreen = vTraceUvPos4.xy / vTraceUvPos4.w;
    vTraceUv = vDataScreen.xy * 0.5 + 0.5;
    #endif
    vUv = uv;
    vTextureUv = uv * uvScale * uvRepeatScale;
    vTextureUv = (uvTransform * vec3(vTextureUv, 1.0)).xy;
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
    #ifdef HAS_GROUND_MAP
    vGroundUv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
    #endif
}
