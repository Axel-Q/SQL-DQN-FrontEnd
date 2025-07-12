import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { MainUI } from './components/MainUI';
import { SetupModal } from './components/SetupModal';
import { ThemeTables, ThemeType } from './utils/constants';

type GameState = 'loading' | 'welcome' | 'main' | 'entering-game';

function App() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [systemOutput, setSystemOutput] = useState('');
  const [theme, setTheme] = useState('cyberpunk' as ThemeType);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [concept, setConcept] = useState('');
  const [schema, setSchema] = useState(ThemeTables[theme]);
  const [randomChoice, setRandomChoice] = useState(0);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setGameState('welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Handle setup form completion
  // since we used a fetch request to the server,
  // we've already passed theme and concepts to the backend
  // and received the action number in response.
  const handleSetupComplete = ({ theme: chosenTheme, concepts, action, narrative, randomChoice: generatedChoice, concept: chosenConcept }: { theme: 'cyberpunk' | 'fantasy' | 'real-world'; concepts: string[]; action: string; narrative: string; randomChoice: number; concept: string }) => {
    setTheme(chosenTheme);
    setConcepts(concepts);
    setSchema(ThemeTables[chosenTheme]);
    setConcept(chosenConcept);
    setRandomChoice(generatedChoice);
    setSystemOutput(narrative);
    setIsSetupModalOpen(false);
    setGameState('entering-game');
    
    // Enter game with a brief delay for smooth transition
    setTimeout(() => {
      setGameState('main');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {gameState === 'loading' && <LoadingScreen />}

      {gameState === 'welcome' && (
        <WelcomeScreen
          onCustomSetup={() => setIsSetupModalOpen(true)}
        />
      )}

      {gameState === 'entering-game' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-blue-400">Entering game...</p>
          </div>
        </div>
      )}

      {gameState === 'main' && theme && (
        <MainUI
          initialOutput={systemOutput}
          initialSchemas={schema}
          theme={theme}
          concepts={concepts}
          concept={concept}
          randomChoice={randomChoice}
        />
      )}

      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}

export default App;