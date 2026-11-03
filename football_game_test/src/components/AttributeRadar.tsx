import React from 'react';
import { PlayerAttributes } from '../types/game';

interface AttributeRadarProps {
  attributes: PlayerAttributes;
  potential: number;
}

export const AttributeRadar: React.FC<AttributeRadarProps> = ({ attributes }) => {
  const stats = [
    { label: '속도 (PAC)', value: attributes.pace },
    { label: '슈팅 (SHO)', value: attributes.shooting },
    { label: '패스 (PAS)', value: attributes.passing },
    { label: '드리블 (DRI)', value: attributes.dribbling },
    { label: '수비 (DEF)', value: attributes.defending },
    { label: '피지컬 (PHY)', value: attributes.physical },
  ];

  const size = 240;
  const center = size / 2;
  const radius = 80;
  const totalStats = stats.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / totalStats) * index - Math.PI / 2;
    const r = (value / 99) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = stats
    .map((s, i) => {
      const { x, y } = getCoordinates(s.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background webs */}
        {[0.25, 0.5, 0.75, 1].map((scale) => {
          const webPoints = stats
            .map((_, i) => {
              const angle = (Math.PI * 2 / totalStats) * i - Math.PI / 2;
              const r = scale * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={scale}
              points={webPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={scale < 1 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Axis spokes */}
        {stats.map((_, i) => {
          const angle = (Math.PI * 2 / totalStats) * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#1e293b" strokeWidth="1" />;
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10B981"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data points and labels */}
        {stats.map((s, i) => {
          const { x, y } = getCoordinates(s.value, i);
          const angle = (Math.PI * 2 / totalStats) * i - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#34D399" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-medium fill-slate-300"
              >
                {s.label.split(' ')[0]}
                <tspan className="font-mono text-emerald-400 font-bold ml-1"> {s.value}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
