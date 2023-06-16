vec3 coords = vNormal;
coords.y += uTime; 
vec3 noisePattern = vec3(noise(coords / 1.3));
float pattern = wave(noisePattern + uTime);

vDisplacement = pattern;

float displacement = vDisplacement / 8.0;

transformed += normalize(objectNormal) * displacement;