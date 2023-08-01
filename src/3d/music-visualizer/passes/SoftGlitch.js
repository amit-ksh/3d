global.THREE = require("three");
require("three/examples/js/postprocessing/Pass");

const _createMaterial = () => {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uDiffuseTexture: { value: null }, //diffuse texture
      uApply: { value: 0 }, //apply the glitch ?
      uAmount: { value: 0.08 },
      uAngle: { value: 0.02 },
    },

    vertexShader: /* glsl */ `
            varying vec2 vUv;
    
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,

    fragmentShader: /* glsl */ `
            uniform bool uApply; //should we apply the glitch
            uniform sampler2D uDiffuseTexture;
            uniform float uAmount;
            uniform float uAngle;
            varying vec2 vUv;
    
            float rand(vec2 co){
              return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }
    
            void main() {
              if(!uApply) {
                vec2 p = vUv;
                float xs = floor(gl_FragCoord.x / 0.5);
                float ys = floor(gl_FragCoord.y / 0.5);
                //base from RGB shift shader
                vec2 offset = uAmount * vec2(cos(uAngle), sin(uAngle));
                vec4 cr = texture2D(uDiffuseTexture, p + offset);
                vec4 cga = texture2D(uDiffuseTexture, p);
                vec4 cb = texture2D(uDiffuseTexture, p - offset);
                gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
              }
              else {
                gl_FragColor = texture2D (uDiffuseTexture, vUv);
              }
            }
          `,
  });

  return material;
};

class SoftGlitchPass extends THREE.Pass {
  constructor() {
    super();
    this.material = _createMaterial();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      this.material
    );
    this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add(this.quad);
    this.factor = 0; // Glitch Factor
  }

  render(renderer, writeBuffer, readBuffer) {
    const factor = Math.max(0, this.factor);

    // uniforms
    this.material.uniforms.uDiffuseTexture.value = readBuffer.texture;

    if (factor) {
      this.material.uniforms.uAmount.value = (Math.random() / 90) * factor;
      this.material.uniforms.uAngle.value =
        THREE.MathUtils.randFloat(-Math.PI, Math.PI) * factor;
      this.material.uniforms.uApply.value = false;
    } else {
      this.material.uniforms.uApply.value = true;
    }

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      renderer.render(this.scene, this.camera);
    }
  }
}

export { SoftGlitchPass };
