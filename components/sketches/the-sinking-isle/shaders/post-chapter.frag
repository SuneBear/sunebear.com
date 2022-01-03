uniform float time;
uniform float progress;
uniform float intensity;
uniform float width;
uniform float scaleX;
uniform float scaleY;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D displacement;
uniform vec4 resolution;
varying vec2 vUv;

#pragma glslify: cnoise4 = require(glsl-noise/classic/4d)

float parabola( float x, float k ) {
  return pow( 4. * x * ( 1. - x ), k );
}

void main()	{
  float dt = parabola(progress,1.);
  float border = 1.;
  vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
  vec4 color1 = texture2D(texture1,newUV);
  vec4 color2 = texture2D(texture2,newUV);
  vec4 d = texture2D(displacement,vec2(newUV.x*scaleX,newUV.y*scaleY));

  float realnoise = 0.5*(cnoise4(vec4(newUV.x*scaleX  + 0.*time/3., newUV.y*scaleY,0.*time/3.,0.)) +1.);

  float w = width*dt;

  float maskvalue = smoothstep(1. - w,1.,vUv.x + mix(-w/2., 1. - w/2., progress));
  float maskvalue0 = smoothstep(1.,1.,vUv.x + progress);

  float mask = maskvalue + maskvalue*realnoise;

  float final = smoothstep(border,border+0.01,mask);

  gl_FragColor = mix(color1,color2,final);
}
