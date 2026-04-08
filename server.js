import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Backend running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "❌ No message provided" });
    }

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-70B-Instruct",
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `
You are a strict study AI.

Rules:
- Always respond in:
Answer: ...
Explanation: ...
- Do NOT return undefined.
- Always give a full answer.
- Be clear and correct.
            `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const aiText = data?.choices?.[0]?.message?.content;

    if (!aiText) {
      return res.json({ reply: "❌ AI failed to respond" });
    }

    res.json({ reply: aiText });

  } catch (err) {
    console.error(err);
    res.json({ reply: "❌ Server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});