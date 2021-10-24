varying vec2 vUv;
varying vec3 vWorldPos;

void main () {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = (projectionMatrix * modelViewMatrix) * vec4(position, 1.0);
}
