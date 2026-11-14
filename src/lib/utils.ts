import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReadinessLabel } from '../types/career';
import { GapPriority } from '../types/skills';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getReadinessBadgeStyle(label: ReadinessLabel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (label) {
    case 'Ready Now':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'Minor Upskilling':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        dot: 'bg-blue-400',
      };
    case 'Moderate Upskilling':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'Long-term Path':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        dot: 'bg-purple-400',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
      };
  }
}

export function getPriorityBadgeStyle(priority: GapPriority): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
      };
    case 'High':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'Medium':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      };
    case 'Low':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
      };
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-indigo-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

export function getScoreBgGlow(score: number): string {
  if (score >= 90) return 'shadow-emerald-500/20 border-emerald-500/30';
  if (score >= 75) return 'shadow-indigo-500/20 border-indigo-500/30';
  if (score >= 60) return 'shadow-amber-500/20 border-amber-500/30';
  return 'shadow-rose-500/20 border-rose-500/30';
}
