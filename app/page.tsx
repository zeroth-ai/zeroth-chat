'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from '@/components/Chat';
import type { ChatMessage } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const saved = localStorage.getItem('ai-image-chat-messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }

      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          localStorage.setItem('ai-image-chat-messages', JSON.stringify(data.messages));
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-image-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        alert('Image too large. Please select an image under 10MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      setImage(file);
      
      if (!input.trim()) {
        setInput('Describe this image in detail');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && !image) || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input || (image ? '[Image uploaded]' : ''),
      image_base64: image ? 'placeholder' : undefined,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    formData.append('message', input);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.description,
          meta_tags: data.meta_tags,
          created_at: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        setTimeout(() => {
          loadMessages();
        }, 100);
        
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Failed to get response: ${error.message}`);
    } finally {
      setLoading(false);
      setInput('');
      setImage(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI Image Description Chat</h1>
        <p style={styles.subtitle}>Upload any image and get detailed AI analysis</p>

      </div>

      <Chat 
        messages={messages}
        loading={loading}
        input={input}
        setInput={setInput}
        image={image}
        setImage={setImage}
        handleImageChange={handleImageChange}
        handleSubmit={handleSubmit}
      />
      
      <div ref={messagesEndRef} />
      
      <footer style={styles.footer}>
        <p>All images are compressed to under 100KB and stored locally in your browser</p>
        <p style={{ marginTop: '4px' }}>Chat history is saved in both localStorage and SQLite database</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
    color: '#c9d1d9',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    textAlign: 'center' as const,
    padding: '32px 0',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '40px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
    color: '#f0f6fc'
  },
  subtitle: {
    color: '#8b949e',
    fontSize: '18px',
    marginBottom: '8px'
  },
  tagline: {
    color: '#484f58',
    fontSize: '14px'
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const,
    color: '#6e7681',
    fontSize: '14px',
    maxWidth: '1200px',
    margin: '32px auto 0'
  }
};