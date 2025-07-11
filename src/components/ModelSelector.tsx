import React from 'react';
import { models, HFModel } from '../api/hfClient';
import { MessageSquare, Image, AudioWaveform, ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: HFModel | null;
  onModelSelect: (model: HFModel) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const categorizedModels = {
    text: models.filter(m => m.category === 'text'),
    chat: models.filter(m => m.category === 'chat'),
    image: models.filter(m => m.category === 'image'),
    audio: models.filter(m => m.category === 'audio'),
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <AudioWaveform className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'text': return 'text-blue-600';
      case 'chat': return 'text-indigo-600';
      case 'image': return 'text-green-600';
      case 'audio': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedModel && (
              <div className={`flex items-center space-x-2 ${getCategoryColor(selectedModel.category)}`}>
                {getCategoryIcon(selectedModel.category)}
                <span className="font-medium">{selectedModel.name}</span>
              </div>
            )}
            {!selectedModel && (
              <span className="text-gray-500">Select an AI model</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {Object.entries(categorizedModels).map(([category, modelList]) => (
            <div key={category} className="p-2">
              <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md mb-1">
                {getCategoryIcon(category)}
                <span className="capitalize">{category} Models</span>
              </div>
              {modelList.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className={getCategoryColor(model.category)}>
                      {getCategoryIcon(model.category)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-500">{model.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;