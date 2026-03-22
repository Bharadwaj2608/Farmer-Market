const express = require("express");
const router = express.Router();
const { auth, isFarmer } = require("../middleware/auth");
const { askAI } = require("../utils/askAI");
const Order = require("../models/Order");
const Listing = require("../models/Listing");

function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring/Summer (Zaid)";
  if (month >= 5 && month <= 9) return "Monsoon/Kharif";
  return "Winter/Rabi";
}


router.post("/price-suggestion", auth, async (req, res) => {
  try {
    const { cropName, quantity, unit, location } = req.body;
    if (!cropName) return res.status(400).json({ message: "cropName is required" });

    const prompt = `A farmer in ${location || "India"} wants to sell ${quantity || ""} ${unit || "kg"} of ${cropName}.
Suggest a fair wholesale price range in Indian Rupees (₹) per ${unit || "kg"} for this crop.
Consider current Indian market rates, seasonality, and typical farm-gate prices.
Respond in this exact format:
MIN: <number>
MAX: <number>
REASON: <one sentence explanation>`;

    const systemPrompt = `You are an expert on Indian agricultural commodity prices. 
You know current mandi rates, seasonal trends, and farm-gate prices across India.
Always respond with realistic ₹ prices based on current market conditions.
Never use markdown formatting.`;

    const reply = await askAI(prompt, systemPrompt);

    const minMatch = reply.match(/MIN:\s*(\d+)/);
    const maxMatch = reply.match(/MAX:\s*(\d+)/);
    const reasonMatch = reply.match(/REASON:\s*(.+)/);

    res.json({
      min: minMatch ? parseInt(minMatch[1]) : null,
      max: maxMatch ? parseInt(maxMatch[1]) : null,
      reason: reasonMatch ? reasonMatch[1].trim() : reply.trim(),
      unit: unit || "kg",
    });
  } catch (err) {
    console.error("Price suggestion error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/forecast
router.post("/forecast", auth, isFarmer, async (req, res) => {
  try {
    const farmerId = req.user._id;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await Order.find({
      farmerId,
      status: "delivered",
      createdAt: { $gte: sixMonthsAgo },
    })
      .populate("listingId", "crop category unit")
      .lean();

    const listings = await Listing.find({ farmerId, status: "active" })
      .select("crop category quantity unit pricePerUnit views quantitySold")
      .lean();

    const cropStats = {};
    orders.forEach((o) => {
      const crop = o.listingId?.crop || "Unknown";
      if (!cropStats[crop]) {
        cropStats[crop] = {
          crop,
          category: o.listingId?.category || "",
          unit: o.unit,
          totalOrders: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          months: {},
        };
      }
      cropStats[crop].totalOrders += 1;
      cropStats[crop].totalQuantity += o.quantity;
      cropStats[crop].totalRevenue += o.totalAmount;
      const month = new Date(o.createdAt).toLocaleString("default", {
        month: "short", year: "numeric",
      });
      cropStats[crop].months[month] = (cropStats[crop].months[month] || 0) + o.quantity;
    });

    const cropSummary = Object.values(cropStats);
    const currentMonth = new Date().toLocaleString("default", { month: "long" });

    const prompt = `
You are an agricultural market analyst helping an Indian farmer make planting and selling decisions.

FARMER'S SALES DATA (last 6 months):
${cropSummary.length > 0
  ? cropSummary.map((c) => `
- Crop: ${c.crop} (${c.category})
  Total orders: ${c.totalOrders}
  Total quantity sold: ${c.totalQuantity} ${c.unit}
  Total revenue: ₹${c.totalRevenue.toLocaleString()}
  Monthly breakdown: ${JSON.stringify(c.months)}
`).join("\n")
  : "No order history yet (new farmer)"}

CURRENT ACTIVE LISTINGS:
${listings.length > 0
  ? listings.map((l) => `- ${l.crop}: ${l.quantity} ${l.unit} at ₹${l.pricePerUnit}, ${l.views} views, ${l.quantitySold} sold`).join("\n")
  : "No active listings"}

CONTEXT:
- Current month: ${currentMonth}
- Current season: ${getSeason()}
- Location: India

Return ONLY valid JSON, no extra text:
{
  "summary": "2-3 sentence overall assessment",
  "topCrops": [
    {
      "crop": "crop name",
      "trend": "rising | stable | falling",
      "demandScore": 85,
      "reason": "short reason",
      "suggestedPrice": "₹X per unit",
      "bestMonthsToSell": ["month1", "month2"]
    }
  ],
  "recommendations": [
    {
      "type": "grow | list | price | timing",
      "title": "short action title",
      "description": "actionable advice in 1-2 sentences",
      "priority": "high | medium | low"
    }
  ],
  "nextSeasonCrops": [
    {
      "crop": "crop name",
      "reason": "why this crop will be in demand",
      "expectedDemand": "high | medium | low"
    }
  ],
  "marketInsight": "1-2 sentences about current market conditions in India"
}`;

    const aiResponse = await askAI(
      prompt,
      "You are an expert Indian agricultural market analyst. Always respond with valid JSON only, no markdown, no explanation."
    );

    let forecast;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      forecast = JSON.parse(clean);
    } catch (parseErr) {
      return res.status(500).json({ message: "AI returned invalid response, please try again." });
    }

    res.json({
      forecast,
      meta: {
        ordersAnalysed: orders.length,
        cropsTracked: cropSummary.length,
        period: "Last 6 months",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Forecast error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/price-suggestion
router.post("/price-suggestion", auth, isFarmer, async (req, res) => {
  try {
    const { crop, category, unit, quantity } = req.body;
    if (!crop) return res.status(400).json({ message: "crop is required" });

    const prompt = `
You are an Indian agricultural market pricing expert.
Suggest a fair market price for this produce in India right now.
Current month: ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}
Season: ${getSeason()}
Crop: ${crop}, Category: ${category || "unknown"}, Unit: ${unit || "kg"}, Quantity: ${quantity || "not specified"}

Return ONLY valid JSON:
{
  "suggestedMinPrice": 25,
  "suggestedMaxPrice": 35,
  "recommendedPrice": 30,
  "unit": "kg",
  "reasoning": "brief explanation",
  "marketTrend": "rising | stable | falling",
  "tip": "one pricing tip for the farmer"
}`;

    const aiResponse = await askAI(prompt, "You are an Indian agricultural pricing expert. Respond with valid JSON only.");
    const clean = aiResponse.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("Price suggestion error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;