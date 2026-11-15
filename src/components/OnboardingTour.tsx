import React, { useState } from 'react';
import {
  Compass,
  Filter,
  Layers,
  Calendar,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../utils/i18n';

interface OnboardingTourProps {
  viewMode: 'landing' | 'dashboard';
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ viewMode }) => {
  const { hasCompletedTour, setHasCompletedTour, theme, language } = usePreferences();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const t = useTranslation(language);

  // Only show on dashboard and when not completed
  if (hasCompletedTour || viewMode !== 'dashboard') {
    return null;
  }

  const steps = [
    {
      step: 1,
      title: t.tourStep1Title,
      content: t.tourStep1Content,
      icon: Filter,
      positionClass: 'top-20 left-4 sm:left-76 md:left-84',
    },
    {
      step: 2,
      title: t.tourStep2Title,
      content: t.tourStep2Content,
      icon: Layers,
      positionClass: 'bottom-20 left-1/2 -translate-x-1/2',
    },
    {
      step: 3,
      title: t.tourStep3Title,
      content: t.tourStep3Content,
      icon: Calendar,
      positionClass: 'top-20 right-4 sm:right-88 md:right-96',
    },
  ];

  const current = steps[currentStep - 1];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasCompletedTour(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setHasCompletedTour(true);
  };

  return (
    <div className="fixed inset-0 z-[90] pointer-events-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative transition-all duration-300 animate-in zoom-in-95 ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
            : 'bg-[#090e1c]/95 border-cyan-500/40 text-slate-100 shadow-cyan-950/60'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Langkah {currentStep} dari {steps.length}
              </span>
            </span>
          </div>

          <button
            onClick={handleSkip}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
            }`}
            title={t.tourBtnSkip}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black shrink-0 shadow-lg shadow-cyan-500/20">
            <StepIcon className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold font-mono tracking-wide text-cyan-400">
              {current.title}
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {current.content}
            </p>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.step === currentStep
                  ? 'w-6 bg-cyan-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <button
            onClick={handleSkip}
            className={`text-xs font-mono font-medium hover:underline cursor-pointer ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {t.tourBtnSkip}
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.tourBtnPrev}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <span>{currentStep === steps.length ? t.tourBtnFinish : t.tourBtnNext}</span>
              {currentStep === steps.length ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
