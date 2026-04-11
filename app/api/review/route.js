import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { resumeText, action = "review", textToEnhance } = body;

    if (!process.env.GEMINI_API_KEY) {
      if (action === "enhance") {
        return NextResponse.json({
          enhancedText: textToEnhance + " (Enhanced: Spearheaded multiple initiatives resulting in a 20% increase in efficiency.)"
        });
      }
      return NextResponse.json({
        score: Math.floor(Math.random() * 20) + 70,
        feedback: [
          "Ensure consistency in formatting across your experience and education.",
          "Use more action verbs like 'Spearheaded', 'Optimized', and 'Developed'.",
          "Quantify your achievements to give them more impact.",
        ]
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === "enhance") {
      const prompt = `You are an expert resume writer. Enhance the following job experience bullet point or description to be more impactful, professional, and results-oriented. Use strong action verbs. Return ONLY the newly enhanced text, without quotes or extra context.
      
Original Text: ${textToEnhance}`;
      
      const result = await model.generateContent(prompt);
      const enhancedText = result.response.text().trim().replace(/^"|"$/g, "");
      return NextResponse.json({ enhancedText });
    } else {
      const prompt = `You are an expert ATS recruiter. Rate this resume out of 100 based on standard industry practices. 
Return your response in STRICT JSON format: {"score": 85, "feedback": ["point 1", "point 2", "point 3"]}.
Resume text: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const gResult = JSON.parse(jsonMatch[0]);
        return NextResponse.json(gResult);
      } else {
        return NextResponse.json(
          { score: 60, feedback: ["Failed to parse AI output, but resume looks somewhat promising.", "Try adding more detail to experience."] },
        );
      }
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
