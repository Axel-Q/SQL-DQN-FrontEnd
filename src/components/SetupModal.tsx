import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { AllConcepts, ThemeType } from '../utils/constants';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payload: {
    theme: ThemeType;
    concepts: string[];
    action: string;
  }) => void;
}

export function SetupModal({ isOpen, onClose, onComplete }: SetupModalProps) {
  const [theme, setTheme] = useState<ThemeType>('cyberpunk' as ThemeType);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [concepts, setConcepts] = useState<string[]>([]);

  const loadingSteps = [
    "Connecting to server...",
    "Initializing AI agent...",
    "Preparing game environment...",
    "Loading theme data...",
    "Finalizing setup..."
  ];

  function toggleConcept(concept: string) {
    setConcepts((prev) =>
      prev.includes(concept) ? prev.filter((c) => c !== concept) : [...prev, concept]
    );
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data first
    if (concepts.length === 0) {
      setError('Please select at least one concept to continue.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setLoadingStep(0);

    try {
      // Step 1: Connecting to server
      setLoadingStep(0);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const apiUrl = import.meta.env.VITE_API_URL;
      const isDev = import.meta.env.MODE === 'development';
      
      console.log('Making request to API');
      console.log('Environment:', import.meta.env.MODE);
      console.log('VITE_API_URL:', apiUrl);
      console.log('Selected concepts:', concepts);

      // Smart fallback: localhost for dev, EC2 for production
      const finalApiUrl = apiUrl || (isDev ? 'http://localhost:3000' : 'http://44.204.27.181:3000');
      
      if (!apiUrl) {
        console.log(`No API URL configured, using ${isDev ? 'localhost' : 'EC2'} fallback:`, finalApiUrl);
      }

      const fullUrl = `${finalApiUrl}/setup-form`;
      console.log('Full URL:', fullUrl);
      
      const requestBody = { conceptsLength: concepts.length };
      console.log('Request body:', requestBody);
      
      // Step 2: Initializing AI agent
      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        mode: 'cors',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Step 3: Preparing game environment
      setLoadingStep(2);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const data = await response.json();
      console.log('Response data:', data);

      // Step 4: Loading theme data
      setLoadingStep(3);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 5: Finalizing setup
      setLoadingStep(4);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Important: Reset loading state before calling onComplete
      setIsLoading(false);
      
      // Pass theme, concepts and action to the parent
      onComplete({ theme, concepts, action: data.action });
    } catch (err) {
      console.error('Request error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(`Request failed: ${errorMessage}`);
      // Reset loading state on error
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        // CSV format: masteryOfConcept1,masteryOfConcept2,...masteryOfConceptN
        // e.g. 0.8,0.6,0.4,0.9,0.7,0.5
        // pass the mastery levels or concepts to the server if needed
        const lines = csv.split(',').map((c) => c.trim());
        if (lines.length !== AllConcepts.length) {
          throw new Error('Inconsistent number of concepts.');
        }
      } catch (err) {
        setError('Invalid CSV format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Changed max-w-md to max-w-2xl to increase window size */}
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
  
        <h2 className="text-2xl font-bold mb-6">Game Setup</h2>
  
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg">
            <div className="flex items-center justify-between text-blue-400">
              <span className="font-medium">Setup Progress</span>
              <span className="text-sm">{loadingStep + 1} / {loadingSteps.length}</span>
            </div>
            <div className="mt-2 text-sm text-blue-300">{loadingSteps[loadingStep]}</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <div className="flex space-x-2">
              {(['cyberpunk', 'fantasy', 'real-world'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    theme === t ? 'bg-blue-500' : 'bg-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Concepts</label>
            <div className="grid grid-cols-2 gap-2">
              {AllConcepts.map((concept) => (
                <label key={concept} className={`flex items-center space-x-2 ${isLoading ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={concepts.includes(concept)}
                    onChange={() => toggleConcept(concept)}
                    disabled={isLoading}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{concept}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                isLoading 
                  ? 'bg-gray-700 opacity-50 cursor-not-allowed' 
                  : 'bg-gray-700 cursor-pointer hover:bg-gray-600'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            onClick={(e) => {
              console.log('Start Game button clicked');
              // The form onSubmit will handle the actual logic
            }}
            className="w-full py-3 bg-blue-500 rounded-lg font-medium hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
                  {loadingSteps[loadingStep]}
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              'Start Game'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}