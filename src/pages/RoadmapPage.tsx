import React, { useState } from 'react';
import {
  Milestone,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  BookOpen,
  ExternalLink,
  Sparkles,
  Award,
  Zap,
  Server,
  Database,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useRoadmap, useToggleTask } from '../hooks/useRoadmap';
import { RoadmapStage } from '../types/roadmap';

export const RoadmapPage: React.FC = () => {
  const { data: roadmap, isLoading, error, refetch } = useRoadmap();
  const toggleTaskMutation = useToggleTask();

  // Active stage tab or collapse state
  const [activeStageId, setActiveStageId] = useState<string>('stg-2'); // defaults to In Progress stage
  const [filterCategory, setFilterCategory] = useState<string>('All');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <ErrorState
        title="Failed to load learning roadmap"
        message={error instanceof Error ? error.message : 'Please check your connection.'}
        onRetry={refetch}
      />
    );
  }

  const handleTaskToggle = (taskId: string, currentStatus: boolean) => {
    toggleTaskMutation.mutate({
      taskId,
      isCompleted: !currentStatus,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Personalized Learning Roadmap
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/20 font-semibold">
                {roadmap.careerTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {roadmap.totalWeeks}-week curriculum calibrated to your {roadmap.weeklySchedule.totalWeeklyHours} hrs/week availability.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Overall Velocity
              </span>
              <span className="text-xl font-black text-emerald-400">
                {roadmap.progressPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-4">
          <ProgressBar value={roadmap.progressPct} color="gradient" size="md" showLabel />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
            <span>
              {roadmap.completedTasksCount} of {roadmap.totalTasksCount} project tasks completed
            </span>
            <span>Week {roadmap.currentWeek} of {roadmap.totalWeeks}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Stages & Tasks vs Weekly Schedule & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stages & Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage Tabs Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {roadmap.stages.map((stage) => {
              const isActive = activeStageId === stage.id;
              const isDone = stage.status === 'Completed';

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`text-xs px-3.5 py-2 rounded-lg border font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : isDone
                      ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-surface-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span>Stage {stage.stageNumber}</span>
                  <span className="text-[10px] opacity-75">({stage.duration})</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Details */}
          {roadmap.stages
            .filter((stg) => stg.id === activeStageId)
            .map((stage) => (
              <div key={stage.id} className="space-y-6 animate-in fade-in">
                {/* Stage Header Card */}
                <Card variant="default" className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                      Stage {stage.stageNumber} • {stage.duration}
                    </span>
                    <Badge
                      variant={
                        stage.status === 'Completed'
                          ? 'success'
                          : stage.status === 'In Progress'
                          ? 'brand'
                          : 'outline'
                      }
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{stage.description}</p>

                  {/* Stage Milestones */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">
                      Key Milestone Objectives
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stage.milestones.map((ms) => (
                        <div
                          key={ms.id}
                          className="p-3 rounded-lg bg-surface-900 border border-slate-800 flex items-start gap-2.5 text-xs"
                        >
                          <div className="p-1 rounded bg-brand-500/10 text-brand-400 mt-0.5 shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block">{ms.title}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed">
                              {ms.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Project Tasks Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Hands-on Deliverables & Tasks ({stage.tasks.length})
                    </h4>
                    <span className="text-xs text-slate-400">
                      Click checkbox to mark completed
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stage.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                          task.isCompleted
                            ? 'bg-surface-900/40 border-slate-800/60 opacity-80'
                            : 'bg-surface-900 border-slate-800 hover:border-brand-500/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleTaskToggle(task.id, task.isCompleted)}
                          className="mt-0.5 text-slate-400 hover:text-brand-400 transition-colors focus:outline-none"
                          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        {/* Task Info */}
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h5
                              className={`text-sm font-semibold ${
                                task.isCompleted
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </h5>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{task.category}</Badge>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {task.estimatedHours}h
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {task.description}
                          </p>

                          {task.deliverable && (
                            <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-brand-300">
                              <span className="font-semibold text-slate-500">Deliverable:</span>
                              <span>{task.deliverable}</span>
                            </div>
                          )}

                          {task.isCompleted && task.completedAt && (
                            <span className="text-[10px] text-emerald-400 font-medium block pt-0.5">
                              ✓ Verified finished on {task.completedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Right Column: Weekly Schedule & Resources (1 col) */}
        <div className="space-y-6">
          {/* Weekly Learning Schedule Widget */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Weekly Learning Schedule
                </CardTitle>
                <Badge variant="brand">{roadmap.weeklySchedule.totalWeeklyHours} hrs / wk</Badge>
              </div>
              <CardDescription>
                Synchronized with your study availability preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roadmap.weeklySchedule.scheduleSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-lg bg-surface-900 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{slot.day}</span>
                    <span className="text-brand-300 font-semibold">{slot.hours} hours</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{slot.focus}</p>
                </div>
              ))}

              {/* Success Tips */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Study Protocol
                </span>
                {roadmap.weeklySchedule.tipsForSuccess.map((tip, idx) => (
                  <p key={idx} className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Curated Recommended Resources */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Vetted Learning Resources
              </CardTitle>
              <CardDescription>High-signal tutorials, books, and repos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roadmap.resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-surface-900 border border-slate-800 hover:border-brand-500/40 block transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      {res.provider}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-950 text-slate-400 border border-slate-800">
                        {res.type}
                      </span>
                      {res.isFree && (
                        <span className="text-[10px] text-emerald-400 font-semibold">Free</span>
                      )}
                    </div>
                  </div>

                  <h5 className="text-xs font-semibold text-slate-200 group-hover:text-brand-300 flex items-center justify-between gap-1">
                    <span>{res.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-400 shrink-0" />
                  </h5>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-slate-800/60">
                    <span>{res.duration}</span>
                    <span>★ {res.rating}</span>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
