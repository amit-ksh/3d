const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify");

// Setup our sketch
const settings = {
  context: "webgl",
  animate: true,
  dimensions: [1080, 1080],
};

// uniform vec3      iResolution;           // viewport resolution (in pixels)
// uniform float     iTime;                 // shader playback time (in seconds)
// uniform float     iTimeDelta;            // render time (in seconds)
// uniform float     iFrameRate;            // shader frame rate
// uniform int       iFrame;                // shader playback frame
// uniform float     iChannelTime[4];       // channel playback time (in seconds)
// uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
// uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
// uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
// uniform vec4      iDate;                 // (year, month, day, time in seconds)
// uniform float     iSampleRate;           // sound sample rate (i.e., 44100)

// Your glsl code
const frag = glsl(`
  precision highp float;
  
  uniform vec3 iResolution;
  uniform float time;
  varying vec2 vUv;

  const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

  float hash( float n )
  {
      return fract(sin(n)*43758.5453);
  }

  float noise( in vec2 x )
  {
      vec2 i = floor(x);
      vec2 f = fract(x);

      f = f*f*(3.0-2.0*f);

      float n = i.x + i.y*57.0;

      return mix(mix( hash(n+ 0.0), hash(n+ 1.0),f.x),
                mix( hash(n+57.0), hash(n+58.0),f.x),f.y);
  }

  float fbm( vec2 p )
  {
      float f = 0.0;
      f += 0.50000*noise( p ); p = m*p*2.02;
      f += 0.25000*noise( p ); p = m*p*2.03;
      f += 0.12500*noise( p ); p = m*p*2.01;
      f += 0.06250*noise( p ); p = m*p*2.04;
      f += 0.03125*noise( p );
      return f/0.984375;
  }

  float length2( vec2 p )
  {
      vec2 q = p*p*p*p;
      return pow( q.x + q.y, 1.0/4.0 );
  }

  void main () {
    vec2 q = gl_FragCoord.xy/iResolution.xy;
    vec2 p = -1.0 + 2.0*q;
    p.x *= iResolution.x/iResolution.y;

    float r = sqrt(dot(p, p));
    float a = atan(p.y, p.x);

    vec3 color = vec3(1.0);

    float ss = 0.5+0.5*sin(2.0*time);
    float anim = 1.0 + 0.2*ss*clamp(1.0-r, 0.0, 1.0);
    r *= anim;

      color = vec3(0.0, 0.3, 0.4);

      // iris
      float f = fbm(5.0*p);
      color = mix(color, vec3(0.2,0.5,0.4), f);

      // color surrounding black ball
      f = 1.0 - smoothstep(0.2, 0.5, r);
      color = mix(color, vec3(0.9,0.6,0.2), f);

      // distort
      a += 0.1*fbm(20.0*p);
      
      // white edges
      f = smoothstep(0.3, 1.0, fbm(vec2(6.0*r, 20.0*a)));
      color = mix(color, vec3(1.0), f);
      
      // black edges
      f = smoothstep(0.4, 0.9, fbm(vec2(10.0*r, 15.0*a)));
      color *= 1.0 - 0.5*f;

      // black highlight around the eye
      f = smoothstep(0.6, 0.8, r);
      color *= 1.0 - 0.6*f;

      // center
      f = smoothstep(0.17, 0.35, 1.1*r);
      color *= f;

      // white highlight near eye ball
      f = 1.0 - smoothstep(0.0,  0.2, length(p - vec2(0.25, 0.2)));
      color += vec3(1.0, 0.9, 0.8)*f*0.8;

      f = smoothstep(0.75, 0.8, r);
      color = mix(color, vec3(1.0), f);

    gl_FragColor = vec4(color, 1.0);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it. It will be rendered by regl.
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,

    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      time: ({ time }) => time,
      iResolution: () => [1080, 1080, 1],
    },
  });
};

canvasSketch(sketch, settings);
