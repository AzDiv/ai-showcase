import React, { useState } from 'react';
import { Upload, X, Loader2, FileText, Music, Mic } from 'lucide-react';
import AudioRecorder from './AudioRecorder';

interface FilePromptProps {
  onSubmit: (file: File) => void;
  isLoading: boolean;
  acceptedTypes: string;
  category: 'image' | 'audio';
}

const FilePrompt: React.FC<FilePromptProps> = ({ onSubmit, isLoading, acceptedTypes, category }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    
    if (category === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && !isLoading) {
      onSubmit(file);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleRecordedAudio = (audioBlob: Blob, audioFile: File) => {
    setFile(audioFile);
    setPreview(null);
    setShowRecorder(false);
  };

  return (
    <div className="space-y-4">
      {/* Audio Recording Option */}
      {category === 'audio' && (
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Record Audio</span>
            <button
              type="button"
              onClick={() => setShowRecorder(!showRecorder)}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
              <span className="text-sm">
                {showRecorder ? 'Hide Recorder' : 'Use Microphone'}
              </span>
            </button>
          </div>
          
          {showRecorder && (
            <AudioRecorder 
              onAudioReady={handleRecordedAudio}
              isProcessing={isLoading}
            />
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {category === 'image' ? 'Image File' : 'Audio File'} 
          {category === 'audio' && ' (Upload or Record)'}
        </label>
        
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept={acceptedTypes}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="file-input"
              disabled={isLoading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                Drop your {category} file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: {acceptedTypes}
              </p>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {category === 'image' ? (
                  <FileText className="h-5 w-5 text-gray-500" />
                ) : (
                  <Music className="h-5 w-5 text-gray-500" />
                )}
                <span className="font-medium text-gray-700">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-red-500 hover:text-red-700 transition-colors"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {preview && category === 'image' && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={!file || isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Analyze</span>
          </>
        )}
      </button>
      </form>
    </div>
  );
};

export default FilePrompt;