// #define IS_CLOSED
attribute float direction;
attribute vec2 vertexDistance;
attribute vec3 nextPosition;
attribute vec3 previousPosition;
attribute float vertexHasToken;
uniform bool taper;
uniform bool miter;
uniform float time;
uniform float totalDistance;
uniform float miterLimit;
uniform float thickness;
uniform float draw;
uniform bool drawing;
uniform bool filling;
uniform vec2 resolution;
varying float vToken;
varying vec2 vDist;

vec4 screenSpaceLine (vec3 offset, float computedThickness) {
  float aspect = resolution.x / resolution.y;
  vec2 aspectVec = vec2(aspect, 1.0);
  mat4 projViewModel = projectionMatrix * modelViewMatrix;
  vec4 previousProjected = projViewModel * vec4(vec3(previousPosition.xyz) + offset, 1.0);
  vec4 currentProjected = projViewModel * vec4(vec3(position.xyz) + offset, 1.0);
  vec4 nextProjected = projViewModel * vec4(vec3(nextPosition.xyz) + offset, 1.0);
  //get 2D screen space with W divide and aspect correction
  vec2 currentScreen = currentProjected.xy / currentProjected.w * aspectVec;
  vec2 previousScreen = previousProjected.xy / previousProjected.w * aspectVec;
  vec2 nextScreen = nextProjected.xy / nextProjected.w * aspectVec;

  float len = computedThickness;
  float orientation = direction;
  vec2 dirA = normalize(currentScreen - previousScreen);
  //starting point uses (next - current)
  vec2 dir = vec2(0.0);
  #ifndef IS_CLOSED
  if (currentScreen == previousScreen) {
      dir = normalize(nextScreen - currentScreen);
  }
  //ending point uses (current - previous)
  else if (currentScreen == nextScreen) {
      dir = normalize(currentScreen - previousScreen);
  }
  //somewhere in middle, needs a join
  else {
    #endif
    //get directions from (C - B) and (B - A)
    vec2 dirB = normalize(nextScreen - currentScreen);
    if (miter) {
        //now compute the miter join normal and length
      vec2 tangent = normalize(dirA + dirB);
      vec2 perp = vec2(-dirA.y, dirA.x);
      vec2 miter = vec2(-tangent.y, tangent.x);
      float miterDot = dot(miter, perp);
      len = miterDot == 0.0 ? 0.0 : (computedThickness / miterDot);
      len = clamp(len, 0.0, computedThickness * miterLimit);
      dir = tangent;
    } else {
        dir = normalize(dirA + dirB);
    }
  #ifndef IS_CLOSED
  }
  #endif
  vec2 normal = vec2(-dir.y, dir.x);
  // convert pixel thickness to NDC space
  vec2 normalLength = vec2(len / 2.0);
  normalLength = normalLength * 2.0;
  // scale normal to line thickness
  normal *= normalLength;
  normal.x /= aspect;
  vec4 finalOffset = vec4(normal * orientation, 0.0, 0.0);
  return currentProjected + finalOffset;
}

float cubicPulse( float c, float w, float x ) {
  x = abs(x - c);
  if( x>w ) return 0.0;
  x /= w;
  return 1.0 - x*x*(3.0-2.0*x);
}

float parabola( float x, float k ) {
  return pow( 4.0*x*(1.0-x), k );
}

void main () {
  float computedThickness = thickness;
  // computedThickness *= mix(0.5, 1.0, vertexHasToken);
  if (taper) computedThickness *= sin(3.14 * vertexDistance.x);
  if (drawing) {
    computedThickness *= smoothstep(1.0, 1.0-0.05, vertexDistance.x);
    computedThickness *= smoothstep(0.0, 0.05, vertexDistance.x);
    // computedThickness *= smoothstep(draw - smoothness, draw + smoothness, vertexDistance.x);
    float e = 0.25;
    float t = draw;
    // computedThickness *= parabola(vertexDistance.x, 1.0);
    float m = mix(-e, 1.0 + e, t);
    float d = 1.0 - min(1.0, abs(vertexDistance.x - m) / e);
    // computedThickness *= step(t, vertexDistance.x);
    // float d = smoothstep(m + e, m - e, vertexDistance.x);
    computedThickness *= cubicPulse(m, e, vertexDistance.x);
    // computedThickness *= smoothstep(totalDistance, totalDistance / 2.0, vertexDistance.y);
  } else if (filling) {
    computedThickness *= step(vertexDistance.x, draw);
  }
  // computedThickness *= abs(vertexDistance.y / )
  float yoff = sin(time + vertexDistance.x * 4.0) * 0.1;
  vec3 offset = vec3(0.0, 0.0, 0.0);
  // offset.y += 2.0 + sin(position.y * 4.0) * 2.0;
  gl_Position = screenSpaceLine(offset, computedThickness);
  vDist = vertexDistance;
  vToken = vertexHasToken;
}
