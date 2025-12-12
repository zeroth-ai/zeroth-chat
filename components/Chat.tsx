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

  // GitHub theme colors
  const theme = {
    bg: {
      primary: '#0d1117',
      secondary: '#161b22',
      tertiary: '#21262d',
      hover: '#30363d',
      accent: '#238636',
      accentHover: '#2ea043',
      userMessage: '#0c2d6b',
      aiMessage: '#21262d'
    },
    border: {
      primary: '#30363d',
      secondary: '#484f58'
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#c9d1d9',
      tertiary: '#8b949e',
      muted: '#6e7681'
    },
    colors: {
      green: '#238636',
      red: '#f85149',
      blue: '#58a6ff',
      purple: '#bc8cff',
      yellow: '#e3b341'
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '80vh',
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.primary}`,
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: theme.bg.secondary,
        padding: '1.5rem',
        borderBottom: `1px solid ${theme.border.primary}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: theme.text.primary
            }}>AI Image Chat</h1>
            <p style={{
              fontSize: '0.875rem',
              color: theme.text.tertiary
            }}>Powered by AI</p>
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: theme.text.tertiary
          }}>
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Chat messages container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '1.5rem',
              backgroundColor: theme.bg.secondary,
              borderRadius: '16px',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem'
              }}>🖼️</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme.text.primary,
                marginBottom: '0.5rem'
              }}>Welcome!</h3>
              <p style={{
                color: theme.text.tertiary,
                maxWidth: '28rem',
                margin: '0 auto'
              }}>
                Upload an image and get detailed AI-powered descriptions.
                Supports JPEG, PNG, WebP up to 10MB.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  backgroundColor: msg.role === 'user' ? theme.bg.userMessage : theme.bg.aiMessage,
                  border: `1px solid ${msg.role === 'user' ? '#1f6feb' : theme.border.primary}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* User message with image */}
                {msg.role === 'user' && msg.image_base64 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: theme.text.tertiary,
                      marginBottom: '0.5rem'
                    }}>📸 Uploaded Image</div>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={msg.image_base64}
                        alt="Uploaded"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '256px',
                          borderRadius: '8px',
                          border: `1px solid ${theme.border.primary}`,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                    </div>
                    {msg.content !== '[Image uploaded]' && (
                      <div style={{
                        marginTop: '0.75rem',
                        fontSize: '0.875rem',
                        color: theme.text.secondary
                      }}>
                        <span style={{ fontWeight: '500' }}>Question:</span> {msg.content}
                      </div>
                    )}
                  </div>
                )}

                {/* User text only */}
                {msg.role === 'user' && !msg.image_base64 && (
                  <div style={{ color: theme.text.primary }}>{msg.content}</div>
                )}

                {/* Assistant response */}
                {msg.role === 'assistant' && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: theme.colors.purple,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: theme.text.primary
                        }}>AI</span>
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        color: theme.text.tertiary
                      }}>Ai</span>
                    </div>
                    
                    <div style={{
                      color: theme.text.primary,
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6'
                    }}>
                      {msg.content}
                    </div>
                    
                    {msg.meta_tags && (
                      <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: `1px solid ${theme.border.secondary}`
                      }}>
                        <button
                          onClick={() => toggleMetaTags(msg.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: theme.text.tertiary,
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = theme.text.secondary}
                          onMouseOut={(e) => e.currentTarget.style.color = theme.text.tertiary}
                        >
                          <span>📊</span>
                          <span>
                            {showMetaTags[msg.id] ? 'Hide' : 'Show'} Analysis Details
                          </span>
                        </button>
                        
                        {showMetaTags[msg.id] && (
                          <div style={{
                            backgroundColor: theme.bg.primary,
                            borderRadius: '8px',
                            padding: '1rem',
                            marginTop: '0.5rem'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                              gap: '0.75rem'
                            }}>
                              {Object.entries(msg.meta_tags)
                                .filter(([_, value]) => {
                                  if (Array.isArray(value)) {
                                    return value.length > 0;
                                  }
                                  return value !== null && value !== undefined;
                                })
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    style={{
                                      backgroundColor: theme.bg.tertiary,
                                      borderRadius: '6px',
                                      padding: '0.75rem',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    <div style={{
                                      fontWeight: '500',
                                      color: theme.text.tertiary,
                                      textTransform: 'capitalize',
                                      marginBottom: '0.25rem'
                                    }}>
                                      {key.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ color: theme.text.primary }}>
                                      {Array.isArray(value) ? (
                                        <div style={{
                                          display: 'flex',
                                          flexWrap: 'wrap',
                                          gap: '0.25rem'
                                        }}>
                                          {value.map((item, idx) => (
                                            <span
                                              key={idx}
                                              style={{
                                                backgroundColor: theme.bg.secondary,
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '4px',
                                                fontSize: '0.6875rem'
                                              }}
                                            >
                                              {String(item)}
                                            </span>
                                          ))}
                                        </div>
                                      ) : typeof value === 'boolean' ? (
                                        <span style={{
                                          color: value ? theme.colors.green : theme.colors.red
                                        }}>
                                          {value ? 'Yes' : 'No'}
                                        </span>
                                      ) : (
                                        String(value)
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              backgroundColor: 'rgba(33, 38, 45, 0.6)',
              border: `1px solid ${theme.border.secondary}`,
              borderRadius: '16px',
              padding: '1.25rem',
              maxWidth: '85%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: theme.text.tertiary,
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite'
                  }}></div>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: theme.text.tertiary,
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite',
                    animationDelay: '0.1s'
                  }}></div>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: theme.text.tertiary,
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite',
                    animationDelay: '0.2s'
                  }}></div>
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: theme.text.tertiary
                }}>
                  Analyzing image with Gemini AI...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <div style={{
        borderTop: `1px solid ${theme.border.primary}`,
        padding: '1rem',
        backgroundColor: 'rgba(22, 27, 34, 0.3)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Image upload area */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <label style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: `linear-gradient(to right, ${theme.colors.purple}, ${theme.colors.blue})`,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'all 0.2s',
                color: theme.text.primary
              }}
              onMouseOver={(e) => e.currentTarget.style.background = `linear-gradient(to right, #8a63d2, #4493f8)`}
              onMouseOut={(e) => e.currentTarget.style.background = `linear-gradient(to right, ${theme.colors.purple}, ${theme.colors.blue})`}
              >
                <span>📷 Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  capture="environment"
                />
              </label>
              
              {image && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: '1rem',
                  backgroundColor: 'rgba(48, 54, 61, 0.5)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: theme.text.primary,
                    maxWidth: '16rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{image.name}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: theme.text.tertiary,
                    marginLeft: '0.5rem'
                  }}>
                    ({Math.round(image.size / 1024)}KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    style={{
                      marginLeft: '0.5rem',
                      color: theme.colors.red,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#ff6b6b'}
                    onMouseOut={(e) => e.currentTarget.style.color = theme.colors.red}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            
            <div style={{
              fontSize: '0.75rem',
              color: theme.text.muted
            }}>
              Max 10MB • Will compress to less than 100KB
            </div>
          </div>

          {/* Text input and send button */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the image or just say 'Describe this image'..."
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: theme.bg.secondary,
                border: `1px solid ${theme.border.primary}`,
                outline: 'none',
                color: theme.text.primary,
                fontSize: '0.875rem'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.colors.blue}
              onBlur={(e) => e.target.style.borderColor = theme.border.primary}
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={(!input.trim() && !image) || loading}
              style={{
                background: `linear-gradient(to right, ${theme.colors.green}, ${theme.colors.green})`,
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontWeight: '600',
                transition: 'all 0.2s',
                color: theme.text.primary,
                border: 'none',
                minWidth: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (!input.trim() && !image) || loading ? 'not-allowed' : 'pointer',
                opacity: (!input.trim() && !image) || loading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!((!input.trim() && !image) || loading)) {
                  e.currentTarget.style.background = `linear-gradient(to right, ${theme.colors.green}, ${theme.colors.green})`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!((!input.trim() && !image) || loading)) {
                  e.currentTarget.style.background = `linear-gradient(to right, ${theme.colors.green}, ${theme.colors.green})`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    border: `2px solid ${theme.text.primary}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%'
                  }}></span>
                  Processing...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
          
          {/* <div style={{
            fontSize: '0.75rem',
            color: theme.text.muted,
            textAlign: 'center'
          }}>
            💡 Tip: You can ask follow-up questions about the same image
          </div> */}
        </form>
      </div>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}