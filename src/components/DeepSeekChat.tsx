import React, { useState } from 'react';
import { Send, Loader2, MessageCircle, User, Bot } from 'lucide-react';
import { InferenceClient } from '@huggingface/inference';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DeepSeekChatProps {
  onResult?: (result: any) => void;
  onError?: (error: string) => void;
}

const DeepSeekChat: React.FC<DeepSeekChatProps> = ({ onResult, onError }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const client = new InferenceClient(import.meta.env.VITE_HF_TOKEN);
      
      const chatCompletion = await client.chatCompletion({
        provider: "fireworks-ai",
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: userMessage.content
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: chatCompletion.choices[0].message.content || 'No response received',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (onResult) {
        onResult({
          type: 'chat',
          generated_text: assistantMessage.content,
          model: 'deepseek-ai/DeepSeek-R1-0528'
        });
      }
    } catch (error: any) {
      console.error('DeepSeek chat error:', error);
      const errorMessage = error.message || 'Failed to get response from DeepSeek';
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Add error message to chat
      const errorChatMessage: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-4">
      {/* Chat Messages */}
      <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Start a conversation with DeepSeek</p>
            <p className="text-sm mt-1">Ask questions, get explanations, or have a discussion</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.content.startsWith('Error:')
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="bg-gray-600 p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">DeepSeek is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask DeepSeek anything..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Clear conversation
          </button>
        )}
      </form>
    </div>
  );
};

export default DeepSeekChat;