const canvasSketch = require("canvas-sketch");
const { random } = require("canvas-sketch-util");
const palattes = require("nice-color-palettes");

// Grab P5.js from npm
const p5 = require("p5");

// Attach p5.js it to global scope
new p5();

const settings = {
  // Tell canvas-sketch we're using p5.js
  p5: true,
  // Turn on a render loop (it's off by default in canvas-sketch)
  animate: true,
  dimensions: [1080, 1080],
};

window.preload = () => {
  // Preload
};

const palette = random.pick(palattes);
let animationTime = 0;
let currentPattern = 0;
const numPatterns = 7;

// Manual pattern control - change this value (0-6) to show specific pattern
const manualPatternSelect = null; // Set to null for automatic cycling, or 0-6 for specific pattern

// Bezold effect demonstration patterns
const bezoldPatterns = {
  // Pattern 1: Classic grid with alternating backgrounds
  classicGrid: (centerColor, bg1, bg2) => {
    const gridSize = 40;
    const squareSize = 20;

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        // Alternating background pattern
        const isEven =
          (Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0;
        fill(isEven ? bg1 : bg2);
        noStroke();
        rect(x, y, gridSize, gridSize);

        // Center square with the same color on both backgrounds
        fill(centerColor);
        const offset = (gridSize - squareSize) / 2;
        rect(x + offset, y + offset, squareSize, squareSize);
      }
    }
  },

  // Pattern 2: Improved geometric spiral pattern
  mandalaPattern: (centerColor, bg1, bg2) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = min(width, height) / 2;

    // Create concentric rings with alternating colors
    for (let r = 20; r < maxRadius; r += 30) {
      const segments = Math.floor(r / 8) + 8;
      const isRingEven = Math.floor(r / 30) % 2 === 0;

      for (let i = 0; i < segments; i++) {
        const angle1 = (TWO_PI / segments) * i;
        const angle2 = (TWO_PI / segments) * (i + 1);
        const isSegmentEven = i % 2 === 0;

        // Determine background color based on ring and segment
        const bgColor = isRingEven === isSegmentEven ? bg1 : bg2;

        fill(bgColor);
        noStroke();

        // Draw segment as a triangle
        beginShape();
        vertex(centerX, centerY);
        vertex(centerX + cos(angle1) * r, centerY + sin(angle1) * r);
        vertex(centerX + cos(angle2) * r, centerY + sin(angle2) * r);
        endShape(CLOSE);
      }
    }

    // Add identical circles at various positions to show Bezold effect
    fill(centerColor);
    noStroke();
  },

  // Pattern 3: Ripple interference pattern
  waveInterference: (centerColor, bg1, bg2) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Create multiple wave sources (rotated 90 degrees)
    const sources = [
      { x: width * 0.75, y: height * 0.25 },
      { x: width * 0.75, y: height * 0.75 },
      { x: width * 0.25, y: height * 0.25 },
      { x: width * 0.25, y: height * 0.75 },
    ];

    // Draw the interference pattern
    const step = 8;
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        let totalWave = 0;

        // Calculate wave interference from all sources
        sources.forEach((source, index) => {
          const distance = dist(x, y, source.x, source.y);
          const wave = sin(
            distance * 0.02 + animationTime * 3 + (index * PI) / 2
          );
          totalWave += wave;
        });

        // Normalize wave value and determine color
        const normalizedWave =
          (totalWave + sources.length) / (sources.length * 2);
        const colorChoice = normalizedWave > 0.5 ? bg1 : bg2;

        fill(colorChoice);
        noStroke();
        rect(x, y, step, step);
      }
    }

    // Add identical elements that will appear on different wave regions
    fill(centerColor);
    noStroke();
  },

  // Pattern 4: Hexagonal honeycomb pattern
  hexagonPattern: (centerColor, bg1, bg2) => {
    const hexSize = 45;
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;

    for (let row = 0; row < height / hexHeight + 2; row++) {
      for (let col = 0; col < width / (hexWidth * 0.75) + 2; col++) {
        const x = col * hexWidth * 0.75;
        const y = row * hexHeight + ((col % 2) * hexHeight) / 2;

        const isEven = (row + col) % 2 === 0;
        fill(isEven ? bg1 : bg2);
        drawHexagon(x, y, hexSize);

        // Add center color dots
        if ((row + col) % 3 === 0) {
          fill(centerColor);
          circle(x, y, hexSize * 0.6);
        }
      }
    }
  },

  // Pattern 5: Diagonal stripes with moving dots
  diagonalStripes: (centerColor, bg1, bg2) => {
    const stripeWidth = 30;

    // Draw diagonal stripes
    for (let x = -height; x < width + height; x += stripeWidth * 2) {
      // Determine stripe color based on position
      const isEven = Math.floor(x / (stripeWidth * 2)) % 2 === 0;
      fill(isEven ? bg1 : bg2);
      noStroke();

      // Draw diagonal stripe
      beginShape();
      vertex(x, 0);
      vertex(x + stripeWidth, 0);
      vertex(x + stripeWidth + height, height);
      vertex(x + height, height);
      endShape(CLOSE);
    }
  },

  // Pattern 6: Concentric circles with rotating segments
  concentricRings: (centerColor, bg1, bg2) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = min(width, height) / 2;

    // Draw concentric circles with alternating colors
    for (let r = 40; r < maxRadius; r += 40) {
      const segments = 16;
      const rotationOffset = animationTime * 2;

      for (let i = 0; i < segments; i++) {
        const angle1 = (TWO_PI / segments) * (i + rotationOffset);
        const angle2 = (TWO_PI / segments) * (i + 1 + rotationOffset);

        // Alternate colors based on ring and segment
        const ringIndex = Math.floor(r / 40);
        const isRingEven = ringIndex % 2 === 0;
        const isSegmentEven = i % 2 === 0;
        const bgColor = isRingEven === isSegmentEven ? bg1 : bg2;

        fill(bgColor);
        noStroke();

        // Draw ring segment
        beginShape();
        // Outer arc
        for (let a = angle1; a <= angle2; a += 0.1) {
          vertex(centerX + cos(a) * r, centerY + sin(a) * r);
        }
        // Inner arc
        for (let a = angle2; a >= angle1; a -= 0.1) {
          vertex(centerX + cos(a) * (r - 40), centerY + sin(a) * (r - 40));
        }
        endShape(CLOSE);
      }
    }
  },

  // Pattern 7: Mixed geometric shapes with diagonal flow
  mixedGeometricFlow: (centerColor, bg1, bg2) => {
    const cellSize = 60;
    const shapeSize = 30;

    for (let x = 0; x < width + cellSize; x += cellSize) {
      for (let y = 0; y < height + cellSize; y += cellSize) {
        // Create diagonal flow pattern
        const diagonalIndex = Math.floor((x + y) / cellSize);
        const isEven = diagonalIndex % 2 === 0;

        // Background for this cell
        fill(isEven ? bg1 : bg2);
        noStroke();
        rect(x, y, cellSize, cellSize);

        // Determine shape type based on position and time
        const shapeType =
          (Math.floor(x / cellSize) +
            Math.floor(y / cellSize) +
            Math.floor(animationTime * 2)) %
          3;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;

        // Rotate color for each shape
        const colorIndex = (diagonalIndex + Math.floor(animationTime * 4)) % 3;
        let shapeColor;
        if (colorIndex === 0) shapeColor = centerColor;
        else if (colorIndex === 1) shapeColor = bg1;
        else shapeColor = bg2;

        fill(shapeColor);
        noStroke();

        // Draw different shapes based on type
        if (shapeType === 0) {
          // Square
          const offset = shapeSize / 2;
          rect(centerX - offset, centerY - offset, shapeSize, shapeSize);
        } else if (shapeType === 1) {
          // Triangle
          beginShape();
          vertex(centerX, centerY - shapeSize / 2);
          vertex(centerX - shapeSize / 2, centerY + shapeSize / 2);
          vertex(centerX + shapeSize / 2, centerY + shapeSize / 2);
          endShape(CLOSE);
        } else {
          // Circle
          circle(centerX, centerY, shapeSize);
        }

        // Add small accent shapes for complexity
        if ((Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 4 === 0) {
          fill(centerColor);
          const accentSize = 8;
          // Small diamond accent
          beginShape();
          vertex(centerX, centerY - accentSize);
          vertex(centerX + accentSize, centerY);
          vertex(centerX, centerY + accentSize);
          vertex(centerX - accentSize, centerY);
          endShape(CLOSE);
        }
      }
    }
  },
};

