import express from "express";

const app = express();
app.use(express.json());

const API_KEY = process.env.AI_API_KEY;
const MODEL = "meta-llama/llama-3-70b-instruct";

// =====================
// 🏠 ROOT
// =====================
app.get("/", (req, res) => {
  res.send("✅ AI Backend Running");
});

// =====================
// 🧠 CHAT (REAL AI)
// =====================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.json({ reply: "❌ Please provide a question." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.5,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "You are a smart study assistant. Always give clear answers and explanations."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    // 🔥 SAFE PARSING (fixes undefined)
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      null;

    if (!reply) {
      console.log("BAD RESPONSE:", data);
      return res.json({ reply: "❌ AI failed to respond properly." });
    }

    res.json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.json({ reply: "❌ Server error (AI failed)" });
  }
});

// =====================
// 🚀 START
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});