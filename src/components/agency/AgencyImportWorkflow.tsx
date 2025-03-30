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