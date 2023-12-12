const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  animate: true,
  fps: 24,
  playing: false,
  dimensions: [1080, 1080],
};

const palette = random.pick(palettes);

class Particle {
  constructor(effect, color) {
    this.effect = effect;
    this.x = Math.floor(random.noise1D * this.canvasWidth);
    this.y = Math.floor(random.noise1D * this.canvasHeight);
    this.color = color;
    this.speedX;
    this.speedY;
    this.speedModifier = random.range(1, 3);
    this.history = [{ x: this.x, y: this.y }];

    this.maxLineLength = Math.floor(Math.random() * 200 + 10);
    this.angle = 0;
    this.timer = this.maxLineLength * 0.5;
  }

  draw() {
    this.effect.context.fillStyle = this.color;
    this.effect.context.strokeStyle = this.color;
    this.effect.context.lineWidth = 0.4;

    this.effect.context.beginPath();
    this.effect.context.moveTo(this.history[0].x, this.history[0].y);

    for (let i = 0; i < this.history.length; i++) {
      this.effect.context.lineTo(this.history[i].x, this.history[i].y);
    }
    this.effect.context.stroke();
  }

  update() {
    this.timer--;
    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let idx = y * this.effect.cols + x;

      this.angle = this.effect.flowFields[idx]?.angle || random.noise1D(10);

      this.speedX = Math.sin(this.angle);
      this.speedY = Math.cos(this.angle);

      this.x += this.speedX * this.speedModifier;
      this.y += this.speedY * this.speedModifier;

      this.history.push({ x: this.x, y: this.y });

      if (this.history.length > this.maxLineLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }

  reset() {
    this.x = Math.floor(Math.random() * this.effect.canvasWidth);
    this.y = Math.floor(Math.random() * this.effect.canvasHeight);
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxLineLength * 2;
  }
}

class Effect {
  constructor(context, canvasWidth, canvasHeight, text) {
    this.context = context;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.nParticles = 5000;
    this.particles = [];
    this.cellSize = 3;
    this.rows;
    this.cols;
    this.flowFields = [];

    this.color = this.createRadialGradient();
    this.text = text;
    this.context.font = "250px Impact";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = this.color;
  }

  run() {
    this.createFlowField();

    this.convertToParticles();
  }

  createLinearGradient() {
    const gradient = this.context.createLinearGradient(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
    gradient.addColorStop(0.2, random.pick(palette));
    gradient.addColorStop(0.4, random.pick(palette));
    gradient.addColorStop(0.6, random.pick(palette));
    gradient.addColorStop(0.8, random.pick(palette));

    return gradient;
  }

  createRadialGradient() {
    const gradient = this.context.createRadialGradient(
      this.canvasWidth * 0.5,
      this.canvasHeight * 0.5,
      10,
      this.canvasWidth * 0.5,
      this.canvasHeight * 0.5,
      this.canvasWidth
    );
    gradient.addColorStop(0.2, random.pick(palette));
    gradient.addColorStop(0.4, random.pick(palette));
    gradient.addColorStop(0.6, random.pick(palette));
    gradient.addColorStop(0.8, random.pick(palette));

    return gradient;
  }

  createFlowField() {
    this.rows = Math.floor(this.canvasHeight / this.cellSize);
    this.cols = Math.floor(this.canvasWidth / this.cellSize);
    this.flowFields = [];

    // draw text
    this.drawText();

    const pixels = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    ).data;

    for (let y = 0; y < this.canvasHeight; y += this.cellSize) {
      for (let x = 0; x < this.canvasWidth; x += this.cellSize) {
        const idx = (y * this.canvasWidth + x) * 4;
        const r = pixels[idx + 0];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        const grayscale = (r + g + b) / 3;
        const angle = ((grayscale / 255) * 6.28).toFixed(2);

        this.flowFields.push({
          x,
          y,
          angle,
        });
      }
    }
  }

  convertToParticles() {
    this.particles = [];
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let y = 0; y < this.nParticles; y++) {
      this.particles.push(new Particle(this, random.pick(palette)));
    }
  }

  drawText() {
    this.context.fillText(
      this.text,
      this.canvasWidth * 0.5,
      this.canvasHeight * 0.5
    );
  }

  render() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
  }
}

const sketch = ({ context, width, height, play }) => {
  init();
  // setup
  const effect = new Effect(context, width, height, "I'm Groot");

  effect.run();

  play();
  window.addEventListener("click", () => {
    play();
  });

  return () => {
    // animation loop
    effect.render();
  };
};

canvasSketch(sketch, settings);

function init() {
  const document = window.document;
  document.body.style.background = "black";
  document.body.style.margin = 0;
  const canvas = document.body.querySelector("canvas");
  canvas.style.background = "black";
  canvas.style.width = window.innerWidth;
  canvas.style.height = window.innerHeight;
  document.body.style.overflow = "hidden";
}
