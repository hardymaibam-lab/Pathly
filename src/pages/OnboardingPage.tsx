import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  OnboardingState,
  RIASECResponses,
  RIASECResponseValue,
  RIASECCategory,
} from '../types/assessment';
import { ProficiencyLevel, SkillCategory, TechnicalSkillItem } from '../types/skills';
import {
  COMMON_TECHNICAL_SKILLS,
  COMMON_SOFT_SKILLS,
  DEGREE_OPTIONS,
  LIKERT_OPTIONS,
  RIASEC_CATEGORIES,
} from '../lib/constants';
import { RIASEC_QUESTIONS } from '../mocks/riasecQuestions';
import { useAssessmentStatus, useSaveDraft, useSubmitAssessment } from '../hooks/useAssessment';
import { useAuth } from '../hooks/useAuth';

const INITIAL_STATE: OnboardingState = {
  currentStep: 1,
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  },
  academicBackground: {
    degree: 'Bachelor of Science (B.S.)',
    major: 'Computer Science',
    institution: '',
    graduationYear: 2026,
    gpa: '3.8',
    coursework: ['Data Structures & Algorithms', 'Operating Systems', 'Databases'],
  },
  technicalSkills: [
    { name: 'Python', category: 'Languages', proficiency: 'Advanced' },
    { name: 'TypeScript', category: 'Languages', proficiency: 'Intermediate' },
    { name: 'React', category: 'Frameworks', proficiency: 'Intermediate' },
  ],
  softSkills: ['Critical Problem Solving', 'System Architecture Thinking', 'Technical Writing & Docs'],
  riasecResponses: {},
  careerPreferences: {
    targetRoles: ['Machine Learning Engineer', 'Full-Stack SaaS Engineer'],
    targetIndustries: ['AI Software', 'Cloud Infrastructure'],
    workPreference: 'Hybrid',
    expectedSalaryMin: 120000,
    preferredCompanySizes: ['Growth Startup (50-200)', 'Mid-Market (200-1000)'],
  },
  weeklyAvailability: {
    weeklyStudyHours: 15,
    preferredDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    targetTimelineMonths: 6,
  },
};

