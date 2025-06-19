import React from 'react';
import { X, BookOpen, CheckCircle } from 'lucide-react';

interface ConceptsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  concepts: string[];
  isCompletedList: boolean;
}

export const ConceptsPopup: React.FC<ConceptsPopupProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  concepts,
  isCompletedList
}) => {
  if (!isOpen) return null;

  const Icon = isCompletedList ? CheckCircle : BookOpen;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Icon className={`w-5 h-5 mr-2 ${isCompletedList ? 'text-green-400' : 'text-blue-400'}`} />
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {concepts.length > 0 ? (
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {concepts.map((concept, index) => (
              <li 
                key={index} 
                className="bg-gray-700/50 p-2 rounded-md text-sm text-gray-300"
              >
                {concept}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">
            No concepts have been mastered yet. Keep learning!
          </p>
        )}
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}; 