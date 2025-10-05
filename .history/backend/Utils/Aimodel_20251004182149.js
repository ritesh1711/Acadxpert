// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const {ChatGoogleGenerativeAI} = require ("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const {RunnableSequence} = require("@langchain/core/runnables");

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 1024,
});
async function generateAIResponse(message) {
    const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant
    .
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
    
    return response.content;
}

module.exports = { generateAIResponse };