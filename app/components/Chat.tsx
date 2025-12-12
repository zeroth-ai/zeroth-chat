'use client';

import { useState } from 'react';
import type { ChatMessage } from '@/types';

interface ChatProps {
    messages: ChatMessage[];
    loading: boolean;
    input: string;
    setInput: (value: string) => void;
    image: File | null;
    setImage: (file: File | null) => void;  
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

export default function Chat({
    messages,
    loading,
    input,
    setInput,
    image,
    setImage,  
    handleImageChange,
    handleSubmit,
}: ChatProps) {
  const [showMetaTags, setShowMetaTags] = useState<Record<number, boolean>>({});

  const toggleMetaTags = (id: number) => {
    setShowMetaTags(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col h-[80vh] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">AI Image Chat</h1>

          </div>
          <div className="text-sm text-gray-400">
            {messages.length} messages
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gray-800 rounded-2xl mb-4">
              <div className="text-4xl mb-2">🖼️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome!</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Upload an image and get detailed AI-powered descriptions.
                Supports JPEG, PNG, WebP up to 10MB.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-5 ${
                  msg.role === 'user'
                    ? 'bg-blue-900/40 border border-blue-800/50'
                    : 'bg-gray-800/60 border border-gray-700/50'
                }`}
              >
                {msg.role === 'user' && msg.image_base64 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">📸 Uploaded Image</div>
                    <div className="relative group">
                      <img
                        src={msg.image_base64}
                        alt="Uploaded"
                        className="max-w-full max-h-64 rounded-lg border border-gray-700 shadow-lg"
                      />
                    </div>
                    {msg.content !== '[Image uploaded]' && (
                      <div className="mt-3 text-sm text-gray-300">
                        <span className="font-medium">Question:</span> {msg.content}
                      </div>
                    )}
                  </div>
                )}

                {msg.role === 'user' && !msg.image_base64 && (
                  <div className="text-white">{msg.content}</div>
                )}

                {msg.role === 'assistant' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white">AI</span>
                      </div>

                    </div>
                    
                    <div className="text-white whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.meta_tags && (
                      <div className="mt-6 pt-4 border-t border-gray-700/50">
                        <button
                          onClick={() => toggleMetaTags(msg.id)}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 mb-2"
                        >
                          <span>📊</span>
                          <span>
                            {showMetaTags[msg.id] ? 'Hide' : 'Show'} Analysis Details
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5 max-w-[85%]">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="text-gray-400 text-sm">
                  Analyzing image with Gemini AI...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 p-4 bg-gray-800/30">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-3 rounded-lg font-medium transition-all text-white">
                <span>📷 Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  capture="environment"
                />
              </label>
              
              {image && (
                <div className="inline-flex items-center ml-4 bg-gray-700/50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-white max-w-xs truncate">{image.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    ({Math.round(image.size / 1024)}KB)
                  </span>
                  {/* Removed the clear button since we don't have setImage */}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              Max 10MB • Will compress to less than 100KB
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the image or just say 'Describe this image'..."
              className="flex-1 p-4 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={(!input.trim() && !image) || loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-semibold transition-all min-w-[120px] flex items-center justify-center text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Processing...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
          
          {/* <div className="text-xs text-gray-500 text-center">
            Tip: You can ask follow-up questions about the same image
          </div> */}
        </form>
      </div>
    </div>
  );
}