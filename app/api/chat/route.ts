import { NextRequest, NextResponse } from 'next/server';
import { describeImage } from '@/lib/deepseek';
import { database } from '@/lib/database';
import { compressImageToBase64, validateImageFile, simpleImageToBase64 } from '@/lib/image-utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  console.log('[API Route] Received image upload request');
  
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const message = formData.get('message') as string || '';
    
    // Validate input
    if (!image) {
      console.log('[API Route] No image provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'No image provided. Please select an image.'
        },
        { status: 400 }
      );
    }
    
    // Validate image file
    const validation = validateImageFile(image);
    if (!validation.valid) {
      console.log('[API Route] Image validation failed:', validation.error);
    } else {
      console.log('[API Route] Image validation passed');
    }
    
    console.log(`[API Route] Processing image: ${image.name}`);
    
    // Try compression first, fallback to simple conversion if it fails
    let compressedBase64: string;
    try {
      compressedBase64 = await compressImageToBase64(image, 500);
      console.log('[API Route] Image compressed successfully');
    } catch (compressError) {
      console.warn('[API Route] Compression failed, trying simple conversion:', compressError);
      compressedBase64 = await simpleImageToBase64(image);
      console.log('[API Route] Used simple base64 conversion');
    }
    
    // Get previous messages for context
    const previousMessages = database.getAllMessages();
    console.log(`[API Route] Previous messages: ${previousMessages.length}`);
    
    // Store user message in database
    const messageId = database.insertMessage(
      'user',
      message || '[Image uploaded]',
      compressedBase64,
      undefined
    );
    
    console.log('[API Route] Calling DeepSeek API...');
    
    // Get description from DeepSeek
    const { description, meta_tags } = await describeImage(
      compressedBase64,
      message,
      previousMessages
    );
    
    console.log(`[API Route] DeepSeek response received: ${description.length} chars`);
    
    // Store assistant response
    const assistantId = database.insertMessage(
      'assistant',
      description,
      undefined,
      meta_tags
    );
    
    console.log('[API Route] Image processed successfully!');
    
    return NextResponse.json({
      success: true,
      description,
      meta_tags,
      stats: {
        image_size_kb: Math.round(compressedBase64.length * 0.75 / 1024),
        description_length: description.length,
        model: 'deepseek-chat'
      },
      message_id: assistantId
    });
    
  } catch (error: any) {
    console.error('[API Route] Error:', error.message);
    console.error('[API Route] Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        suggestion: 'Try a different image format (JPEG works best) or reduce the image size.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint remains the same
export async function GET() {
  try {
    const messages = database.getAllMessages();
    const stats = database.getStats();
    
    return NextResponse.json({
      success: true,
      messages,
      stats,
      count: messages.length
    });
    
  } catch (error: any) {
    console.error('[API GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}