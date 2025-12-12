import OpenAI from 'openai';

// Initialize DeepSeek client
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image_base64?: string;
}

export interface DescriptionResult {
  description: string;
  meta_tags: Record<string, any>;
}

/**
 * Check if the model supports vision
 */
async function checkVisionSupport(): Promise<boolean> {
  try {
    // Try a simple vision request to see if it works
    const testResponse = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Test' },
            {
              type: 'image_url',
              image_url: { url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', detail: 'low' }
            }
          ]
        }
      ],
      max_tokens: 1,
    });
    return true;
  } catch (error: any) {
    console.log('[DeepSeek] Vision not supported by this model');
    return false;
  }
}

/**
 * Alternative: Convert image to text description using a different approach
 */
async function describeImageFallback(imageBase64: string): Promise<string> {
  // For models without vision support, we can't process images directly
  // Return a placeholder message
  return "⚠️ **Note**: Image analysis requires a vision-capable model. The `deepseek-chat` model does not support direct image uploads.\n\nTo analyze images:\n1. Use a model with vision capabilities\n2. Or describe the image in text for analysis";
}

/**
 * Main function to describe image using DeepSeek
 */
export async function describeImage(
  imageBase64: string,
  prompt: string,
  previousMessages: ChatMessage[]
): Promise<DescriptionResult> {
  
  console.log('[DeepSeek] Starting image description...');
  
  try {
    // First, check if vision is supported
    const visionSupported = await checkVisionSupport();
    
    let description: string;
    
    if (visionSupported) {
      console.log('[DeepSeek] Using vision-capable API');
      
      // Prepare conversation history
      const messages: any[] = [];
      
      // Add context from previous messages
      const recentMessages = previousMessages.slice(-2);
      
      recentMessages.forEach(msg => {
        messages.push({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }]
        });
      });
      
      // Extract pure base64 data
      let pureBase64 = imageBase64;
      if (imageBase64.includes(',')) {
        pureBase64 = imageBase64.split(',')[1];
      }
      
      // Create message with image - use the supported format
      messages.push({
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: prompt || 'Please describe this image in detail with markdown formatting.' 
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${pureBase64}`,
              detail: 'low'
            }
          }
        ]
      });
      
      // Call DeepSeek API
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      });
      
      description = response.choices[0]?.message?.content || 'No description generated.';
      
    } else {
      console.log('[DeepSeek] Vision not supported, using fallback');
      description = await describeImageFallback(imageBase64);
      
      // Add the user's prompt to the description
      if (prompt && prompt.trim()) {
        description += `\n\n**Your question**: "${prompt}"\n\n*Please describe the image in text for me to analyze.*`;
      }
    }
    
    console.log('[DeepSeek] Description generated:', description.substring(0, 100) + '...');
    
    // Extract meta tags from description
    const metaTags = extractMetaTags(description);
    
    return {
      description,
      meta_tags: metaTags
    };
    
  } catch (error: any) {
    console.error('[DeepSeek Error]:', error.message);
    
    // Handle specific errors
    if (error.status === 400 && error.message.includes('image_url')) {
      throw new Error(
        'The DeepSeek model you are using does not support image analysis.\n\n' +
        '**Solutions**:\n' +
        '1. Check if your API key has access to vision models\n' +
        '2. Try using a different AI service that supports images\n' +
        '3. Describe the image in text instead of uploading it'
      );
    }
    
    throw new Error(`DeepSeek API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract meta tags from description
 */
function extractMetaTags(description: string): Record<string, any> {
  const tags: Record<string, any> = {
    has_text: /text|writing|word|letter|sign|label|caption|symbol/i.test(description),
    has_people: /person|people|man|woman|child|face|human|person's/i.test(description),
    has_animals: /animal|dog|cat|bird|pet|wildlife|creature|mammal/i.test(description),
    has_food: /food|meal|dish|fruit|vegetable|drink|beverage/i.test(description),
    is_nature: /nature|outdoor|sky|cloud|tree|plant|mountain|water|river|forest|field/i.test(description),
    is_urban: /building|city|street|road|urban|architecture|vehicle|car|traffic/i.test(description),
    is_indoor: /room|indoor|wall|furniture|ceiling|interior|inside|home|office/i.test(description),
    is_art: /painting|art|drawing|illustration|design|creative|artistic|sketch/i.test(description),
    colors: extractColors(description),
    mood: extractMood(description),
    time_of_day: extractTimeOfDay(description),
    word_count: description.split(/\s+/).length,
    vision_supported: !description.includes('does not support'),
  };
  
  return tags;
}

// Helper functions (keep as before)
function extractColors(description: string): string[] {
  const colorMap: Record<string, RegExp> = {
    red: /red|scarlet|crimson|ruby|burgundy|maroon|vermilion/i,
    blue: /blue|azure|navy|cyan|sapphire|cobalt|cerulean|teal|turquoise/i,
    green: /green|emerald|lime|olive|forest|mint|sage|chartreuse/i,
    yellow: /yellow|gold|amber|lemon|mustard|saffron|canary/i,
    orange: /orange|tangerine|peach|amber|rust|pumpkin|coral/i,
    purple: /purple|violet|lavender|mauve|lilac|plum|magenta|indigo/i,
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
  return colors.slice(0, 5);
}

function extractMood(description: string): string[] {
  const moods: string[] = [];
  const moodTests = [
    { mood: 'bright', regex: /bright|sunny|vibrant|colorful|cheerful|happy|joyful|uplifting/i },
    { mood: 'dark', regex: /dark|gloomy|moody|ominous|sad|melancholy|somber/i },
    { mood: 'calm', regex: /calm|peaceful|serene|tranquil|relaxing|gentle|quiet/i },
    { mood: 'energetic', regex: /energentic|dynamic|active|lively|busy|chaotic|vibrant/i },
  ];
  
  for (const test of moodTests) {
    if (test.regex.test(description)) {
      moods.push(test.mood);
    }
  }
  
  return moods.length > 0 ? moods : ['neutral'];
}

function extractTimeOfDay(description: string): string {
  if (/sunrise|dawn|morning|early.*day|sun.*rising/i.test(description)) return 'morning';
  if (/midday|noon|afternoon|high.*noon/i.test(description)) return 'afternoon';
  if (/sunset|dusk|evening|twilight|nightfall/i.test(description)) return 'evening';
  if (/night|midnight|dark.*sky|stars|moon|nocturnal/i.test(description)) return 'night';
  return 'unknown';
}