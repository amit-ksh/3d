varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPattern;
varying float vElevation;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;
uniform float uBassFr;
uniform float uMidsFr;
uniform float uTrebleFr;
uniform float uAudioAvg;

#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3){
    p3=fract(p3*MOD3);
    p3+=dot(p3,p3.yxz+19.19);
    return-1.+2.*fract(vec3((p3.x+p3.y)*p3.z,(p3.x+p3.z)*p3.y,(p3.y+p3.z)*p3.x));
}
float pnoise(vec3 p){
    vec3 pi=floor(p);
    vec3 pf=p-pi;
    vec3 w=pf*pf*(3.-2.*pf);
    return mix(
        mix(
            mix(dot(pf-vec3(0,0,0),hash33(pi+vec3(0,0,0))),
            dot(pf-vec3(1,0,0),hash33(pi+vec3(1,0,0))),
        w.x),
        mix(dot(pf-vec3(0,0,1),hash33(pi+vec3(0,0,1))),
        dot(pf-vec3(1,0,1),hash33(pi+vec3(1,0,1))),
    w.x),
w.z),
mix(
    mix(dot(pf-vec3(0,1,0),hash33(pi+vec3(0,1,0))),
    dot(pf-vec3(1,1,0),hash33(pi+vec3(1,1,0))),
w.x),
mix(dot(pf-vec3(0,1,1),hash33(pi+vec3(0,1,1))),
dot(pf-vec3(1,1,1),hash33(pi+vec3(1,1,1))),
w.x),
w.z),
w.y);
}

vec3 colorA = vec3(0.9, 0.1, 0.1); // Spider-Man red
vec3 colorB = vec3(0.1, 0.2, 0.8); // Spider-Man blue
vec3 colorC = vec3(0.96, 0.96, 0.96); // Deep black

void main(){
    float pat=pnoise(vec3(vUv*uNoise,sin(uTime)*1.4))*uDisplace;
    float proximity=abs(vUv.x-(.5+sin(uTime)/(12.*uSpread)));

    vec3 full=pat*vec3(clamp(.23*uSpread-proximity,0.,1.));
    vec3 newPosition=vPosition+vNormal*full;
    vec3 purpleColor=vec3(.2039,.8314,.2353)/vec3(.1922,.051,.4941);
    vec3 spiderColor=vec3(0.9, 0.9, 0.9); // White accent color
    vec3 color=-vec3(pnoise(vec3(1.-newPosition.z*35.))*40.)*(.01-full)*spiderColor;

    // Audio-reactive color mixing
    vec3 bass = vec3(0.8, 0.1, 0.1) * uBassFr; // Red bass
    vec3 mids = vec3(0.1, 0.3, 0.7) * uMidsFr; // Blue mids
    vec3 treble = vec3(0.9, 0.9, 0.9) * uTrebleFr; // White treble

    // Calculate circular interpolation factor to smooth the seam
    float angle = atan(vPosition.y, vPosition.x); // Get angle around the torus
    float normalizedAngle = (angle / PI + 1.0) * 0.5; // Normalize to [0,1]
    
    // Smooth transition using the circular coordinate
    float blendFactor = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    float circularBlend = mix(normalizedAngle, vUv.x, blendFactor);
    
    // Base color interpolation using the circular coordinates
    vec3 baseColor = mix(colorA, colorB, sin(circularBlend * PI * 2.0 + uTime * 0.5) * 0.5 + 0.5);
    baseColor = mix(baseColor, colorC, sin(vUv.y * PI + uTime * 0.3) * 0.5 + 0.5);

    // Add audio reactive colors
    color = baseColor + bass + mids + treble;

    // Elevation-based intensity - ensure vElevation is properly defined
    float intensity = 1.0;
    if (vElevation != 0.0) {
        intensity += vElevation * 2.0;
    }
    color *= intensity;

    // Time-based pulsing enhanced by audio
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    pulse = pulse * 0.3 * uAudioAvg;
    color += pulse;

    gl_FragColor=vec4(color,1.);
}