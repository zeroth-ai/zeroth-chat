'use client';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  metaTags?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Session
  useEffect(() => {
    let id = localStorage.getItem('chat_session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('chat_session_id', id);
    }
    setSessionId(id);

    // Load History
    fetch(`/api/chat?sessionId=${id}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // 2. Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Handle Image Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 4. Send Message
  const sendMessage = async () => {
    if ((!input.trim() && !image) || loading) return;

    const newMessage: Message = { role: 'user', content: input, imageUrl: image || undefined };
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);
    setInput('');
    setImage(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          sessionId, 
          message: newMessage.content, 
          imageBase64: newMessage.imageUrl 
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 max-w-4xl mx-auto border-x border-gray-800 font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Ai Chat
        </h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
            }`}>
              
              {/* Image Preview in Chat */}
              {msg.imageUrl && (
                <div className="mb-3">
                  <img src={msg.imageUrl} alt="Upload" className="max-h-64 rounded-lg border border-white/20" />
                </div>
              )}

              {/* Message Content (Markdown) */}
              <div className="prose prose-invert prose-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>

              {/* Meta Tags Badge */}
              {msg.metaTags && (
                <div className="mt-4 pt-3 border-t border-gray-600/50 flex flex-wrap gap-2">
                  {msg.metaTags.split(',').map((tag, tIdx) => (
                    <span key={tIdx} className="text-xs font-mono bg-gray-900 text-orange-400 px-2 py-1 rounded border border-gray-700">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-800 px-4 py-2 rounded-full text-sm text-gray-400 border border-gray-700">
              AI is analyzing image...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {/* Selected Image Preview */}
        {image && (
          <div className="mb-3 relative w-fit group">
            <img src={image} className="h-24 rounded-lg border border-gray-600 shadow-lg" />
            <button 
              onClick={() => setImage(null)} 
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex gap-3">
          <label className="cursor-pointer p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition flex items-center justify-center">
            <span className="text-xl">📷</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          
          <input
            className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
            placeholder="Upload an image or ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/20"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}