uniform float rotation;
uniform vec2 repeat;
uniform vec2 offset;
uniform float flip;
uniform float time;
uniform sampler2D envTraceMap;
uniform mat4 envTraceProjection;
uniform mat4 envTraceView;
uniform float spriteHeight;
uniform bool silhouette;
varying vec2 vUv;
varying vec3 vWorldPosition;

#define PI 3.1415926538

#pragma glslify: noise = require('glsl-noise/classic/3d');

void main () {
  vUv = uv;
  vUv *= repeat;
  vUv += offset;
  vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
  vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
  vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

  vec2 scale;
  scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
  scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
  scale.x *= flip;
  vec4 vDataUvPos4 = envTraceProjection * envTraceView * vec4(centerWorldPos.xz, 0.0, 1.0);
  vec2 vDataScreen = vDataUvPos4.xy / vDataUvPos4.w;
  vec2 vDataUv = vDataScreen.xy * 0.5 + 0.5;
  vec3 dCol = texture2D(envTraceMap, vDataUv).rgb;
  // Mock Idle Effect
  dCol += vec3(0.7);
  vec3 offsetPos = position.xyz;
  vec3 vertexWorldPos = centerWorldPos
    + camRightWorld * offsetPos.x * scale.x
    + camUpWorld * offsetPos.y * scale.y;
  vec3 realVertexWorldPos = vertexWorldPos;
  vec3 vertexWorldBasePos = centerWorldPos;
  vec2 curDirection2D = vec2(dCol.gb) * 2.0 - 1.0;
  vec3 curDirection = vec3(curDirection2D.x, 0.0, curDirection2D.y);
  float gradientY = clamp(vertexWorldPos.y / 0.25, 0.0, 1.0);
  vertexWorldPos += 0.05 * position.y * spriteHeight * camRightWorld * sin(time*7.0) * curDirection * pow(dCol.r, 2.0) * 2.0 * gradientY;

  if (silhouette) {
    float xSkew = -60.0 * (PI/180.0);
    float ySkew = 0.0;
    vertexWorldPos.y *= 0.25;
    vertexWorldPos.xyz -= camRightWorld * realVertexWorldPos.y * 0.5;
    vertexWorldPos.z += -0.15;
  }

  // Fake Doddle Effect
  // vertexWorldPos.x += noise(vec3(vertexWorldPos.xy, sin(time * 5.0))) * 0.02;

  vWorldPosition = vertexWorldPos;
  gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
}
