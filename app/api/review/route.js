import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Smart Local Resume Analyzer (Fallback)
function localAnalyzeResume(resumeData) {
  if (!resumeData) {
    return {
      score: 50,
      feedback: ["No resume data provided. Please fill out details and try again."]
    };
  }

  let score = 100;
  const feedback = [];

  const {
    name = "",
    email = "",
    phone = "",
    linkedin = "",
    github = "",
    portfolio = "",
    summary = "",
    education = "",
    skills = [],
    experiences = [],
    projects = []
  } = resumeData;

  // 1. Contact Information
  if (!name.trim()) {
    score -= 10;
    feedback.push("Add your full name to the resume.");
  }
  if (!email.trim()) {
    score -= 10;
    feedback.push("Missing email address. Provide a professional email (e.g. name@domain.com) for recruiters to contact you.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    score -= 5;
    feedback.push("The email address provided does not look like a valid email format.");
  }
  if (!phone.trim()) {
    score -= 10;
    feedback.push("Missing phone number. Include a mobile or telephone number with country code.");
  }
  if (!linkedin.trim() && !github.trim() && !portfolio.trim()) {
    score -= 5;
    feedback.push("Add professional links (such as LinkedIn, GitHub, or a personal portfolio) to improve your online presence.");
  }

  // 2. Summary
  const summaryWords = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  if (summaryWords === 0) {
    score -= 10;
    feedback.push("Professional summary is empty. Add a short paragraph (2-3 sentences) highlighting your experience and key expertise.");
  } else if (summaryWords < 15) {
    score -= 5;
    feedback.push("Professional summary is too brief. Expand it to highlight specific achievements, core technologies, and career objectives.");
  } else if (summaryWords > 100) {
    score -= 5;
    feedback.push("Professional summary is too long (over 100 words). Condense it to keep it crisp and engaging for recruiters.");
  }

  // Clichés check in summary
  const cliches = ["hardworking", "motivated", "detail-oriented", "team player", "dynamic", "results-driven", "synergy", "think outside the box"];
  const summaryLower = summary.toLowerCase();
  const matchedCliches = cliches.filter(c => summaryLower.includes(c));
  if (matchedCliches.length > 0) {
    score -= Math.min(5, matchedCliches.length * 2);
    feedback.push(`Replace generic buzzwords in your summary (${matchedCliches.map(c => `'${c}'`).join(", ")}) with specific, impactful technical achievements.`);
  }

  // 3. Skills
  if (skills.length === 0) {
    score -= 15;
    feedback.push("Skills section is empty. Add key technical skills (programming languages, tools, frameworks) and core soft skills.");
  } else if (skills.length < 5) {
    score -= 5;
    feedback.push("You have listed very few skills. Aim for 6-12 relevant technical skills to match ATS keywords.");
  } else if (skills.length > 18) {
    score -= 5;
    feedback.push("Skills list is a bit cluttered. Focus on the 8-12 most relevant tools and technologies to make it readable.");
  }

  // 4. Work Experience
  if (experiences.length === 0) {
    score -= 20;
    feedback.push("No work experience listed. Add details of current/past professional roles, internships, or freelance work.");
  } else {
    experiences.forEach((exp, idx) => {
      const expTitle = exp.title || `Experience ${idx + 1}`;
      const desc = exp.desc || "";
      const trimmedDesc = desc.trim();

      if (!trimmedDesc) {
        score -= 10;
        feedback.push(`Description for role '${expTitle}' is empty. Describe your core responsibilities and accomplishments.`);
      } else {
        const wordCount = trimmedDesc.split(/\s+/).length;
        if (wordCount < 15) {
          score -= 5;
          feedback.push(`The description for '${expTitle}' is too short. Add more context about your tasks and achievements.`);
        }

        // Bullet points check
        const hasBulletPoints = trimmedDesc.includes("*") || trimmedDesc.includes("-") || trimmedDesc.includes("•") || trimmedDesc.includes("\n");
        if (!hasBulletPoints) {
          score -= 4;
          feedback.push(`Format the description for '${expTitle}' using bullet points (* or -) to improve readability.`);
        }

        // Metrics / Quantification check (looks for numbers or percentages)
        const cleanForMetrics = trimmedDesc.replace(/\b(19|20)\d{2}\b/g, ''); // strip years
        const hasNumberMetrics = /[0-9]+/.test(cleanForMetrics);
        if (!hasNumberMetrics) {
          score -= 5;
          feedback.push(`Quantify accomplishments in '${expTitle}'. Use numbers, percentages, or timeframes (e.g. 'reduced load time by 30%', 'managed $5k budget').`);
        }

        // Weak/Passive words check
        const weakVerbs = ["worked on", "helped", "assisted", "responsible for", "participated in", "dealt with", "handled"];
        const matchedWeak = weakVerbs.filter(verb => trimmedDesc.toLowerCase().includes(verb));
        if (matchedWeak.length > 0) {
          score -= 3;
          feedback.push(`Replace weak/passive phrases in '${expTitle}' (${matchedWeak.map(v => `'${v}'`).join(", ")}) with strong action verbs like 'Spearheaded', 'Engineered', 'Optimized', or 'Orchestrated'.`);
        }
      }
    });
  }

  // 5. Projects
  if (projects.length === 0) {
    score -= 8;
    feedback.push("No projects listed. Adding 1-2 personal or academic projects is highly recommended to showcase hands-on technology usage.");
  } else {
    projects.forEach((proj, idx) => {
      const projTitle = proj.title || `Project ${idx + 1}`;
      if (!proj.desc || proj.desc.trim().length < 15) {
        score -= 3;
        feedback.push(`Description for project '${projTitle}' is too brief. Elaborate on the tech stack used and what the project accomplishes.`);
      }
      if (!proj.link || !proj.link.trim()) {
        feedback.push(`Add a repository link or live demo URL for your project '${projTitle}' to showcase proof of work.`);
      }
    });
  }

  // 6. Education
  if (!education || !education.trim()) {
    score -= 10;
    feedback.push("Education section is empty. Add your academic background, degrees, or certifications.");
  } else {
    const eduLower = education.toLowerCase();
    const hasDegree = /\b(bachelor|bs|ba|master|ms|ma|phd|degree|diploma|graduate)\b/i.test(eduLower);
    if (!hasDegree) {
      feedback.push("Ensure your Education section explicitly mentions the degree or certification name (e.g. 'B.S. Computer Science').");
    }
  }

  score = Math.max(35, Math.min(100, score));

  if (feedback.length === 0) {
    feedback.push("Outstanding! Your resume is well-structured, quantified, and follows the best professional practices.");
  }

  return {
    score,
    feedback
  };
}

// Smart Local Text Enhancer (Fallback)
function localEnhanceDescription(text) {
  if (!text || !text.trim()) return text;

  const lines = text.split("\n");
  const enhancedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    const bulletMatch = trimmed.match(/^([\*\-\•\d+\.\s]+)(.*)/);
    let prefix = "* ";
    let content = trimmed;
    if (bulletMatch) {
      prefix = bulletMatch[1];
      content = bulletMatch[2].trim();
    }

    if (content.length < 5) return line;

    let enhanced = content;

    const startingPhrases = [
      { regex: /^(worked on|was working on|worked)\b/i, replacement: "Developed and engineered" },
      { regex: /^(helped with|helped in|assisted with|assisted in|helped|assisted)\b/i, replacement: "Collaborated on the development and deployment of" },
      { regex: /^(responsible for|in charge of|handled|dealt with)\b/i, replacement: "Led the execution and delivery of" },
      { regex: /^(made|built|created)\b/i, replacement: "Architected and developed" },
      { regex: /^(wrote|written|coded)\b/i, replacement: "Engineered clean, maintainable" },
      { regex: /^(managed|led)\b/i, replacement: "Orchestrated and directed" },
      { regex: /^(improved|fixed|made better)\b/i, replacement: "Optimized and streamlined" },
      { regex: /^(tested|testing)\b/i, replacement: "Designed and executed comprehensive test suites for" },
      { regex: /^(added|integrated)\b/i, replacement: "Integrated and configured" },
      { regex: /^(talked to|worked with clients)\b/i, replacement: "Liaised with stakeholders to align on" }
    ];

    let replacedStart = false;
    for (const phrase of startingPhrases) {
      if (phrase.regex.test(enhanced)) {
        enhanced = enhanced.replace(phrase.regex, phrase.replacement);
        replacedStart = true;
        break;
      }
    }

    const endPhrases = [
      { keys: ['react', 'frontend', 'ui', 'ux', 'components', 'css', 'html', 'vue', 'angular'], phrase: ", enhancing responsive layouts and improving user interaction flow" },
      { keys: ['backend', 'api', 'apis', 'express', 'node', 'django', 'flask', 'spring'], phrase: ", ensuring high scalability, data security, and efficient processing" },
      { keys: ['database', 'sql', 'mongodb', 'postgres', 'queries', 'query', 'nosql', 'mysql'], phrase: ", optimizing query response times and data consistency" },
      { keys: ['test', 'testing', 'qa', 'jest', 'cypress', 'selenium'], phrase: ", establishing robust code coverage and minimizing production regression issues" },
      { keys: ['speed', 'performance', 'latency', 'slow', 'optimization', 'optimize'], phrase: ", reducing resource utilization and accelerating load metrics" },
      { keys: ['bug', 'bugs', 'errors', 'issues', 'stable'], phrase: ", leading to an increase in overall application reliability and system uptime" }
    ];

    const lowerContent = content.toLowerCase();
    const hasResultWord = /\b(resulting in|improving|enhancing|optimizing|ensuring|leading to|reduction of|increase of|decreased|increased|optimized)\b/.test(lowerContent);
    const isTooLong = content.split(/\s+/).length > 15;

    if (!hasResultWord && !isTooLong) {
      for (const ep of endPhrases) {
        const matchesKey = ep.keys.some(key => lowerContent.includes(key));
        if (matchesKey) {
          enhanced = enhanced.replace(/[\.\s]*$/, ""); // Strip trailing periods
          enhanced += ep.phrase;
          break;
        }
      }
    }

    enhanced = enhanced.trim();
    if (enhanced.length > 0) {
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }
    
    if (enhanced.length > 0 && !enhanced.endsWith(".")) {
      enhanced += ".";
    }

    return prefix + enhanced;
  });

  return enhancedLines.filter(l => l.trim().length > 0).join("\n");
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    console.error("Failed to parse request JSON:", err);
  }

  const { resumeText, resumeData, action = "review", textToEnhance } = body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      if (action === "enhance") {
        const enhancedText = localEnhanceDescription(textToEnhance);
        return NextResponse.json({ enhancedText });
      }
      const localResult = localAnalyzeResume(resumeData);
      return NextResponse.json(localResult);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (action === "enhance") {
      const prompt = `You are an expert resume writer. Enhance the following job experience description or bullet point to be highly professional, impactful, and results-oriented. 
Use the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]" where possible. 
Do NOT invent fake generic metrics like "resulting in a 20% increase in efficiency" or "spearheaded multiple initiatives" out of thin air. Instead:
1. If the original text provides metrics, highlight and refine them.
2. If no metrics are provided, focus on explaining the complexity of the technical tasks and the concrete value added using precise, industry-specific action verbs (e.g., Architected, Automating, Restructuring, Consolidating).
3. Optionally, you can insert realistic placeholder metrics in brackets if appropriate, e.g., "[reducing API latency by 35%]" or "[improving test coverage by 20%]", to guide the user on what metrics they should provide.
4. Keep the output concise and preserve the original layout (such as bullet points starting with * or -).
5. Return ONLY the newly enhanced text. Do NOT wrap it in quotes, do NOT add introductory or concluding notes (like "Here is your enhanced text:").

Original Text:
${textToEnhance}`;

      const result = await model.generateContent(prompt);
      const enhancedText = result.response.text().trim().replace(/^"|"$/g, "");
      return NextResponse.json({ enhancedText });
    } else {
      const prompt = `You are an expert ATS (Applicant Tracking System) reviewer and recruiter. 
Evaluate this resume in detail. Analyze each section: Contact Information, Professional Summary, Skills, Work Experience, Projects, and Education.
Provide a realistic ATS score (out of 100) based on industry standards, and a list of highly specific, constructive, and actionable recommendations.
Consider:
- Contact details completeness (email, phone, LinkedIn/GitHub).
- Professional summary impact (length, strong opening, absence of generic clichés).
- Skills section completeness and formatting.
- Work experience descriptions (usage of bullet points, starting action verbs, and quantified accomplishments/metrics).
- Projects description and inclusion of links.
- Education degree and graduation details.

Return your response in STRICT JSON format:
{
  "score": 85,
  "feedback": [
    "Specific feedback point 1",
    "Specific feedback point 2",
    "Specific feedback point 3"
  ]
}

Resume Structured Data:
${JSON.stringify(resumeData, null, 2)}

Resume Serialized Text:
${resumeText}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const gResult = JSON.parse(jsonMatch[0]);
          return NextResponse.json(gResult);
        } catch (parseError) {
          console.error("Failed to parse Gemini output, falling back to local review:", parseError);
          const localResult = localAnalyzeResume(resumeData);
          return NextResponse.json(localResult);
        }
      } else {
        const localResult = localAnalyzeResume(resumeData);
        return NextResponse.json(localResult);
      }
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    try {
      if (action === "enhance") {
        const enhancedText = localEnhanceDescription(textToEnhance);
        return NextResponse.json({ enhancedText });
      }
      const localResult = localAnalyzeResume(resumeData);
      return NextResponse.json(localResult);
    } catch (fallbackError) {
      console.error("Fallback execution error:", fallbackError);
      return NextResponse.json(
        { error: "Failed to process AI request" },
        { status: 500 }
      );
    }
  }
}
