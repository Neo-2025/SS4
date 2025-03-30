import React, { useEffect, useState } from 'react';

export type ProgressStepStatus = 'pending' | 'loading' | 'complete' | 'error';

export interface ProgressStep {
  name: string;
  status: ProgressStepStatus;
}

export interface ProgressUpdate {
  title: string;
  progressLines: string[];
  isComplete: boolean;
}

interface TerminalProgressTrackerProps {
  title: string;
  steps: string[];
  onUpdate?: (update: ProgressUpdate) => void;
  autoStart?: boolean;
}

export const TerminalProgressTracker: React.FC<TerminalProgressTrackerProps> = ({
  title,
  steps,
  onUpdate,
  autoStart = false,
}) => {
  const [trackingSteps, setTrackingSteps] = useState<ProgressStep[]>(
    steps.map(name => ({ name, status: 'pending' }))
  );
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (autoStart && trackingSteps.length > 0) {
      startStep(0);
    }
  }, []);

  const startStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < trackingSteps.length) {
      updateStep(stepIndex, 'loading');
    }
  };

  const completeStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < trackingSteps.length) {
      updateStep(stepIndex, 'complete');
      
      // Auto-start next step if available
      if (stepIndex + 1 < trackingSteps.length) {
        setTimeout(() => {
          startStep(stepIndex + 1);
        }, 500);
      }
    }
  };

  const errorStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < trackingSteps.length) {
      updateStep(stepIndex, 'error');
    }
  };

  const updateStep = (stepIndex: number, status: ProgressStepStatus) => {
    if (stepIndex >= 0 && stepIndex < trackingSteps.length) {
      const updatedSteps = [...trackingSteps];
      updatedSteps[stepIndex].status = status;
      setTrackingSteps(updatedSteps);
      emitUpdate(updatedSteps);
    }
  };

  const emitUpdate = (steps: ProgressStep[]) => {
    const progressLines = steps.map(step => {
      const icon = getStatusIcon(step.status);
      const progressBar = step.status === 'loading' ? '[▓▓▓▓▓▓▓▓▓▓]' : 
                         step.status === 'complete' ? '[▓▓▓▓▓▓▓▓▓▓] 100%' : '..........';
      
      const line = `HealthBench: ${step.name}... ${icon} ${step.status === 'loading' ? progressBar : ''}`;
      return line;
    });

    setOutput(progressLines);
    
    if (onUpdate) {
      onUpdate({
        title,
        progressLines,
        isComplete: steps.every(step => step.status === 'complete' || step.status === 'error')
      });
    }
  };

  const getStatusIcon = (status: ProgressStepStatus): string => {
    switch(status) {
      case 'pending': return '⏳';
      case 'loading': return '🔄';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '';
    }
  };

  return (
    <div className="terminal-progress-tracker">
      <div className="terminal-title">{title}</div>
      <div className="terminal-output">
        {output.map((line, index) => (
          <div key={index} className="terminal-line">{line}</div>
        ))}
      </div>
    </div>
  );
};

// Exported controller for external manipulation
export class TerminalProgressController {
  private steps: ProgressStep[];
  private callback: (update: ProgressUpdate) => void;
  private title: string;

  constructor(
    title: string,
    steps: string[],
    callback: (update: ProgressUpdate) => void
  ) {
    this.title = title;
    this.steps = steps.map(name => ({ name, status: 'pending' }));
    this.callback = callback;
  }

  start(stepIndex: number): void {
    this.updateStep(stepIndex, 'loading');
  }

  complete(stepIndex: number): void {
    this.updateStep(stepIndex, 'complete');
  }

  error(stepIndex: number): void {
    this.updateStep(stepIndex, 'error');
  }

  private updateStep(stepIndex: number, status: ProgressStepStatus): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.steps[stepIndex].status = status;
      this.emitUpdate();
    }
  }

  private emitUpdate(): void {
    const progressLines = this.steps.map(step => {
      const icon = this.getStatusIcon(step.status);
      const progressBar = step.status === 'loading' ? '[▓▓▓▓▓▓▓▓▓▓]' : 
                         step.status === 'complete' ? '[▓▓▓▓▓▓▓▓▓▓] 100%' : '..........';
      return `HealthBench: ${step.name}... ${icon} ${step.status === 'loading' ? progressBar : ''}`;
    });
    
    this.callback({
      title: this.title,
      progressLines,
      isComplete: this.steps.every(step => step.status === 'complete' || step.status === 'error')
    });
  }

  private getStatusIcon(status: ProgressStepStatus): string {
    switch(status) {
      case 'pending': return '⏳';
      case 'loading': return '🔄';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '';
    }
  }
} 