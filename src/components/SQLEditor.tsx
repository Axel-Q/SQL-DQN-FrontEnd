import React from 'react';
import Editor from '@monaco-editor/react';
import { Send } from 'lucide-react';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="relative h-64 bg-gray-800 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="absolute bottom-4 right-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        <span>Run Query</span>
      </button>
    </div>
  );
}; 