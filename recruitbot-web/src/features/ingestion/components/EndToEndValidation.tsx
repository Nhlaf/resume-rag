/**
 * Phase 9: End-to-End Validation Component
 * Shows complete validation checklist after upload
 */

import React from 'react';
import { CheckCircle, XCircle, Loader2, Upload, FileSearch, Sparkles, Database, Search } from 'lucide-react';

interface ValidationStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  details?: string;
}

interface EndToEndValidationProps {
  steps: ValidationStep[];
  overallStatus: 'running' | 'success' | 'error';
}

export const EndToEndValidation: React.FC<EndToEndValidationProps> = ({
  steps,
  overallStatus,
}) => {
  const getStepIcon = (step: ValidationStep) => {
    const Icon = step.icon;

    if (step.status === 'running') {
      return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }

    if (step.status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }

    if (step.status === 'error') {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }

    return <Icon className="w-5 h-5 text-gray-500" />;
  };

  const getStepColor = (step: ValidationStep) => {
    switch (step.status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStepBgColor = (step: ValidationStep) => {
    switch (step.status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'running':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/5 border-gray-500/10';
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <CheckCircle className="w-6 h-6 text-indigo-400" />
        <div>
          <h3 className="text-base font-semibold text-gray-200">End-to-End Validation</h3>
          <p className="text-xs text-gray-400">Verifying complete ingestion pipeline</p>
        </div>
      </div>

      {/* Validation Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id}>
            <div
              className={`flex items-center justify-between p-4 rounded-lg border ${getStepBgColor(
                step
              )} transition-all duration-300`}
            >
              {/* Left: Icon + Label */}
              <div className="flex items-center gap-3">
                {getStepIcon(step)}
                <div>
                  <p className={`text-sm font-medium ${getStepColor(step)}`}>
                    {step.label}
                  </p>
                  {step.details && (
                    <p className="text-xs text-gray-500 mt-0.5">{step.details}</p>
                  )}
                </div>
              </div>

              {/* Right: Duration */}
              {step.duration !== undefined && step.status === 'success' && (
                <span className="text-xs text-gray-500">{step.duration}ms</span>
              )}

              {step.status === 'running' && (
                <span className="text-xs text-blue-400 animate-pulse">Running...</span>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex justify-start pl-6 py-1">
                <div className="w-0.5 h-4 bg-white/10"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div
        className={`mt-5 pt-4 border-t border-white/10 flex items-center gap-3 ${
          overallStatus === 'success'
            ? 'text-green-400'
            : overallStatus === 'error'
            ? 'text-red-400'
            : 'text-blue-400'
        }`}
      >
        {overallStatus === 'running' && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Validation in progress...</span>
          </>
        )}

        {overallStatus === 'success' && (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">All validation checks passed!</span>
          </>
        )}

        {overallStatus === 'error' && (
          <>
            <XCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Validation failed - see details above</span>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to manage validation steps
 */
export const useEndToEndValidation = () => {
  const [steps, setSteps] = React.useState<ValidationStep[]>([
    {
      id: 'upload',
      label: 'File Upload',
      icon: Upload,
      status: 'pending',
    },
    {
      id: 'extraction',
      label: 'PDF Text Extraction',
      icon: FileSearch,
      status: 'pending',
    },
    {
      id: 'parsing',
      label: 'Resume Parsing',
      icon: Sparkles,
      status: 'pending',
    },
    {
      id: 'embedding',
      label: 'Vector Embedding',
      icon: Sparkles,
      status: 'pending',
    },
    {
      id: 'storage',
      label: 'Database Storage',
      icon: Database,
      status: 'pending',
    },
    {
      id: 'searchability',
      label: 'Search Verification',
      icon: Search,
      status: 'pending',
    },
  ]);

  const updateStep = (
    stepId: string,
    status: 'pending' | 'running' | 'success' | 'error',
    duration?: number,
    details?: string
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, status, duration, details }
          : step
      )
    );
  };

  const resetSteps = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: 'pending' as const,
        duration: undefined,
        details: undefined,
      }))
    );
  };

  const getOverallStatus = (): 'running' | 'success' | 'error' => {
    if (steps.some((s) => s.status === 'error')) return 'error';
    if (steps.some((s) => s.status === 'running')) return 'running';
    if (steps.every((s) => s.status === 'success')) return 'success';
    return 'running';
  };

  return {
    steps,
    updateStep,
    resetSteps,
    overallStatus: getOverallStatus(),
  };
};
