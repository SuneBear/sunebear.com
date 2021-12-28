varying vec2 vUv;
uniform sampler2D colorMap;
uniform sampler2D maskMap;
uniform float time;

#define distortScale 0.009

void main() {
  vec2 pos = vUv;

  float X = pos.x * 15. + time * 0.5;
  float Y = pos.y * 15. + time * 0.5;
  pos.y += cos(X+Y) * distortScale * cos(Y);
  pos.x += sin(X-Y) * distortScale * sin(Y);

  // Check original position as well as new distorted position
  vec4 waterMaskColor = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 maskColor = texture2D(maskMap, pos);
  vec4 maskColor2 = texture2D(maskMap, vUv);

  if(maskColor != waterMaskColor || maskColor2 != waterMaskColor){
    pos = vUv;
  }

  vec4 color = texture2D(colorMap, pos);
  gl_FragColor = color;
}
