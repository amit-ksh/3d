const canvasSketch = require("canvas-sketch");
const { random } = require("canvas-sketch-util");

// Grab P5.js from npm
const p5 = require("p5");

const preload = (p5) => {
  // Can p5.loadImage() here and so forth
};

const settings = {
  // Use p5 in instance mode, passing the preloader
  // Can also just pass { p5 } setting if you don't need preloader
  p5: { p5, preload },
  dimensions: [1080, 1080],
  // Turn on a render loop
  animate: true,
  playing: true,
};

let c = "black",
  bg = "white",
  max = 800,
  points = [],
  lines = [];

const scale = 200;
const smooth = random.range(0.00001, 0.0001);
canvasSketch(({ p5 }) => {
  //   Setup
  p5.background(bg);

  p5.frameRate(90);

  p5.noiseDetail(1);
  p5.angleMode(p5.DEGREE);

  let num = 0;
  for (let y = 0; y < p5.height; y += scale) {
    for (let x = 0; x < p5.width; x += scale) {
      let p = p5.createVector(x + p5.random(-10, 10), y + p5.random(-10, 10));
      lines[num] = [p];
      points.push(p);
      num++;
    }
  }

  for (let n = 0; n < max; n++) {
    for (let i = 0; i < points.length; i++) {
      let angle = p5.map(
        p5.noise(points[i].x * smooth, points[i].y * smooth),
        0,
        1,
        0,
        1080
      );
      let p = points[i].add(p5.createVector(p5.cos(angle), p5.sin(angle)));
      lines[i].push(p5.createVector(p.x, p.y));
    }
  }

  let drawn = false;
  return ({ p5 }) => {
    if (drawn) return;

    drawn = true;
    // Draw
    p5.noFill();
    p5.strokeWeight(1);

    for (let o of Object.values(lines)) {
      p5.stroke(c);
      p5.fill(c);

      let str = p5.random(5, 50);
      let on = true;
      let rand = 20;

      for (let i = 0; i < o.length; i++) {
        if (i % rand === 0) {
          rand = p5.floor(p5.random(50, 100));
          on = !on;
          str = p5.random(20, 50);
        }

        if (on) {
          p5.rect(o[i].x, o[i].y, str, 5);
        }

        p5.circle(o[i].x, o[i].y, 10);
      }
    }

    p5.fill(bg);
    p5.noStroke();

    p5.beginShape();
    p5.vertex(0, 0);
    p5.vertex(p5.width, 0);
    p5.vertex(p5.width, p5.height);
    p5.vertex(0, p5.height);

    p5.angleMode(p5.RADIANS);
    p5.beginContour();
    for (let n = 0; n < p5.TWO_PI; n += p5.TWO_PI / 100) {
      let r = 512;
      let x = p5.sin(n) * r;
      let y = p5.cos(n) * r;
      p5.vertex(x + p5.width / 2, y + p5.height / 2);
    }

    p5.endContour();
    p5.endShape(p5.CLOSE);

    p5.noFill();
    p5.stroke(c);
    p5.strokeWeight(20);
    p5.circle(p5.width / 2, p5.height / 2, p5.width - 50, p5.height - 50);
  };
}, settings);
