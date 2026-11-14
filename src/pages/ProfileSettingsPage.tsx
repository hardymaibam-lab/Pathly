import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Code2,
  Briefcase,
  Settings,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Database,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { DEGREE_OPTIONS, COMMON_TECHNICAL_SKILLS } from '../lib/constants';
import { ProficiencyLevel, SkillCategory, TechnicalSkillItem } from '../types/skills';
import { USE_MOCKS, API_BASE_URL } from '../services/api';

export const ProfileSettingsPage: React.FC = () => {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<'academic' | 'skills' | 'preferences' | 'account'>('academic');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Local editable state
  const [formData, setFormData] = useState(() => profile);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>('Intermediate');
  const [courseworkInput, setCourseworkInput] = useState('');

  // Sync initial query data into local form once loaded
  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading || !formData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load student profile"
        message={error instanceof Error ? error.message : 'Please check your connection.'}
        onRetry={refetch}
      />
    );
  }

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      setSaveSuccess('Profile and preferences updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      // Error
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile & Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your academic credentials, technical skills, career preferences, and study pacing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveSuccess}
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={updateProfileMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'academic', label: 'Academic & Personal', icon: GraduationCap },
          { key: 'skills', label: 'Skills & Proficiencies', icon: Code2 },
          { key: 'preferences', label: 'Preferences & Study Hours', icon: Briefcase },
          { key: 'account', label: 'Account & Integration', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`text-xs px-3.5 py-2 rounded-lg border font-medium flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                  : 'bg-surface-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Academic & Personal Info */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Contact details and student headline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.personalInfo.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, fullName: e.target.value },
                    })
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, email: e.target.value },
                    })
                  }
                />
                <Input
                  label="Phone"
                  value={formData.personalInfo.phone || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, phone: e.target.value },
                    })
                  }
                />
                <Input
                  label="Location"
                  value={formData.personalInfo.location || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, location: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bio / Headline
                </label>
                <textarea
                  rows={3}
                  value={formData.personalInfo.bio || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, bio: e.target.value },
                    })
                  }
                  className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm p-3 focus:outline-none focus:border-brand-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle>Academic Background</CardTitle>
              <CardDescription>Degree program and verified coursework</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Degree</label>
                  <select
                    value={formData.academicBackground.degree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicBackground: { ...formData.academicBackground, degree: e.target.value },
                      })
                    }
                    className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:border-brand-500"
                  >
                    {DEGREE_OPTIONS.map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Major"
                  value={formData.academicBackground.major}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicBackground: { ...formData.academicBackground, major: e.target.value },
                    })
                  }
                />

                <Input
                  label="Institution"
                  value={formData.academicBackground.institution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicBackground: { ...formData.academicBackground, institution: e.target.value },
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Graduation Year"
                    type="number"
                    value={formData.academicBackground.graduationYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicBackground: {
                          ...formData.academicBackground,
                          graduationYear: parseInt(e.target.value) || 2026,
                        },
                      })
                    }
                  />
                  <Input
                    label="GPA"
                    value={formData.academicBackground.gpa || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicBackground: { ...formData.academicBackground, gpa: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Coursework Tags */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Completed Coursework
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g. Distributed Computing"
                    value={courseworkInput}
                    onChange={(e) => setCourseworkInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (courseworkInput.trim()) {
                        setFormData({
                          ...formData,
                          academicBackground: {
                            ...formData.academicBackground,
                            coursework: [...formData.academicBackground.coursework, courseworkInput.trim()],
                          },
                        });
                        setCourseworkInput('');
                      }
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.academicBackground.coursework.map((course, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-900 border border-slate-800 text-xs text-slate-300"
                    >
                      {course}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            academicBackground: {
                              ...formData.academicBackground,
                              coursework: formData.academicBackground.coursework.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Skills & Proficiencies */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Technical Skills Portfolio</CardTitle>
              <CardDescription>
                Update your proficiency levels across languages, frameworks, cloud, and databases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Skill */}
              <div className="p-4 rounded-xl bg-surface-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                  Add New Skill
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Skill name"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    />
                  </div>
                  <div>
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                      className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-200 text-sm px-3 py-2"
                    >
                      <option value="Languages">Languages</option>
                      <option value="Frameworks">Frameworks</option>
                      <option value="AI & ML">AI & ML</option>
                      <option value="Cloud & Infra">Cloud & Infra</option>
                      <option value="Databases">Databases</option>
                      <option value="Fundamentals">Fundamentals</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={newSkillProficiency}
                      onChange={(e) => setNewSkillProficiency(e.target.value as ProficiencyLevel)}
                      className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-200 text-sm px-3 py-2"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!newSkillName.trim()) return;
                      const newItem: TechnicalSkillItem = {
                        name: newSkillName.trim(),
                        category: newSkillCategory,
                        proficiency: newSkillProficiency,
                      };
                      setFormData({
                        ...formData,
                        technicalSkills: [...formData.technicalSkills, newItem],
                      });
                      setNewSkillName('');
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Skill
                  </Button>
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-2">
                {formData.technicalSkills.map((sk, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-200">{sk.name}</span>
                      <Badge variant="outline">{sk.category}</Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={sk.proficiency}
                        onChange={(e) => {
                          const level = e.target.value as ProficiencyLevel;
                          setFormData({
                            ...formData,
                            technicalSkills: formData.technicalSkills.map((s, i) =>
                              i === index ? { ...s, proficiency: level } : s
                            ),
                          });
                        }}
                        className="rounded bg-surface-950 border border-slate-800 text-brand-300 text-xs px-2 py-1"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            technicalSkills: formData.technicalSkills.filter((_, i) => i !== index),
                          });
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Preferences & Weekly Study Hours */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Career Preferences & Work Style</CardTitle>
              <CardDescription>Target compensation and work environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Minimum Base Target (USD / Year)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60000"
                    max="220000"
                    step="5000"
                    value={formData.careerPreferences.expectedSalaryMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        careerPreferences: {
                          ...formData.careerPreferences,
                          expectedSalaryMin: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-brand-500"
                  />
                  <span className="font-bold text-sm text-emerald-400 min-w-28 text-right">
                    ${formData.careerPreferences.expectedSalaryMin.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Work Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Remote', 'Hybrid', 'On-site', 'Flexible'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          careerPreferences: {
                            ...formData.careerPreferences,
                            workPreference: mode,
                          },
                        })
                      }
                      className={`p-3 rounded-lg border text-center text-xs font-medium transition-all ${
                        formData.careerPreferences.workPreference === mode
                          ? 'bg-brand-600/15 border-brand-500 text-brand-300'
                          : 'bg-surface-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle>Weekly Study Availability</CardTitle>
              <CardDescription>
                Allocates project tasks and roadmap pacing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Study Hours Allocated Per Week
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="5"
                    value={formData.weeklyAvailability.weeklyStudyHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyAvailability: {
                          ...formData.weeklyAvailability,
                          weeklyStudyHours: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-brand-500"
                  />
                  <span className="font-bold text-sm text-brand-400 min-w-28 text-right">
                    {formData.weeklyAvailability.weeklyStudyHours} hrs / wk
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Preferred Study Days
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ].map((day) => {
                    const isSelected = formData.weeklyAvailability.preferredDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            weeklyAvailability: {
                              ...formData.weeklyAvailability,
                              preferredDays: isSelected
                                ? formData.weeklyAvailability.preferredDays.filter((d) => d !== day)
                                : [...formData.weeklyAvailability.preferredDays, day],
                            },
                          });
                        }}
                        className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                            : 'bg-surface-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: Account & Integration */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>FastAPI Backend Integration Status</CardTitle>
              <CardDescription>
                Architectural status and environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-brand-400" />
                    <span className="font-bold text-slate-200">
                      {USE_MOCKS ? 'Isolated Mock API Adapter' : 'FastAPI Connected'}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Configured Base URL: <code className="text-brand-300">{API_BASE_URL}</code>
                  </p>
                </div>
                <Badge variant={USE_MOCKS ? 'warning' : 'success'} dot>
                  {USE_MOCKS ? 'Development Mode' : 'Production Live'}
                </Badge>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                <p>
                  To connect this frontend to your teammate&apos;s FastAPI backend:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                  <li>Set <code className="text-brand-300">VITE_USE_MOCKS=false</code> in your <code className="text-brand-300">.env</code> file.</li>
                  <li>Ensure the FastAPI backend is running on <code className="text-brand-300">http://localhost:8000/api/v1</code>.</li>
                  <li>All service functions and TypeScript models adhere directly to <code className="text-brand-300">API_CONTRACT.md</code>.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Email notifications and weekly summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { key: 'emailNotifications', label: 'Email Notifications for Roadmap Milestones' },
                { key: 'weeklyDigest', label: 'Weekly Study Schedule & Progress Digest' },
                { key: 'roadmapReminders', label: 'Daily Task Reminders' },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      (formData.accountSettings as unknown as Record<string, boolean>)[opt.key] ?? false
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountSettings: {
                          ...formData.accountSettings,
                          [opt.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-surface-900 text-brand-600 focus:ring-brand-500/30"
                  />
                  <span className="text-slate-300">{opt.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
