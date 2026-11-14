import React from 'react';
import { cn } from '../../lib/utils';

export interface ScoreGaugeProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  label,
  showPercentage = true,
  className,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  const dimensions = {
    sm: { size: 48, stroke: 4, textSize: 'text-xs', labelSize: 'text-[9px]' },
    md: { size: 76, stroke: 6, textSize: 'text-base font-bold', labelSize: 'text-[10px]' },
    lg: { size: 120, stroke: 8, textSize: 'text-2xl font-extrabold', labelSize: 'text-xs' },
  };

  const { size: dim, stroke, textSize, labelSize } = dimensions[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#10b981'; // emerald for >= 90
  if (normalizedScore < 60) strokeColor = '#f43f5e'; // rose
  else if (normalizedScore < 75) strokeColor = '#f59e0b'; // amber
  else if (normalizedScore < 90) strokeColor = '#6366f1'; // indigo/brand

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center shrink-0', className)}>
      <svg width={dim} height={dim} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Score Ring */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      {/* Centered Score Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercentage && (
          <span className={cn('tracking-tight text-slate-100', textSize)}>
            {Math.round(normalizedScore)}
            <span className="text-[70%] font-normal text-slate-400">%</span>
          </span>
        )}
        {label && <span className={cn('text-slate-400 font-medium', labelSize)}>{label}</span>}
      </div>
    </div>
  );
};
