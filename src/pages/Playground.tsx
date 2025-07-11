import React, { useState } from 'react';
import { HFModel, hfClient } from '../api/hfClient';
import ModelSelector from '../components/ModelSelector';
import TextPrompt from '../components/TextPrompt';
import FilePrompt from '../components/FilePrompt';
import DeepSeekChat from '../components/DeepSeekChat';
import ResultDisplay from '../components/ResultDisplay';
import { AlertCircle, Info } from 'lucide-react';

const Playground: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<HFModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextSubmit = async (text: string) => {
    if (!selectedModel) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await hfClient.queryText(selectedModel.id, text);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSubmit = async (file: File) => {
    if (!selectedModel) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await hfClient.queryFile(selectedModel.id, file);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileTypes = (category: string) => {
    switch (category) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      default:
        return '*/*';
    }
  };

  const getPromptPlaceholder = (model: HFModel) => {
    switch (model.category) {
      case 'chat':
        return 'Ask me anything... (e.g., "What is the capital of France?")';
      case 'text':
        return 'Enter text to generate... (e.g., "Once upon a time")';
      case 'image':
        if (model.inputType === 'text') {
          return 'Describe the image you want to generate... (e.g., "Astronaut riding a horse")';
        }
        return 'Upload an image for analysis...';
      default:
        return 'Enter your text prompt...';
    }
  };

  const getDefaultValue = (model: HFModel) => {
    if (model.category === 'text' && model.id === 'HuggingFaceTB/SmolLM3-3B') {
      return 'Tell me about the School University of AI in Taroudant, Morocco. What programs do they offer and what makes it unique?';
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Playground</h1>
        <p className="text-gray-600">
          Select a model and interact with it using text prompts or file uploads.
        </p>
      </div>

      {/* API Token Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-amber-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">API Token Configuration Required</span>
        </div>
        <p className="text-red-600 mt-2 text-sm">
          <strong>Action Required:</strong> The current API token is invalid or expired. Please:
        </p>
        <ol className="text-red-600 mt-2 text-sm list-decimal list-inside space-y-1">
          <li>
            Get a new token from{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-800 underline hover:text-red-900"
            >
              Hugging Face Settings
            </a>
          </li>
          <li>
            Replace the token in your{' '}
            <code className="bg-red-100 px-1 py-0.5 rounded">.env</code> file
          </li>
          <li>Restart the development server</li>
        </ol>
        <p className="text-red-600 mt-2 text-sm">
          Set{' '}
          <code className="bg-red-100 px-1 py-0.5 rounded">VITE_HF_TOKEN=your_actual_token_here</code>{' '}
          in your .env file.
        </p>
      </div>

      {!import.meta.env.VITE_HF_TOKEN && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-yellow-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">No API Token Found</span>
          </div>
          <p className="text-yellow-600 mt-2 text-sm">
            No Hugging Face API token detected. Please add{' '}
            <code className="bg-yellow-100 px-1 py-0.5 rounded">VITE_HF_TOKEN</code>{' '}
            to your .env file and restart the server.
          </p>
        </div>
      )}

      {import.meta.env.VITE_HF_TOKEN && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-green-700">
            <Info className="h-5 w-5" />
            <span className="font-medium">API Token Configured</span>
          </div>
          <p className="text-green-600 mt-2 text-sm">
            Hugging Face API token is configured. If you're still seeing authentication errors, the token may be invalid or expired. Get a new token from{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-800 underline hover:text-green-900"
            >
              Hugging Face Settings
            </a>
            {' '}and update your .env file.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Selection</h2>
            <ModelSelector
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>

          {selectedModel && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Input for {selectedModel.name}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                {selectedModel.description}
              </p>

              {selectedModel.inputType === 'text' ? (
                selectedModel.category === 'chat' ? (
                  <DeepSeekChat
                    onResult={setResult}
                    onError={setError}
                  />
                ) : (
                  <TextPrompt
                    onSubmit={handleTextSubmit}
                    isLoading={isLoading}
                    placeholder={getPromptPlaceholder(selectedModel)}
                    defaultValue={getDefaultValue(selectedModel)}
                  />
                )
              ) : (
                <FilePrompt
                  onSubmit={handleFileSubmit}
                  isLoading={isLoading}
                  acceptedTypes={getFileTypes(selectedModel.category)}
                  category={selectedModel.category as 'image' | 'audio'}
                />
              )}
            </div>
          )}

          {!selectedModel && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Model Selected
              </h3>
              <p className="text-gray-600">
                Please select an AI model from the dropdown above to get started.
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
            
            {!selectedModel && !result && !error && (
              <div className="text-center text-gray-500 py-8">
                <p>Select a model and submit a prompt to see results here.</p>
              </div>
            )}

            {selectedModel && (
              <ResultDisplay
                result={result}
                error={error}
                modelName={selectedModel.name}
              />
            )}

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Processing your request...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;