const express = require("express");
const router = express.Router();  // ← this defines router
const { auth } = require("../middleware/auth.js");
const { askAI } = require("../utils/askAI.js");

// POST /api/chat
router.post("/", auth, async (req, res) => {
  try {
    const { messages, role } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ message: "messages array is required" });

    const systemPrompt = role === "farmer"
      ? `You are FarmBot, a helpful assistant for Indian farmers using the FarmDirect marketplace.
You help farmers with crop advice, pest control, pricing strategies, and how to use FarmDirect.
Be concise, practical, and friendly. Use simple language. Use ₹ for prices.`
      : `You are FarmBot, a helpful assistant for buyers on the FarmDirect marketplace.
You help buyers find produce, negotiate prices, place orders, and use escrow payments.
Be concise, friendly, and helpful. Use simple language. Use ₹ for prices.`;

    const lastMessage = messages[messages.length - 1].content;

    const conversationHistory = messages.slice(0, -1)
      .map((m) => `${m.role === "user" ? "User" : "FarmBot"}: ${m.content}`)
      .join("\n");

    const prompt = `${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}User: ${lastMessage}\nFarmBot:`;
    const cleanMarkdown = (text) => {
    return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // remove **bold**
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')       // remove *italic*
    .replace(/#{1,6}\s/g, '')          // remove headers
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // remove code blocks
    .trim();
    };
    const reply = await askAI(prompt, systemPrompt);
    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;