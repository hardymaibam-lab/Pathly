import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Compass,
  Milestone,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useCareerDetail } from '../hooks/useCareers';
import { getReadinessBadgeStyle } from '../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const CareerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: career, isLoading, error, refetch } = useCareerDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !career) {
    return (
      <ErrorState
        title="Career track not found"
        message={error instanceof Error ? error.message : 'Could not find details for this role.'}
        onRetry={refetch}
      />
    );
  }

  const badgeStyle = getReadinessBadgeStyle(career.readinessLabel);

  const breakdownChartData = [
    { name: 'Skill Fit', score: career.scoreBreakdown.skillCompatibility, fill: '#6366f1' },
    { name: 'Interest (RIASEC)', score: career.scoreBreakdown.interestCompatibility, fill: '#10b981' },
    { name: 'Academic Relevance', score: career.scoreBreakdown.academicRelevance, fill: '#06b6d4' },
    { name: 'Market Demand', score: career.scoreBreakdown.marketDemand, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/careers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Career Recommendations
        </Link>
      </div>

      {/* Hero Overview Header Card */}
      <Card variant="default" className="border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">{career.category}</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                {career.readinessLabel}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {career.title}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              {career.overview}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center">
              <ScoreGauge score={career.compatibilityScore} size="lg" label="Overall Match" />
            </div>
            <div className="hidden sm:flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/roadmap')}
                rightIcon={<Milestone className="w-4 h-4" />}
                className="shadow-glow"
              >
                Adopt Roadmap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/skills')}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
              >
                Inspect Skill Gaps
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-500 block">Median Compensation</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {career.medianSalary}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Projected Market Growth</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              {career.growthRate}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Work Style</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              {career.workStyle}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">RIASEC Alignment</span>
            <span className="text-sm font-bold text-brand-300 mt-0.5 block">
              {career.riasecAlignment.primaryCode}
            </span>
          </div>
        </div>
      </Card>

      {/* Score Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown Chart */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Multifactor Compatibility Breakdown</CardTitle>
            <CardDescription>
              Algorithmic scoring combining technical proficiency, psychometric interests, and academic relevance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(val: number) => [`${val}%`, 'Score']}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {breakdownChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-2.5 rounded bg-surface-900 border border-slate-800">
                <span className="text-slate-500 block">Skill Compatibility</span>
                <span className="text-sm font-bold text-brand-400">
                  {career.scoreBreakdown.skillCompatibility}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-surface-900 border border-slate-800">
                <span className="text-slate-500 block">Interest Compatibility</span>
                <span className="text-sm font-bold text-emerald-400">
                  {career.scoreBreakdown.interestCompatibility}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-surface-900 border border-slate-800">
                <span className="text-slate-500 block">Academic Relevance</span>
                <span className="text-sm font-bold text-cyan-400">
                  {career.scoreBreakdown.academicRelevance}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-surface-900 border border-slate-800">
                <span className="text-slate-500 block">Market Demand</span>
                <span className="text-sm font-bold text-amber-400">
                  {career.scoreBreakdown.marketDemand}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIASEC Profile Affinity */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Psychological Fit</CardTitle>
            <CardDescription>Holland RIASEC Vocational Code Alignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-surface-900 border border-brand-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-400">Primary Holland Code</span>
                <Badge variant="brand">{career.riasecAlignment.primaryCode}</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {career.riasecAlignment.description}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>Alignment Percentage</span>
                <span className="text-slate-100 font-bold">
                  {career.riasecAlignment.alignmentPercentage}%
                </span>
              </div>
              <ProgressBar
                value={career.riasecAlignment.alignmentPercentage}
                color="brand"
                size="md"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Based on empirical research connecting vocational satisfaction and long-term retention in technical specializations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Skill Gaps Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Career Strengths */}
        <Card variant="default" className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Verified Career Strengths
            </CardTitle>
            <CardDescription>
              Existing coursework, skills, and traits directly empowering your readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {career.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Skill Gaps */}
        <Card variant="default" className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Priority Skill Gaps to Bridge
            </CardTitle>
            <CardDescription>
              Technical competencies required by employers currently missing from your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {career.skillGaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Required Skills Matrix Table */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Technical Competency Matrix</CardTitle>
          <CardDescription>
            Comparison of required industry standards versus your self-assessed proficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Skill Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Required Level</th>
                  <th className="py-3 px-4">Your Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {career.requiredSkills.map((req, idx) => (
                  <tr key={idx} className="hover:bg-surface-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">{req.name}</td>
                    <td className="py-3 px-4 text-slate-400">{req.category}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">{req.requiredLevel}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          req.currentLevel === 'Missing'
                            ? 'text-rose-400 font-medium'
                            : 'text-slate-300'
                        }
                      >
                        {req.currentLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {req.status === 'Matched' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Matched
                        </span>
                      ) : req.status === 'Minor Gap' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Minor Gap
                        </span>
                      ) : req.status === 'Moderate Gap' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Moderate Gap
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Missing
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Actions CTA */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-white">
              Ready to pursue {career.title}?
            </h3>
            <p className="text-xs text-slate-400">
              Configure your Personalized Learning Roadmap to bridge identified gaps systematically.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/skills')}
            >
              Simulate Score Improvement
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/roadmap')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Active Roadmap
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
