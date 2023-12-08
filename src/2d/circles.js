const canvasSketch = require("canvas-sketch");

// Grab P5.js from npm
const p5 = require("p5");

const preload = (p5) => {
  // Can p5.loadImage() here and so forth
};

const settings = {
  // Use p5 in instance mode, passing the preloader
  // Can also just pass { p5 } setting if you don't need preloader
  p5: { p5, preload },
  dimensions: [600, 800],
  // Turn on a render loop
  animate: true,
  playing: true,
};

const borderWidth = 60;
const padding = 40;

const bgColor = "#0a1128";
const color = "#ffc643";
const shapeArray = [];
let kills = 0;
canvasSketch(({ play, p5 }) => {
  //   Setup
  p5.background(bgColor);

  class Shape {
    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.fill = Math.random() < 0.25;
    }

    draw() {
      p5.stroke(color);
      p5.strokeWeight(1);
      if (this.fill) {
        p5.fill(color);
      } else {
        p5.noFill();
      }
      p5.circle(this.x, this.y, this.r * 2);
    }

    grow() {
      this.r++;
      this.draw();
    }
  }

  function detectEdgeCollision(shape) {
    if (
      p5.dist(shape.x, shape.y, shape.x, padding) <= shape.r ||
      p5.dist(shape.x, shape.y, padding, shape.y) <= shape.r ||
      p5.dist(shape.x, shape.y, p5.width - padding, shape.y) <= shape.r ||
      p5.dist(shape.x, shape.y, shape.x, p5.height - padding) <= shape.r
    ) {
      return true;
    }
    return false;
  }

  function detectShapeCollision(shape, array) {
    for (let i = 0; i < array.length; i++) {
      let s2 = array[i];
      let distance = p5.dist(shape.x, shape.y, s2.x, s2.y);
      if (distance !== 0 && distance <= shape.r + s2.r) {
        if (shape.r === 1) {
          array.pop();
          kills++;
        }
        return true;
      }
    }
    return false;
  }

  p5.frameRate(120);
  window.addEventListener("click", play);
  window.document.body.style.background = "black";

  return ({ p5 }) => {
    // Draw
    if (kills > 8000) {
      console.log("stopped");
      return;
    }
    p5.background(bgColor);
    p5.noFill();
    // white border
    p5.stroke(color);
    p5.strokeWeight(borderWidth);
    p5.rect(0, 0, p5.width, p5.height);
    // white border
    p5.stroke(bgColor);
    p5.strokeWeight(20);
    p5.rect(0, 0, p5.width, p5.height);

    let shape = new Shape(
      p5.random(padding, p5.width - padding),
      p5.random(padding, p5.height - padding),
      1
    );
    shapeArray.push(shape);

    for (let s of shapeArray) {
      if (detectEdgeCollision(s)) {
        s.draw();
      } else if (detectShapeCollision(s, shapeArray)) {
        if (s.r > 1) {
          s.draw();
        }
      } else {
        s.grow();
      }
    }
  };
}, settings);
