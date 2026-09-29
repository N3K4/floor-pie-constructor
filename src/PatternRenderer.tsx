import React from 'react';
import { CoatingType } from './types';

interface PatternProps {
  pattern: string;
  color: string;
  width?: number;
  height?: number;
}

// Deterministic pseudo-random based on seed
function seededValues(seed: number, count: number): number[] {
  const values: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    values.push(s / 233280);
  }
  return values;
}

export const PatternRenderer: React.FC<PatternProps> = ({ pattern, color, width = 60, height = 60 }) => {
  const renderPattern = () => {
    switch (pattern) {
      case 'dots':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[5, 15, 25, 35, 45, 55].map((x) =>
              [5, 15, 25, 35, 45, 55].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="rgba(0,0,0,0.2)" />
              ))
            )}
          </svg>
        );

      case 'gravel': {
        const vals = seededValues(42, 60);
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {Array.from({ length: 15 }).map((_, i) => (
              <ellipse
                key={i}
                cx={vals[i * 4] * 56 + 2}
                cy={vals[i * 4 + 1] * 56 + 2}
                rx={vals[i * 4 + 2] * 3 + 1}
                ry={vals[i * 4 + 3] * 2 + 1}
                fill={i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}
              />
            ))}
          </svg>
        );
      }

      case 'mesh':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[10, 20, 30, 40, 50].map((v) => (
              <React.Fragment key={v}>
                <line x1="0" y1={v} x2="60" y2={v} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                <line x1={v} y1="0" x2={v} y2="60" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              </React.Fragment>
            ))}
          </svg>
        );

      case 'terrazzo':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[
              { points: '5,3 12,6 8,11', fill: '#8B4513' },
              { points: '25,8 32,5 30,14', fill: '#696969' },
              { points: '45,4 52,8 48,12', fill: '#F5F5DC' },
              { points: '10,22 18,25 14,30', fill: '#2F4F4F' },
              { points: '35,20 42,24 38,28', fill: '#CD853F' },
              { points: '8,40 15,44 12,48', fill: '#8B4513' },
              { points: '28,38 35,42 32,46', fill: '#696969' },
              { points: '48,35 55,38 52,43', fill: '#F5F5DC' },
              { points: '20,50 27,54 24,58', fill: '#2F4F4F' },
              { points: '42,48 49,52 46,56', fill: '#CD853F' },
            ].map((tri, i) => (
              <polygon key={i} points={tri.points} fill={tri.fill} opacity="0.5" />
            ))}
          </svg>
        );

      case 'wood':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={y + (i % 2 === 0 ? 0.5 : -0.3)}
                x2="60"
                y2={y + (i % 2 === 0 ? -0.3 : 0.5)}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        );

      case 'herringbone':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[0, 1, 2, 3, 4, 5].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={col * 16 + (row % 2) * 8}
                  y={row * 10}
                  width="14"
                  height="8"
                  fill="none"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                  transform={`rotate(${row % 2 === 0 ? 45 : -45} ${col * 16 + 7} ${row * 10 + 4})`}
                />
              ))
            )}
          </svg>
        );

      case 'planks':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[0, 1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <rect x="0" y={i * 12} width="60" height="11" fill={i % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'} />
                <line x1="0" y1={i * 12} x2="60" y2={i * 12} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
              </React.Fragment>
            ))}
          </svg>
        );

      case 'smooth':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <defs>
              <linearGradient id={`smooth-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                <stop offset="100%" stopColor="black" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <rect width="60" height="60" fill={color} />
            <rect width="60" height="60" fill={`url(#smooth-${color.replace('#', '')})`} />
          </svg>
        );

      case 'fibers': {
        const fVals = seededValues(77, 40);
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={i}
                x1={fVals[i * 2] * 60}
                y1={fVals[i * 2 + 1] * 60}
                x2={fVals[(i * 2 + 5) % 40] * 60}
                y2={fVals[(i * 2 + 6) % 40] * 60}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        );
      }

      case 'tiles':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={col * 15 + 1}
                  y={row * 15 + 1}
                  width="13"
                  height="13"
                  fill="none"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                  rx="1"
                />
              ))
            )}
          </svg>
        );

      case 'metal':
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <defs>
              <linearGradient id="metalGradV" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                <stop offset="50%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="black" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="60" height="60" fill={color} />
            <rect width="60" height="60" fill="url(#metalGradV)" />
            {[10, 30, 50].map((y) => (
              <line key={y} x1="0" y1={y} x2="60" y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            ))}
          </svg>
        );

      default:
        return (
          <svg width={width} height={height} viewBox="0 0 60 60">
            <rect width="60" height="60" fill={color} />
          </svg>
        );
    }
  };

  return <>{renderPattern()}</>;
};
