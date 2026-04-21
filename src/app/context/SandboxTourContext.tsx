import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ArrowRight, CheckCircle2, Map, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { sandboxExperienceConfig, isSandboxPersona, type SandboxTourStep } from '../config/sandboxExperience';
import { isSandboxEnvironment } from '../config/environment';
import {
  consumeSandboxTourLaunch,
  setSandboxTourProgress,
} from '../lib/sandboxTourSession';
import { useApp } from './AppContext';
import type { SandboxPersona } from '../lib/api';

interface SandboxTourContextValue {
  canOpenTour: boolean;
  openTour: () => void;
}

type ActiveTourState = {
  persona: SandboxPersona;
  stepIndex: number;
} | null;

const SandboxTourContext = createContext<SandboxTourContextValue | null>(null);

function useHighlightTarget(step: SandboxTourStep | null, enabled: boolean) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled || !step) return;

    let cleanupHighlight = () => {};
    let observer: MutationObserver | null = null;
    let intervalId: number | null = null;
    let attempts = 0;
    const maxAttempts = 20;
    const targetSelector = `[data-sandbox-tour-id="${step.targetId}"]`;

    const stopWatching = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      observer?.disconnect();
      observer = null;
    };

    const highlightTarget = () => {
      const element = document.querySelector<HTMLElement>(targetSelector);
      if (!element) {
        attempts += 1;
        if (attempts >= maxAttempts) {
          stopWatching();
        }
        return false;
      }

      stopWatching();
      if (typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }

      const previous = {
        position: element.style.position,
        zIndex: element.style.zIndex,
        boxShadow: element.style.boxShadow,
        borderRadius: element.style.borderRadius,
        transition: element.style.transition,
      };

      if (!element.style.position || element.style.position === 'static') {
        element.style.position = 'relative';
      }

      element.style.zIndex = '60';
      element.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.88), 0 22px 60px rgba(15, 23, 42, 0.18)';
      element.style.borderRadius = '24px';
      element.style.transition = 'box-shadow 160ms ease';

      cleanupHighlight = () => {
        element.style.position = previous.position;
        element.style.zIndex = previous.zIndex;
        element.style.boxShadow = previous.boxShadow;
        element.style.borderRadius = previous.borderRadius;
        element.style.transition = previous.transition;
      };

      return true;
    };

    if (!highlightTarget()) {
      intervalId = window.setInterval(() => {
        highlightTarget();
      }, 120);

      observer = new MutationObserver(() => {
        highlightTarget();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      stopWatching();
      cleanupHighlight();
    };
  }, [enabled, location.pathname, step]);
}

function SandboxTourOverlay({
  persona,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  onComplete,
}: {
  persona: SandboxPersona;
  step: SandboxTourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const isLastStep = stepIndex === totalSteps - 1;
  const personaTitle = sandboxExperienceConfig.personas[persona].title;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[1px]" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-md">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Tour guiado do ${personaTitle}`}
          className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                <Map className="h-3.5 w-3.5" />
                Passo {stepIndex + 1} de {totalSteps}
              </div>
              <h2 className="text-xl font-semibold text-slate-950">{step.title}</h2>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label="Fechar tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <div>
              <p className="mb-1 font-medium text-slate-950">O que fazer aqui</p>
              <p>{step.label}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-slate-950">Por que isso importa</p>
              <p>{step.why}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onSkip}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Pular tour
            </button>

            <button
              type="button"
              onClick={isLastStep ? onComplete : onNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Concluir tour
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Proximo passo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function SandboxTourProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRole, isAuthenticated } = useApp();
  const currentPersona = isSandboxPersona(currentRole) ? currentRole : null;
  const [activeTour, setActiveTour] = useState<ActiveTourState>(null);
  const canOpenTour = isSandboxEnvironment() && isAuthenticated && currentPersona !== null;

  const steps = useMemo(() => {
    if (!activeTour) return [];
    return sandboxExperienceConfig.tours[activeTour.persona];
  }, [activeTour]);

  const currentStep = activeTour ? steps[activeTour.stepIndex] ?? null : null;

  useEffect(() => {
    if (!canOpenTour || !currentPersona) {
      setActiveTour(null);
      return;
    }

    if (!consumeSandboxTourLaunch(currentPersona)) {
      return;
    }

    setActiveTour({
      persona: currentPersona,
      stepIndex: 0,
    });
  }, [canOpenTour, currentPersona]);

  useEffect(() => {
    if (!activeTour || !currentStep) return;
    if (location.pathname === currentStep.route) return;
    navigate(currentStep.route, { replace: true });
  }, [activeTour, currentStep, location.pathname, navigate]);

  useHighlightTarget(currentStep, Boolean(activeTour && currentStep));

  const closeTour = useCallback((progress: 'dismissed' | 'completed') => {
    if (activeTour) {
      setSandboxTourProgress(activeTour.persona, progress);
    }
    setActiveTour(null);
  }, [activeTour]);

  const openTour = useCallback(() => {
    if (!canOpenTour || !currentPersona) return;
    setActiveTour({
      persona: currentPersona,
      stepIndex: 0,
    });
  }, [canOpenTour, currentPersona]);

  const nextStep = () => {
    setActiveTour((current) => {
      if (!current) return current;
      const nextIndex = current.stepIndex + 1;
      const personaSteps = sandboxExperienceConfig.tours[current.persona];
      if (nextIndex >= personaSteps.length) {
        setSandboxTourProgress(current.persona, 'completed');
        return null;
      }

      return {
        ...current,
        stepIndex: nextIndex,
      };
    });
  };

  const value = useMemo<SandboxTourContextValue>(() => ({
    canOpenTour,
    openTour,
  }), [canOpenTour, openTour]);

  return (
    <SandboxTourContext.Provider value={value}>
      {children}
      {activeTour && currentStep && (
        <SandboxTourOverlay
          persona={activeTour.persona}
          step={currentStep}
          stepIndex={activeTour.stepIndex}
          totalSteps={steps.length}
          onNext={nextStep}
          onSkip={() => closeTour('dismissed')}
          onComplete={() => closeTour('completed')}
        />
      )}
    </SandboxTourContext.Provider>
  );
}

export function useSandboxTour() {
  const context = useContext(SandboxTourContext);
  if (!context) {
    throw new Error('useSandboxTour must be used within SandboxTourProvider');
  }
  return context;
}
