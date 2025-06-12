import React, { useState, useEffect, useRef } from 'react';
import { ListChecks } from 'lucide-react';
import { Queries } from '../utils/constants';
import { generateQueryForConcept } from '../utils/queryHelpers';
import { formatDBResult } from '../utils/formatters';
import { useTypewriter } from '../hooks/useTypewriter';
import { animations } from '../styles/animations';
import { MainUIProps, HistoryEntry, TaskStatus } from '../types';
import { generateErrorMessage } from '../utils/llmService';

// Import components
import { TaskList } from './TaskList';
import { SchemaDisplay } from './SchemaDisplay';
import { QueryInputForm } from './QueryInputForm';
import { HistoryPopup } from './HistoryPopup';
import { FeedbackAnimations } from './FeedbackAnimations';
import { OutputDisplay } from './OutputDisplay';
import { MasteryProgress } from './MasteryProgress';

export function MainUI({
  initialOutput,
  initialSchemas,
  theme,
  concepts,
  concept: initialConcept,
  randomChoice: initialRandomChoice,
}: MainUIProps) {
  // State variables
  const [randomChoice, setRandomChoice] = useState(initialRandomChoice);
  const [output, setOutput] = useState(initialOutput);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [input, setInput] = useState('');
  const [masteryLevels, setMasteryLevels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState(initialConcept);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // set variables to track attempts, hints, and optimizations
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(false);


  // Use custom typewriter hook for output animation
  const { displayText, isTyping } = useTypewriter(output, output.includes('Error:'));

  // Refs for scrolling
  const historyContainerRef = useRef<HTMLDivElement>(null);
  const outputContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when history or output changes
  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [output]);

  // Match mastery levels to the number of user-chosen concepts
  useEffect(() => {
    setMasteryLevels(concepts.map(() => 0.6));
  }, [concepts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setAttempts(prev => prev + 1);
      const themeQueries = Queries[theme as keyof typeof Queries];
      const conceptQueries = themeQueries[concept as keyof typeof themeQueries];
      
      // Make sure we have valid expected data to send
      if (!conceptQueries?.expected || randomChoice >= conceptQueries.expected.length) {
        throw new Error("Invalid query configuration");
      }
      
      const expected = conceptQueries.expected[randomChoice];
      
      const response = await fetch('http://localhost:3000/submit-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: input, expected, attempts, hintsUsed}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `${errorData.message || 'An unknown error occurred'}`;
        throw new Error(errorMessage);
      }

      // Parse response and handle data
      const data = await response.json();
      
      // Extract all needed values from the response
      const { newMastery, action, resultFromDB, correct } = data;
      const isCorrect = Boolean(correct);

      // Add the task to history
      setTasks(currentTasks => [
        ...currentTasks,
        {
          taskName: `Task ${currentTasks.length + 1}`,
          correct: isCorrect,
          concept,
          narrative: output
        }
      ]);

      // Get the next concept based on the action
      const newActionNumber = parseInt(action, 10);
      const newConcept = concepts[newActionNumber];
      
      // Update state with values from response
      setConcept(newConcept);
      setMasteryLevels(newMastery);
      console.log('Mastery Levels:', newMastery);
      
      // Format the database result
      const dbResultString = formatDBResult(resultFromDB);
      
      // Save the query and result to history
      setHistory(prev => [...prev, { 
        userQuery: input, 
        dbResultString 
      }]);

      // Generate the next query
      const { narrative, randomChoice: newRandomChoice } = await generateQueryForConcept(
        theme,
        newConcept
      );
      
      setRandomChoice(newRandomChoice);

      // Show appropriate animation based on correctness
      if (isCorrect) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
        setAttempts(0); // Reset attempts on success
      } else {
        setShowErrorAnimation(true);
        setTimeout(() => setShowErrorAnimation(false), 1500);
      }

      // Set the new output and clear input
      setOutput(narrative);
      setInput('');
    } catch (error) {
      const basicErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 1500);
      
      try {
        // Set a temporary error message while waiting for the LLM
        setOutput(prevOutput => {
          return prevOutput + `\n\n<span class="text-red-500">Error: ${basicErrorMessage}</span>`;
        });
        
        //TODO: record hintsUsed when error message showed. Refined to hint button.
        // Call the LLM service to get a more helpful error message
        const improvedErrorMessage = await generateErrorMessage({
          userQuery: input,
          errorMessage: basicErrorMessage,
          concept,
          theme
        });
        
        // Update the output with the improved error message
        setOutput(prevOutput => {
          const hasExistingError = prevOutput.includes("Error:");
          if (hasExistingError) {
            return prevOutput.split("Error:")[0] + 
              `<span class="text-red-500">Error: ${improvedErrorMessage}</span>`;
          } else {
            return prevOutput + 
              `\n\n<span class="text-red-500">Error: ${improvedErrorMessage}</span>`;
          }
        });
      } catch (llmError) {
        // Fallback in case the LLM service fails
        console.error('Failed to generate improved error message:', llmError);
        
        setOutput(prevOutput => {
          const hasExistingError = prevOutput.includes("Error:");
          if (hasExistingError) {
            return prevOutput.split("Error:")[0] + 
              `<span class="text-red-500">Error: ${basicErrorMessage}</span>`;
          } else {
            return prevOutput + 
              `\n\n<span class="text-red-500">Error: ${basicErrorMessage}</span>`;
          }
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper to toggle the history popup
  const toggleHistory = () => setIsHistoryOpen(!isHistoryOpen);

  // Helper to use a query from history
  const useQueryFromHistory = (query: string) => setInput(query);

  return (
    <>
      <style>{animations.success + animations.error + animations.tooltip}</style>
      
      <FeedbackAnimations
        showSuccess={showSuccessAnimation}
        showError={showErrorAnimation}
      />
      
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="flex flex-col h-full">
          <div ref={outputContainerRef} className="flex-grow mb-4 rounded-xl p-4 overflow-auto bg-gray-800">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ListChecks className="w-5 h-5 mr-2" />
              Task Board
            </h3>
            
            <TaskList tasks={tasks} />
            <span className="text-gray-400 text-sm">{attempts} attempts</span>
            <OutputDisplay
              displayText={displayText}
              isTyping={isTyping}
            />
          </div>

          <div className="relative h-12 mb-4">
            <QueryInputForm
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              toggleHistory={toggleHistory}
            />
            
            <HistoryPopup
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              history={history}
              onUseQuery={useQueryFromHistory}
            />
          </div>
        </div>

        <div className="space-y-4">
          <MasteryProgress concepts={concepts} masteryLevels={masteryLevels} />
          <SchemaDisplay schemas={initialSchemas} theme={theme} />
        </div>
      </div>
    </>
  );
}