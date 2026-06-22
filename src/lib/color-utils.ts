import { logger } from "@/lib/logger";

export function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return rgbToHsl(r, g, b);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) return [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * Adjusts a color for better visibility against the current theme background.
 * Light mode: darkens and saturates to pop against white.
 * Dark mode: returns the natural extracted color (less is more on dark backgrounds).
 */
export function adjustColorForTheme(
  color: string,
  theme: "light" | "dark",
): string {
  if (color === "transparent" || color === "#000000") return color;

  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;

  const r = Number(match[1]), g = Number(match[2]), b = Number(match[3]);

  if (theme === "light") {
    const [h, s, l] = rgbToHsl(r, g, b);
    const adjusted = hslToRgb(h, Math.min(s + 35, 90), Math.max(l * 0.6, 12));
    return `rgb(${adjusted[0]}, ${adjusted[1]}, ${adjusted[2]})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// Cache for already-computed colors
const colorCache = new Map<string, string>();

/**
 * Extracts the dominant color from an image URL by drawing it to a 1x1 canvas.
 * Results are cached to avoid re-computation for the same URL.
 * @param {string} imageUrl - The URL of the image.
 * @returns {Promise<string>} The dominant color as an RGB string or hex fallback.
 */
export async function getDominantColor(imageUrl: string): Promise<string> {
  // Return cached result if available
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (imageUrl.startsWith("http")) {
      img.crossOrigin = "Anonymous";
    }
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve("#000000"); // Fallback
        return;
      }

      // Resize to 1x1 to get average color
      canvas.width = 1;
      canvas.height = 1;

      // Draw image to 1x1 pixel
      ctx.drawImage(img, 0, 0, 1, 1);

      try {
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const color = `rgb(${r}, ${g}, ${b})`;
        colorCache.set(imageUrl, color);
        resolve(color);
      } catch (e) {
        // Can happen with CORS issues even with crossOrigin set
        logger.warn("Failed to extract color", e);
        resolve("#000000");
      }
    };

    img.onerror = () => {
      logger.warn("Failed to load image for color extraction");
      resolve("#000000");
    };
  });
}
