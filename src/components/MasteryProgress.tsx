import { Trophy } from 'lucide-react';

interface MasteryProgressProps {
  concepts: string[];
  masteryLevels: number[];
}

export function MasteryProgress({ concepts, masteryLevels }: MasteryProgressProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          SQL Mastery Progress
        </h3>
      </div>

      <div className="grid grid-cols-10 gap-2 mb-8">
        {masteryLevels.map((level, index) => (
          <div key={index} className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${level * 100}%` }}
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {concepts.map((concept, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{`Concept ${index + 1}: ${concept}`}</span>
            <span
              className={`font-medium ${
                masteryLevels[index] >= 0.8
                  ? 'text-green-400'
                  : masteryLevels[index] >= 0.5
                  ? 'text-yellow-400'
                  : 'text-blue-400'
              }`}
            >
              {Number.isFinite(masteryLevels[index]) ? Math.round(masteryLevels[index] * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}