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
  constructor(effect, x, y, color) {
    this.effect = effect;
    this.x = Math.random() * this.effect.canvasWidth;
    this.y = Math.random() * this.effect.canvasHeight;
    this.color = color;
    this.originX = x;
    this.originY = y;
    this.size = this.effect.gap;
    this.dx = 0;
    this.dy = 0;
    this.vx = 0;
    this.vy = 0;
    this.force = 0;
    this.angle = 0;
    this.distance = 0;
    this.friction = Math.random() * 0.9;
    this.ease = Math.random() * 0.05;
  }

  draw() {
    this.effect.context.fillStyle = this.color;
    this.effect.context.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    this.dx = this.effect.mouse.x - this.x;
    this.dy = this.effect.mouse.y - this.y;
    this.distance = this.dx * this.dx + this.dy * this.dy;
    this.force = -this.effect.mouse.radius / this.distance;

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
  }
}

class Effect {
  constructor(context, canvasWidth, canvasHeight) {
    this.context = context;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.textX = this.canvasWidth / 2.5;
    this.textY = this.canvasHeight / 2.5;
    this.fontSize = 100;
    this.textInput = document.getElementById("textInput");
    this.textInput.addEventListener("blur", (e) => {
      if (e.key !== "") {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.wrapText(e.target.value ?? "Hello");
      }
    });

    this.particles = [];
    this.gap = 2;
    this.mouse = {
      radius: 2000,
      x: 0,
      y: 0,
    };

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });

    // FONT STYLE
    const gradient = this.context.createLinearGradient(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    );
    gradient.addColorStop(0.3, random.pick(palette));
    gradient.addColorStop(0.5, random.pick(palette));
    gradient.addColorStop(0.7, random.pick(palette));
    this.context.fillStyle = gradient;
    this.context.font = this.fontSize + "px cursive";
    this.context.textAlign = "center"; // horizontal alignment
    this.context.textBaseline = "middle"; // vertical alignment
    this.context.strokeStyle = random.pick(palette);
  }

  wrapText() {
    this.lineHeight = this.fontSize;
    this.maxTextWidth = this.canvasWidth * 0.5;

    // break the line
    let lineArray = [];
    let lineCounter = 0;
    let line = "";
    let words = this.textInput.value.split(" ");

    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + " ";

      if (this.context.measureText(testLine).width > this.maxTextWidth) {
        line = words[i] + " ";
        lineCounter++;
      } else {
        line = testLine;
      }
      lineArray[lineCounter] = line;
    }

    let textHeight = this.lineHeight * lineCounter;
    let textY = this.textY - textHeight / 2;
    lineArray.forEach((line, idx) => {
      this.context.fillText(line, this.textX, textY + idx * this.lineHeight);
      this.context.strokeText(line, this.textX, textY + idx * this.lineHeight);
    });

    this.convertToParticles();
  }

  convertToParticles() {
    this.particles = [];

    const pixels = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight
    ).data;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha > 0) {
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const color = `rgb(${r}, ${g}, ${b})`;
          this.particles.push(new Particle(this, x, y, color));
        }
      }
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

  resize(w, h) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.textX = this.canvasWidth / 2;
    this.textY = this.canvasHeight / 2;
    this.maxTextWidth = this.canvasWidth / 2;
  }
}

const sketch = ({ context, width, height, play }) => {
  init();
  // setup
  const effect = new Effect(context, width, height);

  effect.wrapText();

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

  const inputEl = document.createElement("input");
  const inputStyle = inputEl.style;
  inputEl.id = "textInput";
  inputStyle.position = "absolute";
  inputStyle.top = "10px";
  inputStyle.width = "80%";
  inputStyle.padding = "0.5rem 1rem";
  inputStyle.border = 0;
  inputStyle.borderRadius = "8px";
  inputEl.style.opacity = 0;
  inputEl.style.zIndex = -1;
  inputEl.value = getText() || "Creative Coding!";

  document.body.prepend(inputEl);
}

function getText() {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);

  const text = urlParams.get("text");

  return text;
}
