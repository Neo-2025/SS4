---
status: Draft
classification: workflow
---

# AGENCY-IMPORT-WORKFLOW

## Status

**Current Status**: Draft
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 1
- Projects: 1
- Related Patterns: 2

## Classification

Workflow Pattern

## Problem

Importing agency data from external sources like CMS Provider Data Catalog requires multiple steps with potential failures at each stage. Users need visibility into the progress of these steps, clear error feedback, and a consistent experience. Without a structured workflow, the import process can be opaque and difficult to troubleshoot.

## Solution

The Agency Import Workflow pattern provides a structured, multi-step process for importing agency data with visual progress tracking, error handling, and a consistent user experience. It combines the Terminal Progress Tracker pattern with domain-specific logic for agency data import, validation, and setup.

### Core Components

1. **Step Definition**: Clear definition of import steps
2. **Progress Visualization**: Visual indication of current step and progress
3. **Error Handling**: Comprehensive error handling with clear user feedback
4. **Agency Data Validation**: Validation of agency input and data
5. **State Management**: Tracking of import state throughout the process

### Key Features

1. **Progressive Feedback**: Step-by-step progress indication
2. **Error Recovery**: Clear error messages with recovery instructions
3. **Visual Indicators**: Status icons and progress bars
4. **CCN Validation**: Validation of CMS Certification Numbers
5. **Consistent Experience**: Standardized import experience for all agencies

## Implementation Example

```tsx
import React, { useState, useEffect } from 'react';
import { useTerminalProgress } from '../../hooks/useTerminalProgress';
import '../../styles/terminal-progress.css';

interface AgencyImportWorkflowProps {
  ccn: string;
  onComplete?: (success: boolean) => void;
  onProgress?: (progress: number) => void;
}

export const AgencyImportWorkflow: React.FC<AgencyImportWorkflowProps> = ({
  ccn,
  onComplete,
  onProgress
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [agencyData, setAgencyData] = useState<any>(null);
  
  // Define the import steps
  const importSteps = [
    'Validating CCN',
    'Fetching agency data from CMS Provider Data Catalog',
    'Importing quality measures',
    'Importing star ratings',
    'Importing patient experience data',
    'Setting up agency profile',
    'Importing state and national benchmarks'
  ];
  
  const {
    progressLines,
    isComplete,
    startStep,
    completeStep,
    errorStep
  } = useTerminalProgress({
    title: `Agency Import: ${ccn}`,
    steps: importSteps,
    onComplete: () => {
      setIsImporting(false);
      onComplete?.(error === null);
    }
  });
  
  // Start the import process
  const startImport = async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      // Step 1: Validate CCN
      startStep(0);
      await simulateApiCall(1000);
      
      // Validate CCN format
      if (!ccn || !ccn.match(/^\d{6}$/)) {
        throw new Error('Invalid CCN format. Please enter a 6-digit number.');
      }
      completeStep(0);
      
      // Step 2: Fetch agency data
      startStep(1);
      const fetchedAgencyData = await simulateAgencyFetch(ccn);
      setAgencyData(fetchedAgencyData);
      completeStep(1);
      
      // Step 3: Import quality measures
      startStep(2);
      await simulateApiCall(1500);
      completeStep(2);
      
      // Step 4: Import star ratings
      startStep(3);
      await simulateApiCall(1000);
      completeStep(3);
      
      // Step 5: Import patient experience data
      startStep(4);
      await simulateApiCall(2000);
      completeStep(4);
      
      // Step 6: Setup agency profile
      startStep(5);
      await simulateApiCall(1000);
      completeStep(5);
      
      // Step 7: Import benchmarks
      startStep(6);
      await simulateApiCall(1500);
      completeStep(6);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      
      // Mark the current step as error
      const currentStep = progressLines.findIndex(line => line.includes('🔄'));
      if (currentStep !== -1) {
        errorStep(currentStep);
      }
    }
  };
  
  // Simulate API calls with delays
  const simulateApiCall = (delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  };
  
  // Simulate fetching agency data
  const simulateAgencyFetch = async (ccn: string) => {
    await simulateApiCall(1500);
    
    // Mock agency data for testing
    return {
      ccn,
      name: ccn === '123456' ? 'Valley Home Health Services' : `Agency ${ccn}`,
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      phone: '(555) 123-4567',
      ownership: 'Non-profit',
    };
  };
  
  // Start the import process when the component mounts
  useEffect(() => {
    startImport();
  }, []);
  
  return (
    <div className="agency-import-workflow">
      <div className="terminal-progress-tracker">
        <div className="terminal-title">Agency Import: {ccn}</div>
        <div className="terminal-output">
          {progressLines.map((line, index) => (
            <div 
              key={index} 
              className={`terminal-line ${
                line.includes('⏳') ? 'status-pending' :
                line.includes('🔄') ? 'status-loading' :
                line.includes('✅') ? 'status-complete' :
                line.includes('❌') ? 'status-error' : ''
              }`}
            >
              {line}
            </div>
          ))}
          
          {error && (
            <div className="terminal-line status-error">
              HealthBench: Error: {error}
            </div>
          )}
          
          {isComplete && !error && (
            <div className="terminal-line status-complete">
              HealthBench: Agency setup complete! You can now run reports.
            </div>
          )}
        </div>
      </div>
      
      {agencyData && isComplete && !error && (
        <div className="agency-summary">
          <h3>Agency Successfully Imported</h3>
          <div>
            <strong>{agencyData.name}</strong> (CCN: {agencyData.ccn})
            <div>{agencyData.address}</div>
            <div>{agencyData.city}, {agencyData.state} {agencyData.zip}</div>
            <div>Phone: {agencyData.phone}</div>
            <div>Ownership: {agencyData.ownership}</div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Benefits

1. **User Visibility**: Clear visibility into the import process
2. **Structured Approach**: Well-defined steps for a complex process
3. **Error Clarity**: Specific error messages for each step
4. **Process Consistency**: Standardized import process for all agencies
5. **Visual Feedback**: Real-time visual feedback on progress
6. **Recovery Guidance**: Clear guidance when errors occur
7. **Completion Clarity**: Clear indication of successful completion

## Limitations

1. **UI Dependency**: Relies on specific UI components for visualization
2. **Fixed Steps**: Predefined steps may not adapt to all import scenarios
3. **Error Recovery**: Limited support for resuming after errors
4. **Network Dependency**: Heavily dependent on network reliability
5. **Progress Precision**: Progress indicators are approximations, not precise

## Related Patterns

- **TERMINAL-PROGRESS-TRACKER**: Used for visual progress indication
- **CIRCUIT-BREAKER-PATTERN**: Can be integrated for handling API failures
- **CSV-FALLBACK-MECHANISM**: Can provide fallback data when imports fail

## Usage Examples

### CLI Command Integration

```typescript
/**
 * Setup agency command: >setup agency [ccn]
 * @param args Command arguments
 */
