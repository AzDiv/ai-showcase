import React from 'react';
import { CheckCircle, AlertCircle, Copy, Info } from 'lucide-react';

interface ResultDisplayProps {
  result: any;
  error: string | null;
  modelName: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, error, modelName }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        
        {error.includes('Model not found') && (
          <div className="mt-3 p-3 bg-red-100 rounded-md">
            <div className="flex items-center space-x-2 text-red-700 mb-2">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Troubleshooting Tips:</span>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              <li>• The model may be private or require special access</li>
              <li>• Try a different model from the dropdown</li>
              <li>• Some models may be temporarily unavailable</li>
            </ul>
          </div>
        )}
        
        {error.includes('loading') && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-md">
            <p className="text-sm text-yellow-700">
              The model is currently loading. This usually takes 1-2 minutes for the first request.
              Please try again in a moment.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const renderResult = () => {
    // Handle image generation results
    if (result && result.type === 'image_generation' && result.imageUrl) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Generated Image</span>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = result.imageUrl;
                link.download = `generated-image-${Date.now()}.png`;
                link.click();
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
            >
              Download
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <img
              src={result.imageUrl}
              alt={`Generated: ${result.prompt}`}
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Prompt:</strong> {result.prompt}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Model:</strong> {result.model}
            </p>
          </div>
        </div>
      );
    }

    // Handle chat completion results
    if (result && result.type === 'chat' && result.generated_text) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Chat Response</span>
            <button
              onClick={() => copyToClipboard(result.generated_text)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <p className="text-gray-900 whitespace-pre-wrap">
              {result.generated_text}
            </p>
          </div>
        </div>
      );
    }

    // Handle text generation results
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      const generatedText = result[0].generated_text;
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Generated Text</span>
            <button
              onClick={() => copyToClipboard(generatedText)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
            {generatedText}
          </p>
        </div>
      );
    }

    // Handle image classification results
    if (Array.isArray(result) && result.length > 0 && result[0].label) {
      return (
        <div className="space-y-4">
          <span className="text-sm font-medium text-gray-700">Classification Results</span>
          {result.slice(0, 5).map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className="text-blue-600 font-mono">
                  {(item.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.score * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Handle object detection results
    if (Array.isArray(result) && result.length > 0 && result[0].box) {
      return (
        <div className="space-y-4">
          <span className="text-sm font-medium text-gray-700">Detected Objects</span>
          {result.map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className="text-green-600 font-mono">
                  {(item.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Position: ({item.box.xmin}, {item.box.ymin}) to ({item.box.xmax}, {item.box.ymax})</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Handle audio transcription results
    if (result.text) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Transcription</span>
            <button
              onClick={() => copyToClipboard(result.text)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
            {result.text}
          </p>
        </div>
      );
    }

    // Handle simple string results
    if (typeof result === 'string') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Result</span>
            <button
              onClick={() => copyToClipboard(result)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
            {result}
          </p>
        </div>
      );
    }

    // Handle array results
    if (Array.isArray(result)) {
      return (
        <div className="space-y-4">
          <span className="text-sm font-medium text-gray-700">Results</span>
          {result.map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              {typeof item === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-700 capitalize">{key}:</span>
                      <span className="text-gray-900">
                        {typeof value === 'number' ? value.toFixed(4) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900">{String(item)}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Handle object results
    if (typeof result === 'object') {
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <pre className="text-sm text-gray-900 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
    }

    // Fallback for any other result type
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-gray-900">{String(result)}</p>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="font-medium text-gray-900">Results from {modelName}</span>
      </div>
      
      {renderResult()}
    </div>
  );
};

export default ResultDisplay;