const STEPS = [
  { step: 1, title: 'Personal Information', short: 'Personal' },
  { step: 2, title: 'Academic Background', short: 'Academic' },
  { step: 3, title: 'Technical Skills', short: 'Tech Skills' },
  { step: 4, title: 'Soft Skills', short: 'Soft Skills' },
  { step: 5, title: 'RIASEC Assessment (36 Qs)', short: 'RIASEC' },
  { step: 6, title: 'Career Preferences', short: 'Preferences' },
  { step: 7, title: 'Weekly Availability', short: 'Availability' },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: statusData } = useAssessmentStatus();
  const saveDraftMutation = useSaveDraft();
  const submitAssessmentMutation = useSubmitAssessment();

  const [state, setState] = useState<OnboardingState>(() => {
    return {
      ...INITIAL_STATE,
      personalInfo: {
        ...INITIAL_STATE.personalInfo,
        fullName: user?.fullName || 'Alex Chen',
        email: user?.email || 'alex.chen@pathly.ai',
      },
    };
  });

  const [stepError, setStepError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  // RIASEC active category filter tab in Step 5
  const [riasecCategoryTab, setRiasecCategoryTab] = useState<RIASECCategory>('Realistic');

  // Input states for chips
  const [courseInput, setCourseInput] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>('Intermediate');
  const [newSoftSkillInput, setNewSoftSkillInput] = useState('');
  const [targetRoleInput, setTargetRoleInput] = useState('');

  // Hydrate saved draft from status if available
  useEffect(() => {
    if (statusData?.savedState) {
      setState((prev) => ({
        ...prev,
        ...statusData.savedState,
        currentStep: statusData.savedState?.currentStep || prev.currentStep,
      }));
    }
  }, [statusData]);

  // Handle Save Draft
  const handleSaveDraft = async () => {
    try {
      const res = await saveDraftMutation.mutateAsync({
        step: state.currentStep,
        data: state,
      });
      setSaveToast(`Draft successfully saved at ${res.savedAt}`);
      setTimeout(() => setSaveToast(null), 3500);
    } catch {
      setSaveToast('Failed to save draft. Local backup maintained.');
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setStepError(null);

    if (state.currentStep === 1) {
      if (!state.personalInfo.fullName.trim()) {
        setStepError('Please enter your full name.');
        return false;
      }
      if (!state.personalInfo.email.trim() || !state.personalInfo.email.includes('@')) {
        setStepError('Please enter a valid email address.');
        return false;
      }
    }

    if (state.currentStep === 2) {
      if (!state.academicBackground.degree.trim()) {
        setStepError('Please select or specify your degree program.');
        return false;
      }
      if (!state.academicBackground.institution.trim()) {
        setStepError('Please provide your university or college institution.');
        return false;
      }
    }

    if (state.currentStep === 3) {
      if (state.technicalSkills.length === 0) {
        setStepError('Please add at least one technical skill to calibrate recommendations.');
        return false;
      }
    }

    if (state.currentStep === 4) {
      if (state.softSkills.length === 0) {
        setStepError('Please select at least two soft skills.');
        return false;
      }
    }

    if (state.currentStep === 5) {
      const answeredCount = Object.keys(state.riasecResponses).length;
      if (answeredCount < 36) {
        // Find which categories are incomplete
        const missingCategories = (
          ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'] as RIASECCategory[]
        ).filter((cat) => {
          const catQuestions = RIASEC_QUESTIONS.filter((q) => q.category === cat);
          return !catQuestions.every((q) => state.riasecResponses[q.id]);
        });

        setStepError(
          `Please answer all 36 RIASEC questions (${answeredCount}/36 complete). Incomplete categories: ${missingCategories.join(', ')}.`
        );
        return false;
      }
    }

    if (state.currentStep === 6) {
      if (state.careerPreferences.targetRoles.length === 0) {
        setStepError('Please specify at least one target role or direction.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (state.currentStep < 7) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStepError(null);
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateCurrentStep()) return;
    try {
      await submitAssessmentMutation.mutateAsync(state);
      setIsCompletedSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      setStepError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    }
  };

  // Helper to fill all 36 RIASEC questions with high realistic sample values for fast tester evaluation
  const handleAutoFillRIASEC = () => {
    const responses: RIASECResponses = {};
    RIASEC_QUESTIONS.forEach((q) => {
      // realistic engineering student bias
      if (q.category === 'Investigative') responses[q.id] = (Math.random() > 0.2 ? 5 : 4) as RIASECResponseValue;
      else if (q.category === 'Conventional') responses[q.id] = (Math.random() > 0.3 ? 4 : 5) as RIASECResponseValue;
      else if (q.category === 'Realistic') responses[q.id] = (Math.random() > 0.4 ? 4 : 3) as RIASECResponseValue;
      else responses[q.id] = (Math.floor(Math.random() * 3) + 2) as RIASECResponseValue;
    });
    setState((prev) => ({ ...prev, riasecResponses: responses }));
    setStepError(null);
  };

  if (isCompletedSuccess) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <Card variant="glow" className="max-w-lg w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-glow">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
            <p className="text-sm text-slate-300">
              Synthesizing 36 RIASEC responses, academic coursework, and skill proficiencies against live market data...
            </p>
          </div>
          <ProgressBar value={100} color="emerald" className="pt-2" />
          <p className="text-xs text-slate-400">Redirecting to your student dashboard...</p>
        </Card>
      </div>
    );
  }

  const answeredRIASECCount = Object.keys(state.riasecResponses).length;
  const progressPercent = Math.round(((state.currentStep - 1) / 7) * 100);

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-surface-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white">Student Onboarding & RIASEC</h1>
            <p className="text-[11px] text-slate-400">
              Step {state.currentStep} of 7: {STEPS[state.currentStep - 1].title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveToast && (
            <span className="hidden sm:inline-block text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 animate-in fade-in">
              {saveToast}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={saveDraftMutation.isPending}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Exit to Dashboard
          </Button>
        </div>
      </header>

      {/* Progress Bar & Stepper */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-6">
          <ProgressBar value={progressPercent} color="gradient" size="sm" />
          <div className="hidden md:flex justify-between mt-3 text-[11px] font-medium text-slate-400">
            {STEPS.map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < state.currentStep) {
                    setState((prev) => ({ ...prev, currentStep: s.step }));
                  }
                }}
                disabled={s.step > state.currentStep}
                className={`transition-colors ${
                  s.step === state.currentStep
                    ? 'text-brand-400 font-bold'
                    : s.step < state.currentStep
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {s.step}. {s.short}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {stepError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="flex-1 leading-relaxed">{stepError}</span>
          </div>
        )}

        {/* Step Forms */}
        <Card variant="default" className="border-slate-800 p-6 sm:p-8 shadow-xl">
          {/* STEP 1: Personal Information */}
          {state.currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">1. Personal Information</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tell us who you are so we can personalize your career trajectory and profile dossier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={state.personalInfo.fullName}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                    }))
                  }
                  placeholder="Alex Chen"
                />

                <Input
                  label="Email Address *"
                  type="email"
                  value={state.personalInfo.email}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value },
                    }))
                  }
                  placeholder="alex.chen@pathly.ai"
                />

                <Input
                  label="Phone Number (Optional)"
                  value={state.personalInfo.phone || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value },
                    }))
                  }
                  placeholder="+1 (415) 890-4321"
                />

                <Input
                  label="Current Location"
                  value={state.personalInfo.location || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value },
                    }))
                  }
                  placeholder="San Francisco, CA or Remote"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Professional Bio / Student Headline
                </label>
                <textarea
                  rows={3}
                  value={state.personalInfo.bio || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, bio: e.target.value },
                    }))
                  }
                  placeholder="CS junior passionate about distributed systems, deep learning inference, and high-performance developer tools."
                  className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm p-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Academic Background */}
          {state.currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">2. Academic Background</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your degree program and coursework determine academic relevance scoring for technical roles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Degree Level *
                  </label>
                  <select
                    value={state.academicBackground.degree}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        academicBackground: { ...prev.academicBackground, degree: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  >
                    {DEGREE_OPTIONS.map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Major / Specialization *"
                  value={state.academicBackground.major}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      academicBackground: { ...prev.academicBackground, major: e.target.value },
                    }))
                  }
                  placeholder="Computer Science, Software Engineering, etc."
                />

                <Input
                  label="Institution / University *"
                  value={state.academicBackground.institution}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      academicBackground: { ...prev.academicBackground, institution: e.target.value },
                    }))
                  }
                  placeholder="University of California, Berkeley"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Graduation Year"
                    type="number"
                    value={state.academicBackground.graduationYear}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        academicBackground: {
                          ...prev.academicBackground,
                          graduationYear: parseInt(e.target.value) || 2026,
                        },
                      }))
                    }
                  />

                  <Input
                    label="GPA (Optional)"
                    value={state.academicBackground.gpa || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        academicBackground: { ...prev.academicBackground, gpa: e.target.value },
                      }))
                    }
                    placeholder="3.85 / 4.0"
                  />
                </div>
              </div>

              {/* Coursework Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Key Coursework Completed
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    placeholder="e.g. Distributed Systems, Neural Networks, Compilers"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (courseInput.trim()) {
                          setState((prev) => ({
                            ...prev,
                            academicBackground: {
                              ...prev.academicBackground,
                              coursework: [...prev.academicBackground.coursework, courseInput.trim()],
                            },
                          }));
                          setCourseInput('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (courseInput.trim()) {
                        setState((prev) => ({
                          ...prev,
                          academicBackground: {
                            ...prev.academicBackground,
                            coursework: [...prev.academicBackground.coursework, courseInput.trim()],
                          },
                        }));
                        setCourseInput('');
                      }
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {state.academicBackground.coursework.map((course, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-900 border border-slate-800 text-xs text-slate-300"
                    >
                      {course}
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            academicBackground: {
                              ...prev.academicBackground,
                              coursework: prev.academicBackground.coursework.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Technical Skills */}
          {state.currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">3. Technical Skills</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Add your core programming languages, frameworks, databases, and infra tools along with your self-assessed proficiency.
                </p>
              </div>

              {/* Add Skill Form */}
              <div className="p-4 rounded-xl bg-surface-900/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                  Add a Skill
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Skill name (e.g. PyTorch, Go, Docker)"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                    />
                  </div>
                  <div>
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                      className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-brand-500"
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
                      className="w-full rounded-lg bg-surface-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-brand-500"
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
                      const skillItem: TechnicalSkillItem = {
                        name: newSkillName.trim(),
                        category: newSkillCategory,
                        proficiency: newSkillProficiency,
                      };
                      setState((prev) => ({
                        ...prev,
                        technicalSkills: [...prev.technicalSkills, skillItem],
                      }));
                      setNewSkillName('');
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Skill
                  </Button>
                </div>
              </div>

              {/* Quick Add Suggestions */}
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  Popular tech skills (click to add):
                </span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TECHNICAL_SKILLS.map((sk) => {
                    const alreadyAdded = state.technicalSkills.some(
                      (s) => s.name.toLowerCase() === sk.name.toLowerCase()
                    );
                    return (
                      <button
                        key={sk.name}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => {
                          setState((prev) => ({
                            ...prev,
                            technicalSkills: [
                              ...prev.technicalSkills,
                              { name: sk.name, category: sk.category as SkillCategory, proficiency: 'Intermediate' },
                            ],
                          }));
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          alreadyAdded
                            ? 'bg-surface-900 text-slate-600 border-slate-800/50 cursor-not-allowed'
                            : 'bg-surface-900 text-slate-300 border-slate-800 hover:border-brand-500/50 hover:text-white'
                        }`}
                      >
                        + {sk.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Skills Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Configured Skills ({state.technicalSkills.length})
                </h4>
                <div className="space-y-2">
                  {state.technicalSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-surface-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-200">{skill.name}</span>
                        <Badge variant="outline">{skill.category}</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={skill.proficiency}
                          onChange={(e) => {
                            const newLevel = e.target.value as ProficiencyLevel;
                            setState((prev) => ({
                              ...prev,
                              technicalSkills: prev.technicalSkills.map((s, i) =>
                                i === index ? { ...s, proficiency: newLevel } : s
                              ),
                            }));
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
                            setState((prev) => ({
                              ...prev,
                              technicalSkills: prev.technicalSkills.filter((_, i) => i !== index),
                            }));
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Soft Skills */}
          {state.currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">4. Soft Skills & Work Style</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Technical leadership, mentorship, and communication traits play an integral role in career compatibility.
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">
                  Select your strongest behavioral strengths:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMMON_SOFT_SKILLS.map((skill) => {
                    const isSelected = state.softSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setState((prev) => ({
                            ...prev,
                            softSkills: isSelected
                              ? prev.softSkills.filter((s) => s !== skill)
                              : [...prev.softSkills, skill],
                          }));
                        }}
                        className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-brand-600/15 border-brand-500 text-brand-200'
                            : 'bg-surface-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{skill}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Soft Skill Addition */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Add Custom Trait
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Incident Post-Mortem Facilitation"
                    value={newSoftSkillInput}
                    onChange={(e) => setNewSoftSkillInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (newSoftSkillInput.trim()) {
                        setState((prev) => ({
                          ...prev,
                          softSkills: [...prev.softSkills, newSoftSkillInput.trim()],
                        }));
                        setNewSoftSkillInput('');
                      }
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: RIASEC Interest Assessment (36 questions!) */}
          {state.currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">5. RIASEC Interest Assessment</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold">
                      36 Questions Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Holland&apos;s 6 vocational dimensions: Realistic, Investigative, Artistic, Social, Enterprising, Conventional.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFillRIASEC}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
                    title="Quickly fill sample responses for test evaluation"
                  >
                    Auto-Fill Responses
                  </Button>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="p-3.5 rounded-xl bg-surface-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Total Questions Answered:{' '}
                  <strong className="text-brand-400">{answeredRIASECCount} / 36</strong>
                </span>
                <span className="text-slate-400">
                  {answeredRIASECCount === 36 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All 36 Complete
                    </span>
                  ) : (
                    `${36 - answeredRIASECCount} remaining`
                  )}
                </span>
              </div>

              {/* Dimension Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                {(
                  [
                    'Realistic',
                    'Investigative',
                    'Artistic',
                    'Social',
                    'Enterprising',
                    'Conventional',
                  ] as RIASECCategory[]
                ).map((category) => {
                  const meta = RIASEC_CATEGORIES[category];
                  const questionsInCat = RIASEC_QUESTIONS.filter((q) => q.category === category);
                  const answeredInCat = questionsInCat.filter((q) => state.riasecResponses[q.id]).length;
                  const isCatDone = answeredInCat === 6;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setRiasecCategoryTab(category)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-2 transition-all ${
                        riasecCategoryTab === category
                          ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                          : 'bg-surface-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>
                        {meta.code} - {category}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded ${
                          isCatDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-surface-950 text-slate-500'
                        }`}
                      >
                        {answeredInCat}/6
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Dimension Header */}
              <div className="p-4 rounded-xl bg-surface-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: RIASEC_CATEGORIES[riasecCategoryTab].color }}
                  />
                  <h4 className="text-sm font-bold text-white">
                    {riasecCategoryTab} Dimension ({RIASEC_CATEGORIES[riasecCategoryTab].tagline})
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {RIASEC_CATEGORIES[riasecCategoryTab].description}
                </p>
              </div>

              {/* Questions for the selected dimension */}
              <div className="space-y-4">
                {RIASEC_QUESTIONS.filter((q) => q.category === riasecCategoryTab).map((q, idx) => {
                  const currentValue = state.riasecResponses[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-surface-900 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                            Question {q.id.toUpperCase()} ({idx + 1} of 6)
                          </span>
                          <p className="text-sm text-slate-100 font-medium leading-relaxed">
                            {q.text}
                          </p>
                          {q.contextHint && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-slate-500" />
                              {q.contextHint}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 5-Point Likert Scale Buttons */}
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {LIKERT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setState((prev) => ({
                                ...prev,
                                riasecResponses: {
                                  ...prev.riasecResponses,
                                  [q.id]: opt.value as RIASECResponseValue,
                                },
                              }));
                            }}
                            className={`p-2 rounded-lg text-center text-xs font-medium border transition-all ${
                              currentValue === opt.value
                                ? 'bg-brand-600 text-white border-brand-500 shadow-glow-sm'
                                : 'bg-surface-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span className="block text-sm font-bold">{opt.value}</span>
                            <span className="hidden sm:block text-[9px] truncate">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Career Preferences */}
          {state.currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">6. Career Preferences</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify your ideal roles, target industries, and work environment expectations.
                </p>
              </div>

              {/* Target Roles */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Roles / Aspiring Titles *
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g. Machine Learning Engineer, Cloud Solutions Architect"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (targetRoleInput.trim()) {
                        setState((prev) => ({
                          ...prev,
                          careerPreferences: {
                            ...prev.careerPreferences,
                            targetRoles: [...prev.careerPreferences.targetRoles, targetRoleInput.trim()],
                          },
                        }));
                        setTargetRoleInput('');
                      }
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {state.careerPreferences.targetRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-900 border border-slate-800 text-xs text-slate-300"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            careerPreferences: {
                              ...prev.careerPreferences,
                              targetRoles: prev.careerPreferences.targetRoles.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Preference */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Work Style Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['Remote', 'Hybrid', 'On-site', 'Flexible'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          careerPreferences: {
                            ...prev.careerPreferences,
                            workPreference: mode,
                          },
                        }))
                      }
                      className={`p-3 rounded-lg border text-center text-xs font-medium transition-all ${
                        state.careerPreferences.workPreference === mode
                          ? 'bg-brand-600/15 border-brand-500 text-brand-300'
                          : 'bg-surface-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Minimum Salary */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Minimum Base Compensation Target (USD / Year)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60000"
                    max="220000"
                    step="5000"
                    value={state.careerPreferences.expectedSalaryMin}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        careerPreferences: {
                          ...prev.careerPreferences,
                          expectedSalaryMin: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-brand-500"
                  />
                  <span className="font-bold text-sm text-emerald-400 min-w-28 text-right">
                    ${state.careerPreferences.expectedSalaryMin.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Weekly Learning Availability */}
          {state.currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">7. Weekly Learning Availability</h2>
                <p className="text-xs text-slate-400 mt-1">
                  We schedule your personalized roadmap modules and project tasks based on your genuine study hours.
                </p>
              </div>

              {/* Weekly Hours Slider */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Weekly Study Hours Dedicated to Upskilling
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="5"
                    value={state.weeklyAvailability.weeklyStudyHours}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        weeklyAvailability: {
                          ...prev.weeklyAvailability,
                          weeklyStudyHours: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-brand-500"
                  />
                  <span className="font-bold text-base text-brand-400 min-w-28 text-right">
                    {state.weeklyAvailability.weeklyStudyHours} hrs / wk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recommended for students: 10 to 15 hours per week alongside coursework.
                </p>
              </div>

              {/* Preferred Study Days */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Preferred Days for Hands-on Coding & Projects
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
                    const isSelected = state.weeklyAvailability.preferredDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setState((prev) => ({
                            ...prev,
                            weeklyAvailability: {
                              ...prev.weeklyAvailability,
                              preferredDays: isSelected
                                ? prev.weeklyAvailability.preferredDays.filter((d) => d !== day)
                                : [...prev.weeklyAvailability.preferredDays, day],
                            },
                          }));
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

              {/* Target Timeline */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Readiness Timeline
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 6, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          weeklyAvailability: {
                            ...prev.weeklyAvailability,
                            targetTimelineMonths: months,
                          },
                        }))
                      }
                      className={`p-3 rounded-lg border text-center text-xs font-medium transition-all ${
                        state.weeklyAvailability.targetTimelineMonths === months
                          ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                          : 'bg-surface-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <strong className="block text-sm font-bold">{months} Months</strong>
                      <span className="text-[10px] text-slate-500">
                        {months === 3 ? 'Sprint' : months === 6 ? 'Balanced' : 'Comprehensive'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
            {state.currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handlePrev}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            {state.currentStep < 7 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinalSubmit}
                isLoading={submitAssessmentMutation.isPending}
                rightIcon={<Sparkles className="w-4 h-4" />}
                className="shadow-glow"
              >
                Generate Career Roadmap
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