async setupAgency(args: string[]): Promise<CommandResult> {
  if (args.length < 1) {
    return {
      success: false,
      message: 'Invalid usage. Correct syntax: >setup agency [ccn]'
    };
  }
  
  const ccn = args[0];
  
  // Start the import process with progress tracking
  const { progressLines, startImport } = setupAgencyImport(ccn);
  
  try {
    // Start the import
    const result = await startImport();
    
    return {
      success: true,
      message: [
        ...progressLines,
        ``,
        `HealthBench: Setup complete for ${result.name} (CCN: ${result.ccn})!`,
        `HealthBench: Type >list reports to see available reports.`
      ].join('\n'),
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: [
        ...progressLines,
        ``,
        `HealthBench: Setup failed: ${(error as Error).message}`
      ].join('\n')
    };
  }
}
```

### Bulk Import Implementation

```typescript
/**
 * Bulk import multiple agencies
 * @param ccnList List of CCNs to import
 */
async bulkImportAgencies(ccnList: string[]): Promise<ImportResults> {
  const results: ImportResult[] = [];
  
  for (const ccn of ccnList) {
    try {
      // Create a separate import workflow for each agency
      const { startImport } = setupAgencyImport(ccn);
      const result = await startImport();
      
      results.push({
        ccn,
        success: true,
        name: result.name
      });
    } catch (error) {
      results.push({
        ccn,
        success: false,
        error: (error as Error).message
      });
    }
  }
  
  return {
    totalCount: ccnList.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
    results
  };
}
```

## Evolution History

- **v1.0** (Current): Initial implementation with Terminal Progress Tracker integration 