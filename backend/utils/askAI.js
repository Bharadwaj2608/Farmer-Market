const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

console.log("API KEY LOADED:", process.env.ANTHROPIC_API_KEY?.slice(0, 20));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ✅ Strips any markdown that Claude still sneaks in
const stripMarkdown = (text) => {
  if (!text) return ''
  let clean = text
  clean = clean.replace(/\**\**/g, '') 
  clean = clean.replace(/\#/g, '') 
  clean = clean.replace(/\*\*\**/g, '')          // Remove all ** bold markers
  clean = clean.replace(/\*/g, '')             // Remove all * italic markers
  clean = clean.replace(/^#{1,6}\s*/gm, '')   // Remove ### headers
  clean = clean.replace(/^[-•]\s+/gm, '')     // Remove bullet points
  clean = clean.replace(/^\d+\.\s+/gm, '')    // Remove numbered lists (1. 2. 3.)
  return clean.trim()
}

const SYSTEM_PROMPT = `You are FarmBot, a helpful assistant for farmers and buyers on FarmDirect.

IMPORTANT FORMATTING RULES — you MUST follow these strictly:
- Reply in plain text ONLY
- NEVER use ** for bold
- NEVER use * for italic  
- NEVER use ### or any # for headers
- NEVER use bullet points (- or •)
- NEVER use numbered lists (1. 2. 3.)
- Write everything as plain conversational sentences and paragraphs
- Keep responses short and easy to read`

const askAI = async (prompt, systemPrompt = "") => {
  const msg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    // ✅ Always use SYSTEM_PROMPT — append any extra systemPrompt if provided
    system: systemPrompt ? `${SYSTEM_PROMPT}\n\n${systemPrompt}` : SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  // ✅ Double safety — strip any markdown Claude still returns
  const rawText = msg.content[0].text
  return stripMarkdown(rawText)
};

module.exports = { askAI };
