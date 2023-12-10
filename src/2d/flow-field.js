const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  animate: true,
  fps: 24,
  playing: false,
};

const palette = random.pick(palettes);

class Particle {
  constructor(effect, color) {
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.canvasWidth);
    this.y = Math.floor(Math.random() * this.effect.canvasHeight);
    this.color = color;
    this.speedX;
    this.speedY;
    this.speedModifier = random.range(1, 3);
    this.history = [{ x: this.x, y: this.y }];

    this.maxLineLength = Math.floor(Math.random() * 200 + 10);
    this.angle = 0;
    this.radius = 10;
    this.timer = this.maxLineLength * 2;
  }

  draw() {
    this.effect.context.fillStyle = this.color;
    this.effect.context.strokeStyle = this.color;
    this.effect.context.lineWidth = 0.2;

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

      this.angle = this.effect.flowFields[idx];

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
  constructor(context, canvasWidth, canvasHeight) {
    this.context = context;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.particles = [];
    this.rows;
    this.cols;
    this.flowFields = [];
    this.nParticles = 5000;
    this.cellSize = 10;
    this.curve = random.range(1, 4);
    this.zoom = random.range(0, 0.07);
  }

  run() {
    this.createFlowField();
    this.convertToParticles();
  }

  createFlowField() {
    this.rows = Math.floor(this.canvasHeight / this.cellSize);
    this.cols = Math.floor(this.canvasWidth / this.cellSize);
    this.flowFields = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let angle1 =
          Math.cos(x * this.zoom) * this.curve +
          Math.sin(y * this.zoom) * this.curve;

        let angle2 =
          (1 / Math.tan(x * this.zoom)) * this.curve +
          (1 / Math.tan(y * this.zoom)) * this.curve;

        let angle3 =
          random.noise1D(x * this.zoom) * this.curve +
          random.noise1D(y * this.zoom) * this.curve;

        let angle4 =
          random.gaussian(x, x / this.rows) *
          this.zoom *
          this.curve *
          random.gaussian(y, y / this.cols) *
          this.zoom *
          this.curve;

        this.flowFields.push(angle2);
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

  render() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
  }
}

const sketch = ({ context, width, height, play }) => {
  init();
  // setup
  const effect = new Effect(context, width, height);

  effect.run();

  play();
  window.addEventListener("click", () => {
    play();
  });

  return ({ context, width, height }) => {
    // animation loop
    effect.render();
  };
};

canvasSketch(sketch, settings);

function init() {
  const document = window.document;
  document.body.style.background = "white";
  document.body.style.margin = 0;
  const canvas = document.body.querySelector("canvas");
  canvas.style.background = "black";
  canvas.style.width = window.innerWidth;
  canvas.style.height = window.innerHeight;
  document.body.style.overflow = "hidden";
}
