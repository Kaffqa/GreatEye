import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { ClusterPoint, HeatmapConfig } from '../types';

interface HeatmapLayerProps {
  clusters: ClusterPoint[];
  config: HeatmapConfig;
}

// Thermal Palette Gradients
const GRADIENTS: Record<string, Record<number, string>> = {
  nasa: {
    0.1: 'rgba(6, 182, 212, 0.35)', // Cyan
    0.3: 'rgba(16, 185, 129, 0.65)', // Emerald
    0.5: 'rgba(234, 179, 8, 0.85)', // Amber
    0.7: 'rgba(249, 115, 22, 0.95)', // Thermal Orange
    0.9: 'rgba(239, 68, 68, 1.0)', // Red Alert
    1.0: 'rgba(255, 255, 255, 1.0)', // White-hot Core
  },
  inferno: {
    0.1: 'rgba(59, 7, 100, 0.35)', // Deep Purple
    0.3: 'rgba(147, 51, 234, 0.65)', // Violet
    0.5: 'rgba(225, 29, 72, 0.85)', // Crimson
    0.7: 'rgba(245, 158, 11, 0.95)', // Orange Glow
    0.9: 'rgba(254, 240, 138, 1.0)', // Yellow
    1.0: 'rgba(255, 255, 255, 1.0)', // Pure White
  },
  gambut: {
    0.1: 'rgba(4, 120, 87, 0.35)', // Forest Moss
    0.3: 'rgba(13, 148, 136, 0.65)', // Teal
    0.5: 'rgba(217, 119, 6, 0.85)', // Smoldering Amber
    0.7: 'rgba(220, 38, 38, 0.95)', // Peatfire Red
    0.9: 'rgba(153, 27, 27, 1.0)', // Char Maroon
    1.0: 'rgba(254, 202, 202, 1.0)', // Ash White
  },
};

// Create a radial gradient stamp canvas
function createCircleStamp(radius: number, blur: number): HTMLCanvasElement {
  const r = radius + blur;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = r * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const gradient = ctx.createRadialGradient(r, r, Math.max(0, radius - blur), r, r, r);
  gradient.addColorStop(0, 'rgba(0,0,0,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// Create a 256-color gradient lookup palette
function createPalette(gradientPreset: string): Uint8ClampedArray {
  const grad = GRADIENTS[gradientPreset] || GRADIENTS.nasa;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Uint8ClampedArray(1024);

  const linear = ctx.createLinearGradient(0, 0, 256, 1);
  for (const [stop, color] of Object.entries(grad)) {
    linear.addColorStop(parseFloat(stop), color);
  }

  ctx.fillStyle = linear;
  ctx.fillRect(0, 0, 256, 1);

  return ctx.getImageData(0, 0, 256, 1).data;
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ clusters, config }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Initialize canvas overlay on Leaflet pane
    const overlayPane = map.getPanes().overlayPane;
    const canvas = document.createElement('canvas');
    canvas.className = 'leaflet-heatmap-layer pointer-events-none select-none';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.willChange = 'transform';
    canvas.style.zIndex = '150';

    overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const circleStamp = createCircleStamp(config.radius, config.blur);
    const palette = createPalette(config.gradientPreset);

    // 2. Render function
    const redraw = () => {
      if (!canvas || !map) return;

      const size = map.getSize();
      const bounds = map.getBounds();
      const topLeft = map.containerPointToLayerPoint([0, 0]);

      L.DomUtil.setPosition(canvas, topLeft);

      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!clusters.length) return;

      const south = bounds.getSouth() - 0.5;
      const north = bounds.getNorth() + 0.5;
      const west = bounds.getWest() - 0.5;
      const east = bounds.getEast() + 0.5;

      // Filter to viewport bounds
      const inView = clusters.filter(
        (c) => c.lat >= south && c.lat <= north && c.lon >= west && c.lon <= east
      );

      if (!inView.length) return;

      const currentZoom = map.getZoom();
      const r = config.radius + config.blur;

      // Dynamic spatial binning for ultra-smooth 60 FPS on large nationwide datasets
      let pointsToRender: { lat: number; lon: number; weight: number }[] = [];

      if (currentZoom <= 6 && inView.length > 5000) {
        // Bin points into a 0.12° spatial grid
        const grid = new Map<string, { lat: number; lon: number; weightSum: number; count: number }>();
        const gridSize = 0.12;

        for (let i = 0; i < inView.length; i++) {
          const c = inView[i];
          const gx = Math.round(c.lon / gridSize) * gridSize;
          const gy = Math.round(c.lat / gridSize) * gridSize;
          const key = `${gx.toFixed(2)},${gy.toFixed(2)}`;

          const intensity =
            config.weightMode === 'frp'
              ? Math.min(1.0, Math.max(0.12, c.frp / config.maxIntensity))
              : Math.min(1.0, Math.max(0.12, c.nh / 8));

          const existing = grid.get(key);
          if (existing) {
            existing.weightSum += intensity;
            existing.count += 1;
          } else {
            grid.set(key, { lat: c.lat, lon: c.lon, weightSum: intensity, count: 1 });
          }
        }

        grid.forEach((val) => {
          pointsToRender.push({
            lat: val.lat,
            lon: val.lon,
            weight: Math.min(1.0, val.weightSum * 0.8),
          });
        });
      } else {
        // High zoom: Render individual clusters directly
        const maxSamples = 8000;
        const step = inView.length > maxSamples ? Math.ceil(inView.length / maxSamples) : 1;

        for (let i = 0; i < inView.length; i += step) {
          const c = inView[i];
          const intensity =
            config.weightMode === 'frp'
              ? Math.min(1.0, Math.max(0.15, c.frp / config.maxIntensity))
              : Math.min(1.0, Math.max(0.15, c.nh / 7));

          pointsToRender.push({
            lat: c.lat,
            lon: c.lon,
            weight: intensity,
          });
        }
      }

      // 3. Stamp radial gradient circles onto canvas
      for (let i = 0; i < pointsToRender.length; i++) {
        const pt = pointsToRender[i];
        const containerPt = map.latLngToContainerPoint([pt.lat, pt.lon]);

        if (
          containerPt.x < -r ||
          containerPt.x > canvas.width + r ||
          containerPt.y < -r ||
          containerPt.y > canvas.height + r
        ) {
          continue;
        }

        ctx.globalAlpha = pt.weight;
        ctx.drawImage(circleStamp, containerPt.x - r, containerPt.y - r);
      }

      // 4. Colorize pixel data using thermal palette lookup table
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      const opacityFactor = config.opacity;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          const offset = alpha * 4;
          data[i] = palette[offset]; // Red
          data[i + 1] = palette[offset + 1]; // Green
          data[i + 2] = palette[offset + 2]; // Blue
          data[i + 3] = Math.round(alpha * opacityFactor); // Alpha
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    const scheduleRedraw = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(redraw);
    };

    // Event listeners
    map.on('moveend', scheduleRedraw);
    map.on('zoomend', scheduleRedraw);
    map.on('resize', scheduleRedraw);

    // Initial render
    scheduleRedraw();

    return () => {
      map.off('moveend', scheduleRedraw);
      map.off('zoomend', scheduleRedraw);
      map.off('resize', scheduleRedraw);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, clusters, config]);

  return null;
};
