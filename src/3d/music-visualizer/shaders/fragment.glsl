varying vec2 vUv;
varying float vPattern;

uniform float uTime;
uniform float uAudioFrequency;

// Version 3 ( possibly the fastest version, using a mix instead of a ternary operator ):

/* ** ColorStop Point data structure for the COLOR_RAMP macro
color -> the color of the color stop
position -> position of the color stop on the color ramp -> [0, 1]
*/
struct ColorStop {
    vec3 color;
    float position;
};

/* ** COLOR_RAMP macro by Arya Ross -> based on Blender's ColorRamp Node in the shading tab
ColorStop[?] colors -> array of color stops that can have any length
float factor -> the position that you want to know the color of -> [0, 1]
vec3 finalColor -> the final color based on the factor

Line 5 Of The Macro:
// possibly is bad for performance
index = isInBetween ? i : index; \

Taken From: https://stackoverflow.com/a/26219603/19561482
index = int(mix(float(index), float(i), float(isInBetween))); \
*/
#define COLOR_RAMP(colors,factor,finalColor){\
    int index=0;\
    for(int i=0;i<colors.length()-1;i++){\
        ColorStop currentColor=colors[i];\
        bool isInBetween=currentColor.position<=factor;\
        index=int(mix(float(index),float(i),float(isInBetween)));\
    }\
    ColorStop currentColor=colors[index];\
    ColorStop nextColor=colors[index+1];\
    float range=nextColor.position-currentColor.position;\
    float lerpFactor=(factor-currentColor.position)/range;\
    finalColor=mix(currentColor.color,nextColor.color,lerpFactor);\
}\

void main(){
    float time=uTime*(1.+uAudioFrequency*20.);
    
    vec3 color;
    // Neon colors: electric blue to hot pink based on frequency
    vec3 mainColor=mix(vec3(0.0,0.8,1.0),vec3(1.0,0.2,0.8),uAudioFrequency);
    
    // Add intense flickering neon effect - clamped to prevent black flicker
    mainColor.r*=clamp(0.9+sin(time*5.0)*0.1, 0.5, 1.0);
    mainColor.g*=clamp(0.8+cos(time*4.0)*0.2, 0.5, 1.0);
    mainColor.b*=clamp(0.95+sin(time*6.0)*0.05, 0.5, 1.0);
    
    // Neon color gradient: bright electric colors
    ColorStop[5]colors=ColorStop[](
        ColorStop(vec3(1.0,1.0,1.0),0.0),      // Pure white core
        ColorStop(vec3(0.2,1.0,1.0),0.2),      // Electric cyan
        ColorStop(vec3(0.0,0.5,1.0),0.4),      // Electric blue
        ColorStop(vec3(1.0,0.0,1.0),0.7),      // Electric magenta
        ColorStop(vec3(0.5,0.0,0.5),1.0)       // Deep purple edges
    );
    
    // Ensure vPattern is in valid range and apply color ramp
    float pattern = clamp(vPattern, 0.0, 1.0);
    COLOR_RAMP(colors,pattern,color);
    
    // Fallback to neon color if something goes wrong
    if(length(color) < 0.1) {
        color = mainColor;
    }
    
    // Enhanced neon glow intensity - clamped to prevent black flicker
    color*=clamp(1.2+uAudioFrequency*0.8, 1., 2.5);
    
    // Add neon glow effect - clamped to prevent negative values
    float glow = clamp(1.0 + sin(time) * 0.3, 0.7, 1.3);
    color *= glow;
    
    // Ensure final color never goes completely black
    color = max(color, vec3(0.1));
    
    gl_FragColor=vec4(color,1.0);
}