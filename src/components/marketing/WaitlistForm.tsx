'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/legacy-client';

type FormStep = 'email' | 'name' | 'age' | 'team' | 'league' | 'submitting' | 'success';

interface FormData {
  email: string;
  full_name: string;
  age: string;
  team: string;
  league: string;
  source: string;
}

const STEPS: { key: FormStep; label: string; placeholder: string; type: string; required: boolean }[] = [
  { key: 'email', label: "What's your email?", placeholder: 'you@example.com', type: 'email', required: true },
  { key: 'name', label: "What's your name?", placeholder: 'Your full name', type: 'text', required: true },
  { key: 'age', label: 'How old are you?', placeholder: '16', type: 'number', required: false },
  { key: 'team', label: "What team do you play for?", placeholder: 'Team name', type: 'text', required: false },
  { key: 'league', label: 'What league are you in?', placeholder: 'USHL, OHL, NCAA...', type: 'text', required: false },
];

export default function WaitlistForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    age: '',
    team: '',
    league: '',
    source: 'direct',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Capture source from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData(prev => ({ ...prev, source: params.get('source') || 'direct' }));
  }, []);

  // Auto-focus input on step change
  useEffect(() => {
    if (inputRef.current && !isSuccess) {
      inputRef.current.focus();
    }
  }, [currentStep, isSuccess]);

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Get the current field value
  const getCurrentValue = () => {
    switch (currentStepData?.key) {
      case 'email': return formData.email;
      case 'name': return formData.full_name;
      case 'age': return formData.age;
      case 'team': return formData.team;
      case 'league': return formData.league;
      default: return '';
    }
  };

  // Update current field value
  const updateCurrentValue = (value: string) => {
    switch (currentStepData?.key) {
      case 'email': setFormData(prev => ({ ...prev, email: value })); break;
      case 'name': setFormData(prev => ({ ...prev, full_name: value })); break;
      case 'age': setFormData(prev => ({ ...prev, age: value })); break;
      case 'team': setFormData(prev => ({ ...prev, team: value })); break;
      case 'league': setFormData(prev => ({ ...prev, league: value })); break;
    }
  };

  // Handle next step or submit
  async function handleNext() {
    setError(null);

    // Validate required fields
    if (currentStepData?.required && !getCurrentValue().trim()) {
      setError('This field is required');
      return;
    }

    // If last step, submit to Supabase
    if (currentStep === STEPS.length - 1) {
      await handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }

  // Handle form submission
  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('waitlist')
        .insert([{
          email: formData.email,
          full_name: formData.full_name || null,
          age: formData.age ? parseInt(formData.age) : null,
          team: formData.team || null,
          league: formData.league || null,
          source: formData.source,
        }]);

      if (supabaseError) {
        if (supabaseError.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          console.error('Supabase error:', supabaseError);
          setError('Something went wrong. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  }

  // Handle Enter key
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  }

  // Handle back
  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto animate-scale-in">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-ice-600 to-ice-800 flex items-center justify-center animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold mb-3">You&apos;re on the list! 🏒</h3>
          <p className="text-hky-muted mb-6 text-lg">
            Thanks {formData.full_name ? formData.full_name.split(' ')[0] : ''}! We&apos;ll email you when hky.bio launches.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hky-surface border border-white/10 text-sm text-hky-muted">
            <span className="w-2 h-2 rounded-full bg-ice-600 animate-pulse"></span>
            Position #{Math.floor(Math.random() * 50) + 480} in line
          </div>
        </div>
      </div>
    );
  }

  // Submitting state
  if (isSubmitting) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-ice-700/30 border-t-ice-700 animate-spin"></div>
        <p className="text-xl text-hky-muted">Saving your spot...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-1 bg-hky-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ice-600 to-ice-800 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-hky-dim mt-2 text-right">
          {currentStep + 1} of {STEPS.length}
        </p>
      </div>

      {/* Question */}
      <div className="animate-fade-up" key={currentStep}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
          {currentStepData?.label}
        </h2>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type={currentStepData?.type || 'text'}
            value={getCurrentValue()}
            onChange={(e) => updateCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentStepData?.placeholder}
            className="w-full text-center text-xl sm:text-2xl py-4 px-6 bg-transparent border-b-2 border-hky-surface focus:border-ice-600 outline-none transition-colors placeholder:text-hky-dim"
            autoFocus
          />

          {error && (
            <p className="text-center text-sm text-red-400 animate-fade-up">
              {error}
            </p>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 rounded-xl border border-white/10 text-hky-muted hover:bg-hky-surface transition-colors font-medium"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 btn-primary text-lg py-4"
            >
              {currentStep === STEPS.length - 1 ? 'Join Waitlist →' : 'Continue →'}
            </button>
          </div>

          {/* Skip hint for optional fields */}
          {!currentStepData?.required && (
            <p className="text-center text-xs text-hky-dim">
              Press Enter to skip
            </p>
          )}
        </div>
      </div>
    </div>
  );
}