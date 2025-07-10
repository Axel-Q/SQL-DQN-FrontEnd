import React, { useState, useEffect, useRef } from 'react';
import { ListChecks } from 'lucide-react';
import { Queries, AllConcepts } from '../utils/constants';
import { generateQueryForConcept } from '../utils/queryHelpers';
import { formatDBResult } from '../utils/formatters';
import { useTypewriter } from '../hooks/useTypewriter';
import { animations } from '../styles/animations';
import { MainUIProps, HistoryEntry, TaskStatus, UserProgress } from '../types';
import { generateErrorMessage, getHintFromLLM } from '../utils/llmService';
import { initializeProgress, updateProgress } from '../utils/badgeManager';
import { getDifficultyForConcept } from '../utils/difficultyManager';
import { totalQuestionsAcrossAllThemes } from '../utils/questionTotals';

// Import components
import { TaskList } from './TaskList';
import { SchemaDisplay } from './SchemaDisplay';
import { QueryInputForm } from './QueryInputForm';
import { HistoryPopup } from './HistoryPopup';
import { FeedbackAnimations } from './FeedbackAnimations';
import { OutputDisplay } from './OutputDisplay';
import { MasteryProgress } from './MasteryProgress';
import { BadgeDisplay } from './BadgeDisplay';
import { SQLEditor } from './SQLEditor';
import { DifficultyIndicator } from './DifficultyIndicator';
import { ConceptsPopup } from './ConceptsPopup';

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
  const [masteryLevels, setMasteryLevels] = useState<number[]>([0.2]);
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState(initialConcept);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // set variables to track attempts, hints, and optimizations
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(false);
  const [hintText, setHintText] = useState('');


  const [userProgress, setUserProgress] = useState<UserProgress>(initializeProgress());
  const [isConceptsPopupOpen, setIsConceptsPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [conceptsToShow, setConceptsToShow] = useState<string[]>([]);
  const [isCompletedList, setIsCompletedList] = useState(false);

  

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
  }, [concepts]);

  // Get current difficulty
  const currentDifficulty = getDifficultyForConcept(concept);

  const totalQuestions = totalQuestionsAcrossAllThemes;
  const totalConcepts = AllConcepts.length;

  const handleShowCompletedConcepts = () => {
    setConceptsToShow(userProgress.uniqueConcepts);
    setPopupTitle('Mastered Concepts');
    setIsCompletedList(true);
    setIsConceptsPopupOpen(true);
  };

  const handleShowAllConcepts = () => {
    setConceptsToShow(AllConcepts);
    setPopupTitle('All SQL Concepts');
    setIsCompletedList(false);
    setIsConceptsPopupOpen(true);
  };
  
  const handleUpdateProgress = (questionCompleted: boolean, newConcept?: string) => {
    const updatedProgress = updateProgress(userProgress, questionCompleted, newConcept);
    setUserProgress(updatedProgress);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setAttempts(prev => prev + 1); // Increment attempts

    console.log('=== handleSubmit 开始 ===');
    console.log('isLoading before:', isLoading);

    try {
      setIsLoading(true);
      console.log('setIsLoading(true) 调用');
      
      const themeQueries = Queries[theme as keyof typeof Queries];
      const conceptQueries = themeQueries[concept as keyof typeof themeQueries];
      
      // Make sure we have valid expected data to send
      if (!conceptQueries?.expected || randomChoice >= conceptQueries.expected.length) {
        throw new Error("Invalid query configuration");
      }
      
      const expected = conceptQueries.expected[randomChoice];
      
      const apiUrl = import.meta.env.VITE_API_URL;
      const isDev = import.meta.env.MODE === 'development';
      const finalApiUrl = apiUrl || (isDev ? 'http://localhost:3000' : 'http://44.204.27.181:3000');
      
      const questionId = randomChoice; // Or use your actual question's unique integer ID

      const response = await fetch(`${finalApiUrl}/submit-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: input, expected, questionId, attempts, hintsUsed }),
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
        setAttempts(0); // Reset attempts for next question
        setHintsUsed(false); // Reset for next question
        setHintText('');
      } else {
        setShowErrorAnimation(true);
        setTimeout(() => setShowErrorAnimation(false), 1500);
      }

      // Update user progress
      const conceptJustMastered = isCorrect && newMastery >= 0.8 && !userProgress.uniqueConcepts.includes(concept);
      handleUpdateProgress(true, conceptJustMastered ? concept : undefined);

      console.log('请求成功，准备重置状态');
      setOutput(narrative);
      setInput('');
      setIsLoading(false);
      console.log('setIsLoading(false) 调用');
      
    } catch (error) {
      console.log('请求失败:', error);
      const basicErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setShowErrorAnimation(true);
      setTimeout(() => setShowErrorAnimation(false), 1500);
      
      try {
        // Set a temporary error message while waiting for the LLM
        setOutput(prevOutput => {
          return prevOutput + `\n\n<span class="text-red-500">Error: ${basicErrorMessage}</span>`;
        });
        
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
    
    console.log('=== handleSubmit 结束 ===');
  };

  // Helper to toggle the history popup
  const toggleHistory = () => setIsHistoryOpen(!isHistoryOpen);

  // Helper to use a query from history
  const useQueryFromHistory = (query: string) => setInput(query);

  useEffect(() => {
    const fetchHint = async () => {
      if (hintsUsed) {
        // Get the current input and expected for the question
        const themeQueries = Queries[theme as keyof typeof Queries];
        const conceptQueries = themeQueries[concept as keyof typeof themeQueries];
        const expected = conceptQueries?.expected?.[randomChoice];
        const inputData = conceptQueries?.input?.[randomChoice];

        if (expected && inputData) {
          setHintText('Loading hint...');
          try {
            const hint = await getHintFromLLM(theme, concept, inputData, expected);
            setHintText(hint);
          } catch (e) {
            setHintText('Failed to load hint.');
          }
        }
      } else {
        setHintText('');
      }
    };
    fetchHint();
    // eslint-disable-next-line
  }, [hintsUsed, theme, concept, randomChoice]);

  return (
    <>
      <style>{animations.success + animations.error + animations.tooltip}</style>
      
      <FeedbackAnimations
        showSuccess={showSuccessAnimation}
        showError={showErrorAnimation}
      />
      
      <div className="min-h-screen flex flex-col">
        {/* Header with badges */}
        <header className="bg-gray-800 border-b border-gray-700 p-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-0.5">
              <h1 className="text-lg font-bold text-white">SQL Learning Platform</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Completed Questions: {userProgress.completedQuestions} / {totalQuestions}</span>
                <span>|</span>
                <span>Mastered Concepts: 
                  <button onClick={handleShowCompletedConcepts} className="text-blue-400 hover:underline focus:outline-none mx-1">
                    {userProgress.completedConcepts}
                  </button>
                  /
                  <button onClick={handleShowAllConcepts} className="text-blue-400 hover:underline focus:outline-none mx-1">
                    {totalConcepts}
                  </button>
                </span>
              </div>
            </div>
            <BadgeDisplay badges={userProgress.badges} />
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Left column: SQL Editor and related UI */}
          <div className="flex flex-col h-full">
            <div className="mb-4">
            <div ref={outputContainerRef} className="flex-grow mb-4 rounded-xl p-4 overflow-auto bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <ListChecks className="w-5 h-5 mr-2" />
                  Task Board
                </h3>
                <DifficultyIndicator
                  level={currentDifficulty.level}
                  description={currentDifficulty.description}
                />
              </div>
              
              <TaskList tasks={tasks} />
              
              <OutputDisplay
                displayText={displayText}
                isTyping={isTyping}
              />
              {hintsUsed && hintText && (
                <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-sm text-blue-300 font-medium mb-1">💡 Hint:</div>
                  <div className="text-sm text-blue-200">{hintText}</div>
                </div>
              )}
            </div>
              <SQLEditor
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              {/* Attempts and Hint Switch Row */}
              <div className="flex items-center gap-6 mt-2">
  <span className="px-3 py-1 rounded bg-gray-700 text-gray-200 text-xs font-semibold shadow-sm border border-gray-600">
    Attempts: {attempts}
  </span>
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-300 font-medium">Get Hint</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={hintsUsed}
        onChange={() => {
          if (!hintsUsed) setHintsUsed(true);
        }}
        disabled={hintsUsed}
        className="sr-only peer"
      />
      <div className={
        "w-10 h-5 rounded-full transition-colors duration-200 " +
        (hintsUsed ? "bg-blue-600" : "bg-gray-600") +
        (hintsUsed ? " cursor-not-allowed" : "")
      }>
        <div className={
          "absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 " +
          (hintsUsed ? "translate-x-5" : "")
        }></div>
      </div>
    </label>
  </div>
</div>
            </div>
          </div>

          {/* Right column: SchemaDisplay and other info */}
          <div className="space-y-4">
            <MasteryProgress concepts={concepts} masteryLevels={masteryLevels}/>
            <SchemaDisplay schemas={initialSchemas} theme={theme} />
            {/* You can add MasteryProgress, etc. here if you want them in the right column */}
            
          </div>
        </div>
      </div>

      <ConceptsPopup
        isOpen={isConceptsPopupOpen}
        onClose={() => setIsConceptsPopupOpen(false)}
        title={popupTitle}
        concepts={conceptsToShow}
        isCompletedList={isCompletedList}
      />
    </>
  );
}