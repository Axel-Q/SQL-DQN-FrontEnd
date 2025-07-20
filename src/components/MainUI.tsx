import React, { useState, useEffect, useRef } from 'react';
import { ListChecks } from 'lucide-react';
import { Queries, AllConcepts } from '../utils/constants';
import { generateQueryForConcept } from '../utils/queryHelpers';
import { formatDBResult } from '../utils/formatters';
import { useTypewriter } from '../hooks/useTypewriter';
import { animations } from '../styles/animations';
import { MainUIProps, HistoryEntry, TaskStatus, UserProgress, Badge } from '../types';
import { generateErrorMessage, getHintFromLLM, getCorrectAnswerFromLLM } from '../utils/llmService';
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
import { UserBehaviour } from './UserBahaviour';
import { BadgePopup } from './BadgeDisplay';

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
  const [masteryLevels, setMasteryLevels] = useState<number[]>(Array(concepts.length).fill(0));
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState(initialConcept);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // set variables to track attempts, hints, and optimizations
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState('');
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');


  const [userProgress, setUserProgress] = useState<UserProgress>(initializeProgress());
  const [isConceptsPopupOpen, setIsConceptsPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [conceptsToShow, setConceptsToShow] = useState<string[]>([]);
  const [isCompletedList, setIsCompletedList] = useState(false);
  const [recentBadge, setRecentBadge] = useState<null | Badge>(null);

  

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

  const handleHintToggle = () => {
    setHintsUsed(!hintsUsed);
    if (!hintsUsed) {
      setShowCorrectAnswer(false); // Close correct answer when opening hint
    }
    setFeedbackMessage(''); // Clear feedback when toggling hint
  };

  const handleCorrectAnswerToggle = () => {
    setShowCorrectAnswer(!showCorrectAnswer);
    if (!showCorrectAnswer) {
      setHintsUsed(false); // Close hint when opening correct answer
    }
    setFeedbackMessage(''); // Clear feedback when toggling correct answer
  };

  const handleInputChange = (newInput: string) => {
    setInput(newInput);
    // Clear feedback message when user starts typing
    if (feedbackMessage) {
      setFeedbackMessage('');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setAttempts(prev => prev + 1); // Increment attempts

    console.log('=== handleSubmit 开始 ===');
    console.log('isLoading before:', isLoading);

    // SECRET CHEAT: If user used "Get Correct Answer", compare their input with the correct answer
    if (showCorrectAnswer && correctAnswerText) {
      console.log('Secret cheat: User used Get Correct Answer, comparing input with correct answer');
      console.log('User input:', input);
      console.log('Correct answer:', correctAnswerText);
      
      // Compare user input with correct answer (case-insensitive, ignore whitespace)
      const normalizedInput = input.trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedCorrect = correctAnswerText.trim().toLowerCase().replace(/\s+/g, ' ');
      
      // Check if they are basically the same (allowing for minor differences)
      const isBasicallySame = normalizedInput === normalizedCorrect || 
                             normalizedInput.includes(normalizedCorrect) || 
                             normalizedCorrect.includes(normalizedInput);
      
      console.log('Normalized input:', normalizedInput);
      console.log('Normalized correct:', normalizedCorrect);
      console.log('Is basically same:', isBasicallySame);
      
      if (isBasicallySame) {
        console.log('Secret cheat: Input matches correct answer, marking as correct');
        
        // Simulate correct answer response
        const mockData = {
          correct: true,
          newMastery: masteryLevels,
          action: '0', // Next concept index
          resultFromDB: [],
          message: 'Correct! Moving to next question...'
        };
        
        // Extract all needed values from the mock response
        const { newMastery, action, resultFromDB, correct } = mockData;
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

        // Format the database result
        const dbResultString = formatDBResult(resultFromDB);
        
        // Save the query and result to history
        setHistory(prev => [...prev, { 
          userQuery: input, 
          dbResultString 
        }]);

        // Show success feedback
        setFeedbackMessage('Correct! Loading next question...');
        setIsLoadingNextQuestion(true);
        
        // Get the next concept based on the action
        const newActionNumber = parseInt(action, 10);
        const newConcept = concepts[newActionNumber];
        
        // Update state with values from response
        setConcept(newConcept);
        console.log("New Concept:", newConcept)
        setMasteryLevels(newMastery);
        console.log('Mastery Levels:', newMastery);
        
        // Generate the next query
        const { narrative, randomChoice: newRandomChoice } = await generateQueryForConcept(
          theme,
          newConcept,
          0.5 // Default coefficient
        );
        
        setRandomChoice(newRandomChoice);
        setOutput(narrative);
        
        // Clear feedback after loading
        setFeedbackMessage('');
        setIsLoadingNextQuestion(false);

        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
        setAttempts(0); // Reset attempts for next question
        setHintsUsed(false); // Reset for next question
        setHintText('');
        setShowCorrectAnswer(false); // Reset correct answer for next question
        setCorrectAnswerText('');

        // Update user progress
        const currentConceptIndex = concepts.indexOf(concept);
        const conceptJustMastered = isCorrect && currentConceptIndex >= 0 && newMastery[currentConceptIndex] >= 0.8 && !userProgress.uniqueConcepts.includes(concept);
        handleUpdateProgress(isCorrect, conceptJustMastered ? concept : undefined);

        console.log('Secret cheat: Successfully marked as correct');
        setInput('');
        setIsLoading(false);
        return;
      } else {
        console.log('Secret cheat: Input does not match correct answer, proceeding with normal validation');
      }
    }

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
      
      // Force proxy in production to avoid HTTPS upgrade issues
      const finalApiUrl = isDev 
        ? (apiUrl || 'http://localhost:3000')  // Dev: use env var or localhost
        : '/api';  // Production: always use proxy
      
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

      // Format the database result
      const dbResultString = formatDBResult(resultFromDB);
      
      // Save the query and result to history
      setHistory(prev => [...prev, { 
        userQuery: input, 
        dbResultString 
      }]);

      // Only proceed to next question if answer is correct
      if (isCorrect) {
        // Show success feedback
        setFeedbackMessage('Correct! Loading next question...');
        setIsLoadingNextQuestion(true);
        
        // Get the next concept based on the action
        const newActionNumber = parseInt(action, 10);
        const newConcept = concepts[newActionNumber];
        
        // Update state with values from response
        setConcept(newConcept);
        console.log("New Concept:", newConcept)
        setMasteryLevels(newMastery);
        console.log('Mastery Levels:', newMastery);
        
        // Generate the next query
        const { narrative, randomChoice: newRandomChoice } = await generateQueryForConcept(
          theme,
          newConcept,
          0.5 // Default coefficient
        );
        
        setRandomChoice(newRandomChoice);
        setOutput(narrative);
        
        // Clear feedback after loading
        setFeedbackMessage('');
        setIsLoadingNextQuestion(false);
      } else {
        // Keep the same question and narrative for incorrect answers
        console.log('Answer incorrect, staying on same question');
        setFeedbackMessage('Wrong answer, please try again.');
        setOutput(prev => prev + '<br/><span class="text-red-500">Error: Incorrect answer, please try again.</span>');
      }

      // Show appropriate animation based on correctness
      if (isCorrect) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
        setAttempts(0); // Reset attempts for next question
        setHintsUsed(false); // Reset for next question
        setHintText('');
        setShowCorrectAnswer(false); // Reset correct answer for next question
        setCorrectAnswerText('');
      } else {
        setShowErrorAnimation(true);
        setTimeout(() => setShowErrorAnimation(false), 1500);
      }

      // Update user progress
      // Find the index of the current concept in the concepts array
      const currentConceptIndex = concepts.indexOf(concept);
      const conceptJustMastered = isCorrect && currentConceptIndex >= 0 && newMastery[currentConceptIndex] >= 0.8 && !userProgress.uniqueConcepts.includes(concept);
      // Only count as completed if the answer is correct
      handleUpdateProgress(isCorrect, conceptJustMastered ? concept : undefined);

      console.log('请求成功，准备重置状态');
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

  useEffect(() => {
    const fetchCorrectAnswer = async () => {
      if (showCorrectAnswer) {
        // Get the current input and expected for the question
        const themeQueries = Queries[theme as keyof typeof Queries];
        const conceptQueries = themeQueries[concept as keyof typeof themeQueries];
        const expected = conceptQueries?.expected?.[randomChoice];
        const inputData = conceptQueries?.input?.[randomChoice];

        if (expected && inputData) {
          setCorrectAnswerText('Loading correct answer...');
          try {
            const answer = await getCorrectAnswerFromLLM(theme, concept, inputData, expected);
            setCorrectAnswerText(answer);
          } catch (e) {
            setCorrectAnswerText('Failed to load correct answer.');
          }
        }
      } else {
        setCorrectAnswerText('');
      }
    };
    fetchCorrectAnswer();
    // eslint-disable-next-line
  }, [showCorrectAnswer, theme, concept, randomChoice]);

  // Detect new badge unlocks
  useEffect(() => {
    const unlocked = userProgress.badges.filter(b => b.unlocked);
    if (unlocked.length > 0) {
      // Only show popup for the most recently unlocked badge
      const lastUnlocked = unlocked[unlocked.length - 1];
      // Only show if this badge wasn't already shown
      if (!recentBadge || recentBadge.id !== lastUnlocked.id) {
        setRecentBadge(lastUnlocked);
      }
    }
  }, [userProgress.badges]);

  // Handler to close badge popup
  const handleCloseBadgePopup = () => setRecentBadge(null);

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
            <BadgeDisplay 
              badges={userProgress.badges} 
              completedQuestions={userProgress.completedQuestions}
              completedConcepts={userProgress.completedConcepts}
            />
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Left column: SQL Editor and related UI */}
          <div className="flex flex-col h-full min-h-[500px]">
            {/* Output/Question/History area */}
            <div ref={outputContainerRef} className="flex-grow overflow-y-auto mb-4 rounded-xl p-4 bg-gray-800 min-h-[200px] max-h-[350px]">
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
              {feedbackMessage && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  isLoadingNextQuestion 
                    ? 'bg-blue-900/20 border-blue-500/30 text-blue-200' 
                    : 'bg-red-900/20 border-red-500/30 text-red-200'
                }`}>
                  <div className="flex items-center">
                    {isLoadingNextQuestion && (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    )}
                    <span className="text-sm font-medium">{feedbackMessage}</span>
                  </div>
                </div>
              )}
              {hintsUsed && hintText && (
    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
      <div className="text-sm text-blue-300 font-medium mb-1">💡 Hint:</div>
      <div className="text-sm text-blue-200">{hintText}</div>
    </div>
  )}
              {showCorrectAnswer && correctAnswerText && (
    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
      <div className="text-sm text-green-300 font-medium mb-1">✅ Correct Answer:</div>
      <div className="text-sm text-green-200 font-mono">{correctAnswerText}</div>
    </div>
  )}
            </div>

            {/* Editor and attempts/hint row always at the bottom */}
            <div className="mt-auto">
              <SQLEditor
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              <UserBehaviour
                attempts={attempts}
                hintsUsed={hintsUsed}
                onHintToggle={handleHintToggle}
                onCorrectAnswerToggle={handleCorrectAnswerToggle}
                showCorrectAnswer={showCorrectAnswer}
              />
            </div>
          </div>

          {/* Right column: SchemaDisplay and other info */}
          <div className="space-y-4">
            <MasteryProgress concepts={concepts} masteryLevels={masteryLevels} />
            <SchemaDisplay schemas={initialSchemas} theme={theme} />
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
      {recentBadge && (
        <BadgePopup badge={recentBadge} onClose={handleCloseBadgePopup} />
      )}
    </>
  );
}