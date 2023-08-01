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
    float time=uTime*(1.+uAudioFrequency*10.);
    
    vec3 color;
    vec3 mainColor=mix(vec3(.2,.3,.9),vec3(.4,1.,.3),uAudioFrequency);
    
    mainColor.r*=.9+sin(time)/3.2;
    mainColor.g*=1.1+cos(time/2.)/2.5;
    mainColor.b*=.8+cos(time/5.)/4.;
    
    ColorStop[4]colors=ColorStop[](
        ColorStop(vec3(1.),0.),
        ColorStop(vec3(1.),.01),
        ColorStop(vec3(mainColor),.1),
        ColorStop(vec3(.01,.05,.2),1.)
    );
    COLOR_RAMP(colors,vPattern,color);
    
    gl_FragColor=vec4(vec3(color),1);
}
