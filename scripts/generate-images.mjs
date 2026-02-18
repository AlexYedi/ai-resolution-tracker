/**
 * Generate placeholder PWA icons and OG image using pure SVG → PNG conversion.
 * No external canvas dependencies needed — uses a data URI approach with sharp or
 * falls back to raw SVG files that browsers can render.
 *
 * Run: node scripts/generate-images.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// Colors from design system
const AMBER = "#C17F4E";
const CANVAS = "#F5EDE3";
const WHITE = "#FFFFFF";
const TEXT_PRIMARY = "#2D2520";

function createIconSVG(size) {
  const fontSize = Math.round(size * 0.35);
  const borderRadius = Math.round(size * 0.15);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${AMBER}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-weight="bold"
        font-size="${fontSize}" fill="${WHITE}">YB</text>
</svg>`;
}

function createOGImageSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="${CANVAS}"/>

  <!-- Amber accent bar at top -->
  <rect width="1200" height="6" fill="${AMBER}"/>

  <!-- Left amber accent stripe -->
  <rect x="80" y="180" width="4" height="270" rx="2" fill="${AMBER}"/>

  <!-- Name -->
  <text x="110" y="260" font-family="Georgia, 'Times New Roman', serif"
        font-weight="bold" font-size="72" fill="${TEXT_PRIMARY}">Yedi Balian</text>

  <!-- Subtitle -->
  <text x="110" y="330" font-family="Georgia, 'Times New Roman', serif"
        font-size="36" fill="${AMBER}">10-Weekend AI Resolution</text>

  <!-- Tagline -->
  <text x="110" y="400" font-family="Arial, Helvetica, sans-serif"
        font-size="24" fill="#6B5E54">Building AI fluency, one project at a time.</text>

  <!-- Decorative dots -->
  <circle cx="110" cy="450" r="4" fill="${AMBER}" opacity="0.5"/>
  <circle cx="130" cy="450" r="4" fill="${AMBER}" opacity="0.35"/>
  <circle cx="150" cy="450" r="4" fill="${AMBER}" opacity="0.2"/>

  <!-- Amber accent bar at bottom -->
  <rect y="624" width="1200" height="6" fill="${AMBER}"/>
</svg>`;
}

// Write SVG files (browsers/social platforms render SVGs fine for OG,
// but PWA icons need PNG. We'll convert via a different method if needed.)
// For now, write SVGs as the source of truth.

// Icon 192
writeFileSync(join(publicDir, "icon-192.svg"), createIconSVG(192));
console.log("✓ Created icon-192.svg");

// Icon 512
writeFileSync(join(publicDir, "icon-512.svg"), createIconSVG(512));
console.log("✓ Created icon-512.svg");

// OG Image
writeFileSync(join(publicDir, "og-image.svg"), createOGImageSVG());
console.log("✓ Created og-image.svg");

// Now attempt PNG conversion using resvg-js or sharp
// If neither is available, we'll note that SVGs were created
async function tryConvertToPNG() {
  try {
    // Try using sharp (commonly available)
    const sharp = await import("sharp");

    const icon192Buffer = Buffer.from(createIconSVG(192));
    await sharp.default(icon192Buffer).png().toFile(join(publicDir, "icon-192.png"));
    console.log("✓ Converted icon-192.png");

    const icon512Buffer = Buffer.from(createIconSVG(512));
    await sharp.default(icon512Buffer).png().toFile(join(publicDir, "icon-512.png"));
    console.log("✓ Converted icon-512.png");

    const ogBuffer = Buffer.from(createOGImageSVG());
    await sharp.default(ogBuffer).resize(1200, 630).png().toFile(join(publicDir, "og-image.png"));
    console.log("✓ Converted og-image.png");

    return true;
  } catch (e) {
    console.log("⚠ sharp not available, trying alternative...");
  }

  // If sharp is not available, create minimal valid 1x1 PNGs as placeholders
  // and note that proper PNGs need to be generated
  console.log("⚠ No image conversion library available.");
  console.log("  SVG files have been created. Convert them to PNG manually or install sharp:");
  console.log("  npm install -D sharp && node scripts/generate-images.mjs");
  return false;
}

const converted = await tryConvertToPNG();
if (converted) {
  console.log("\n✅ All images generated successfully!");
} else {
  console.log("\n📄 SVG source files created in public/. PNG conversion pending.");
}
