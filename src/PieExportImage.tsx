import React from 'react';
import { Pie } from './types';

interface PieExportImageProps {
  pie: Pie;
  showGaps?: boolean;
}

const GAP = 4;
const LAYER_MIN_HEIGHT = 16;
const LAYER_MAX_HEIGHT = 120;
const LABEL_WIDTH = 280;
const PATTERN_WIDTH = 200;
const PADDING = 30;
const HEADER_HEIGHT = 60;

const getPatternDef = (pattern: string, id: string): string => {
  const base = `<pattern id="p-${id}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">`;
  switch (pattern) {
    case 'dots':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><circle cx="5" cy="5" r="1.5" fill="rgba(0,0,0,0.2)"/><circle cx="15" cy="5" r="1.5" fill="rgba(0,0,0,0.2)"/><circle cx="5" cy="15" r="1.5" fill="rgba(0,0,0,0.2)"/><circle cx="15" cy="15" r="1.5" fill="rgba(0,0,0,0.2)"/><circle cx="10" cy="10" r="1.5" fill="rgba(0,0,0,0.2)"/></pattern>`;
    case 'gravel':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><ellipse cx="5" cy="5" rx="2" ry="1.5" fill="rgba(0,0,0,0.1)"/><ellipse cx="15" cy="12" rx="3" ry="2" fill="rgba(255,255,255,0.1)"/><ellipse cx="8" cy="16" rx="2" ry="1" fill="rgba(0,0,0,0.08)"/></pattern>`;
    case 'mesh':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><line x1="0" y1="10" x2="20" y2="10" stroke="rgba(0,0,0,0.25)" stroke-width="0.7"/><line x1="10" y1="0" x2="10" y2="20" stroke="rgba(0,0,0,0.25)" stroke-width="0.7"/></pattern>`;
    case 'terrazzo':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><polygon points="3,3 7,5 5,8" fill="#8B4513" opacity="0.5"/><polygon points="12,10 16,12 14,15" fill="#696969" opacity="0.5"/><polygon points="8,14 11,16 9,18" fill="#F5F5DC" opacity="0.5"/></pattern>`;
    case 'wood':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><line x1="0" y1="4" x2="20" y2="4.5" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/><line x1="0" y1="9" x2="20" y2="8.5" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/><line x1="0" y1="14" x2="20" y2="14.5" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/><line x1="0" y1="19" x2="20" y2="18.5" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/></pattern>`;
    case 'herringbone':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><rect x="1" y="1" width="8" height="4" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" transform="rotate(45 5 3)"/><rect x="10" y="10" width="8" height="4" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" transform="rotate(-45 14 12)"/></pattern>`;
    case 'planks':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><line x1="0" y1="5" x2="20" y2="5" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/><line x1="0" y1="10" x2="20" y2="10" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/><line x1="0" y1="15" x2="20" y2="15" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/></pattern>`;
    case 'smooth':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><rect width="20" height="20" fill="rgba(255,255,255,0.05)"/></pattern>`;
    case 'fibers':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><line x1="2" y1="3" x2="8" y2="7" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/><line x1="12" y1="5" x2="18" y2="9" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/><line x1="5" y1="12" x2="11" y2="16" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/><line x1="14" y1="14" x2="19" y2="18" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/></pattern>`;
    case 'tiles':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><rect x="1" y="1" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" rx="0.5"/><rect x="11" y="1" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" rx="0.5"/><rect x="1" y="11" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" rx="0.5"/><rect x="11" y="11" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" rx="0.5"/></pattern>`;
    case 'metal':
      return `${base}<rect width="20" height="20" fill="__COLOR__"/><rect width="20" height="10" fill="rgba(255,255,255,0.1)"/><line x1="0" y1="7" x2="20" y2="7" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/></pattern>`;
    default:
      return `${base}<rect width="20" height="20" fill="__COLOR__"/></pattern>`;
  }
};

