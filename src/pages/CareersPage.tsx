import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useCareers } from '../hooks/useCareers';
import { getReadinessBadgeStyle } from '../lib/utils';
import { ReadinessLabel } from '../types/career';

const READINESS_FILTERS = [
  'All',
  'Ready Now',
  'Minor Upskilling',
  'Moderate Upskilling',
];

export const CareersPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'title'>('score');

  const { data: careers, isLoading, error, refetch } = useCareers(selectedFilter);

  const filteredCareers = (careers || [])
    .filter((career) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        career.title.toLowerCase().includes(q) ||
        career.category.toLowerCase().includes(q) ||
        career.topSkills.some((sk) => sk.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.compatibilityScore - a.compatibilityScore;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Career Recommendations
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/20 font-semibold">
                AI Match Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated across your Holland RIASEC interests, academic degree, and current code proficiencies.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/onboarding')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
          >
            Update Assessment
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Readiness Tabs */}
          <div className="flex flex-wrap gap-2">
            {READINESS_FILTERS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                  selectedFilter === tab
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                    : 'bg-surface-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search roles or skills (e.g. PyTorch)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5" />}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'title')}
              className="rounded-lg bg-surface-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 focus:outline-none focus:border-brand-500 shrink-0"
            >
              <option value="score">Sort: Highest Match</option>
              <option value="title">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState
          title="Failed to load recommendations"
          message={error instanceof Error ? error.message : 'Please check your connection.'}
          onRetry={refetch}
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCareers.length === 0 && (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No career recommendations match your filter"
          description="Try selecting a different readiness tier or clearing your search keywords."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedFilter('All');
            setSearchQuery('');
          }}
        />
      )}

      {/* Career Cards Grid */}
      {!isLoading && !error && filteredCareers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => {
            const badgeStyle = getReadinessBadgeStyle(career.readinessLabel);

            return (
              <Card
                key={career.id}
                variant="interactive"
                onClick={() => navigate(`/careers/${career.id}`)}
                className="flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Category & Readiness Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      {career.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                      {career.readinessLabel}
                    </span>
                  </div>

                  {/* Title & Score Radial Gauge */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition-colors">
                        {career.title}
                      </h3>
                      <p className="text-xs text-slate-500">{career.workStyle}</p>
                    </div>
                    <ScoreGauge score={career.compatibilityScore} size="sm" showPercentage />
                  </div>

                  {/* Short Explanation */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {career.shortExplanation}
                  </p>

                  {/* Top Skills Chips */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                      Evaluated Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {career.topSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-surface-900 border border-slate-800 text-[11px] text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Salary & Action Footer */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Median Compensation</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {career.medianSalary}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/careers/${career.id}`);
                      }}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
