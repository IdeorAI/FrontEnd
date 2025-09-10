// app/api/gemini/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { seedIdea, segmentDescription } = await req.json();

    if (!process.env.BACKEND_URL) {
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    // Chamar sua API backend .NET
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/GeminiAI/suggest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seedIdea, segmentDescription }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }
    
     const getErrorMessage = (e: unknown) => e instanceof Error ? e.message
    : (() => { try { return JSON.stringify(e); } catch { return String(e); } })();

   
    const data = await response.json();
    return NextResponse.json(data);
  }  catch (e: unknown) {
   return NextResponse.json(
     { error: 'Internal server error',
       details: process.env.NODE_ENV === 'development' ? getErrorMessage(e) : undefined },
     { status: 500 }
  );
 }
}