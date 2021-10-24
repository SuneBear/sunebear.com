varying vec2 vUv;
varying vec2 vDataUv;

void main () {
  vUv = uv;
  vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
  vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
  vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
  vec2 scale;
  scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
  scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
  vec3 offsetPos = position.xyz;
  vec3 vertexWorldPos = centerWorldPos
    + camRightWorld * offsetPos.x * scale.x
    + camUpWorld * offsetPos.y * scale.y;
  gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
}
