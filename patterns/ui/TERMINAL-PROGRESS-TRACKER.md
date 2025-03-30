---
status: Candidate
classification: ui
---

# TERMINAL-PROGRESS-TRACKER

## Status

**Current Status**: Candidate
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 2
- Projects: 1
- Related Patterns: 3

## Classification

UI Pattern

## Problem

In CLI-first and terminal-styled interfaces, users need clear visual feedback during multi-step processes that may take significant time to complete. Traditional progress indicators like spinners or progress bars don't translate well to text-based interfaces, and users need contextual information about which steps are pending, in progress, or completed.

## Solution

The Terminal Progress Tracker pattern provides a structured, text-based approach to visualize progress through a multi-step process, with clear status indicators for each step. It uses ASCII/Unicode characters to create a terminal-like experience with support for different states (pending, loading, complete, error) and automatic step progression.

### Core Components

1. **Progress Step Management**: Tracks the status of each step in a process
2. **Status Visualization**: Displays the current state using iconic symbols and progress bars
3. **Step Transition Management**: Handles transitions between different states
4. **Terminal-Style Formatting**: Uses monospace fonts and ASCII/Unicode characters

### Key Features

1. Status icons for clear visual differentiation:
   - Pending: ⏳
   - Loading: 🔄
   - Complete: ✅
   - Error: ❌

2. ASCII progress bars for active steps:
   - Loading: `[▓▓▓▓▓▓▓▓▓▓]`
   - Complete: `[▓▓▓▓▓▓▓▓▓▓] 100%`
   - Pending: `..........`

3. Step progression:
   - Automatic: Steps can automatically progress when the previous completes
   - Manual: Steps can be explicitly started, completed, or marked as errored
   - Error handling: Process can continue or stop on errors

## Implementation Example

### TerminalProgressTracker Component

```tsx
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
      
      return `HealthBench: ${step.name}... ${icon} ${step.status === 'loading' ? progressBar : ''}`;
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
```

### Hook-Based Implementation

```tsx
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
  }, [progressController]);

  return {
    progressLines: progressUpdate?.progressLines || [],
    isComplete,
    startStep,
    completeStep
  };
}
```

## Benefits

1. **Enhanced User Experience**: Users can clearly see progress and current status
2. **Contextual Feedback**: Each step shows relevant information about what's happening
3. **Clear Error Indication**: Errors are clearly marked and distinguished from in-progress steps
4. **Visual Consistency**: Terminal-style presentation maintains UI consistency
5. **Low-Visual Overhead**: Works well in CLI and text-based environments
6. **Step Tracking**: Easy to see which steps are done, in progress, or pending

## Limitations

1. **Text-Only**: Limited to text and Unicode characters, no graphical elements
2. **Fixed Width Challenges**: Wrapping on small screens or terminals can break formatting
3. **Limited Animation**: Progress indication is simple compared to graphical interfaces
4. **Character Rendering**: Some Unicode characters may not render consistently across all environments

## Related Patterns

- **CLI-COMMAND-PATTERN**: Often integrated with Terminal Progress Tracker for command execution feedback
- **AGENCY-IMPORT-WORKFLOW**: Uses Terminal Progress Tracker for multi-step agency import
- **TEXT-TABLE-FORMATTING**: Complements Terminal Progress Tracker for data presentation

## Usage Examples

### Agency Import Workflow

```tsx
const AgencyImportWorkflow: React.FC<AgencyImportWorkflowProps> = ({
  ccn,
  onComplete
}) => {
  const {
    progressLines,
    isComplete,
    startStep,
    completeStep,
    errorStep
  } = useTerminalProgress({
    title: `Agency Import: ${ccn}`,
    steps: [
      'Validating CCN',
      'Fetching agency data',
      'Importing quality measures',
      'Importing star ratings',
      'Setting up agency profile'
    ],
    onComplete: () => onComplete?.(true)
  });

  useEffect(() => {
    // Start the import process
    startImport();
  }, []);

  const startImport = async () => {
    try {
      // Step 1: Validate CCN
      startStep(0);
      await validateCCN(ccn);
      completeStep(0);
      
      // Step 2: Fetch agency data
      startStep(1);
      const agencyData = await fetchAgency(ccn);
      completeStep(1);

      // Continue with other steps...
    } catch (error) {
      errorStep(currentStepIndex);
    }
  };

  return (
    <div className="terminal-progress-view">
      {progressLines.map((line, index) => (
        <div key={index} className="terminal-line">{line}</div>
      ))}
    </div>
  );
};
```

## Evolution History

- **v1.0** (2023-10): Initial implementation with basic progress states
- **v1.1** (Current): Added error handling, auto-progression, and hook-based implementation 