import { NextRequest, NextResponse } from 'next/server';
import { describeImage } from '@/lib/gemini';
import { database } from '@/lib/database';
import { compressImageToBase64 } from '@/lib/image-utils';

// Allow larger payloads for images
export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 30,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const message = formData.get('message') as string || '';
    
    // Validate input
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided. Please select an image.' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image (JPEG, PNG, etc.)' },
        { status: 400 }
      );
    }
    
    // Validate file size (client-side also but double-check)
    if (image.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    console.log(`Processing image: ${image.name} (${Math.round(image.size / 1024)}KB)`);
    
    // Compress image to under 100KB
    const compressedBase64 = await compressImageToBase64(image, 100);
    console.log(`Compressed to: ${Math.round(compressedBase64.length * 0.75 / 1024)}KB`);
    
    // Get previous messages for context
    const previousMessages = database.getAllMessages();
    
    // Store user message in database
    const messageId = database.insertMessage(
      'user',
      message || '[Image uploaded]',
      compressedBase64,
      null
    );
    
    console.log(`Stored user message with ID: ${messageId}`);
    
    // Get description from Gemini
    console.log('Calling Gemini API...');
    const { description, meta_tags } = await describeImage(
      compressedBase64,
      message,
      previousMessages
    );
    
    // Store assistant response
    const assistantId = database.insertMessage(
      'assistant',
      description,
      null,
      meta_tags
    );
    
    console.log(`Stored assistant response with ID: ${assistantId}`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      description,
      meta_tags,
      stats: {
        image_size_kb: Math.round(compressedBase64.length * 0.75 / 1024),
        description_length: description.length,
        model: 'gemini-pro-vision'
      },
      message_id: assistantId
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        suggestion: 'Check your Gemini API key in .env.local'
      },
      { status: 500 }
    );
  }
}

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
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}