export const PieExportImage: React.FC<PieExportImageProps> = ({ pie, showGaps = true }) => {
  const gap = showGaps ? GAP : 0;
  const maxThickness = Math.max(...pie.layers.map((l) => l.coatingType.thickness));
  const totalThickness = pie.layers.reduce((s, l) => s + l.coatingType.thickness, 0);

  const layersReversed = [...pie.layers].reverse();

  const layerHeights = layersReversed.map(
    (l) => Math.max((l.coatingType.thickness / maxThickness) * LAYER_MAX_HEIGHT, LAYER_MIN_HEIGHT)
  );

  const totalHeight =
    layerHeights.reduce((s, h) => s + h, 0) +
    gap * (layersReversed.length - 1) +
    PADDING * 2 +
    HEADER_HEIGHT;

  const svgWidth = PATTERN_WIDTH + LABEL_WIDTH + PADDING * 2 + 60;
  const svgHeight = totalHeight;

  const patternDefs = pie.layers
    .map((l) => getPatternDef(l.coatingType.pattern, l.id).replace(/__COLOR__/g, l.coatingType.color))
    .join('\n');

  let currentY = PADDING + HEADER_HEIGHT;
  const layerPositions = layersReversed.map((_, i) => {
    const y = currentY;
    currentY += layerHeights[i] + gap;
    return y;
  });

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <defs>${patternDefs}</defs>
      
      <!-- Background -->
      <rect width="${svgWidth}" height="${svgHeight}" fill="#1f2937"/>
      
      <!-- Header -->
      <text x="${PADDING}" y="${PADDING + 20}" fill="#60a5fa" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Пирог №${pie.number}</text>
      <text x="${PADDING}" y="${PADDING + 42}" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">${pie.name} • Общая толщина: ${totalThickness} мм</text>
      
      <!-- Dimension line -->
      <line x1="${PADDING + 10}" y1="${PADDING + HEADER_HEIGHT}" x2="${PADDING + 10}" y2="${PADDING + HEADER_HEIGHT + layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)}" stroke="#6b7280" stroke-width="1"/>
      <line x1="${PADDING + 5}" y1="${PADDING + HEADER_HEIGHT}" x2="${PADDING + 15}" y2="${PADDING + HEADER_HEIGHT}" stroke="#6b7280" stroke-width="1"/>
      <line x1="${PADDING + 5}" y1="${PADDING + HEADER_HEIGHT + layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)}" x2="${PADDING + 15}" y2="${PADDING + HEADER_HEIGHT + layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)}" stroke="#6b7280" stroke-width="1"/>
      <text x="${PADDING + 12}" y="${PADDING + HEADER_HEIGHT + (layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)) / 2}" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" transform="rotate(-90 ${PADDING + 12} ${PADDING + HEADER_HEIGHT + (layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)) / 2})">${totalThickness} мм</text>
      
      <!-- Layers -->
      ${layersReversed
        .map((layer, i) => {
          const y = layerPositions[i];
          const h = layerHeights[i];
          const x = PADDING + 30;
          return `
            <!-- Layer ${i + 1} -->
            <rect x="${x}" y="${y}" width="${PATTERN_WIDTH}" height="${h}" fill="url(#p-${layer.id})" stroke="#4b5563" stroke-width="0.5" rx="2"/>
            <text x="${x + 8}" y="${y + h / 2 + 4}" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold" opacity="0.9">${layer.coatingType.thickness}мм</text>
            
            <!-- Label -->
            <text x="${x + PATTERN_WIDTH + 12}" y="${y + h / 2 - 2}" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="11" font-weight="500">${layer.coatingType.name}</text>
            <text x="${x + PATTERN_WIDTH + 12}" y="${y + h / 2 + 12}" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10">${layer.coatingType.thickness} мм</text>
          `;
        })
        .join('\n')}
      
      <!-- Footer -->
      <text x="${PADDING + 30}" y="${svgHeight - 15}" fill="#60a5fa" font-family="Arial, sans-serif" font-size="12" font-weight="bold">ИТОГО: ${totalThickness} мм</text>
    </svg>
  `;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgContent }}
      className="max-w-full overflow-auto"
    />
  );
};

export const exportPieAsPNG = (pie: Pie, showGaps: boolean = true): Promise<string> => {
  return new Promise((resolve, reject) => {
    const gap = showGaps ? GAP : 0;
    const maxThickness = Math.max(...pie.layers.map((l) => l.coatingType.thickness));
    const totalThickness = pie.layers.reduce((s, l) => s + l.coatingType.thickness, 0);

    const layersReversed = [...pie.layers].reverse();

    const layerHeights = layersReversed.map(
      (l) => Math.max((l.coatingType.thickness / maxThickness) * LAYER_MAX_HEIGHT, LAYER_MIN_HEIGHT)
    );

    const totalHeight =
      layerHeights.reduce((s, h) => s + h, 0) +
      gap * (layersReversed.length - 1) +
      PADDING * 2 +
      HEADER_HEIGHT;

    const svgWidth = PATTERN_WIDTH + LABEL_WIDTH + PADDING * 2 + 60;
    const svgHeight = totalHeight;

    const patternDefs = pie.layers
      .map((l) => getPatternDef(l.coatingType.pattern, l.id).replace(/__COLOR__/g, l.coatingType.color))
      .join('\n');

    let currentY = PADDING + HEADER_HEIGHT;
    const layerPositions = layersReversed.map((_, i) => {
      const y = currentY;
      currentY += layerHeights[i] + gap;
      return y;
    });

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <defs>${patternDefs}</defs>
      <rect width="${svgWidth}" height="${svgHeight}" fill="#1f2937"/>
      <text x="${PADDING}" y="${PADDING + 20}" fill="#60a5fa" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Пирог №${pie.number}</text>
      <text x="${PADDING}" y="${PADDING + 42}" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">${pie.name} • Общая толщина: ${totalThickness} мм</text>
      <line x1="${PADDING + 10}" y1="${PADDING + HEADER_HEIGHT}" x2="${PADDING + 10}" y2="${PADDING + HEADER_HEIGHT + layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)}" stroke="#6b7280" stroke-width="1"/>
      <line x1="${PADDING + 5}" y1="${PADDING + HEADER_HEIGHT}" x2="${PADDING + 15}" y2="${PADDING + HEADER_HEIGHT}" stroke="#6b7280" stroke-width="1"/>
      <line x1="${PADDING + 5}" y1="${PADDING + HEADER_HEIGHT + layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)}" x2="${PADDING + 15}" y2="${PADDING + HEADER_HEIGHT + layerHeights.reduce((s, h) => s + h, 0) + gap * (layersReversed.length - 1)}" stroke="#6b7280" stroke-width="1"/>
      ${layersReversed
        .map((layer, i) => {
          const y = layerPositions[i];
          const h = layerHeights[i];
          const x = PADDING + 30;
          return `
            <rect x="${x}" y="${y}" width="${PATTERN_WIDTH}" height="${h}" fill="url(#p-${layer.id})" stroke="#4b5563" stroke-width="0.5" rx="2"/>
            <text x="${x + 8}" y="${y + h / 2 + 4}" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold" opacity="0.9">${layer.coatingType.thickness}мм</text>
            <text x="${x + PATTERN_WIDTH + 12}" y="${y + h / 2 - 2}" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="11" font-weight="500">${layer.coatingType.name}</text>
            <text x="${x + PATTERN_WIDTH + 12}" y="${y + h / 2 + 12}" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10">${layer.coatingType.thickness} мм</text>
          `;
        })
        .join('\n')}
      <text x="${PADDING + 30}" y="${svgHeight - 15}" fill="#60a5fa" font-family="Arial, sans-serif" font-size="12" font-weight="bold">ИТОГО: ${totalThickness} мм</text>
    </svg>`;

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject('Canvas context not available');
      return;
    }
    ctx.scale(scale, scale);

    const img = new Image();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject('Failed to load SVG');
    };

    img.src = url;
  });
};

export const downloadPieImage = async (pie: Pie, withGaps: boolean = true) => {
  try {
    const dataUrl = await exportPieAsPNG(pie, withGaps);
    const link = document.createElement('a');
    link.download = `пирог_${pie.number}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Export failed:', err);
  }
};
