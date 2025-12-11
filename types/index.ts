export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    image_base64?: string;
    meta_tags?: Record<string, any>;
    created_at: string;
  }
  
  export interface MetaTags {
    has_text?: boolean;
    has_people?: boolean;
    has_animals?: boolean;
    has_food?: boolean;
    is_nature?: boolean;
    is_urban?: boolean;
    is_indoor?: boolean;
    is_art?: boolean;
    is_photo?: boolean;
    colors?: string[];
    mood?: string[];
    time_of_day?: string;
    word_count?: number;
    has_emojis?: boolean;
    is_modern?: boolean;
    is_vintage?: boolean;
    is_abstract?: boolean;
    [key: string]: any;
  }