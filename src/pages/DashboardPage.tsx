import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Target,
  Milestone,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useDashboardSummary } from '../hooks/useDashboard';
import { getReadinessBadgeStyle } from '../lib/utils';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 mb-6">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        message={error instanceof Error ? error.message : 'Please try again.'}
        onRetry={refetch}
      />
    );
  }

  // Transform RIASEC data for Radar Chart
  const riasecRadarData = Object.entries(summary.riasecBreakdown).map(([dimension, score]) => ({
    dimension,
    score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Career Dashboard</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Assessment
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synthesis of your 36-Q RIASEC assessment, technical proficiencies, and learning trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/onboarding')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
          >
            Retake Assessment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/roadmap')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Go to Roadmap
          </Button>
        </div>
      </div>

      {/* Top Stat Cards (4-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Career Readiness Score */}
        <Card variant="default">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Career Readiness</span>
              <p className="text-2xl font-extrabold text-white">
                {summary.careerReadinessScore}
                <span className="text-xs font-normal text-slate-400"> / 100</span>
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 pt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8 pts from coursework</span>
              </div>
            </div>
            <ScoreGauge score={summary.careerReadinessScore} size="sm" showPercentage={false} />
          </CardContent>
        </Card>

        {/* 2. Profile Completion */}
        <Card variant="default">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Profile Completion</span>
              <UserCheck className="w-4 h-4 text-brand-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{summary.profileCompletionPct}%</span>
              <span className="text-[11px] text-slate-400">All 7 steps verified</span>
            </div>
            <ProgressBar value={summary.profileCompletionPct} color="brand" size="sm" />
          </CardContent>
        </Card>

        {/* 3. Skill Strengths & Gaps */}
        <Card
          variant="interactive"
          onClick={() => navigate('/skills')}
          title="Click to view Skill Gap Analysis"
        >
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Skills Portfolio</span>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {summary.skillStrengthsCount}
                </span>
                <span className="text-[11px] text-slate-400 block">Proficient</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div>
                <span className="text-2xl font-extrabold text-amber-400">
                  {summary.skillGapsCount}
                </span>
                <span className="text-[11px] text-slate-400 block">Identified Gaps</span>
              </div>
            </div>
            <span className="text-[10px] text-brand-400 hover:underline flex items-center gap-1 pt-1">
              View Radar Analysis <ChevronRight className="w-3 h-3" />
            </span>
          </CardContent>
        </Card>

        {/* 4. Active Roadmap Progress */}
        <Card
          variant="interactive"
          onClick={() => navigate('/roadmap')}
          title="Click to view Learning Roadmap"
        >
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Roadmap Velocity</span>
              <Milestone className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-extrabold text-white">{summary.roadmapProgressPct}%</span>
              <span className="text-[10px] text-slate-400 truncate max-w-28">Stage 2 Active</span>
            </div>
            <ProgressBar value={summary.roadmapProgressPct} color="gradient" size="sm" />
            <span className="text-[10px] text-purple-300 hover:underline flex items-center gap-1 pt-0.5">
              Continue weekly tasks <ChevronRight className="w-3 h-3" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RIASEC Psychometric Radar */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Holland RIASEC Psychometric Profile</CardTitle>
              <CardDescription>
                Empirical scoring across all 6 vocational interests (6 questions per dimension, 36 total)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                Primary: Investigative (94%)
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riasecRadarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#334155"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                  />
                  <Radar
                    name="Student Profile"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-2 rounded bg-surface-900 border border-slate-700 text-xs shadow-lg">
                          <p className="font-bold text-white">{d.dimension}</p>
                          <p className="text-brand-300">{d.score}% Match Affinity</p>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 border-t border-slate-800 text-center">
              {Object.entries(summary.riasecBreakdown).map(([dim, val]) => (
                <div key={dim} className="p-2 rounded bg-surface-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{dim.substring(0, 4)}</span>
                  <span className="text-xs font-bold text-slate-200">{val}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Portfolio Category Balance */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Skill Balance by Domain</CardTitle>
            <CardDescription>Proficient skills vs identified learning gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.skillDistribution} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#475569"
                    tick={{ fill: '#cbd5e1', fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="proficientCount" name="Proficient" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="gapCount" name="Gap to Bridge" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Proficient
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Gap to Bridge
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Career Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Top Career Recommendations
            </h2>
            <p className="text-xs text-slate-400">
              Ranked by multi-factor algorithmic compatibility with your RIASEC profile and skills
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/careers')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View All ({summary.topCareerRecommendations.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {summary.topCareerRecommendations.slice(0, 3).map((career) => {
            const badgeStyle = getReadinessBadgeStyle(career.readinessLabel);
            return (
              <Card
                key={career.id}
                variant="interactive"
                onClick={() => navigate(`/careers/${career.id}`)}
                className="flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{career.category}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                      {career.readinessLabel}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-base text-white hover:text-brand-300 transition-colors">
                      {career.title}
                    </h3>
                    <ScoreGauge score={career.compatibilityScore} size="sm" showPercentage />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {career.shortExplanation}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {career.topSkills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-surface-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium">{career.medianSalary}</span>
                    <span className="text-brand-400 font-semibold hover:underline flex items-center gap-1">
                      Deep Dive <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Next Step Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Milestone Card */}
        <Card variant="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Active Milestone Objective
            </CardTitle>
            <CardDescription>Current focal point on your personalized roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                  Target Week 7
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  In Progress
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{summary.activeMilestoneTitle}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Host an open-weights LLM service sustaining 100 concurrent requests under 40ms token latency.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/roadmap')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue Stage 2 Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity & Milestone Logs</CardTitle>
            <CardDescription>Live telemetry from your learning progress and assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-surface-900 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                    {act.type === 'roadmap_task' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : act.type === 'assessment' ? (
                      <Compass className="w-4 h-4 text-brand-400" />
                    ) : (
                      <Milestone className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-200">{act.title}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
