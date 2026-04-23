import { Link } from 'react-router';
import { Compass, RotateCcw } from 'lucide-react';
import { sandboxExperienceConfig } from '../../config/sandboxExperience';
import { isSandboxEnvironment } from '../../config/environment';
import { useApp } from '../../context/AppContext';
import { useSandboxTour } from '../../context/SandboxTourContext';

export function SandboxEnvironmentBanner() {
  const { currentRole, isAuthenticated } = useApp();
  const { canOpenTour, openTour } = useSandboxTour();

  if (!isSandboxEnvironment()) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              {sandboxExperienceConfig.banner.badge}
            </p>
            <p className="text-sm text-amber-950">
              {sandboxExperienceConfig.banner.title} {sandboxExperienceConfig.banner.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {isAuthenticated && (
            <span className="whitespace-nowrap rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800">
              {sandboxExperienceConfig.banner.roleLabels[currentRole] ?? 'Experiência ativa'}
            </span>
          )}
          {canOpenTour && (
            <button
              type="button"
              onClick={openTour}
              className="inline-flex items-center justify-center gap-2 text-center sm:whitespace-nowrap rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
            >
              {sandboxExperienceConfig.banner.tourCta}
            </button>
          )}
          <Link
            to="/sandbox"
            className="inline-flex items-center justify-center gap-2 text-center sm:whitespace-nowrap rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {sandboxExperienceConfig.banner.restartCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
