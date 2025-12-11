import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configure the model
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro-vision',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DescriptionResult {
  description: string;
  meta_tags: Record<string, any>;
}

//   Generate image description using Gemini

export async function describeImage(
  imageBase64: string,
  prompt: string,
  previousMessages: ChatMessage[]
): Promise<DescriptionResult> {
  
  // Prepare context from previous messages (last 2 for free tier efficiency)
  const context = previousMessages
    .slice(-2)
    .map(msg => `${msg.role}: ${msg.content.includes('data:image') ? '[Image]' : msg.content}`)
    .join('\n');
  
  // Enhanced prompt for detailed descriptions
  const enhancedPrompt = `
    ${context ? `Context from previous messages:\n${context}\n\n` : ''}
    ${prompt || "Describe this image in detail with markdown formatting."}
    
    Please provide a comprehensive description including:
    1. **Main Subject** - What is the primary focus?
    2. **Objects** - What objects are visible?
    3. **Colors** - Color scheme and prominent colors
    4. **Composition** - Layout, framing, perspective
    5. **Text** - Any visible text or writing
    6. **Mood/Atmosphere** - Emotional tone
    7. **Details** - Notable small details
    
    Format your response in markdown with clear sections and bullet points.
  `;
  
  // Extract base64 data (remove data URL prefix)
  const base64Data = imageBase64.split(',')[1];
  
  try {
    const result = await model.generateContent([
      enhancedPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
    ]);
    
    const response = await result.response;
    const description = response.text();
    
    // Extract meta tags from description
    const metaTags = extractMetaTags(description);
    
    return { 
      description, 
      meta_tags: metaTags 
    };
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Fallback response
    return {
      description: `## Image Analysis\n\n**Error**: ${error.message || 'Failed to process image'}\n\nPlease try again with a different image or check your API key.`,
      meta_tags: { 
        error: true,
        message: error.message 
      }
    };
  }
}


//  Extract meta tags from description

function extractMetaTags(description: string): Record<string, any> {
  const lowercaseDesc = description.toLowerCase();
  
  const tags: Record<string, any> = {
    // Content type
    has_text: /text|writing|word|letter|sign|label|caption|symbol/i.test(description),
    has_people: /person|people|man|woman|child|face|human|person's/i.test(description),
    has_animals: /animal|dog|cat|bird|pet|wildlife|creature|mammal/i.test(description),
    has_food: /food|meal|dish|fruit|vegetable|drink|beverage/i.test(description),
    
    // Environment
    is_nature: /nature|outdoor|sky|cloud|tree|plant|mountain|water|river|forest|field/i.test(description),
    is_urban: /building|city|street|road|urban|architecture|vehicle|car|traffic/i.test(description),
    is_indoor: /room|indoor|wall|furniture|ceiling|interior|inside|home|office/i.test(description),
    
    // Style
    is_art: /painting|art|drawing|illustration|design|creative|artistic|sketch/i.test(description),
    is_photo: /photo|photograph|picture|image|camera|shot|photographic/i.test(description),
    
    // Colors detected
    colors: extractColors(description),
    
    // Mood/Atmosphere
    mood: extractMood(description),
    
    // Time
    time_of_day: extractTimeOfDay(description),
    
    // Stats
    word_count: description.split(/\s+/).length,
    has_emojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/u.test(description),
    
    // Additional flags
    is_modern: /modern|contemporary|recent|current|new/i.test(description),
    is_vintage: /vintage|old|antique|historical|retro|classic/i.test(description),
    is_abstract: /abstract|pattern|texture|shape|form|geometric/i.test(description),
  };
  
  return tags;
}

/**
 * Extract colors mentioned in description
 */
function extractColors(description: string): string[] {
  const colorMap: Record<string, RegExp> = {
    red: /red|scarlet|crimson|ruby|burgundy|maroon|vermilion/i,
    blue: /blue|azure|navy|cyan|sapphire|cobalt|cerulean|teal|turquoise/i,
    green: /green|emerald|lime|olive|forest|mint|sage|chartreuse/i,
    yellow: /yellow|gold|amber|lemon|mustard|saffron|canary/i,
    orange: /orange|tangerine|peach|amber|rust|pumpkin|coral/i,
    purple: /purple|violet|lavender|mauve|lilac|plum|magenta|indigo/i,
    pink: /pink|rose|magenta|salmon|fuchsia|blush|hot pink/i,
    brown: /brown|tan|beige|chocolate|copper|umber|taupe|khaki/i,
    black: /black|ebony|charcoal|onyx|jet|raven/i,
    white: /white|ivory|cream|pearl|snow|alabaster|eggshell/i,
    gray: /gray|grey|silver|ash|slate|smoke|gunmetal/i,
  };
  
  const colors: string[] = [];
  for (const [color, regex] of Object.entries(colorMap)) {
    if (regex.test(description) && !colors.includes(color)) {
      colors.push(color);
    }
  }
  return colors.slice(0, 5); // Limit to 5 most prominent
}


//  Extract mood from description
function extractMood(description: string): string[] {
  const moods: string[] = [];
  
  const moodTests = [
    { mood: 'bright', regex: /bright|sunny|vibrant|colorful|cheerful|happy|joyful|uplifting/i },
    { mood: 'calm', regex: /calm|peaceful|serene|tranquil|relaxing|gentle|quiet/i },
    { mood: 'dark', regex: /dark|gloomy|moody|ominous|sad|melancholy|brooding|somber/i },
    { mood: 'energetic', regex: /energetic|dynamic|active|lively|busy|chaotic|vibrant/i },
    { mood: 'mysterious', regex: /mysterious|enigmatic|mystical|ethereal|dreamy|surreal/i },
    { mood: 'warm', regex: /warm|cozy|inviting|comfortable|homely|snug/i },
    { mood: 'cold', regex: /cold|chilly|frosty|icy|bleak|barren|sterile/i },
  ];
  
  for (const test of moodTests) {
    if (test.regex.test(description)) {
      moods.push(test.mood);
    }
  }
  
  return moods.length > 0 ? moods : ['neutral'];
}


// Extract time of day

function extractTimeOfDay(description: string): string {
  if (/sunrise|dawn|morning|early.*day|sun.*rising/i.test(description)) return 'morning';
  if (/midday|noon|afternoon|high.*noon/i.test(description)) return 'afternoon';
  if (/sunset|dusk|evening|twilight|nightfall/i.test(description)) return 'evening';
  if (/night|midnight|dark.*sky|stars|moon|nocturnal/i.test(description)) return 'night';
  return 'unknown';
}