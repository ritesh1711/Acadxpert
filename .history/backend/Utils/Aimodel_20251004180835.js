import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 1024,
});

export async function generateAIResponse(message) {
    const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a compassionate and supportive mental health assistant. Your role is to provide emotional support, coping strategies, stress management techniques, and mental well-being tips.
If the user's message is a follow-up (such as "ok", "tell more", "continue", "what else?", etc.), assume it refers to the previous mental health topic and continue the conversation with empathy.
If the conversation is unrelated to mental health, politely refuse to answer.
Respond in around 70-80 words only.`
  ],
  ["human", "{input}"]
]);

const chain = RunnableSequence.from([
  {
    input:(input) => input
  },
  prompt,
  model
]);

const response = await chain.invoke({ input: message });
    console.log("AI response:", response);
    
    return response;
}