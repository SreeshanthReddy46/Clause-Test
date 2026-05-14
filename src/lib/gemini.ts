import { GoogleGenAI } from "@google/genai";

export interface AgentFeedback {
  agentName: string;
  role: string;
  responsibilities: string[];
  feedback: string;
  errors: string[];
  suggestions: string[];
  rating: number;
  metrics?: { label: string; value: string; category: string; description: string }[];
}

export async function analyzeProject(
  srsText: string,
  reqText: string,
  codeSnippet: string,
  concurrentRequests: number
): Promise<AgentFeedback[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    You are an AI Multi-Agent QA Orchestrator. You lead a swarm of 7 specialized testing agents.
    Analyze the following project technical requirements and source code:
    
    1. Planner Agent (Senior QA Architect - Understands app structure, breaks tasks into flows like login, payment, and checkout)
    2. UI Testing Agent (Visual Consistency & Layout Specialist - Detects alignment issues, missing components, responsiveness, and broken interactions)
    3. Functional Testing Agent (Logic & Interaction Specialist - Validates user journeys, form submissions, and expected state transitions)
    4. API Testing Agent (Schema, Latency & Load Simulation - Validates status codes and JSON schema. Simulates ${concurrentRequests} concurrent requests to detect race conditions and bottlenecks. Provdies 'Request Payload' and 'Server Response' for errors)
    5. Security Testing Agent (Vulnerability & Auth Specialist - Tests for broken authentication, injection flaws, and insecure endpoints)
    6. Performance Agent (Stress & Bottleneck Specialist - Identifies slowdowns under concurrent user handling and resource leaks)
    7. Bug Reporter Agent (Synthesis & Severity Specialist - Prioritizes issues, defines reproduction steps, and suggests specific fixes)

    For each agent, provide:
    - Detailed feedback in markdown.
    - 3-5 key responsibilities.
    - Top 3-5 errors/critical flags.
    - Top 3-5 suggestions for improvement.
    - A rating from 1-10.
    - 3-5 specific metrics (performance, security, usability, logic).

    SRS Context:
    ${srsText || "Target Site Audit - analyzing provided live URL and optional artifacts."}

    Requirements:
    ${reqText || "No specific user requirements provided. Perform a general heuristic evaluation and detect potential business logic flaws."}

    Source Artifacts & Live Targets:
    ${codeSnippet}

    SPECIAL INSTRUCTION FOR LIVE TARGETS:
    If a TARGET URL is provided in the Source Artifacts:
    - The swarm should treat this as a "Live Audit".
    - Even without source code, provide heuristic analysis based on common patterns for such sites.
    - API Agent: Assume standard REST/GraphQL patterns for the domain and simulate potential failure points.
    - Security Agent: Focus on common web vulnerabilities (OWASP Top 10) applicable to the landing page and visible endpoints.
    - UI Agent: Evaluate based on common UX best practices and design systems.

    Return a JSON array of 7 objects following the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
