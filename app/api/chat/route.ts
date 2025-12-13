import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent multiple DB connections
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, imageBase64 } = await req.json();

    if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

    // 1. Save User Message
    await prisma.chatSession.upsert({
      where: { id: sessionId },
      update: {},
      create: { id: sessionId },
    });

    await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: message || '',
        imageUrl: imageBase64 || null,
      },
    });

    // 2. AI Logic (Pollinations.ai)
    let aiResponseText = "";
    let extractedTags = "";

    try {
      // Construct the message payload 
      const messages: any[] = [
        { 
          role: "system", 
          content: "You are a helpful image analyst. Describe images in Markdown. Always end your response with a list of 5 tags in this format: 'TAGS: tag1, tag2, tag3'." 
        }
      ];

      if (imageBase64) {
        // Image Mode
        messages.push({
          role: "user",
          content: [
            { type: "text", text: message || "Describe this image detailedly." },
            { 
              type: "image_url", 
              image_url: { 
                url: imageBase64 // Passes the full data URI
              } 
            }
          ]
        });
      } else {
        // Text Only Mode
        messages.push({ role: "user", content: message });
      }

      // Call Pollinations 
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          model: 'openai', // Automatically uses GPT-4o or similar vision models
          jsonMode: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Pollinations API Error: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text(); // Response is raw text
      
      // Parse Tags, not really needed but is proided by the fine grained token so why not lol
      if (text.includes("TAGS:")) {
        const parts = text.split("TAGS:");
        aiResponseText = parts[0].trim();
        extractedTags = parts[1].trim();
      } else {
        aiResponseText = text;
      }

    } catch (aiError: any) {
      console.error("AI Service Error:", aiError);
      aiResponseText = `⚠️ Service Error: ${aiError.message}. (Try a smaller image or shorter prompt).`;
    }

    // 3. Save AI Response
    const aiMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant', // Only two roles are defined the user and the assistant
        content: aiResponseText,
        metaTags: extractedTags,
      },
    });

    return NextResponse.json(aiMessage);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET Route
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json([]);
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}