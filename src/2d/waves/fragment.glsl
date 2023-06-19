uniform float uTime;
uniform sampler2D uTexture;

varying float vDisplacement;
varying float vWave;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main(){
  float wave = vWave * 0.2;
  // Split each texture color vector
  float r = texture2D(uTexture, vUv).r;
  float g = texture2D(uTexture, vUv + wave).g;
  float b = texture2D(uTexture, vUv).b;
  // Put them back together
  vec3 texture = vec3(r, g, b);
  
  gl_FragColor = vec4(texture, 1.);
}

