import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Sliders,
  Milestone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useSkillGapAnalysis } from '../hooks/useSkillGap';
import { getPriorityBadgeStyle } from '../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: gapData, isLoading, error, refetch } = useSkillGapAnalysis();

  // Interactive Simulator State: student can check off skills to see their score jump!
  const [selectedToLearn, setSelectedToLearn] = useState<string[]>(['sk-triton', 'sk-docker']);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error || !gapData) {
    return (
      <ErrorState
        title="Failed to load skill gap analysis"
        message={error instanceof Error ? error.message : 'Please check your connection.'}
        onRetry={refetch}
      />
    );
  }

  // Calculate simulated boosted score based on selected skills
  const baseScore = gapData.overallReadinessScore;
  const simulatedBoost = gapData.skills
    .filter((sk) => selectedToLearn.includes(sk.id))
    .reduce((acc, curr) => acc + curr.potentialScoreImprovement, 0);
  const simulatedScore = Math.min(100, baseScore + simulatedBoost);

  const toggleSkillSimulation = (id: string) => {
    if (selectedToLearn.includes(id)) {
      setSelectedToLearn(selectedToLearn.filter((x) => x !== id));
    } else {
      setSelectedToLearn([...selectedToLearn, id]);
    }
  };

  // Prepare chart data comparing numerical proficiency: 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
  const comparisonChartData = gapData.skills.map((sk) => ({
    name: sk.name.split(' ')[0], // short name
    fullName: sk.name,
    current: sk.currentNumeric,
    required: sk.requiredNumeric,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Skill Gap Analysis & Radar
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                Delta Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dissects the delta between your verified proficiency levels and market hiring standards.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/roadmap')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Sync to Roadmap
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400">Current Readiness Index</span>
            <p className="text-2xl font-extrabold text-white">
              {gapData.overallReadinessScore}%
            </p>
            <span className="text-[11px] text-slate-500 block">Baseline across evaluated roles</span>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400">Potential Max Score</span>
            <p className="text-2xl font-extrabold text-emerald-400">
              {gapData.potentialMaxScore}%
            </p>
            <span className="text-[11px] text-emerald-500/80 block">
              +18% score uplift possible
            </span>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400">Critical Priority Gaps</span>
            <p className="text-2xl font-extrabold text-rose-400">
              {gapData.criticalGapsCount} Skills
            </p>
            <span className="text-[11px] text-slate-500 block">Blocks immediate hireability</span>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Skills Evaluated</span>
            <p className="text-2xl font-extrabold text-brand-300">
              {gapData.skills.length} Items
            </p>
            <span className="text-[11px] text-slate-500 block">AI, Cloud, Systems & DBs</span>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Score Improvement Simulator */}
      <Card variant="glow" className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              <h3 className="text-base font-bold text-white">
                Interactive Score Improvement Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check off the skills you plan to acquire in your upcoming study sprints. Watch how your readiness score and career compatibility immediately leap.
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-xl bg-surface-900 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Simulated Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{simulatedScore}%</span>
                <span className="text-xs font-bold text-emerald-500">
                  +{simulatedBoost}% uplift
                </span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <Button
              size="sm"
              onClick={() => navigate('/roadmap')}
              rightIcon={<Milestone className="w-3.5 h-3.5" />}
            >
              Update Roadmap
            </Button>
          </div>
        </div>

        {/* Selected Skills Chips */}
        <div className="pt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 font-medium mr-2">Targeting in sprint:</span>
          {gapData.skills.map((sk) => {
            const isChecked = selectedToLearn.includes(sk.id);
            return (
              <button
                key={sk.id}
                type="button"
                onClick={() => toggleSkillSimulation(sk.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
                  isChecked
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                    : 'bg-surface-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>{sk.name}</span>
                <span
                  className={`text-[10px] font-bold ${
                    isChecked ? 'text-brand-200' : 'text-emerald-400'
                  }`}
                >
                  +{sk.potentialScoreImprovement}%
                </span>
                {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Current vs Required Proficiency Chart */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Current vs Required Proficiency Benchmark</CardTitle>
          <CardDescription>
            Normalized proficiency scale (1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Expert)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <YAxis
                  domain={[0, 4]}
                  ticks={[1, 2, 3, 4]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) =>
                    val === 1 ? 'Beginner' : val === 2 ? 'Interm.' : val === 3 ? 'Advanced' : 'Expert'
                  }
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const levels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
                    return (
                      <div className="p-3 rounded-lg bg-surface-900 border border-slate-700 text-xs shadow-xl space-y-1">
                        <p className="font-bold text-white">{d.fullName}</p>
                        <p className="text-slate-400">Your Level: <strong className="text-slate-200">{levels[d.current]}</strong></p>
                        <p className="text-slate-400">Target Level: <strong className="text-emerald-400">{levels[d.required]}</strong></p>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => <span className="text-slate-300">{val}</span>}
                />
                <Bar dataKey="current" name="Current Proficiency" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Required Proficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Skill Gap Table */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Detailed Skill Gap Breakdown</CardTitle>
          <CardDescription>
            Categorized by gap priority, estimated time to bridge, and impact on score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Skill & Focus</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current → Target</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Score Uplift</th>
                  <th className="py-3 px-4">Est. Bridge Time</th>
                  <th className="py-3 px-4 text-right">Sprint Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {gapData.skills.map((skill) => {
                  const pStyle = getPriorityBadgeStyle(skill.priority);
                  const isChecked = selectedToLearn.includes(skill.id);

                  return (
                    <tr
                      key={skill.id}
                      className={`hover:bg-surface-900/40 transition-colors ${
                        isChecked ? 'bg-brand-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-100">{skill.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                          {skill.description}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline">{skill.category}</Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-400">{skill.currentLevel}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span className="font-semibold text-emerald-400">{skill.requiredLevel}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                        >
                          {skill.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-400 text-sm">
                          +{skill.potentialScoreImprovement}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {skill.estimatedWeeksToBridge} weeks
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={isChecked ? 'secondary' : 'outline'}
                          onClick={() => toggleSkillSimulation(skill.id)}
                          className="text-xs"
                        >
                          {isChecked ? 'Planned in Sprint' : '+ Add to Sprint'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
