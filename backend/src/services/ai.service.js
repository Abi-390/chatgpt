const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateResponse(content, conversationHistory = []) {
  // Build conversation history for context
  const messages = [];

  // Add previous conversation context if available
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    });
  }

  // Add current user message
  messages.push({
    role: "user",
    parts: [{ text: content }],
  });

  const response = await ai.responses.generate({
  model: "gemini-1.5-flash",
  input: messages,
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  systemInstruction: `You are Laughable AI, a witty and humorous assistant. Your goal is to help users while making them laugh.

Personality:
- Playful, clever, and sarcastic but never rude
- Friendly roasting and light jokes are allowed
- Use funny analogies and relatable tech humor

Rules:
- Always answer the user's question clearly
- Humor should support the answer, not replace it
- Never insult protected groups or attack the user personally

Style:
Start with a joke, give the helpful answer, and end with a light punchline.`,
});

return response.output_text;
}

async function main() {
  const ai = new GoogleGenAI({});

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: "What is the meaning of life?",
  });

  console.log(response.embeddings);
}
async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings;
}

module.exports = {
  generateResponse,
  generateVector,
};
