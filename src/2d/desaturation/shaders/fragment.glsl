uniform sampler2D uTexture;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main(){
  const vec3 DESATURATE=vec3(.2126,.7152,.0722);
  vec3 color=texture2D(uTexture,vUv).xyz;
  
  float finalColor=dot(DESATURATE,color);
  
  gl_FragColor=vec4(vec3(finalColor),1);
}

