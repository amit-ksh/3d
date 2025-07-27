const canvasSketch = require("canvas-sketch");
const Random = require("canvas-sketch-util/random");
const { lerp } = require("canvas-sketch-util/math");

// Set a random seed for reproducible results
Random.setSeed(Random.getRandomSeed());

const settings = {
  // 300 PPI for print resolution
  pixelsPerInch: 300,
  // All our dimensions and rendering units will use inches
  units: "in",
  // 3.5x2 inches
  dimensions: [3.5, 2],
  // Add the seed to the filename for reproducibility
  suffix: Random.getSeed(),
  // Enable animation
  animate: true,
  // Animation duration in seconds (optional, defaults to infinite loop)
};

const sketch = () => {
  return ({
    context,
    width,
    height,
    time,
    exporting,
    bleed,
    trimWidth,
    trimHeight,
  }) => {
    // Clear canvas and fill with a gradient background
    context.clearRect(0, 0, width, height);

    // Create a subtle radial gradient background
    const gradient = context.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2
    );
    gradient.addColorStop(0, "#f8f9fa");
    gradient.addColorStop(0.6, "#eff3f4");
    gradient.addColorStop(1, "#e9ecef");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Visualize the trim area with a yellow guide
    // This is ignored on export
    if (!exporting && bleed > 0) {
      context.strokeStyle = "hsl(0, 80%, 80%)";
      context.lineWidth = 0.0075;
      context.strokeRect(bleed, bleed, trimWidth, trimHeight);
    }

    // Use varied colors and shapes for more interest
    const baseColor = "#2b82b5";

    // Make circles expand to edge of smallest trim (card) edge,
    // but with a 1/4" padding.
    const maxRadius = Math.min(trimWidth, trimHeight) / 2 - 1 / 4;

    // Draw enhanced spiral pattern using Fibonacci series with animation
    const points = 377; // Fibonacci number for natural distribution

    // Animation parameters
    const slowTime = time * 0.3; // Slow rotation
    const pulseTime = time * 2; // Faster pulsing
    const breatheTime = time * 0.8; // Medium breathing effect

    // Generate Fibonacci sequence for natural spiral
    const fibonacci = [1, 1];
    for (let i = 2; i < 25; i++) {
      fibonacci[i] = fibonacci[i - 1] + fibonacci[i - 2];
    }

    // Use Fibonacci angle (137.5°) for natural phyllotaxis pattern
    const fibonacciAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

    // Single layer: Organic spiral using only circles with animation
    for (let i = 0; i < points; i++) {
      const n = i + 1;

      // Use Fibonacci angle for natural spiral distribution with rotation
      const baseAngle = n * fibonacciAngle;
      const rotationOffset = slowTime * 0.5; // Slow overall rotation
      const angle = baseAngle + rotationOffset;

      // Distance based on square root for even distribution (Vogel's model)
      const distance = Math.sqrt(n) / Math.sqrt(points);

      // Add organic variation using Fibonacci-based noise with animation
      const fibIndex =
        Math.floor(Math.log(n) / Math.log(1.618)) % fibonacci.length;
      const organicVariation =
        Random.noise1D(
          n * 0.01 + fibonacci[fibIndex] * 0.001 + slowTime * 0.1
        ) * 0.1;

      // Add breathing effect to the overall pattern
      const breatheEffect =
        1 + Math.sin(breatheTime + distance * Math.PI * 2) * 0.15;
      const adjustedDistance = (distance + organicVariation) * breatheEffect;

      // Calculate position
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      const r = adjustedDistance * maxRadius;
      const cx = width / 2 + x * r;
      const cy = height / 2 + y * r;

      // Organic size variation based on Fibonacci growth with pulsing
      const fibGrowth =
        fibonacci[fibIndex % fibonacci.length] /
        fibonacci[Math.min(fibIndex + 1, fibonacci.length - 1)];
      const baseRadius = 0.005 + 0.015 * Math.pow(distance, 0.6);
      const organicSize = Random.noise1D(n * 0.005 + slowTime * 0.05) * 0.008;
      const pulseEffect = 1 + Math.sin(pulseTime + n * 0.1) * 0.3;
      const radius = Math.max(
        0.001,
        (baseRadius * fibGrowth + organicSize) * pulseEffect
      );

      // Natural color progression with animated hue shift
      const hueShift = slowTime * 30; // Slow color rotation
      const hue = ((angle * 180) / Math.PI + distance * 120 + hueShift) % 360;
      const saturation = 40 + distance * 30 + Random.noise1D(n * 0.003) * 20;
      const lightness = 45 + distance * 35 + Random.noise1D(n * 0.008) * 15;
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      // Natural transparency variation with gentle pulsing
      const basePulse =
        Math.sin(pulseTime * 0.5 + distance * Math.PI * 3) * 0.2;
      const alpha =
        0.3 + distance * 0.5 + Random.noise1D(n * 0.007) * 0.3 + basePulse;

      context.fillStyle = color;
      context.globalAlpha = Math.max(0.1, Math.min(1, alpha));

      // Draw only circles for simplicity and organic feel
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2, false);
      context.fill();
    }

    // Optional: Add subtle connecting flow lines with animation
    context.globalAlpha = 0.03 + Math.sin(pulseTime * 0.3) * 0.02; // Animated opacity
    context.strokeStyle = "#888";
    context.lineWidth = 0.0005;

    // Connect every 21st circle (Fibonacci number) for subtle organic flow
    for (let i = 21; i < points; i += 21) {
      const n1 = i;
      const n2 = i - 21;

      // Calculate positions for both circles with animation
      const rotationOffset = slowTime * 0.5;

      const angle1 = n1 * fibonacciAngle + rotationOffset;
      const distance1 = Math.sqrt(n1) / Math.sqrt(points);
      const breathe1 =
        1 + Math.sin(breatheTime + distance1 * Math.PI * 2) * 0.15;
      const x1 = Math.cos(angle1);
      const y1 = Math.sin(angle1);
      const r1 = distance1 * maxRadius * breathe1;
      const cx1 = width / 2 + x1 * r1;
      const cy1 = height / 2 + y1 * r1;

      const angle2 = n2 * fibonacciAngle + rotationOffset;
      const distance2 = Math.sqrt(n2) / Math.sqrt(points);
      const breathe2 =
        1 + Math.sin(breatheTime + distance2 * Math.PI * 2) * 0.15;
      const x2 = Math.cos(angle2);
      const y2 = Math.sin(angle2);
      const r2 = distance2 * maxRadius * breathe2;
      const cx2 = width / 2 + x2 * r2;
      const cy2 = height / 2 + y2 * r2;

      // Draw subtle curved connection with animated curve
      context.beginPath();
      context.moveTo(cx1, cy1);
      const animatedNoise = slowTime * 0.1;
      const midX =
        (cx1 + cx2) / 2 + Random.noise2D(cx1, cy1 + animatedNoise) * 0.02;
      const midY =
        (cy1 + cy2) / 2 + Random.noise2D(cx2, cy2 + animatedNoise) * 0.02;
      context.quadraticCurveTo(midX, midY, cx2, cy2);
      context.stroke();
    }

    context.globalAlpha = 1; // Reset alpha
  };
};

canvasSketch(sketch, settings);