// Helper function to draw hexagon
function drawHexagon(x, y, size) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    const angle = (TWO_PI / 6) * i;
    const xPos = x + cos(angle) * size;
    const yPos = y + sin(angle) * size;
    vertex(xPos, yPos);
  }
  endShape(CLOSE);
}

canvasSketch(() => {
  return () => {
    animationTime += 0.01;

    // Select vibrant colors from palette to make patterns pop
    const colorIndex =
      Math.floor(animationTime * 0.3) % Math.min(4, palette.length);

    // Use full-strength palette colors for maximum impact
    const paletteColor1 = color(palette[colorIndex]);
    const paletteColor2 = color(palette[(colorIndex + 4) % palette.length]);
    const paletteColor3 = color(palette[(colorIndex + 3) % palette.length]);

    // Higher opacity for vibrant, popping colors
    paletteColor1.setAlpha(220);
    paletteColor2.setAlpha(200);

    const centerColor = color(paletteColor3);
    centerColor.setAlpha(255); // Full opacity for center elements to pop

    const bg1 = paletteColor1;
    const bg2 = paletteColor2;

    // Darker background to make colors pop more
    background(25, 30, 35);

    // Switch between patterns - use manual selection if specified, otherwise auto-cycle
    if (manualPatternSelect !== null) {
      currentPattern = manualPatternSelect % numPatterns;
    } else {
      currentPattern = Math.floor(animationTime * 0.3) % numPatterns;
    }

    // bezoldPatterns.classicGrid(centerColor, bg1, bg2);

    // bezoldPatterns.mandalaPattern(centerColor, bg1, bg2);

    // bezoldPatterns.waveInterference(centerColor, bg1, bg2);

    // bezoldPatterns.hexagonPattern(centerColor, bg1, bg2);

    // bezoldPatterns.diagonalStripes(centerColor, bg1, bg2);

    // bezoldPatterns.concentricRings(centerColor, bg1, bg2);

    bezoldPatterns.mixedGeometricFlow(centerColor, bg1, bg2);
  };
}, settings);
