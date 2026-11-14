import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { MOCK_CAREERS } from '../mocks/mockData';
import { getReadinessBadgeStyle } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const previewCareer = MOCK_CAREERS[activePreviewIndex] || MOCK_CAREERS[0];
  const readinessStyle = getReadinessBadgeStyle(previewCareer.readinessLabel);

  return (
    <div className="relative overflow-hidden bg-surface-950">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[1200px] -right-48 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-900 border border-brand-500/30 text-xs font-medium text-slate-200 shadow-glow-sm animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Career Guidance SaaS Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-brand-400 font-semibold">Holland RIASEC Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
            Navigate your tech career with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300">
              precision intelligence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
            Stop relying on generic advice. Pathly evaluates your 36-question RIASEC psychometrics,
            academic coursework, and code proficiency to map personalized learning roadmaps with zero guesswork.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-glow"
            >
              Start Free 36-Question Assessment
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/careers')}
              leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
              className="w-full sm:w-auto"
            >
              Explore Target Roles
            </Button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>36-Question Holland RIASEC Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Skill Gap Analysis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>FastAPI & PostgreSQL Backend Ready</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Hero Preview Card */}
        <div className="mt-16 max-w-4xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border-slate-800 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                  Live Engine Preview
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Real-Time Compatibility Synthesis
              </h3>
            </div>

            {/* Role Switcher Pills */}
            <div className="flex flex-wrap gap-2">
              {MOCK_CAREERS.slice(0, 3).map((career, idx) => (
                <button
                  key={career.id}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    activePreviewIndex === idx
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : 'bg-surface-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {career.title}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Compatibility Gauge */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-900/60 border border-slate-800/80 text-center">
              <ScoreGauge score={previewCareer.compatibilityScore} size="lg" label="Match Score" />
              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${readinessStyle.bg} ${readinessStyle.text} ${readinessStyle.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${readinessStyle.dot}`} />
                  {previewCareer.readinessLabel}
                </span>
              </div>
            </div>

            {/* Rationale & Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs text-slate-400">Target Role</span>
                <h4 className="text-xl font-bold text-white flex items-center justify-between">
                  {previewCareer.title}
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {previewCareer.medianSalary}
                  </span>
                </h4>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {previewCareer.shortExplanation}
              </p>

              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  Core Skills Evaluated
                </span>
                <div className="flex flex-wrap gap-2">
                  {previewCareer.topSkills.map((sk) => (
                    <Badge key={sk} variant="brand">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                <span>Growth Outlook: <strong className="text-slate-200">{previewCareer.growthRate}</strong></span>
                <Link
                  to={`/careers/${previewCareer.id}`}
                  className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
                >
                  View Full Career Dossier <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/80 bg-surface-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Methodology
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              From Self-Assessment to Offer Letter
            </h2>
            <p className="text-sm text-slate-400">
              A scientific 4-step framework that connects psychological strengths with real technical hiring requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'RIASEC Assessment',
                desc: 'Complete 36 Holland vocational interest questions (6 per dimension: Realistic, Investigative, Artistic, Social, Enterprising, Conventional).',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Compatibility Synthesis',
                desc: 'Our engine blends your coursework, technical skills, and behavioral traits against industry hiring criteria.',
                icon: BarChart3,
              },
              {
                step: '03',
                title: 'Skill Gap Radar',
                desc: 'Identify the exact delta between your current proficiency and target expectations, prioritized by impact score.',
                icon: Target,
              },
              {
                step: '04',
                title: 'Personalized Roadmap',
                desc: 'Follow multi-stage projects, weekly study hours, and production milestones that turn theoretical gaps into shipped code.',
                icon: Calendar,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="glass-panel p-6 rounded-xl border-slate-800 flex flex-col justify-between relative group hover:border-brand-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-slate-700 group-hover:text-brand-500/40 transition-colors">
                        {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-center text-brand-400">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-surface-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Features Built for Engineers
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Everything Needed to Land Your Dream Role
            </h2>
            <p className="text-sm text-slate-400">
              Purpose-built tools replacing vague advice with concrete, measurable deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Dynamic Compatibility Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scores roles across four balanced dimensions: Skill match, Interest fit, Academic relevance, and Real-world market demand.
                </p>
                <div className="pt-2 text-xs text-brand-300 font-medium">
                  Weighted multi-factor scoring
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Skill Gap Simulator</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  See how learning a specific library (e.g. PyTorch, Docker, or FastAPI) immediately boosts your overall readiness score.
                </p>
                <div className="pt-2 text-xs text-cyan-300 font-medium">
                  Interactive what-if simulations
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Weekly Availability Scheduler</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your personalized roadmap respects your actual schedule—allocating 5 to 20+ study hours across your preferred weekdays and weekends.
                </p>
                <div className="pt-2 text-xs text-emerald-300 font-medium">
                  Realistic study pacing
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Interactive Task Check-offs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track projects with actionable checkboxes that instantly calculate milestone velocity and profile completion.
                </p>
                <div className="pt-2 text-xs text-purple-300 font-medium">
                  Continuous progress sync
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Curated Engineering Resources</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct access to documentation, official tutorials, systems books, and GitHub repositories vetted for deep learning and systems engineering.
                </p>
                <div className="pt-2 text-xs text-amber-300 font-medium">
                  High-signal resources
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">REST API Handover Architecture</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Separated service layer, strict TypeScript models, and isolated mock adapters designed for clean FastAPI & PostgreSQL integration.
                </p>
                <div className="pt-2 text-xs text-blue-300 font-medium">
                  FastAPI backend ready
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Exploration Preview Grid */}
      <section id="career-preview" className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                Explore The Catalog
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
                Top High-Growth Career Tracks
              </h2>
            </div>
            <Link
              to="/careers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300"
            >
              View all careers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CAREERS.slice(0, 3).map((career) => {
              const rStyle = getReadinessBadgeStyle(career.readinessLabel);
              return (
                <div
                  key={career.id}
                  className="glass-card-interactive p-6 rounded-xl flex flex-col justify-between"
                  onClick={() => navigate(`/careers/${career.id}`)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{career.category}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${rStyle.bg} ${rStyle.text} ${rStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rStyle.dot}`} />
                        {career.readinessLabel}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                      {career.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {career.shortExplanation}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {career.topSkills.slice(0, 4).map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-surface-900 border border-slate-800 text-[11px] text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        Compatibility
                      </span>
                      <p className="text-lg font-bold text-emerald-400">
                        {career.compatibilityScore}%
                      </p>
                    </div>
                    <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Explore
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to action banner */}
      <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-surface-950 via-brand-950/20 to-surface-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto shadow-glow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to discover your optimal engineering trajectory?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Take the standardized 36-question RIASEC assessment. Uncover your skill gaps and generate your custom learning roadmap in under 5 minutes.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-glow"
            >
              Start Student Onboarding
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
