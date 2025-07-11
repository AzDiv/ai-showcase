import React, { useState } from 'react';
import { useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface TextPromptProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  defaultValue?: string;
}

const TextPrompt: React.FC<TextPromptProps> = ({ 
  onSubmit, 
  isLoading, 
  placeholder = "Enter your text prompt...",
  defaultValue = ''
}) => {
  const [text, setText] = useState(defaultValue);

  useEffect(() => {
    setText(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
          Text Input
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Generate</span>
          </>
        )}
      </button>
    </form>
  );
};

export default TextPrompt;