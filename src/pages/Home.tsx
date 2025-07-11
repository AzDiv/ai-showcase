import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Brain, Zap, Shield, Globe } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full">
            <Brain className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          HF AI Showcase
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Explore the power of artificial intelligence with our interactive showcase of 
          Hugging Face models. From text generation to image analysis and audio processing, 
          discover what's possible with state-of-the-art AI.
        </p>
        <Link
          to="/playground"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
        >
          <Play className="h-5 w-5" />
          <span>Try the Playground</span>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple AI Models</h3>
          <p className="text-gray-600">
            Access a variety of pre-trained models for text generation, image analysis, 
            and audio processing tasks.
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p className="text-gray-600">
            Your data is processed securely through Hugging Face's inference API 
            with industry-standard encryption.
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Globe className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
          <p className="text-gray-600">
            Simple, intuitive interface that makes AI accessible to everyone, 
            regardless of technical background.
          </p>
        </div>
      </div>

      {/* Model Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Available Model Categories
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Text Models</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• SmolLM3-3B - Compact Language Model</li>
                <li>• Efficient Text Generation</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Chat Models</h3>
              <ul className="text-sm text-indigo-600 space-y-1">
                <li>• DeepSeek-R1-Zero - Advanced Reasoning</li>
                <li>• Powered by Fireworks AI</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Image Models</h3>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• FLUX.1 Dev - Image Generation</li>
                <li>• Vision Transformer - Classification</li>
                <li>• DETR - Object Detection</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Audio Models</h3>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Whisper Large V3 - Advanced Speech Recognition</li>
                <li>• Transcription & Analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Explore AI?
        </h2>
        <p className="text-gray-600 mb-8">
          Jump into our interactive playground and start experimenting with different AI models.
        </p>
        <Link
          to="/playground"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-lg font-medium"
        >
          <Play className="h-5 w-5" />
          <span>Start Exploring</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;