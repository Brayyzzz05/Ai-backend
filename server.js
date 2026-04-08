import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SAMBANOVA_API_KEY;

// Health check (fixes "CANNOT GET /")
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ error: "No message provided" });
    }

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
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
You are a STRICT study AI.

RULES:
- Always respond in this format:

Answer: <final answer>
Explanation: <step-by-step explanation>

- Never repeat the question.
- Be precise and correct.
- For math:
  - Always simplify properly
  - Detect identities and factor correctly
- Answer all subjects clearly.
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
      return res.json({ error: "AI failed" });
    }

    res.json({
      reply: aiText
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});