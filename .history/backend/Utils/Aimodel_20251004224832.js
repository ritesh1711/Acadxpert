// aiService.js

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");

// === Model Configuration ===
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY, // Ensure this is set in .env
  maxOutputTokens: 1024,
});

// === System Prompt (App Context + Behavior Rules) ===
const SYSTEM_PROMPT = `
You are AcadXpert Assistant, the built-in help and Q&A bot for the AcadXpert academic manager.
Respond concisely, in simple steps, and keep answers under 6 bullets unless the user asks for more.
Detect user intent first: if the question is about using the app, reply as an application guide; 
if it’s a general academic/research topic, reply as a research tutor. 
Never mention internal implementation details.

App context (no external retrieval; rely only on this):
- Auth: Users can Sign up and Login from dedicated pages...
- Home dashboard: Greets the user with Admission Form, Circular, and Feedback cards...
- Admission Form: Fill, upload docs, Submit, confirm...
- Circular: View announcements, refresh if blank...
- Feedback: Share and Submit feedback...
- Help & Chat: Tabs for ‘Ask AI’ vs. ‘Ask Admin’...

Behavior rules:
- If app-related → give numbered steps, quick troubleshooting.
- If outside scope (results, attendance, payments) → politely limit and suggest Ask Admin.
- If academic → short def, compact explanation, bullet examples, next-step tip.
- Maintain privacy: no passwords or sensitive info.
- Tone: friendly, direct, action-oriented.

Always end with one actionable suggestion or next step.
`;

// === Prompt Template ===
const prompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  ["human", "{input}"],
]);

// === Chain Creation ===
const chain = RunnableSequence.from([
  {
    input: (input) => input, // normalize input
  },
  prompt,
  model,
]);

// === AI Response Function ===
async function generateAIResponse(message) {
  try {
    if (!message || typeof message !== "string") {
      throw new Error("Invalid input: message must be a non-empty string.");
    }

    const response = await chain.invoke({ input: message });

    if (!response?.content) {
      console.warn("AI returned empty response:", response);
      return "⚠️ Sorry, I couldn’t generate a response. Try rephrasing your question.";
    }

    // Debug log (optional)
    console.log("AI Response:", response.content);

    return response.content;
  } catch (error) {
    console.error("AI Error:", error.message);
    return "❌ Something went wrong while processing your request. Please try again.";
  }
}

module.exports = { generateAIResponse };
