import { useState, useCallback, useEffect } from 'react';
import { ProgressStepStatus, ProgressUpdate, TerminalProgressController } from '../components/terminal/TerminalProgressTracker';

interface UseTerminalProgressOptions {
  title: string;
  steps: string[];
  autoStart?: boolean;
  onComplete?: () => void;
}

export function useTerminalProgress({
  title,
  steps,
  autoStart = false,
  onComplete
}: UseTerminalProgressOptions) {
  const [progressController, setProgressController] = useState<TerminalProgressController | null>(null);
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize the controller
  useEffect(() => {
    const controller = new TerminalProgressController(
      title,
      steps,
      (update) => {
        setProgressUpdate(update);
        if (update.isComplete && !isComplete) {
          setIsComplete(true);
          onComplete?.();
        }
      }
    );
    setProgressController(controller);

    if (autoStart && steps.length > 0) {
      setTimeout(() => {
        controller.start(0);
      }, 500);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const startStep = useCallback((stepIndex: number) => {
    progressController?.start(stepIndex);
  }, [progressController]);

  const completeStep = useCallback((stepIndex: number) => {
    progressController?.complete(stepIndex);
    
    // Auto-start next step if available
    if (stepIndex + 1 < steps.length) {
      setTimeout(() => {
        progressController?.start(stepIndex + 1);
      }, 500);
    }
  }, [progressController, steps.length]);

  const errorStep = useCallback((stepIndex: number) => {
    progressController?.error(stepIndex);
  }, [progressController]);

  const startNext = useCallback(() => {
    if (!progressUpdate) return;
    
    const currentStepIndex = progressUpdate.progressLines.findIndex(
      line => line.includes('🔄')
    );
    
    if (currentStepIndex !== -1) {
      completeStep(currentStepIndex);
    } else {
      const pendingStepIndex = progressUpdate.progressLines.findIndex(
        line => line.includes('⏳')
      );
      
      if (pendingStepIndex !== -1) {
        startStep(pendingStepIndex);
      }
    }
  }, [progressUpdate, startStep, completeStep]);

  return {
    progressLines: progressUpdate?.progressLines || [],
    isComplete,
    startStep,
    completeStep,
    errorStep,
    startNext
  };
} 